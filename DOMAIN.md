# Domluveno — doména + ostrý provoz (krok za krokem)

Cíl: `https://domluveno.online` ukazuje tuhle appku,
sdílecí odkazy fungují napříč zařízeními a data se ukládají na server.

## 1) Registrace domény (.cz)

- Jdi na registrátora: **Wedos / Forpsi / Cloudflare Registrar** (u .cz je to jedno, ceny ~150–250 Kč/rok).
- Hotovo: `domluveno.online` je zaregistrovaná. Zbývá DNS (krok 3).
- Údaje drž na sebe/firmu, zapni **WHOIS privacy** (u .cz řeší registr částečně sám) a **auto-renew**.
- Neměň zatím nameservery, DNS záznamy nastavíme ve 3. kroku.

## 2) Nasazení appky (Vercel, zdarma)

1. Pushni repo na GitHub (soukromé stačí).
2. Na **vercel.com → Add New → Project → Import** z GitHubu. Framework: **Other** (statika, žádný build).
3. Deploy → dostaneš adresu `xxx.vercel.app`. Otestuj: vytvoř plán → zkopíruj odkaz → otevři v anonymním okně.

## 3) Napojení domény na Vercel

1. Vercel → projekt → **Settings → Domains → Add** → `domluveno.online` + `www.domluveno.online`.
2. Vercel ti ukáže DNS záznamy. U registrátora nastav:
   - `A @ → 76.76.21.21`
   - `CNAME www → cname.vercel-dns.com`
3. Počkej 5–60 min (DNS propagace). HTTPS certifikát vystaví Vercel sám (Let's Encrypt).
4. V `config.js` je už `APP_URL: "https://domluveno.online"` — po nasazení jen redeploy.
   V `index.html` přepiš `canonical` a `og:url` na ostrou adresu.

## 4) Databáze (aby hlasy fungovaly všude)

Bez tohohle běží appka v **demo režimu** (každý vidí jen svoje).
Plná funkčnost = 10 minut:

1. Založ projekt na **supabase.com** (free).
2. V SQL editoru spusť celý `supabase/schema.sql` (vytvoří tabulky, RLS a funkce
   `create_event` / `cast_vote` / `confirm_event`).
3. Zkopíruj **Project URL** + **anon public key** do `config.js`:
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Nikdy sem nedávej `service_role` klíč.
4. Redeploy. Test: telefon (mobilní data) vytvoří plán → pošli odkaz kamarádovi →
   jeho hlas se objeví tobě ve výsledcích.

## 5) Ostrý checklist před sdílením

- [ ] Odkaz z `#/s/` jde otevřít na druhém zařízení bez přihlášení
- [ ] Hlas z mobilu se propíše do výsledků na desktopu
- [ ] `https://` funguje i na `www` verzi (redirect)
- [ ] V Supabase vidíš řádky v `events` / `votes`
- [ ] Smazání dat na žádost: `delete from votes where ...` (GDPR)

## Co mi napiš, až budeš mít

1. Jakou doménu jsi zaregistroval + u koho (pošlu přesné DNS záznamy).
2. Vercel adresu (`xxx.vercel.app`) — zkontroluju hlavičky a OG náhledy.
3. Supabase URL + anon key — buď vložíš sám do `config.js`, nebo mi ho pošli a vložím ho.

Aktuální stav v repu: odkazy už se generují z ostré adresy automaticky
(`Backend.shareUrl`), takže po napojení domény není potřeba měnit kód —
jen `APP_URL` a redeploy.
