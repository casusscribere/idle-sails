// Step 1 of PLAN-2: extend each metric's per-decade top-10 with an unranked
// 11–20 "second tier". Tier-2 is assembled from era-block candidate pools (mid-
// tier ports, ordered by salience, leaning per metric), minus that decade's
// top-10, capped at 10. Ranks within tier-2 are NOT meaningful (a set, not order).
import { readFileSync, writeFileSync } from "node:fs";
const P="/home/kirk/REPOS_LINUX/idle_sails/research/port-rankings-1550-1815.json";
const J=JSON.parse(readFileSync(P,"utf8"));
const DEC=J.decades, keys=["ships","tonnage","value"];

// era-block candidate pools, ordered by rough salience. from/to inclusive (decade years).
const POOLS={
 ships:[
  [1550,1585,["Marseille","Naples","Ragusa","Bremen","Rouen","La Rochelle","Bilbao","Málaga","Barcelona","Palermo","Stockholm","Bergen","Middelburg","Bruges","Rostock","Reval","Dublin","Bordeaux","Nantes","Königsberg","Copenhagen"]],
  [1585,1660,["Livorno","Copenhagen","Königsberg","Riga","Marseille","Bordeaux","Nantes","Rouen","La Rochelle","Bremen","Bilbao","Málaga","Barcelona","Naples","Stockholm","Middelburg","Emden","Ragusa","Dublin","Hull","Bristol","Bergen"]],
  [1660,1720,["Bristol","Copenhagen","Königsberg","Riga","Bordeaux","Nantes","Rouen","Le Havre","La Rochelle","Bilbao","Málaga","Barcelona","Naples","Stockholm","Bremen","Ostend","Dublin","Hull","Boston","Bergen","Genoa","Livorno"]],
  [1720,1780,["Bristol","Liverpool","Copenhagen","Nantes","Rouen","Le Havre","Bilbao","Málaga","Barcelona","Naples","Stockholm","Bremen","St Petersburg","Boston","Philadelphia","Charleston","Dublin","Cork","Genoa","Livorno","Marseille","Königsberg","Riga","Danzig","Kingston"]],
  [1780,1815,["Bristol","Nantes","Bordeaux","Le Havre","Rouen","Barcelona","Naples","Trieste","Stockholm","Bremen","Boston","Charleston","Baltimore","Cork","Hull","Königsberg","Danzig","Bergen","Genoa","Ostend","Marseille","Kingston"]]
 ],
 tonnage:[
  [1550,1585,["Naples","Ragusa","Bremen","Palermo","Bilbao","Málaga","Barcelona","Stockholm","Bergen","Rouen","Marseille","Reval","Stettin","Stralsund","Rostock","Middelburg","Bordeaux","La Rochelle","Copenhagen","Bristol"]],
  [1585,1660,["Copenhagen","Livorno","Marseille","Bordeaux","Bremen","Stockholm","Bergen","Rouen","Bilbao","Málaga","Barcelona","Naples","Stettin","Memel","Reval","Middelburg","Bristol","Hull","Nantes","Sunderland","Genoa"]],
  [1660,1720,["Copenhagen","Stockholm","Bergen","Marseille","Nantes","Bordeaux","Bremen","Sunderland","Hull","Bilbao","Málaga","Barcelona","Naples","Stettin","Memel","Boston","Bristol","Genoa","Livorno","Whitby","Veracruz","Cartagena"]],
  [1720,1780,["Copenhagen","Stockholm","Marseille","Nantes","Sunderland","Whitby","Hull","Bremen","Bilbao","Barcelona","Naples","Boston","Philadelphia","Charleston","Danzig","Königsberg","Genoa","Livorno","Bergen","Veracruz","Bombay","Madras","Kingston"]],
  [1780,1815,["Copenhagen","Sunderland","Whitby","Hull","Stockholm","Bremen","Danzig","Königsberg","Bordeaux","Marseille","Nantes","Boston","Charleston","Baltimore","Philadelphia","Bombay","Madras","Batavia","Bergen","Trieste","Genoa","Naples","Kingston"]]
 ],
 value:[
  [1550,1585,["Marseille","Naples","Ragusa","Barcelona","Bilbao","Málaga","Rouen","Palermo","Bremen","Goa","Malacca","Bruges","Stockholm","Middelburg","Nantes","Bordeaux","Copenhagen","Königsberg"]],
  [1585,1660,["Marseille","Livorno","Naples","Barcelona","Bilbao","Málaga","Rouen","Bremen","Malacca","Goa","Surat","Nantes","Bordeaux","Copenhagen","Königsberg","Stockholm","Ragusa","Middelburg","Pernambuco","Cartagena","Veracruz","Manila"]],
  [1660,1720,["Marseille","Livorno","Naples","Barcelona","Málaga","Rouen","Bremen","Nantes","Bordeaux","Surat","Madras","Bombay","Malacca","Manila","Cartagena","Veracruz","Portobelo","Pernambuco","Cap-Français","Copenhagen","Smyrna","Mocha","Havana"]],
  [1720,1780,["Marseille","Naples","Barcelona","Rouen","Nantes","Le Havre","Madras","Bombay","Surat","Manila","Cap-Français","Cartagena","Veracruz","Havana","Kingston","Buenos Aires","Smyrna","Mocha","Bandar Abbas","Copenhagen","Livorno","Pernambuco"]],
  [1780,1815,["Marseille","Naples","Barcelona","Nantes","Le Havre","Madras","Bombay","Manila","Havana","Cap-Français","Kingston","Buenos Aires","Charleston","Baltimore","Philadelphia","Smyrna","Mocha","Copenhagen","Stockholm","Pernambuco","Trieste","Surat"]]
 ]
};

function tier2For(metric,d){
  const top10=new Set(J.metrics[metric].topByDecade[d]);
  const seen=new Set(); const out=[];
  for(const [f,t,ports] of POOLS[metric]){ if(d<f||d>t) continue;
    for(const p of ports){ if(top10.has(p)||seen.has(p)) continue; seen.add(p); out.push(p); if(out.length===10) return out; } }
  return out;
}
const problems=[];
for(const m of keys){
  J.metrics[m].tier2ByDecade={};
  for(const d of DEC){ const t2=tier2For(m,d); J.metrics[m].tier2ByDecade[d]=t2;
    if(t2.length!==10) problems.push(`${m} ${d}s: ${t2.length} tier-2 ports`);
    const inter=t2.filter(p=>J.metrics[m].topByDecade[d].includes(p));
    if(inter.length) problems.push(`${m} ${d}s: tier-2 overlaps top-10 (${inter})`);
  }
}
J.note=(J.note||"")+" Tier-2 (ranks 11–20) is an UNRANKED second tier per metric per decade (membership, not order); the top-10 remains ranked.";

if(problems.length){ console.error("PROBLEMS:\n"+problems.join("\n")); process.exit(1); }

writeFileSync(P, JSON.stringify(J,null,2));

// full top-20 CSV
const rows=["decade,metric,tier,rank,port"];
for(const m of keys) for(const d of DEC){
  J.metrics[m].topByDecade[d].forEach((p,i)=>rows.push(`${d},${m},top10,${i+1},"${p}"`));
  J.metrics[m].tier2ByDecade[d].forEach(p=>rows.push(`${d},${m},tier2,,"${p}"`));
}
writeFileSync("/home/kirk/REPOS_LINUX/idle_sails/research/port-top20-1550-1815.csv",rows.join("\n")+"\n");

// universe report
const uni=new Set(); for(const m of keys) for(const d of DEC){J.metrics[m].topByDecade[d].forEach(p=>uni.add(p));J.metrics[m].tier2ByDecade[d].forEach(p=>uni.add(p));}
const top10uni=new Set(); for(const m of keys) for(const d of DEC) J.metrics[m].topByDecade[d].forEach(p=>top10uni.add(p));
const newPorts=[...uni].filter(p=>!top10uni.has(p)).sort();
console.log(`✓ tier-2 added to all 3 metrics × ${DEC.length} decades (10 each). No overlaps.`);
console.log(`port universe: ${uni.size} (was ${top10uni.size} in the top-10s) — ${newPorts.length} new mid-tier ports`);
console.log("new ports: "+newPorts.join(", "));
console.log("\nsample — ships:");
for(const d of [1550,1650,1750,1810]) console.log(`  ${d}s top10: ${J.metrics.ships.topByDecade[d].slice(0,10).join(", ")}\n       tier2: ${J.metrics.ships.tier2ByDecade[d].join(", ")}`);
