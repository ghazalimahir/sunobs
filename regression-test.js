"use strict";
const fs=require("fs");
const path=require("path");
const coeffs=JSON.parse(fs.readFileSync(path.join(__dirname,"coefficients.json"),"utf8"));
const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,"regression-fixtures.json"),"utf8"));
const origins={
  "Johor":2.0233,"Negeri Sembilan":2.4244,"Melaka":2.4244,"Pahang":3.4239,
  "Selangor":3.4048,"Terengganu":4.5645,"Pulau Pinang":5.2515,"Seberang Perai":5.2515,
  "Kedah":5.5753,"Perlis":5.5753,"Perak":4.5133,"Kelantan":5.5337
};
function dmmssToDeg(value){const n=Number(value);const sign=n<0?-1:1,a=Math.abs(n),deg=Math.floor(a),raw=Math.round((a-deg)*10000),min=Math.floor(raw/100),sec=raw%100;return sign*(deg+min/60+sec/3600)}
function originDmmssToDeg(value){const n=Number(value),sign=n<0?-1:1,a=Math.abs(n),deg=Math.floor(a),min=Math.floor(((Math.round(a*100)%100)+100)%100),sec=((Math.round(a*10000)%100)+100)%100;return sign*(deg+min/60+sec/3600)}
function timeHours(t){const p=t.split(":").map(Number);return p[0]+p[1]/60+(p[2]||0)/3600}
function mean(a){return a.reduce((x,y)=>x+y,0)/a.length}
function mod(n,m){return ((n%m)+m)%m}
function rad(d){return d*Math.PI/180}
function deg(r){return r*180/Math.PI}
function roundArcsec(v){return Math.round(v*3600)/3600}
function ceilArcsec(v){return Math.ceil(v*3600-1e-12)/3600}
function calculateSet(set,date,lat,tirusan){
 const local=mean(set.times), [y,m,d]=date.split("-").map(Number);
 const utcDate=new Date(Date.UTC(y,m-1,d)+(local-8)*3600*1000);
 const year=utcDate.getUTCFullYear(),month=utcDate.getUTCMonth()+1;
 const day=utcDate.getUTCDate()+(utcDate.getUTCHours()+utcDate.getUTCMinutes()/60+utcDate.getUTCSeconds()/3600)/24;
 const c=coeffs[`${year}-${String(month).padStart(2,"0")}`],poly=x=>c[0]+c[1]*x+c[2]*x*x+c[3]*x*x*x+c[4]*x*x*x*x;
 const day0=Math.floor(day),x0=Math.round((day0/32)*1e7)/1e7,x1=Math.round(((day0+1/24)/32)*1e7)/1e7;
 const d0=roundArcsec(poly(x0)),d1=roundArcsec(poly(x1)),utHour=(day-day0)*24,decl=roundArcsec(d0+(d1-d0)*utHour);
 const hzSun=[set.hz[1],set.hz[2],mod(set.hz[3],180),mod(set.hz[4],180)],avgSun=roundArcsec(mean(hzSun));
 const avgTR=roundArcsec(mean([mod(set.hz[0],180),mod(set.hz[5],180)])),alt=roundArcsec(mean(set.vertical));
 const refr=ceilArcsec(((41.4105+8.8*Math.cos(rad(alt)))/Math.tan(rad(alt)))/3600),adjAlt=alt-refr;
 let cosA=(Math.sin(rad(decl))-Math.sin(rad(lat))*Math.sin(rad(adjAlt)))/(Math.cos(rad(lat))*Math.cos(rad(adjAlt)));cosA=Math.max(-1,Math.min(1,cosA));
 const baseAz=roundArcsec(deg(Math.acos(cosA)))+1/3600,session=local<12.5?"PAGI":"PETANG",sunAz=session==="PETANG"?mod(360-baseAz,360):mod(baseAz,360);
 const trueTR=mod(avgTR+sunAz-avgSun,360),grid=mod(trueTR+roundArcsec(tirusan),360);
 return {decl,sunAz,trueTR,grid};
}
const sample={date:"2003-03-07",n:22017,set1:{times:["08:28:59","08:29:17","08:29:58","08:30:13"].map(timeHours),hz:[162,96.19,95.454,275.4655,276.205,342].map(dmmssToDeg),vertical:[15.061111111111103,15.129166666666677,15.304166666666674,15.355555555555554]},set2:{times:["08:33:25","08:33:41","08:34:21","08:34:46"].map(timeHours),hz:[162,96.2535,95.522,275.533,276.275,342].map(dmmssToDeg),vertical:[16.15416666666667,16.2125,16.383333333333326,16.480555555555554]}};
function calc(state,e=-4900){const origin=originDmmssToDeg(origins[state]),lat=origin+sample.n*.03256/3600,dl=e*.03246/3600,tir=-dl*Math.sin(rad(lat));const a=calculateSet(sample.set1,sample.date,lat,tir),b=calculateSet(sample.set2,sample.date,lat,tir);return {origin,lat,dl,tir,a,b,mean:mod((a.grid+b.grid)/2,360),diff:Math.abs(mod(a.grid-b.grid+180,360)-180)*3600}}
function near(a,b,t=1e-9){return Math.abs(a-b)<=t}
let fail=[];
for(const [state,exp] of Object.entries(fixtures.states)){const x=calc(state);const checks=[[x.origin,exp.originLatDD],[x.lat,exp.stationLatDD],[x.dl,exp.deltaLongitudeDD],[x.tir,exp.tirusanDD],[x.a.decl,exp.set1.declination],[x.a.sunAz,exp.set1.sunAzimuth],[x.a.trueTR,exp.set1.trueTR],[x.a.grid,exp.set1.gridTR],[x.b.decl,exp.set2.declination],[x.b.sunAz,exp.set2.sunAzimuth],[x.b.trueTR,exp.set2.trueTR],[x.b.grid,exp.set2.gridTR],[x.mean,exp.meanGridTR],[x.diff,exp.differenceArcsec]];checks.forEach(([a,b],i)=>{if(!near(a,b))fail.push(`${state} check ${i}: ${a} != ${b}`)})}
for(const [label,exp] of Object.entries(fixtures.sign_tests)){const x=calc("Pahang",exp.easting);[[x.dl,exp.deltaLongitudeDD],[x.tir,exp.tirusanDD],[x.a.grid,exp.grid1],[x.b.grid,exp.grid2],[x.mean,exp.mean]].forEach(([a,b],i)=>{if(!near(a,b))fail.push(`${label} check ${i}: ${a} != ${b}`)})}
if(fail.length){console.error(fail.join("\n"));process.exit(1)}
const p=calc("Pahang");
console.log(JSON.stringify({states:Object.keys(origins).length,coefficients:Object.keys(coeffs).length,set1:p.a.grid,set2:p.b.grid,mean:p.mean,differenceArcsec:p.diff},null,2));
