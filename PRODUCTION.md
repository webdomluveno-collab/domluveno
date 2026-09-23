# Domluveno — cesta na produkci (funkční + bezpečná)

Současný stav: statický prototyp (`index.html` + `app.js`), data jen v `localStorage`.
Na produkci potřebujeme: hosting + databázi + serverové API. Níže nejrychlejší bezpečná cesta.

## Doporučená architektura (MVP, levná)

- **Frontend:** Vercel (statika teď, Next.js později). `vercel.json` už obsahuje bezpečnostní hlavičky (CSP, X-Frame-Options…).
- **Backend:** Supabase (Postgres + RLS). Žádný vlastní server na začátek.
- **Schéma:** `supabase/schema.sql` — eventy, termíny, místa, hlasy, secrets odděleně, rate-limit tabulka.

Proč Supabase: nemusíš řešit servery, RLS hlídá čtení hlasů (`show_results`), zápis jde jen přes RPC funkce `create_event` / `cast_vote` s validací na serveru.

## Kroky

1. **Git**
   `git init && git add -A && git commit -m "Domluveno prototyp + produkcni schema"`
   Založ privátní repo na GitHubu, push.
2. **Supabase projekt** (free tier stačí)
   - Vytvoř projekt, v SQL editoru spusť `supabase/schema.sql`.
   - Vytvoř `private` schema pokud neexistuje; PostgREST ho nevystavuje.
   - Zkopíruj `SUPABASE_URL` + `SUPABASE_ANON_KEY` (nikdy `service_role` do frontendu).
3. **Napojit frontend** (další krok vývoje)
   - `POST` event → `rpc('create_event', …)` → vrátí `{id, admin_token}`. `admin_token` uložit jen organizátorovi (localStorage), na serveru jen hash.
   - Hlasování → `rpc('cast_vote', {p_event, p_name, p_token, p_choices, …})`. `p_token` = náhodný token hosta (umožní edit vlastního hlasu). Skóre **vždy přepočítat na serveru**, klientovi nevěřit.
   - ID eventů nehadatelná (`slug-xxxx`, generuje server). Nesmí být sekvenční.
4. **Antispam / abuse**
   - Cloudflare Turnstile na formuláře (hlasování + tvorba).
   - Rate-limit: `rate_limits` v DB + limit na IP (60 hlasů/hod, viz funkce).
   - Jména max 30 znaků, escapovat při renderu (uživ. `textContent`, ne `innerHTML` pro jména).
5. **Doména + hosting**
   - Vercel → Add Domain `domluveno.online`, zapni HTTPS (auto), nasměruj DNS.
   - Test: tvorba → sdílení → hlas z anonymního okna → výsledky → potvrzení.
6. **GDPR minimum**
   - Sbíráš jen přezdívku + volby. Přidej větu „Hlasováním souhlasíš se zobrazením přezdívky účastníkům." + tlačítko „Smazat moje data" (smazat `votes` dle `voter_token`).
   - Nastav `expires_at` (např. smazat eventy starší 12 měsíců).

## Co NEDĚLAT

- Nedávat `service_role` klíč do frontendu.
- Nečíst `private.event_secrets` z klienta.
- Nespoléhat na `localStorage` jako databázi (jde smazat, nejde sdílet).
- Nepoužívat sekvenční ID (`/p/1`, `/p/2`) — šly by enumerovat.

## Další krok (až řekneš)

Převod `app.js` na fetch proti Supabase + Turnstile + stránka `/p/[id]` s OG tagy pro hezké náhledy ve WhatsAppu. Odhad: 1–2 h práce.
