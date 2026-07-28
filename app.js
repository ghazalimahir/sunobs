
if(/Android/i.test(navigator.userAgent)){
  document.documentElement.classList.add("is-android");
}

const THEME_KEY="sunobsTheme";
function applyTheme(theme){
 document.documentElement.setAttribute("data-theme",theme);
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta) meta.setAttribute("content", theme==="dark"?"#0e1520":"#17365d");
 const btn=document.getElementById("themeToggleBtn");
 if(btn) btn.textContent = theme==="dark"?"☀️ Terang":"🌙 Gelap";
}
(function initTheme(){
 const saved=localStorage.getItem(THEME_KEY);
 const theme= saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
 applyTheme(theme);
})();

function toast(msg,type){
 const c=document.getElementById("toastContainer"); if(!c) return;
 const el=document.createElement("div");
 el.className="toast"+(type?" toast-"+type:"");
 el.textContent=msg;
 c.appendChild(el);
 requestAnimationFrame(()=>el.classList.add("show"));
 setTimeout(()=>{ el.classList.remove("show"); setTimeout(()=>el.remove(),300); },3200);
}

const APP_VERSION = "2.0.1";
let coeffs = {};
let coeffsError = null;
const STATE_ORIGINS = {
  "Johor": {station:"Gunung Belumut", latDmmss:2.0233, latText:"2° 02′ 33.20196″ U", lonText:"103° 33′ 39.83730″ T"},
  "Negeri Sembilan": {station:"Gun Hill", latDmmss:2.4244, latText:"2° 42′ 43.63383″ U", lonText:"101° 56′ 22.92969″ T"},
  "Melaka": {station:"Gun Hill", latDmmss:2.4244, latText:"2° 42′ 43.63383″ U", lonText:"101° 56′ 22.92969″ T"},
  "Pahang": {station:"Gunung Sinyum", latDmmss:3.4239, latText:"3° 42′ 38.69263″ U", lonText:"102° 26′ 04.60772″ T"},
  "Selangor": {station:"Bukit Asa", latDmmss:3.4048, latText:"3° 40′ 48.37778″ U", lonText:"101° 30′ 24.48581″ T"},
  "Terengganu": {station:"Gunung Gajah Trom", latDmmss:4.5645, latText:"4° 56′ 44.97184″ U", lonText:"102° 53′ 37.00496″ T"},
  "Pulau Pinang": {station:"Fort Cornwallis", latDmmss:5.2515, latText:"5° 25′ 15.20433″ U", lonText:"100° 20′ 40.76024″ T"},
  "Seberang Perai": {station:"Fort Cornwallis", latDmmss:5.2515, latText:"5° 25′ 15.20433″ U", lonText:"100° 20′ 40.76024″ T"},
  "Kedah": {station:"Gunung Perak", latDmmss:5.5753, latText:"5° 57′ 52.82155″ U", lonText:"100° 38′ 10.93860″ T"},
  "Perlis": {station:"Gunung Perak", latDmmss:5.5753, latText:"5° 57′ 52.82155″ U", lonText:"100° 38′ 10.93860″ T"},
  "Perak": {station:"Gunung Hijau Larut", latDmmss:4.5133, latText:"4° 51′ 32.64488″ U", lonText:"100° 48′ 55.47038″ T"},
  "Kelantan": {station:"Bukit Panau (Baru)", latDmmss:5.5337, latText:"5° 53′ 37.07975″ U", lonText:"102° 10′ 32.24529″ T"}
};

function updateOriginDisplay(){
 const state=document.getElementById("state").value;
 const origin=STATE_ORIGINS[state];
 document.getElementById("originStation").value=origin.station;
 document.getElementById("originLatitude").value=origin.latText;
 document.getElementById("originLongitude").value=origin.lonText;
}

const rows = [
  ["TR Awal", false, "162.0000", ""],
  ["P.Ki α", true, "96.1900", "74.5620"],
  ["P.Ki ω", true, "95.4540", "74.5215"],
  ["P.Ka ω", true, "275.4655", "285.1815"],
  ["P.Ka α", true, "276.2050", "285.2120"],
  ["TR Akhir", false, "342.0000", ""]
];
const rows2 = [
  ["TR Awal", false, "162.0000", ""],
  ["P.Ki α", true, "96.2535", "73.5045"],
  ["P.Ki ω", true, "95.5220", "73.4715"],
  ["P.Ka ω", true, "275.5330", "286.2300"],
  ["P.Ka α", true, "276.2750", "286.2850"],
  ["TR Akhir", false, "342.0000", ""]
];
const times1=["","08:29","08:29","08:30","08:30",""];
const times2=["","08:33","08:34","08:34","08:35",""];

function buildSet(containerId, data, times, savedValues){
 const c=document.getElementById(containerId);
 c.innerHTML=`<div class="obs-wrap"><table class="obs-table">
 <colgroup><col class="col-target"><col class="col-time"><col class="col-angle"><col class="col-angle"></colgroup>
 <thead><tr><th class="target-head">Sasaran</th><th class="time-head">Waktu</th><th>Mengufuk<span>ddd.mmss</span></th><th>Pugak<span>ddd.mmss</span></th></tr></thead><tbody>${
 data.map((r,i)=>{
   const sv=savedValues&&savedValues[i];
   const timeVal=(sv?sv.time:times[i]).slice(0,5);
   const hzVal=sv?sv.hz:r[2];
   const vVal=sv?sv.v:r[3];
   return `<tr class="${r[1]?"sun-row":"tr-row"}"><td class="target">${r[0]}</td><td><input class="time" aria-label="Waktu ${r[0]}" type="time" step="60" value="${timeVal}" ${r[1]?"":"disabled"}></td><td><input class="hz" aria-label="Mengufuk ${r[0]}" inputmode="decimal" value="${hzVal}"></td><td><input class="v" aria-label="Pugak ${r[0]}" inputmode="decimal" value="${vVal}" ${r[1]?"":"disabled"}></td></tr>`;
 }).join("")
 }</tbody></table></div>`;
}
buildSet("set1",rows,times1); buildSet("set2",rows2,times2);

const coeffsStatusEl = document.getElementById("coeffsStatus");
fetch("coefficients.json")
  .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
  .then(d=>{ coeffs=d; coeffsError=null; if(coeffsStatusEl) coeffsStatusEl.hidden=true; })
  .catch(err=>{
    coeffsError=err;
    if(coeffsStatusEl){
      coeffsStatusEl.hidden=false;
      coeffsStatusEl.textContent="Gagal memuatkan pekali sudutistiwa (coefficients.json). Semak sambungan internet, kemudian muat semula halaman.";
    }
  });

function dmmssToDeg(value){
 const n=Number(value);
 if(!Number.isFinite(n)) throw new Error("Bacaan sudut tidak sah");
 const sign=n<0?-1:1, a=Math.abs(n);
 const deg=Math.floor(a);
 const raw=Math.round((a-deg)*10000);
 const min=Math.floor(raw/100), sec=raw%100;
 if(min>=60||sec>=60) throw new Error(`Format ddd.mmss tidak sah: ${value}`);
 return sign*(deg+min/60+sec/3600);
}
function originDmmssToDeg(value){
 // Ikut formula latitud origin Excel v2.3D (AUDIT!B6) tepat.
 const n=Number(value);
 if(!Number.isFinite(n)) throw new Error("Latitud origin tidak sah");
 const sign=n<0?-1:1, a=Math.abs(n);
 const deg=Math.floor(a);
 const min=Math.floor(((Math.round(a*100)%100)+100)%100);
 const sec=((Math.round(a*10000)%100)+100)%100;
 if(min>=60||sec>=60) throw new Error(`Format latitud origin tidak sah: ${value}`);
 return sign*(deg+min/60+sec/3600);
}
function dms(deg){
 if(!Number.isFinite(deg)) return "—";
 const sign=deg<0?"-":"";
 const totalSeconds=Math.round(Math.abs(deg)*3600);
 const d=Math.floor(totalSeconds/3600);
 const m=Math.floor((totalSeconds%3600)/60);
 const sec=totalSeconds%60;
 return `${sign}${d}° ${String(m).padStart(2,"0")}′ ${String(sec).padStart(2,"0")}″`;
}
function timeHours(t){
 const p=t.split(":").map(Number); if(p.length<2||p.some(Number.isNaN)) throw new Error("Waktu tidak lengkap");
 return p[0]+p[1]/60+(p[2]||0)/3600;
}
function verticalToAltitude(v, type){
 if(type==="zenith"){
   if(v>=0&&v<=180) return 90-v;
   if(v>180&&v<=360) return v-270;
 }else if(type==="signed"){
   if(Math.abs(v)<=90) return v;
 }else if(type==="360"){
   if(v>=0&&v<=90) return v;
   if(v>=270&&v<=360) return v-360;
 }
 throw new Error("Bacaan pugak tidak sepadan dengan jenis yang dipilih");
}
function parseSet(id,type){
 const el=document.getElementById(id), trs=[...el.querySelectorAll("tbody tr")];
 const hz=trs.map(tr=>dmmssToDeg(tr.querySelector(".hz").value));
 const vertical=[], times=[];
 trs.forEach((tr,i)=>{
   if(i>0&&i<5){
     vertical.push(verticalToAltitude(dmmssToDeg(tr.querySelector(".v").value),type));
     times.push(timeHours(tr.querySelector(".time").value));
   }
 });
 return {hz,vertical,times};
}
function mean(a){return a.reduce((x,y)=>x+y,0)/a.length}
function mod(n,m){return ((n%m)+m)%m}
function rad(d){return d*Math.PI/180}
function deg(r){return r*180/Math.PI}
function roundArcsec(v){return Math.round(v*3600)/3600}
function ceilArcsec(v){return Math.ceil(v*3600-1e-12)/3600}

function calculateSet(set,date,lat,tirusan){
 const local=mean(set.times);
 // Excel: tarikh cerapan + waktu tempatan - 8 jam.
 // Date.UTC digunakan supaya keputusan tidak berubah mengikut zon masa telefon.
 const [dateYear,dateMonth,dateDay]=date.split("-").map(Number);
 const utcDate=new Date(Date.UTC(dateYear,dateMonth-1,dateDay,0,0,0)+(local-8)*3600*1000);
 const year=utcDate.getUTCFullYear(), month=utcDate.getUTCMonth()+1;
 if(year<2000||year>2050) throw new Error("Tarikh di luar julat 2000–2050");
 const day=utcDate.getUTCDate()+(utcDate.getUTCHours()+utcDate.getUTCMinutes()/60+utcDate.getUTCSeconds()/3600)/24;
 const c=coeffs[`${year}-${String(month).padStart(2,"0")}`];
 if(!c) throw new Error("Pekali sudutistiwa belum dimuatkan");
 const poly=x=>c[0]+c[1]*x+c[2]*x*x+c[3]*x*x*x+c[4]*x*x*x*x;
 const day0=Math.floor(day);
 const x0=Math.round((day0/32)*1e7)/1e7;
 const x1=Math.round(((day0+1/24)/32)*1e7)/1e7;
 const d0=roundArcsec(poly(x0));
 const d1=roundArcsec(poly(x1));
 const utHour=(day-day0)*24;
 const decl=roundArcsec(d0+(d1-d0)*utHour);

 const hzSun=[set.hz[1],set.hz[2],mod(set.hz[3],180),mod(set.hz[4],180)];
 const avgSun=roundArcsec(mean(hzSun));
 const avgTR=roundArcsec(mean([mod(set.hz[0],180),mod(set.hz[5],180)]));
 const alt=roundArcsec(mean(set.vertical));
 if(alt<=0) throw new Error("Altitud Matahari mesti melebihi 0°");
 const refr=ceilArcsec(((41.4105+8.8*Math.cos(rad(alt)))/Math.tan(rad(alt)))/3600);
 const adjAlt=alt-refr;
 let cosA=(Math.sin(rad(decl))-Math.sin(rad(lat))*Math.sin(rad(adjAlt)))/(Math.cos(rad(lat))*Math.cos(rad(adjAlt)));
 cosA=Math.max(-1,Math.min(1,cosA));
 const baseAz=roundArcsec(deg(Math.acos(cosA)))+1/3600;
 const session=local<12.5?"PAGI":"PETANG";
 const sunAz=session==="PETANG"?mod(360-baseAz,360):mod(baseAz,360);
 const trueTR=mod(avgTR+sunAz-avgSun,360);
 const grid=mod(trueTR+roundArcsec(tirusan),360);
 return {local,year,month,day,decl,avgSun,avgTR,alt,refr,adjAlt,sunAz,trueTR,tirusan,grid,session};
}

function markStale(){
 if(window.lastResult){
   window.lastResult=null;
   const b=document.getElementById("statusBanner");
   if(b && (b.classList.contains("pass")||b.classList.contains("warn"))){
     b.textContent='Input diubah — tekan "Kira Azimut" semula';
     b.className="banner idle";
   }
 }
}

function calculate(){
 window.lastResult=null;
 try{
  if(coeffsError) throw new Error("Pekali sudutistiwa gagal dimuatkan. Sila muat semula halaman semasa online.");
  if(!Object.keys(coeffs).length) throw new Error("Data pekali sedang dimuatkan. Cuba semula sebentar lagi.");
  const date=document.getElementById("date").value;
  if(!date) throw new Error("Tarikh belum diisi");
  const n=Number(document.getElementById("northing").value), e=Number(document.getElementById("easting").value);
  if(!Number.isFinite(n)||!Number.isFinite(e)) throw new Error("Koordinat tidak lengkap");
  const state=document.getElementById("state").value;
  const origin=STATE_ORIGINS[state];
  if(!origin) throw new Error("Negeri belum dipilih");
  const originLat=originDmmssToDeg(origin.latDmmss);
  const lat=originLat+n*0.03256/3600;
  const longitudeDiff=e*0.03246/3600;
  const tirusan=-longitudeDiff*Math.sin(rad(lat));
  const type=document.getElementById("verticalType").value;
  const r1=calculateSet(parseSet("set1",type),date,lat,tirusan);
  const r2=calculateSet(parseSet("set2",type),date,lat,tirusan);
  const avg=mod((r1.grid+r2.grid)/2,360);
  const diff=Math.abs(mod(r1.grid-r2.grid+180,360)-180)*3600;
  document.getElementById("set1Grid").textContent=dms(r1.grid);
  document.getElementById("set2Grid").textContent=dms(r2.grid);
  document.getElementById("meanGrid").textContent=dms(avg);
  document.getElementById("setDiff").textContent=`${diff.toFixed(3)}"`;
  const banner=document.getElementById("statusBanner");
  banner.textContent=diff<=30?"LULUS":"SEMAK — beza set melebihi 30″";
  banner.className="banner "+(diff<=30?"pass":"warn");
  const details=[
    ["Negeri",state],["Stesen origin",origin.station],
    ["Latitud origin GDM2000",origin.latText],["Longitud origin GDM2000",origin.lonText+" (rujukan)"],
    ["Garis lintang stesen",dms(lat)],["Tirusan",dms(tirusan)],
    ["Set 1 — sesi",r1.session],["Set 1 — sudutistiwa",dms(r1.decl)],["Set 1 — altitud dilaras",dms(r1.adjAlt)],["Set 1 — azimut Matahari",dms(r1.sunAz)],["Set 1 — bearing sebenar TR",dms(r1.trueTR)],
    ["Set 2 — sesi",r2.session],["Set 2 — sudutistiwa",dms(r2.decl)],["Set 2 — altitud dilaras",dms(r2.adjAlt)],["Set 2 — azimut Matahari",dms(r2.sunAz)],["Set 2 — bearing sebenar TR",dms(r2.trueTR)]
  ];
  document.getElementById("detailResults").innerHTML=`<table class="detail-table">${details.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join("")}</table>`;
  window.lastResult={date,state,n,e,lat,r1,r2,avg,diff,station:document.getElementById("station").value,reference:document.getElementById("reference").value};
 }catch(err){
  const b=document.getElementById("statusBanner"); b.textContent=err.message; b.className="banner error";
 }
}
document.getElementById("calculateBtn").onclick=calculate;
document.getElementById("printBtn").onclick=()=>{calculate();setTimeout(()=>window.print(),100)};
document.getElementById("resetBtn").onclick=()=>{if(confirm("Kosongkan semua input dan keputusan?")) location.reload()};

function modeNote(){
 const v=document.getElementById("verticalType").value;
 document.getElementById("modeNote").textContent={
  zenith:"ZENIT 0°: ufuk pada 90°/270°. Contoh muka kiri 74° dan muka kanan 285°.",
  signed:"UFUK 0° BERTANDA: altitud terus. Naik positif, turun negatif.",
  "360":"UFUK 0° 0–360: naik 0°–90°, turun 270°–360°."
 }[v];
}
document.getElementById("verticalType").onchange=modeNote; modeNote();
document.getElementById("state").onchange=updateOriginDisplay; updateOriginDisplay();

function readRecordsSafe(){
 try{
   const raw=localStorage.getItem("sunobsRecords");
   const a=raw?JSON.parse(raw):[];
   return Array.isArray(a)?a:[];
 }catch(e){ return []; }
}
function getSetSnapshot(id){
 const el=document.getElementById(id), trs=[...el.querySelectorAll("tbody tr")];
 return trs.map(tr=>({
   time: tr.querySelector(".time").value,
   hz: tr.querySelector(".hz").value,
   v: tr.querySelector(".v").value
 }));
}
function renderTrendChart(all){
 const canvas=document.getElementById("trendChart");
 const emptyEl=document.getElementById("trendEmpty");
 if(!canvas) return;
 const data=all.slice(0,12).slice().reverse();
 if(!data.length){
   canvas.hidden=true; if(emptyEl) emptyEl.hidden=false;
   return;
 }
 canvas.hidden=false; if(emptyEl) emptyEl.hidden=true;
 const ctx=canvas.getContext("2d");
 const dpr=window.devicePixelRatio||1;
 const w=canvas.clientWidth||canvas.parentElement.clientWidth, h=canvas.clientHeight||120;
 canvas.width=Math.max(1,w*dpr); canvas.height=Math.max(1,h*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.clearRect(0,0,w,h);
 const vals=data.map(r=>parseFloat(r.diff)||0);
 const maxVal=Math.max(30,...vals)*1.15;
 const padL=4,padR=4,padB=6,padT=8;
 const plotW=w-padL-padR, plotH=h-padT-padB;
 const gap=plotW/data.length;
 const barW=Math.max(4,gap*0.55);
 const styles=getComputedStyle(document.documentElement);
 const gridColor=(styles.getPropertyValue("--chart-grid")||"#d8e0e8").trim();
 const passColor=(styles.getPropertyValue("--chart-pass")||"#4caf7d").trim();
 const warnColor=(styles.getPropertyValue("--chart-warn")||"#c0392b").trim();
 const thresholdY=padT+plotH-(30/maxVal)*plotH;
 ctx.strokeStyle=gridColor; ctx.lineWidth=1; ctx.setLineDash([4,4]);
 ctx.beginPath(); ctx.moveTo(padL,thresholdY); ctx.lineTo(w-padR,thresholdY); ctx.stroke();
 ctx.setLineDash([]);
 data.forEach((r,i)=>{
   const v=vals[i];
   const barH=Math.max(2,(v/maxVal)*plotH);
   const x=padL+i*gap+(gap-barW)/2;
   const y=padT+plotH-barH;
   ctx.fillStyle=v<=30?passColor:warnColor;
   const rad=Math.min(3,barW/2);
   ctx.beginPath();
   ctx.moveTo(x,y+barH);
   ctx.lineTo(x,y+rad);
   ctx.quadraticCurveTo(x,y,x+rad,y);
   ctx.lineTo(x+barW-rad,y);
   ctx.quadraticCurveTo(x+barW,y,x+barW,y+rad);
   ctx.lineTo(x+barW,y+barH);
   ctx.closePath();
   ctx.fill();
 });
}
function renderRecords(){
 const all=readRecordsSafe();
 const q=(document.getElementById("recordSearch")?.value||"").trim().toLowerCase();
 const sort=document.getElementById("recordSort")?.value||"newest";
 let items=all.map((r,i)=>({r,i}));
 if(q) items=items.filter(({r})=>[r.station,r.reference,r.state,r.date].some(v=>String(v||"").toLowerCase().includes(q)));
 if(sort==="oldest") items=items.slice().reverse();
 document.getElementById("savedRecords").innerHTML=items.length?items.map(({r,i})=>`<div class="record"><strong>${r.station||"Tanpa nama stesen"} — ${r.date}</strong><small>${r.state||"Negeri tidak direkod"} · ${r.reference||"Tiada TR"} · ${r.mean} · Beza ${r.diff}</small><div class="record-actions"><button class="secondary" onclick="loadRecord(${i})">Muat</button><button class="danger" onclick="deleteRecord(${i})">Padam</button></div></div>`).join(""):`<p class="empty-state">${q?"Tiada rekod sepadan carian.":"Belum ada rekod."}</p>`;
 renderTrendChart(all);
}
window.deleteRecord=i=>{
 if(!confirm("Padam rekod ini?")) return;
 const a=readRecordsSafe();a.splice(i,1);localStorage.setItem("sunobsRecords",JSON.stringify(a));renderRecords();
 toast("Rekod dipadam");
};
window.loadRecord=i=>{
 const a=readRecordsSafe(), r=a[i]; if(!r) return;
 document.getElementById("date").value=r.date||"";
 if(r.state){ document.getElementById("state").value=r.state; updateOriginDisplay(); }
 document.getElementById("station").value=r.station||"";
 document.getElementById("reference").value=r.reference||"";
 document.getElementById("northing").value=r.northing??"";
 document.getElementById("easting").value=r.easting??"";
 document.getElementById("verticalType").value=r.verticalType||"zenith"; modeNote();
 if(r.set1) buildSet("set1", rows, r.set1.map(x=>x.time), r.set1);
 if(r.set2) buildSet("set2", rows2, r.set2.map(x=>x.time), r.set2);
 window.lastResult=null;
 const b=document.getElementById("statusBanner");
 b.textContent='Rekod dimuat — tekan "Kira Azimut" untuk sahkan'; b.className="banner idle";
 window.scrollTo({top:0,behavior:"smooth"});
};
document.getElementById("saveBtn").onclick=()=>{
 calculate(); if(!window.lastResult) return;
 const a=readRecordsSafe();
 a.unshift({
   date:window.lastResult.date,
   state:window.lastResult.state,
   station:window.lastResult.station,
   reference:window.lastResult.reference,
   northing:window.lastResult.n,
   easting:window.lastResult.e,
   verticalType:document.getElementById("verticalType").value,
   set1:getSetSnapshot("set1"),
   set2:getSetSnapshot("set2"),
   mean:dms(window.lastResult.avg),
   diff:window.lastResult.diff.toFixed(3)+'"',
   savedAt:new Date().toISOString()
 });
 localStorage.setItem("sunobsRecords",JSON.stringify(a.slice(0,50)));renderRecords();
 toast("Rekod disimpan","success");
};
document.getElementById("exportCsvBtn").onclick=()=>{
 const a=readRecordsSafe();
 if(!a.length){ toast("Tiada rekod untuk dieksport.","error"); return; }
 const header=["Tarikh","Negeri","Stesen","Tanda Rujuk","Bearing Grid Purata","Beza Set","Disimpan Pada"];
 const lines=[header.join(",")].concat(a.map(r=>[r.date,r.state,r.station,r.reference,r.mean,r.diff,r.savedAt||""]
   .map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")));
 const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const link=document.createElement("a");
 link.href=url; link.download=`sunobs-rekod-${new Date().toISOString().slice(0,10)}.csv`;
 document.body.appendChild(link); link.click(); link.remove();
 URL.revokeObjectURL(url);
 toast("CSV dieksport","success");
};
document.getElementById("recordSearch")?.addEventListener("input",renderRecords);
document.getElementById("recordSort")?.addEventListener("change",renderRecords);
window.addEventListener("resize",()=>renderTrendChart(readRecordsSafe()));
document.getElementById("themeToggleBtn")?.addEventListener("click",()=>{
 const cur=document.documentElement.getAttribute("data-theme");
 const next=cur==="dark"?"light":"dark";
 localStorage.setItem(THEME_KEY,next);
 applyTheme(next);
 renderTrendChart(readRecordsSafe());
});
renderRecords();

document.querySelector("main").addEventListener("input", markStale);
document.querySelector("main").addEventListener("change", markStale);
document.querySelector("main").addEventListener("focusout", e=>{
 const t=e.target;
 if(!(t.classList && (t.classList.contains("hz")||t.classList.contains("v")))) return;
 if(t.disabled || t.value.trim()===""){ t.classList.remove("invalid"); t.removeAttribute("title"); return; }
 try{ dmmssToDeg(t.value); t.classList.remove("invalid"); t.removeAttribute("title"); }
 catch(err){ t.classList.add("invalid"); t.title=err.message; }
});

const versionEl=document.getElementById("appVersion");
if(versionEl) versionEl.textContent=APP_VERSION;

if("serviceWorker" in navigator){
 navigator.serviceWorker.register("service-worker.js").then(reg=>{
   reg.addEventListener("updatefound",()=>{
     const sw=reg.installing; if(!sw) return;
     sw.addEventListener("statechange",()=>{
       if(sw.state==="installed" && navigator.serviceWorker.controller){
         const ub=document.getElementById("updateBanner"); if(ub) ub.hidden=false;
       }
     });
   });
 }).catch(()=>{});
 let reloaded=false;
 navigator.serviceWorker.addEventListener("controllerchange",()=>{
   if(reloaded) return; reloaded=true; location.reload();
 });
}
const updateBtn=document.getElementById("updateBtn");
if(updateBtn) updateBtn.onclick=()=>location.reload();
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.getElementById("installBtn").hidden=false});
document.getElementById("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById("installBtn").hidden=true}};
