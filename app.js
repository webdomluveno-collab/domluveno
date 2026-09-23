/* Domluveno — SPA */
const $=s=>document.querySelector(s);
const AV=[["M","#6C2BEE"],["E","#FF6B5E"],["T","#0EA5E9"],["H","#2FD6A3"],["D","#FF8FAB"],["J","#F59E0B"],["K","#8B5CF6"],["L","#EC4899"],["P","#10B981"],["S","#F97316"]];
const av=(n,i)=>{const c=AV[(i||n.charCodeAt(0))%AV.length];return `<span style="background:${c[1]}">${(n||"?")[0].toUpperCase()}</span>`};
const AVGROUP=(names)=>`<div class="avs">${names.map((n,i)=>av(n,i)).join("")}</div>`;

const DEMO={
 id:"demo",emoji:"🍻",title:"Páteční pivo",by:"Martin",
 dates:[
  {id:"d1",label:"Pátek 25. 9.",short:"Pá 25. 9.",times:["18:00","19:00","20:00"]},
  {id:"d2",label:"Sobota 26. 9.",short:"So 26. 9.",times:["18:00","19:00","20:00"]},
  {id:"d3",label:"Neděle 27. 9.",short:"Ne 27. 9.",times:["18:00","19:00"]},
 ],
 places:["Lokal","Dva kohouti","Pizza Nuova"],
 votes:[
  {name:"Martin",yes:["d1|18:00","d1|19:00","d1|20:00","d2|18:00","d2|19:00","d2|20:00","d3|18:00"],maybe:[],no:[]},
  {name:"Eva",yes:["d2|18:00","d2|19:00","d2|20:00","d1|19:00"],maybe:["d1|18:00"],no:["d3|18:00"]},
  {name:"Tomáš",yes:["d2|19:00","d2|20:00","d1|20:00"],maybe:["d2|18:00","d1|19:00"],no:[]},
  {name:"Honza",yes:["d2|19:00","d1|19:00","d1|20:00"],maybe:["d2|18:00"],no:["d3|18:00"]},
  {name:"Klára",yes:["d2|19:00","d2|18:00"],maybe:["d1|19:00"],no:[]},
  {name:"David",yes:["d1|18:00","d1|19:00"],maybe:[],no:["d2|19:00","d2|20:00"]},
  {name:"Petr",yes:["d2|19:00","d2|20:00","d3|18:00"],maybe:["d1|20:00"],no:[]},
  {name:"Lucka",yes:["d2|19:00","d1|19:00","d2|18:00"],maybe:[],no:[]},
  {name:"Jana",yes:["d2|19:00","d2|20:00"],maybe:["d3|18:00"],no:["d1|18:00"]},
 ],
 placeVotes:{"Lokal":7,"Dva kohouti":4,"Pizza Nuova":2},
 confirmed:null
};
let store={events:{demo:JSON.parse(JSON.stringify(DEMO))}};
try{const s=localStorage.getItem("domluveno-v1");if(s)store=JSON.parse(s);}catch(e){}
const save=()=>{try{localStorage.setItem("domluveno-v1",JSON.stringify(store))}catch(e){}};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),2200)};

function score(ev){
 const out=[];
 ev.dates.forEach(d=>d.times.forEach(t=>{
  const k=d.id+"|"+t;let y=0,m=0,n=0;const whoY=[],whoM=[];
  ev.votes.forEach(v=>{if((v.yes||[]).includes(k)){y++;whoY.push(v.name)}else if((v.maybe||[]).includes(k)){m++;whoM.push(v.name)}else n++});
  out.push({k,date:d,time:t,yes:y,maybe:m,no:n,pts:y*2+m,total:ev.votes.length,whoY,whoM});
 }));
 out.sort((a,b)=>b.pts-a.pts||b.yes-a.yes);
 return out;
}
function bestPlace(ev){const e=Object.entries(ev.placeVotes||{}).sort((a,b)=>b[1]-a[1]);return e[0]||null}

/* ---------- confetti ---------- */
function confetti(){const c=$("#confetti"),x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;const cols=["#6C2BEE","#FF6B5E","#2FD6A3","#FFC531","#FF8FAB","#fff"];const ps=Array.from({length:160},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,w:6+Math.random()*7,h:8+Math.random()*8,c:cols[Math.floor(Math.random()*cols.length)],vy:2+Math.random()*3.4,vx:-1.5+Math.random()*3,r:Math.random()*Math.PI,vr:-.1+Math.random()*.2}));let f=0;(function tick(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.y+=p.vy;p.x+=p.vx+Math.sin(p.y/40);p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});if(++f<220)requestAnimationFrame(tick);else x.clearRect(0,0,c.width,c.height)})()}

/* ---------- views ---------- */
function landing(){
return `
<section class="max-w-6xl mx-auto px-4 pt-[104px] sm:pt-[120px]">
<div class="grid lg:grid-cols-2 gap-8 items-center">
<div class="anim-in">
<span class="eyebrow">✌️ pro partu, ne pro porady</span>
<h1 class="h-display text-[44px] sm:text-[66px] mt-4">Kam? Kdy?<br/>A <em>kdo</em> vlastně může?</h1>
<div class="mt-3 text-[22px] sm:text-[28px] leading-tight">Domluvte se <span class="marker">jedním odkazem</span><span class="hand text-[20px] sm:text-[22px] text-ink/60 ml-2 -rotate-2 inline-block">bez 127 zpráv →</span></div>
<p class="text-[16px] sm:text-[17px] text-ink/65 font-medium leading-relaxed mt-4 max-w-[46ch]">Vytvoř plán, pošli ho do skupiny a nechte Domluveno najít termín a variantu, která sedí nejvíc lidem.</p>
<div class="flex flex-wrap gap-2.5 mt-6">
<a href="#/create" class="btn-primary text-[16px] !px-7 !py-4">Vytvořit plán zdarma <i data-lucide="arrow-right" class="w-5 h-5"></i></a>
<a href="#jak-to-funguje" data-scroll class="btn-ghost !px-6 !py-4"><i data-lucide="play" class="w-4 h-4"></i> Ukázat, jak to funguje</a>
</div>
<div class="text-[13px] font-bold text-ink/50 mt-4 flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-emerald-500"></i> Bez registrace pro účastníky • Hotovo za pár minut</div>
<div class="flex items-center gap-3 mt-6">${AVGROUP(["Martin","Eva","Tomáš","Honza","David","+4"])}<span class="text-[13px] font-bold text-ink/55">12 400+ part už se domluvilo</span></div>
</div>

<div class="relative anim-in" style="animation-delay:.1s">
<div class="card p-5 sm:p-6 relative" style="border-radius:20px;transform:rotate(1deg)">
<span class="tape"></span>
<div class="flex items-start justify-between gap-3">
<div><div class="font-display font-black text-[22px] tracking-tight">🍻 Pátek s partou</div><div class="hand text-[18px] text-ink/60 -mt-0.5">kdy se sejdeme, bando?</div></div>
<span class="chip bg-[#221B12] text-white -rotate-2">9 z 10 může</span></div>
<div class="grid grid-cols-3 gap-2.5 mt-4">
<div class="date-card"><div class="font-extrabold text-[13px]">Pá 25. 9.</div><div class="text-[12px] font-bold text-emerald-600 mt-1">✓ 7 lidí</div><div class="prog mt-2"><i style="width:70%"></i></div></div>
<div class="date-card best"><div class="font-extrabold text-[13px]">So 26. 9.</div><div class="text-[12px] font-bold text-ink mt-1">✓ 9 lidí</div><div class="mt-1.5"><span class="badge-best">★ Nejlepší shoda</span></div></div>
<div class="date-card"><div class="font-extrabold text-[13px]">Ne 27. 9.</div><div class="text-[12px] font-bold text-ink/50 mt-1">✓ 5 lidí</div><div class="prog mt-2"><i style="width:50%"></i></div></div>
</div>
<div class="flex items-center justify-between mt-4">${AVGROUP(["Eva","Tomáš","Honza","Klára","Jana"])}<span class="text-[12px] font-bold text-ink/50">+4 další</span></div>
<div class="mt-4 p-4 flex items-center gap-3" style="background:var(--ink);color:#FAF5EC;border-radius:16px;border:1.5px solid #000">
<div class="trophy" style="font-size:30px">✨</div>
<div class="flex-1"><div class="font-extrabold text-[15px]">Máme vítěze <span class="hand text-[#FFD84D] text-[16px] font-semibold">konečně!</span></div><div class="text-[13px] opacity-80 font-semibold">Sobota 26. září · 19:00 · <b>9 z 10 lidí může</b></div></div>
<a href="#/p/demo/results" class="bg-[#FFD84D] text-ink font-extrabold text-[13px] rounded-xl px-3.5 py-2.5 whitespace-nowrap" style="border:1.5px solid #000">Potvrdit plán</a>
</div>
<span class="bubble" style="top:-18px;right:18px;--r:4deg">já můžu 🙌</span>
<span class="bubble" style="bottom:118px;left:-14px;--r:-5deg;animation-delay:.7s">sobota!! <span class="hand">pls</span></span>
<span class="bubble" style="top:44%;right:-12px;--r:3deg;animation-delay:1.3s">+1</span>
</div>
</div>
</div>

<!-- problem strip -->
<div class="card mt-10 p-6 sm:p-8" id="problem">
<div class="text-center font-display font-black text-[26px] sm:text-[34px] tracking-tight">Méně zpráv. <span class="marker">Více skutečných plánů.</span></div>
<div class="grid md:grid-cols-[1fr_auto_1fr] gap-5 items-center mt-6">
<div class="rounded-2xl bg-[#F6F2F7] border border-ink/10 p-4 space-y-2.5">
<div class="chat-b bg-white shadow-sm"><b>Martin:</b> Tak kdy můžete?</div>
<div class="chat-b bg-white shadow-sm ml-auto"><b>Eva:</b> V pátek ne 😭</div>
<div class="chat-b bg-white shadow-sm"><b>Tomáš:</b> A sobota?</div>
<div class="chat-b bg-white shadow-sm"><b>Martin:</b> @Honza můžeš?</div>
<div class="chat-b bg-violet-100 ml-auto"><b>Honza:</b> Co se řeší?</div>
<div class="text-[12px] font-bold text-ink/40 text-center pt-1">127 nepřečtených zpráv · nikdo neví 🤯</div>
</div>
<div class="mx-auto w-12 h-12 rounded-full grid place-items-center text-[#FFD84D] font-black" style="background:var(--ink);border:1.5px solid #000;box-shadow:2px 2px 0 rgba(34,27,18,.3)">→</div>
<div class="p-5 text-[#FAF5EC]" style="background:var(--ink);border-radius:18px;border:1.5px solid #000;transform:rotate(.6deg)">
<div class="flex items-center gap-2 font-extrabold"><span class="logo-badge !w-7 !h-7">✓</span> Domluveno</div>
<div class="font-display font-extrabold text-[26px] mt-3">🏆 Sobota 19:00</div>
<div class="font-bold opacity-90">9/10 lidí může</div>
<a href="#/p/demo" class="inline-flex mt-3 bg-white text-ink font-extrabold text-[13px] rounded-xl px-4 py-2.5">Otevřít ukázku hlasování</a>
</div>
</div>
</div>

<!-- how -->
<div id="jak-to-funguje" class="mt-14 scroll-mt-28">
<div class="text-center"><span class="eyebrow">🪄 jednoduché jak poslat smstku</span>
<h2 class="h-display text-[32px] sm:text-[46px] mt-3">Tři kroky a <em>je domluveno.</em></h2></div>
<div class="grid md:grid-cols-3 gap-4 mt-7 stagger">
<div class="card card-hover p-6"><div class="font-display font-extrabold text-violet-300 text-[40px]">01</div><div class="font-extrabold text-[19px]">Vytvoř plán</div><p class="text-[14px] text-ink/60 font-semibold">Vyber, co plánuješ, a přidej možné termíny. Zabere to dvě minuty.</p>
<div class="mt-4 rounded-2xl bg-lav border border-ink/10 p-3.5"><div class="font-extrabold text-[14px]">🍻 Páteční pivo</div><div class="flex gap-1.5 mt-2"><span class="chip bg-ink text-white">Pá 19:00</span><span class="chip bg-ink text-white">So 19:00</span><span class="chip bg-white border border-ink/10">+ přidat</span></div></div></div>
<div class="card card-hover p-6"><div class="font-display font-extrabold text-violet-300 text-[40px]">02</div><div class="font-extrabold text-[19px]">Pošli jeden odkaz</div><p class="text-[14px] text-ink/60 font-semibold">Otevřou ho z WhatsAppu, Messengeru i IG. Žádný účet nepotřebují.</p>
<div class="mt-4 rounded-2xl bg-white border border-ink/10 p-3.5"><div class="share-link !text-[12px]">domluveno.online/#/p/patecni-pivo-x7k2</div><div class="flex gap-1.5 mt-2.5"><span class="chip bg-[#25D366] text-white">WhatsApp</span><span class="chip bg-[#0084FF] text-white">Messenger</span><span class="chip bg-ink text-white">Kopírovat</span></div></div></div>
<div class="card card-hover p-6"><div class="font-display font-extrabold text-violet-300 text-[40px]">03</div><div class="font-extrabold text-[19px]">Najdeme nejlepší shodu</div><p class="text-[14px] text-ink/60 font-semibold">Domluveno spočítá vítěze a jasně ho ukáže. Žádné luštění tabulky.</p>
<div class="mt-4 rounded-2xl p-3.5 text-white" style="background:linear-gradient(135deg,#1B1533,#6C2BEE)"><div class="font-extrabold">🏆 Sobota 19:00</div><div class="text-[13px] font-bold opacity-80">8/9 lidí · potvrdit jedním klikem</div></div></div>
</div>
</div>

<!-- use cases -->
<div id="priklady" class="mt-14 scroll-mt-28">
<div class="flex items-end justify-between flex-wrap gap-3"><div><span class="eyebrow">🎈 Na cokoliv s partou</span><h2 class="h-display text-[30px] sm:text-[44px] mt-2">Od piva po dovolenou.</h2></div><span class="text-[13.5px] font-bold text-ink/50">Klikni a předvyplníme ti ukázku →</span></div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6" id="usecases"></div>
</div>

<!-- smart matching -->
<div class="mt-14 grid lg:grid-cols-2 gap-5 items-stretch">
<div class="card p-7 sm:p-9">
<span class="eyebrow">🧠 Chytrá shoda</span>
<h2 class="h-display text-[28px] sm:text-[38px] mt-3">Nech tabulky tabulkami.</h2>
<p class="text-ink/60 font-semibold mt-3 leading-relaxed">Nechceme, abys deset minut hledal nejzelenější sloupec. Domluveno rovnou ukáže nejlepší variantu. Počítá <b>„Můžu“</b> na prvním místě, pak <b>„Když bude potřeba“</b> a minimalizuje ty, co nemůžou.</p>
<a href="#/p/demo/results" class="btn-ghost mt-5">Zobrazit živý výpočet <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
</div>
<div class="card p-5 sm:p-6">
<div class="space-y-3" id="podium"></div>
<div class="text-[12.5px] font-bold text-ink/45 mt-3 px-1">Skóre: Můžu = 2 body · Když bude potřeba = 1 bod · Nemůžu = 0</div>
</div>
</div>

<!-- groups preview -->
<div id="parta" class="mt-14 scroll-mt-28 card p-7 sm:p-9 overflow-hidden relative">
<div class="grid lg:grid-cols-2 gap-7 items-center">
<div><span class="eyebrow">👯 Parta</span><h2 class="h-display text-[28px] sm:text-[40px] mt-3">S lidmi, se kterými plánuješ pořád.</h2>
<p class="text-ink/60 font-semibold mt-3">Ulož si partu jednou a příště ji přizveš na jeden klik. Kluci, volejbal, spolužáci, rodina.</p>
<div class="flex gap-2.5 mt-5 flex-wrap"><a href="#/groups" class="btn-primary">Prohlédnout Party</a><a href="#/create" class="btn-ghost">Naplánovat něco</a></div></div>
<div class="grid grid-cols-2 gap-3">
<div class="card card-hover p-4"><div class="font-extrabold">🍻 Kluci</div><div class="text-[12px] font-bold text-ink/50">8 členů</div><div class="mt-2">${AVGROUP(["M","T","H","P","+4"])}</div><button onclick="location.hash='#/create'" class="mt-3 w-full bg-violet-100 text-violet-700 font-extrabold text-[13px] rounded-xl py-2.5">Naplánovat něco</button></div>
<div class="card card-hover p-4"><div class="font-extrabold">🏐 Volejbal</div><div class="text-[12px] font-bold text-ink/50">12 členů</div><div class="mt-2">${AVGROUP(["K","L","J","S","+8"])}</div><button onclick="location.hash='#/groups'" class="mt-3 w-full bg-emerald-100 text-emerald-700 font-extrabold text-[13px] rounded-xl py-2.5">Otevřít partu</button></div>
<div class="card card-hover p-4"><div class="font-extrabold">🎓 Spolužáci</div><div class="text-[12px] font-bold text-ink/50">21 členů</div><div class="mt-2">${AVGROUP(["A","B","C","D","+"])}</div></div>
<div class="card card-hover p-4"><div class="font-extrabold">👨‍👩‍👧 Rodina</div><div class="text-[12px] font-bold text-ink/50">6 členů</div><div class="mt-2">${AVGROUP(["M","T","E","J","+2"])}</div></div>
</div>
</div>
</div>

<div class="mt-10 text-center pb-4">
<div class="font-display font-extrabold text-[26px] sm:text-[34px] tracking-tight">„Dohodněte se bez dohadování.“</div>
<p class="text-ink/55 font-semibold">Termín, místo i plán. Pošli jeden odkaz a nechte skupinu rozhodnout.</p>
<a href="#/create" class="btn-primary mt-5 !text-[16px] !px-8 !py-4">Vytvořit plán zdarma</a>
</div>
</section>`;
}

const TYPES=[["🍻","Posezení"],["🍽","Večeře"],["🎬","Kino"],["🏔","Výlet"],["✈️","Dovolená"],["🎉","Oslava"],["🎮","Gaming"],["✨","Něco jiného"]];
const USES=[["🍻","Hospoda","Páteční pivo","linear-gradient(135deg,#FFF1C6,#FFE3B8)"],["🎬","Kino","Dune 2 s partou","linear-gradient(135deg,#E4D6FF,#C9B6FF)"],["🍕","Večeře","Pizza večer","linear-gradient(135deg,#FFE3D6,#FFC9B8)"],["🏔","Výlet","Sněžka v sobotu","linear-gradient(135deg,#D8F5E7,#B9E8D2)"],["✈️","Dovolená","Chorvatsko 2026","linear-gradient(135deg,#D6EEFF,#B9DCFF)"],["🎮","Gaming night","CS turnájek","linear-gradient(135deg,#E8E4FF,#D4CCFF)"],["⚽","Sport","Fotbálek ve čtvrtek","linear-gradient(135deg,#DCFCE7,#BBF7D0)"],["🎉","Oslava","Evy třicetiny","linear-gradient(135deg,#FFE0EC,#FFC9DA)"]];

let draft={type:0,name:"Páteční pivo",dates:[{label:"Pátek 25. 9.",times:["18:00","19:00","20:00"],on:[1]},{label:"Sobota 26. 9.",times:["18:00","19:00","20:00"],on:[1]}],withPlace:true,places:["Lokal","Dva kohouti"]};

function createView(){
 const t=TYPES.map((x,i)=>`<button class="type-card ${draft.type===i?'on':''}" data-t="${i}"><span class="em">${x[0]}</span>${x[1]}</button>`).join("");
 const ds=draft.dates.map((d,di)=>`<div class="card !rounded-2xl p-4"><div class="flex items-center justify-between gap-2"><input class="input-big !py-2.5 !text-[15px]" value="${d.label}" data-dlabel="${di}"/><button class="btn-ghost !p-2.5" data-deld="${di}"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div><div class="grid grid-cols-3 gap-2 mt-3">${d.times.map((t,ti)=>`<button class="time-chip ${d.on.includes(ti)?'on':''}" data-d="${di}" data-time="${ti}">${t}</button>`).join("")}</div></div>`).join("");
 return `<section class="max-w-2xl mx-auto px-4 pt-[104px]">
 <a href="#/" class="text-[13px] font-extrabold text-ink/50">← Zpět</a>
 <h1 class="h-display text-[32px] sm:text-[44px] mt-2">Co plánujete?</h1>
 <p class="text-ink/60 font-semibold">Vyber typ, přidej termíny a pošli jeden odkaz. Hotovo za pár minut.</p>
 <div class="type-grid mt-5">${t}</div>
 <div class="card p-5 sm:p-6 mt-4"><label class="text-[13px] font-extrabold text-ink/60">NÁZEV PLÁNU</label>
 <input id="evname" class="input-big mt-2" value="${draft.name}" placeholder="Páteční pivo"/></div>
 <div class="card p-5 sm:p-6 mt-4"><div class="flex items-center justify-between"><div class="font-extrabold text-[18px]">Kdy?</div><span class="chip bg-violet-100 text-violet-700">více možností vítáno</span></div>
 <div class="space-y-3 mt-4" id="dates">${ds}</div>
 <button id="adddate" class="btn-ghost w-full justify-center mt-3">+ Přidat další termín</button></div>
 <div class="card p-5 sm:p-6 mt-4">
 <div class="flex items-center justify-between gap-3"><div><div class="font-extrabold text-[17px]">Chcete rozhodnout i o místě?</div><div class="text-[13px] font-semibold text-ink/55">Hospoda, kino, hřiště…</div></div>
 <div id="placetog" class="seg !w-[110px]" style="cursor:pointer"><button class="${draft.withPlace?'on':''}" style="flex:1">Ano</button></div>
 ${draft.withPlace?`<div class="space-y-2 mt-4" id="places">${draft.places.map((p,i)=>`<div class="flex gap-2"><input class="input-big !py-2.5" value="${p}" data-pl="${i}"/><button class="btn-ghost !p-2.5" data-pdel="${i}">✕</button></div>`).join("")}</div><button id="addplace" class="btn-ghost w-full justify-center mt-2.5 !py-3">+ Přidat místo</button>`:""}
 </div>
 <div class="bottom-cta"><button id="make" class="btn-primary w-full justify-center !py-4 !text-[16px]">Vytvořit plán <i data-lucide="sparkles" class="w-5 h-5"></i></button>
 <div class="text-center text-[12.5px] font-bold text-ink/45 mt-2">Kamarádi nepotřebují účet.</div></div>
 </section>`;
}

function shareView(ev){
 const link=(window.Backend?Backend.shareUrl(ev.id):"domluveno.online/#/p/"+ev.id);
 const backendOn=window.Backend&&Backend.enabled();
 const onServer=!!ev._remote;
 const remote=backendOn?(onServer?"Sdílený odkaz funguje na všech zařízeních ✓":"POZOR: jen v tomto zařízení — na server se neuložilo"):"Demo režim — po napojení Supabase poběží odkazy všude";
 return `<section class="max-w-xl mx-auto px-4 pt-[110px] text-center">
 <div class="anim-in mx-auto w-[86px] h-[86px] rounded-full grid place-items-center text-white text-[38px] font-black" style="background:linear-gradient(135deg,#2FD6A3,#0EA5E9);box-shadow:0 20px 44px -12px rgba(47,214,163,.6)">✓</div>
 <h1 class="h-display text-[32px] sm:text-[42px] mt-5">Hotovo. Teď už jen<br/>sežeň partu.</h1>
 <p class="text-ink/60 font-semibold mt-2">Pošli jeden odkaz do skupiny. Kamarádi nepotřebují účet.</p>
 <div class="card p-5 mt-6 text-left"><div class="text-[12px] font-extrabold text-ink/50 tracking-wide">TVŮJ ODKAZ · <span style="font-weight:700">${remote}</span></div>
 <div class="text-[11px] font-bold text-ink/40 mt-1">verze v3 · backend ${backendOn ? "ON" : "OFF"} · event ${onServer ? "server" : "lokální"}</div>
 <div class="share-link mt-2">${link}</div>
 <div class="grid grid-cols-2 gap-2 mt-3"><button class="btn-primary justify-center" id="copy"><i data-lucide="copy" class="w-4 h-4"></i> Kopírovat odkaz</button>
 <a class="btn-ghost justify-center" href="#/p/${ev.id}">Otevřít náhled</a></div>
 <div class="grid grid-cols-3 gap-2 mt-2"><button class="chip bg-[#25D366] text-white justify-center !py-2.5" onclick="toast('Otevírám WhatsApp…')">WhatsApp</button><button class="chip bg-[#0084FF] text-white justify-center !py-2.5" onclick="toast('Otevírám Messenger…')">Messenger</button><button class="chip bg-[#0088CC] text-white justify-center !py-2.5" onclick="toast('Otevírám Telegram…')">Telegram</button></div></div>
 <div class="card p-5 mt-4 text-left"><div class="font-extrabold">Tak kdo může? 👇</div><div class="text-[13.5px] text-ink/60 font-semibold">Takhle to uvidí tvoje parta. Velká tlačítka, žádné přihlašování.</div>
 <a href="#/p/${ev.id}" class="btn-ghost w-full justify-center mt-3">Zobrazit hlasování hosta</a></div>
 <a href="#/p/${ev.id}/results" class="inline-flex mt-4 text-[13.5px] font-extrabold text-violet-700">Zatím je tu trochu ticho 👀 — skočit na výsledky →</a>
 </section>`;
}

function voteView(ev,thanks){
 const r=score(ev);const top=r[0];
 return `<section class="max-w-xl mx-auto px-4 pt-[100px] pb-6">
 <div class="card p-5 sm:p-6">
 <div class="flex items-center gap-3"><div class="text-[38px]">${ev.emoji}</div><div><h1 class="font-display font-extrabold text-[24px] tracking-tight leading-none">${ev.title}</h1><div class="text-[13.5px] font-bold text-ink/55 mt-1">${ev.by} hledá nejlepší termín.</div></div></div>
 ${thanks?`<div class="mt-4 rounded-2xl p-4 anim-in" style="background:linear-gradient(135deg,#EDFDF4,#D8F8E9);border:1.5px solid #2FD6A3"><div class="font-extrabold text-[16px]">Díky, počítáme s tebou 👋</div><div class="text-[13px] font-bold text-emerald-800">Průběžný vítěz: <b>${top.date.label} ${top.time}</b> · ${top.yes} z ${top.total} může</div></div>`
 :`<div class="mt-4"><label class="text-[13px] font-extrabold text-ink/60">JAK TI ŘÍKAJÍ?</label><input id="vname" class="input-big mt-1.5" placeholder="Honza" value=""/></div>`}
 </div>
 <div class="font-extrabold text-[19px] mt-6 mb-1 px-1">Kdy můžeš?</div>
 <div class="text-[13px] font-bold text-ink/50 px-1 mb-3">Klikni na čas → <span class="text-emerald-600">Můžu</span> · <span class="text-amber-600">Když bude potřeba</span> · <span class="text-rose-500">Nemůžu</span>. Opakovaným klikem měníš.</div>
 <div id="ballot" class="space-y-3.5">${ev.dates.map(d=>`
  <div class="card p-4"><div class="font-extrabold text-[16px]">${d.label}</div>
  <div class="grid grid-cols-3 gap-2 mt-3">${d.times.map(t=>{
   const k=d.id+"|"+t;const st=(window._sel[k]||"none");
   const cls=st==="yes"?"yes":st==="maybe"?"maybe":st==="no"?"no":"";
   const lab=st==="yes"?"✓ Můžu":st==="maybe"?"🤷 Možná":st==="no"?"✕ Ne":"○";
   return `<button class="vote-time ${cls}" data-k="${k}">${t}<small>${lab}</small></button>`}).join("")}</div></div>`).join("")}
 </div>
 ${ev.places?.length?`<div class="font-extrabold text-[19px] mt-6 px-1">A kam?</div><div class="flex flex-wrap gap-2 mt-2">${ev.places.map((p,i)=>`<button class="time-chip !px-5 ${window._place===p?'on':''}" data-place="${p}">${p}</button>`).join("")}</div>`:""}
 <div class="bottom-cta"><button id="sendvote" class="btn-primary w-full justify-center !py-4 !text-[16px]">${thanks?"Upravit moje možnosti":"Odeslat moje možnosti"} <i data-lucide="check" class="w-5 h-5"></i></button>
 <a href="#/p/${ev.id}/results" class="block text-center text-[13px] font-extrabold text-violet-700 mt-2.5">Zobrazit průběžné výsledky →</a></div>
 </section>`;
}

function resultsView(ev){
 const r=score(ev);const w=r[0],s=r[1];const bp=bestPlace(ev);
 const cant=w.total-w.yes-w.maybe;const onlyOut=cant===1?ev.votes.find(v=>!v.yes.includes(w.k)&&!v.maybe.includes(w.k))?.name:null;
 return `<section class="max-w-2xl mx-auto px-4 pt-[100px]">
 <div class="text-center"><span class="eyebrow">🏁 Už se to rýsuje</span>
 <h1 class="h-display text-[32px] sm:text-[44px] mt-3">Máme nejlepší variantu.</h1></div>
 <div class="winner-glow p-6 sm:p-8 mt-6 anim-in">
 <div class="trophy">🏆</div>
 <div class="font-display font-extrabold text-[30px] sm:text-[38px] tracking-tight mt-1">${w.date.label}</div>
 <div class="font-display font-extrabold text-[22px] opacity-90">${w.time}${bp?` · 📍 ${bp[0]}`:""}</div>
 <div class="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-2 mt-3 font-extrabold text-[14px]">${w.yes} z ${w.total} lidí může ${w.maybe?`· +${w.maybe} když bude potřeba`:""}</div>
 <div class="flex items-center gap-3 mt-4">${AVGROUP(w.whoY.slice(0,6))}<span class="text-[13px] font-bold opacity-80">${onlyOut?`Pouze ${onlyOut} nemůže.`:`${w.whoY.slice(0,4).join(", ")} a další můžou.`}</span></div>
 <div class="prog mt-5 !bg-white/20"><i style="width:${Math.round(w.yes/w.total*100)}%;background:linear-gradient(90deg,#FFC531,#FF8FAB)"></i></div>
 </div>
 <div class="card p-5 mt-4 flex items-center gap-4"><div class="text-[30px]">🥈</div><div class="flex-1"><div class="text-[12px] font-extrabold text-ink/50">DALŠÍ NEJLEPŠÍ MOŽNOST</div><div class="font-extrabold text-[17px]">${s.date.label} · ${s.time}</div><div class="text-[13px] font-bold text-ink/55">${s.yes} z ${s.total} lidí</div></div><div class="prog !w-24"><i style="width:${Math.round(s.yes/s.total*100)}%"></i></div></div>
 ${ev.votes.length===0?`<div class="card p-8 mt-4 text-center"><div class="text-[34px]">👀</div><div class="font-extrabold text-[18px] mt-2">Zatím tu nikdo nehlasoval.</div><p class="text-ink/55 font-semibold text-[14px]">Pošli odkaz do skupiny a sleduj, jak se plán skládá.</p><button class="btn-primary mt-3" onclick="location.hash='#/s/${ev.id}'">Sdílet plán</button></div>`:""}
 <div class="flex gap-2 mt-4 flex-wrap"><button id="matrixbtn" class="btn-ghost !py-3 text-[14px]">Zobrazit všechny odpovědi <i data-lucide="chevron-down" class="w-4 h-4"></i></button>
 <a href="#/p/${ev.id}" class="btn-ghost !py-3 text-[14px]">Přidat hlas</a></div>
 <div id="matrix" class="matrix mt-3 hidden"><table><tr><th style="text-align:left;padding-left:14px">Kdo</th>${r.slice(0,6).map(c=>`<th>${c.date.short}<br/>${c.time}</th>`).join("")}</tr>
 ${ev.votes.map(v=>`<tr><td style="text-align:left;padding-left:14px;font-weight:800">${v.name}</td>${r.slice(0,6).map(c=>{let cls="d-n",ch="✕";if((v.yes||[]).includes(c.k)){cls="d-y";ch="✓"}else if((v.maybe||[]).includes(c.k)){cls="d-m";ch="~"}return `<td><span class="dot ${cls}">${ch}</span></td>`}).join("")}</tr>`).join("")}</table></div>
 <div class="bottom-cta"><button id="confirm" class="btn-primary w-full justify-center !py-4 !text-[16px]">Potvrdit ${w.date.short} ${w.time} 🎉</button>
 <div class="text-center text-[12.5px] font-bold text-ink/45 mt-2">Všem se rozešle finální plán. Změna je možná i později.</div></div>
 </section>`;
}

function confirmedView(ev){
 const r=score(ev)[0];const bp=bestPlace(ev);
 return `<section class="max-w-xl mx-auto px-4 pt-[110px] text-center">
 <div class="anim-in text-[64px]">🎉</div>
 <h1 class="h-display text-[38px] sm:text-[50px] mt-2">Je domluveno!</h1>
 <div class="card p-6 mt-6 text-left anim-in" style="animation-delay:.1s">
 <div class="font-display font-extrabold text-[22px]">${ev.emoji} ${ev.title}</div>
 <div class="mt-3 space-y-2.5 font-bold text-[15.5px]">
 <div class="flex gap-2.5 items-center">📅 ${r.date.label}</div>
 <div class="flex gap-2.5 items-center">🕖 ${r.time}</div>
 ${bp?`<div class="flex gap-2.5 items-center">📍 ${bp[0]}</div>`:""}
 <div class="flex gap-2.5 items-center">👥 ${r.yes} lidí ${r.maybe?`(+${r.maybe} když bude potřeba)`:""}</div></div>
 <div class="grid grid-cols-2 gap-2 mt-5"><button class="btn-primary justify-center !py-3.5 text-[14px]" onclick="toast('Přidáno do kalendáře ✓')"><i data-lucide="calendar-plus" class="w-4 h-4"></i> Přidat do kalendáře</button>
 <button class="btn-ghost justify-center !py-3.5 text-[14px]" id="copy2"><i data-lucide="share-2" class="w-4 h-4"></i> Sdílet finální plán</button></div>
 ${bp?`<button class="btn-ghost w-full justify-center mt-2 !py-3 text-[14px]" onclick="toast('Otevírám mapu…')"><i data-lucide="map-pin" class="w-4 h-4"></i> Otevřít místo na mapě</button>`:""}
 </div>
 <div class="font-extrabold text-ink/60 mt-5">Vidíme se tam 👋</div>
 <div class="flex justify-center gap-2.5 mt-3 flex-wrap"><a href="#/create" class="btn-ghost text-[14px]">Naplánovat další</a><a href="#/dashboard" class="btn-ghost text-[14px]">Moje plány</a></div>
 </section>`;
}

function groupsView(){
 const G=[["🍻","Kluci","8 členů",["M","T","H","P"],"#E4D6FF"],["🏐","Volejbal","12 členů",["K","L","J","S"],"#D8F5E7"],["🎓","Spolužáci","21 členů",["A","B","C","D"],"#FFF1C6"],["👨‍👩‍👧","Rodina","6 členů",["M","E","J","T"],"#FFE0EC"]];
 return `<section class="max-w-6xl mx-auto px-4 pt-[104px]">
 <span class="eyebrow">👯 Parta</span>
 <h1 class="h-display text-[32px] sm:text-[46px] mt-2">S lidmi, se kterými<br/>plánuješ pořád.</h1>
 <p class="text-ink/60 font-semibold mt-2">Ulož si partu a příště ji přizveš na jeden klik.</p>
 <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 stagger">
 ${G.map(g=>`<div class="uc-card card-hover" style="background:${g[4]}"><div class="text-[34px]">${g[0].split(" ")[0]}</div><b>${g[1]}</b><small>${g[2]}</small><div class="mt-2">${AVGROUP(g[3])}</div><button onclick="location.hash='#/create'" class="mt-3 bg-ink text-white font-extrabold text-[13px] rounded-xl py-2.5">Naplánovat něco</button></div>`).join("")}
 <button onclick="toast('Nová parta vytvořena ✓')" class="rounded-[22px] border-[2px] border-dashed border-violet-300 bg-white/60 p-6 grid place-items-center text-violet-700 font-extrabold min-h-[180px] hover:bg-white transition">+ Vytvořit partu</button></div>
 </section>`;
}

function dashView(){
 const evs=Object.values(store.events);
 return `<section class="max-w-2xl mx-auto px-4 pt-[104px]">
 <h1 class="h-display text-[32px] sm:text-[42px]">Moje plány</h1>
 <p class="text-ink/60 font-semibold">Všechno, co právě domlouváš.</p>
 <div class="space-y-3 mt-5 stagger">${evs.map(ev=>{const r=score(ev)[0];return `
 <a href="#/p/${ev.id}/results" class="card card-hover p-5 flex items-center gap-4 no-underline" style="text-decoration:none;color:inherit">
 <div class="text-[34px]">${ev.emoji}</div>
 <div class="flex-1"><div class="font-extrabold text-[17px]">${ev.title}</div><div class="text-[13px] font-bold text-ink/55">🏆 ${r.date.short} ${r.time} · ${r.yes}/${r.total} může</div></div>
 <span class="chip ${ev.confirmed?'bg-emerald-100 text-emerald-700':'bg-violet-100 text-violet-700'}">${ev.confirmed?'Domluveno ✓':'Sbírá hlasy'}</span></a>`}).join("")}</div>
 <a href="#/create" class="btn-primary w-full justify-center mt-5 !py-4">+ Nový plán</a>
 </section>`;
}

/* ---------- router ---------- */
function render(){
 const h=location.hash||"#/";
 const app=$("#app");
 document.querySelectorAll("#tabbar a").forEach(a=>a.classList.remove("on"));
 window.scrollTo({top:0});
 let html="";
 if(h==="#/"||h==="#"){html=landing();setTab("home")}
 else if(h.startsWith("#/create")){html=createView()}
 else if(h.startsWith("#/s/")){const id=h.split("/")[2];html=shareView(store.events[id]||store.events.demo)}
 else if(h.match(/^#\/p\/[^\/]+\/results/)){const id=h.split("/")[2];const ev=store.events[id]||store.events.demo;html=resultsView(ev)}
 else if(h.match(/^#\/p\/[^\/]+\/confirmed/)){const id=h.split("/")[2];const ev=store.events[id]||store.events.demo;html=confirmedView(ev);setTimeout(confetti,250)}
 else if(h.startsWith("#/p/")){const id=h.split("/")[2];const ev=store.events[id]||store.events.demo;window._sel=window._sel||{};html=voteView(ev,window._thanks)}
 else if(h.startsWith("#/groups")){html=groupsView();setTab("groups")}
 else if(h.startsWith("#/dashboard")){html=dashView();setTab("dash")}
 else html=landing();
 app.innerHTML=html;
 if(window.lucide)lucide.createIcons();
 bind(h);
 if(h==="#/"||!h){fillLanding()}
 // Serverová synchronizace: neznámé / vzdálené eventy dotáhni ze Supabase (když je nakonfigurován)
 const m=h.match(/^#\/(s|p)\/([^\/]+)/);
 if(m&&window.Backend&&Backend.enabled()){
  const sid=m[2];
  if(sid&&sid!=="demo"&&!window["_pulled_"+sid]){
   window["_pulled_"+sid]=true;
   Backend.pullEvent(sid).then(fresh=>{store.events[sid]=fresh;save();render()}).catch(()=>{});
  }
 }
}
function setTab(t){document.querySelector(`#tabbar a[data-tab="${t}"]`)?.classList.add("on")}
function fillLanding(){
 const uc=$("#usecases");if(!uc)return;
 uc.innerHTML=USES.map((u,i)=>`<button class="uc-card text-left" style="background:${u[3]}" data-use="${i}"><div class="text-[34px]">${u[0]}</div><b>${u[1]}</b><small>${u[2]}</small></button>`).join("");
 uc.querySelectorAll("[data-use]").forEach(b=>b.onclick=()=>{const u=USES[+b.dataset.use];draft.name=u[2];toast(`Předvyplněno: ${u[2]} ✓`);location.hash="#/create"});
 const r=score(store.events.demo).slice(0,3);
 const medals=["🥇","🥈","🥉"];
 $("#podium").innerHTML=r.map((c,i)=>`<div class="rounded-2xl border ${i===0?'border-violet-500 bg-[#F6F0FF]':'border-ink/10 bg-white'} p-4 flex items-center gap-3"><div class="text-[26px]">${medals[i]}</div><div class="flex-1"><div class="font-extrabold">${c.date.short} ${c.time}</div><div class="prog mt-1.5"><i style="width:${Math.round(c.yes/c.total*100)}%"></i></div></div><b class="font-display">${c.yes}/${c.total}</b></div>`).join("");
 document.querySelectorAll("[data-scroll]").forEach(a=>a.onclick=e=>{if(a.getAttribute("href").startsWith("#/"))return;e.preventDefault();document.querySelector(a.getAttribute("href"))?.scrollIntoView({behavior:"smooth"})});
}

function bind(h){
 $("#copy")&&( $("#copy").onclick=async()=>{const id=h.split("/")[2]||"demo";const url=window.Backend?Backend.fullShare(id):"https://domluveno.online/#/p/"+id;try{await navigator.clipboard.writeText(url);toast("Odkaz zkopírován ✓")}catch(e){toast("Odkaz zkopírován ✓")}} );
 $("#copy2")&&($("#copy2").onclick=async()=>{try{await navigator.clipboard.writeText(location.href);toast("Finální plán zkopírován ✓")}catch(e){toast("Finální plán zkopírován ✓")}});
 // create bindings
 document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{draft.type=+b.dataset.t;render()});
 const nm=$("#evname");nm&&(nm.oninput=e=>draft.name=e.target.value);
 document.querySelectorAll("[data-dlabel]").forEach(i=>i.oninput=e=>draft.dates[+e.target.dataset.dlabel].label=e.target.value);
 document.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const d=draft.dates[+b.dataset.d];const t=+b.dataset.time;d.on=d.on.includes(t)?d.on.filter(x=>x!==t):[...d.on,t];render()});
 document.querySelectorAll("[data-deld]").forEach(b=>b.onclick=()=>{draft.dates.splice(+b.dataset.deld,1);render()});
 $("#adddate")&&($("#adddate").onclick=()=>{draft.dates.push({label:"Neděle 27. 9.",times:["17:00","18:00","19:00"],on:[1]});render()});
 $("#placetog")&&($("#placetog").onclick=()=>{draft.withPlace=!draft.withPlace;render()});
 document.querySelectorAll("[data-pl]").forEach(i=>i.oninput=e=>draft.places[+e.target.dataset.pl]=e.target.value);
 document.querySelectorAll("[data-pdel]").forEach(b=>b.onclick=()=>{draft.places.splice(+b.dataset.pdel,1);render()});
 $("#addplace")&&($("#addplace").onclick=()=>{draft.places.push("Nové místo");render()});
 $("#make")&&($("#make").onclick=async()=>{
  const id=(draft.name||"plan").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").slice(0,24)+"-"+Math.random().toString(36).slice(2,6);
  const ev={id,emoji:TYPES[draft.type][0],title:draft.name||"Nový plán",by:"Ty",dates:draft.dates.map((d,i)=>({id:"d"+(i+1),label:d.label,short:d.label.split(" ").slice(0,2).join(" "),times:d.on.map(t=>d.times[t]).filter(Boolean)})).filter(d=>d.times.length),places:draft.withPlace?[...draft.places]:[],votes:JSON.parse(JSON.stringify(DEMO.votes.slice(0,3))),placeVotes:{},confirmed:null};
  if(!ev.dates.length){toast("Přidej aspoň jeden termín");return}
  store.events[id]=ev;save();
  // Když je napojený Supabase, vytvoř event i na serveru a přesměruj na serverové ID
  if(window.Backend&&Backend.enabled()){
   toast("Ukládám na server…");
   try{const fresh=await Backend.createEventRemote(draft);store.events[fresh.id]=fresh;save();toast("Na serveru ✓ Teď už jen sežeň partu.");location.hash="#/s/"+fresh.id;return}
   catch(e){console.error("[domluveno] create remote selhalo:",e);toast("Server chyba ("+((e&&e.message)||"neznámá")+") — ukládám jen lokálně")}
  }
  toast("Hotovo. Teď už jen sežeň partu.");location.hash="#/s/"+id;
 });
 // voting
 document.querySelectorAll(".vote-time").forEach(b=>b.onclick=()=>{
  const k=b.dataset.k;const cur=window._sel[k]||"none";
  window._sel[k]=cur==="none"?"yes":cur==="yes"?"maybe":cur==="maybe"?"no":"none";
  const st=window._sel[k];
  b.className="vote-time "+(st==="none"?"":st);
  b.querySelector("small").textContent=st==="yes"?"✓ Můžu":st==="maybe"?"🤷 Možná":st==="no"?"✕ Ne":"○";
  b.style.transform="scale(.93)";setTimeout(()=>b.style.transform="",120);
 });
 document.querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>{window._place=b.dataset.place;document.querySelectorAll("[data-place]").forEach(x=>x.classList.remove("on"));b.classList.add("on")});
 $("#sendvote")&&($("#sendvote").onclick=async()=>{
  const id=(h.split("/")[2]||"demo");const ev=store.events[id];
  const name=($("#vname")?.value||"").trim()||("Host "+(ev.votes.length+1));
  const yes=Object.entries(window._sel||{}).filter(([k,v])=>v==="yes").map(([k])=>k);
  const maybe=Object.entries(window._sel||{}).filter(([k,v])=>v==="maybe").map(([k])=>k);
  if(!yes.length&&!maybe.length){toast("Ťukni aspoň na jeden čas 👆");return}
  const ex=ev.votes.findIndex(v=>v.name.toLowerCase()===name.toLowerCase());
  const rec={name,yes,maybe,no:[]};
  if(ex>=0)ev.votes[ex]=rec;else ev.votes.push(rec);
  if(window._place)ev.placeVotes[window._place]=(ev.placeVotes[window._place]||0)+1;
  save();
  if(window.Backend&&Backend.enabled()&&ev._remote){
   try{await Backend.castVoteRemote(ev,name,window._sel,window._place);const fresh=await Backend.pullEvent(id);store.events[id]=fresh;save()}
   catch(e){/* zustane lokalni kopie, nevadi */}
  }
  window._thanks=true;window._sel={};toast("Díky, počítáme s tebou 👋");render();
 });
 $("#matrixbtn")&&($("#matrixbtn").onclick=()=>{const m=$("#matrix");m.classList.toggle("hidden");$("#matrixbtn").innerHTML=m.classList.contains("hidden")?"Zobrazit všechny odpovědi <i data-lucide='chevron-down' class='w-4 h-4'></i>":"Skrýt odpovědi <i data-lucide='chevron-up' class='w-4 h-4'></i>";lucide.createIcons()});
 $("#confirm")&&($("#confirm").onclick=()=>{const id=h.split("/")[2];store.events[id].confirmed=true;save();location.hash="#/p/"+id+"/confirmed"});
}
window.addEventListener("hashchange",()=>{window._thanks=false;if(!location.hash.includes("/p/"))window._sel={};render()});
render();
