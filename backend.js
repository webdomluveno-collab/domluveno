/* Domluveno — backend adapter (Supabase přes fetch, bez SDK).
   Lokální store zůstává jako okamžitá cache; když je nakonfigurováno
   SUPABASE_URL + ANON_KEY, data se zapisují i na server, takže odkazy
   fungují napříč zařízeními. Bez konfigurace = čistě lokální demo. */
window.Backend = (() => {
  const cfg = () => window.DOMLUVENO_CONFIG || {};
  const enabled = () => !!(cfg().SUPABASE_URL && cfg().SUPABASE_ANON_KEY);

  function base() {
    if (cfg().APP_URL) return cfg().APP_URL.replace(/\/$/, "");
    const p = location.pathname.replace(/index\.html?$/, "").replace(/\/$/, "");
    return location.origin + (p || "");
  }
  const shareUrl = (id) => base() + "/#/p/" + id;
  const fullShare = shareUrl;

  async function rpc(fn, body) {
    const r = await fetch(cfg().SUPABASE_URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": cfg().SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + cfg().SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(fn + ": " + r.status);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }

  async function get(table, q) {
    const r = await fetch(cfg().SUPABASE_URL + "/rest/v1/" + table + "?" + q, {
      headers: { "apikey": cfg().SUPABASE_ANON_KEY, "Authorization": "Bearer " + cfg().SUPABASE_ANON_KEY }
    });
    if (!r.ok) throw new Error(table + ": " + r.status);
    return r.json();
  }

  const rnd = (n) => {
    const a = new Uint8Array(n || 12);
    crypto.getRandomValues(a);
    return Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
  };
  const voterToken = (eventId) => {
    const k = "domluveno-voter-" + eventId;
    let t = null;
    try { t = localStorage.getItem(k); } catch (e) {}
    if (!t) { t = rnd(12); try { localStorage.setItem(k, t); } catch (e) {} }
    return t;
  };

  /* Ploché řádky z DB -> lokální tvar {dates:[{id,label,short,times}], votes:[{name,yes,maybe}]}.
     Klíč hlasu = uuid termínu (stabilní napříč zařízeními). */
  function toLocal(evRow, dateRows, placeRows, voteRows, choiceRows, placeVoteRows) {
    const groups = [];
    dateRows.forEach(o => {
      let g = groups.find(g => g.label === o.label);
      if (!g) { g = { id: "g" + (groups.length + 1), label: o.label, short: o.day_short, times: [], _ids: [] }; groups.push(g); }
      g.times.push(o.time); g._ids.push(o.id);
    });
    // uuid termínu -> lokální klíč "g1|19:00", aby fungovalo stávající skórování
    const uuidToKey = {};
    groups.forEach(g => g.times.forEach((t, i) => { uuidToKey[g._ids[i]] = g.id + "|" + t; }));
    const byVote = {};
    (voteRows || []).forEach(v => { byVote[v.id] = { name: v.voter_name, yes: [], maybe: [] }; });
    (choiceRows || []).forEach(c => {
      const v = byVote[c.vote_id]; if (!v) return;
      const k = uuidToKey[c.option_id] || c.option_id;
      if (c.value === "yes") v.yes.push(k);
      else if (c.value === "maybe") v.maybe.push(k);
    });
    // times v grupě: klíč = uuid (místo "d1|19:00"), aby seděl s hlasováními
    const dates = groups.map(g => ({ id: g.id, label: g.label, short: g.short, times: g.times, _ids: g._ids }));
    const placeCount = {};
    (placeVoteRows || []).forEach(pv => {
      const pl = (placeRows || []).find(p => p.id === pv.place_id);
      if (pl) placeCount[pl.label] = (placeCount[pl.label] || 0) + 1;
    });
    return {
      id: evRow.id, emoji: evRow.emoji || "✨", title: evRow.title, by: evRow.organizer_name || "Organizátor",
      dates: dates.map(d => ({ id: d.id, label: d.label, short: d.short, times: d.times })),
      _optIds: groups.flatMap(g => g._ids),
      _keyByTime: (() => { const m = {}; groups.forEach(g => g.times.forEach((t, i) => { m[g.id + "|" + t] = g._ids[i]; })); return m; })(),
      places: (placeRows || []).map(p => p.label),
      _placeIds: (placeRows || []).map(p => p.id),
      votes: Object.values(byVote), placeVotes: placeCount,
      confirmed: evRow.status === "confirmed" ? true : null,
      _remote: true
    };
  }

  async function pullEvent(id) {
    const ev = await get("events", "id=eq." + encodeURIComponent(id) + "&select=*&limit=1");
    if (!ev[0]) throw new Error("not found");
    const [d, p] = await Promise.all([
      get("date_options", "event_id=eq." + encodeURIComponent(id) + "&order=sort&select=*"),
      get("place_options", "event_id=eq." + encodeURIComponent(id) + "&select=*")
    ]);
    let votes = [], choices = [], pv = [];
    try {
      votes = await get("votes", "event_id=eq." + encodeURIComponent(id) + "&select=id,voter_name");
      if (votes.length) {
        const ids = votes.map(v => v.id);
        const inList = "(" + ids.join(",") + ")";
        [choices, pv] = await Promise.all([
          get("vote_choices", "vote_id=in." + encodeURIComponent(inList) + "&select=*").catch(() => []),
          get("place_votes", "vote_id=in." + encodeURIComponent(inList) + "&select=*").catch(() => [])
        ]);
      }
    } catch (e) { /* show_results=false -> host hlasy neuvidí, nevadí */ }
    return toLocal(ev[0], d, p, votes, choices, pv);
  }

  async function createEventRemote(draft) {
    const dates = [];
    draft.dates.forEach(d => {
      const short = (d.label || "").split(" ").slice(0, 2).join(" ");
      (d.on || []).forEach(ti => {
        const t = d.times[ti]; if (!t) return;
        dates.push({ label: d.label, day_short: short, time: t });
      });
    });
    const res = await rpc("create_event", {
      p_title: draft.name || "Nový plán",
      p_emoji: (["🍻","🍽","🎬","🏔","✈️","🎉","🎮","✨"])[draft.type] || "✨",
      p_organizer: "Ty",
      p_dates: dates,
      p_places: (draft.withPlace ? draft.places : []).filter(Boolean),
      p_show_results: true
    });
    try { localStorage.setItem("domluveno-admin-" + res.id, res.admin_token); } catch (e) {}
    const fresh = await pullEvent(res.id);
    return fresh;
  }

  async function castVoteRemote(ev, name, sel, placeLabel) {
    // sel: {key -> 'yes'|'maybe'} kde key může být "g1|19:00" (lokální) nebo uuid (remote)
    const toUuid = (k) => (ev._keyByTime && ev._keyByTime[k]) || (/^[0-9a-f-]{36}$/i.test(k) ? k : null);
    const choices = Object.entries(sel || {})
      .filter(([, v]) => v === "yes" || v === "maybe")
      .map(([k, v]) => ({ option_id: toUuid(k), value: v }))
      .filter(c => c.option_id);
    if (!choices.length) throw new Error("empty");
    let placeIds = [];
    if (placeLabel && ev._placeIds) {
      const idx = (ev.places || []).indexOf(placeLabel);
      if (idx >= 0 && ev._placeIds[idx]) placeIds = [ev._placeIds[idx]];
    }
    return rpc("cast_vote", {
      p_event: ev.id, p_name: name, p_token: voterToken(ev.id),
      p_choices: choices, p_place_ids: placeIds, p_ip_hash: null
    });
  }

  return { enabled, shareUrl, fullShare, pullEvent, createEventRemote, castVoteRemote, voterToken };
})();
