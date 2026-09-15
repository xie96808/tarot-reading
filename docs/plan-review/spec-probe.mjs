// Executable probes of the DESIGN CONTRACT, not an application implementation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { webcrypto, createHash } from 'node:crypto';
const doc = fs.readFileSync(new URL('../design.md', import.meta.url), 'utf8');
const code = doc.match(/async function uniformInt[\s\S]*?\n}/)[0]
  .replace('rng: ProductionRng','rng').replace('n: number','n').replace(': Promise<number>','');
const uniformInt = new Function(`${code}; return uniformInt;`)();
const range=2**32, n=78, limit=range-range%n;
let count=0;
const values=[limit,range-1,77];
assert.equal(await uniformInt({nextUint32:async()=>{count++; return values.shift();}},78),77);
assert.equal(count,3);
for(const bad of [0,79.5,-1,NaN,Infinity,range+1]) {
  await assert.rejects(uniformInt({nextUint32:async()=>0},bad),RangeError);
}
assert.equal(await uniformInt({nextUint32:async()=>range-1},range),range-1);
console.log('PASS actual design uniformInt snippet: rejection, invalid bounds, full uint32 bound');
const bins=Array(78).fill(0); for(let x=0;x<256-256%78;x++) bins[x%78]++;
assert.deepEqual(new Set(bins),new Set([3]));
console.log('PASS 8-bit exhaustive analogue: every accepted bucket has exactly 3 values');
const majors=[...doc.matchAll(/^\| `([0-2][0-9]_[^`]+)` \| [^|]+ \| [^|]+ \| (?:air|water|earth|fire) \| [^|]+ \|$/gm)].map(m=>m[1]);
const ranks=['01_ace',...Array.from({length:9},(_,i)=>String(i+2).padStart(2,'0')),'page','knight','queen','king'];
const ids=[...majors,...['cups','pents','swords','wands'].flatMap(s=>ranks.map(r=>`${s}_${r}`))];
assert.equal(new Set(ids).size,78);
async function refRng(seed,samples=new Uint8Array(),purpose='shuffle'){
  const ikm=new Uint8Array(seed.length+samples.length);ikm.set(seed);ikm.set(samples,seed.length);
  const key=await webcrypto.subtle.importKey('raw',ikm,'HKDF',false,['deriveBits']);
  let counter=0,pool=new DataView(new ArrayBuffer(0)),offset=0;
  return {nextUint32:async()=>{
    if(offset===pool.byteLength){
      const bits=await webcrypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt:new Uint8Array(32),info:new TextEncoder().encode(`tarot/fy-hkdf-2/${purpose}/block/${counter++}`)},key,1024*8);
      pool=new DataView(bits);offset=0;
    }
    const result=pool.getUint32(offset,false);offset+=4;return result;
  }};
}
const a=await refRng(new Uint8Array(32)),b=await refRng(new Uint8Array(32));
const c=await refRng(new Uint8Array(32),new Uint8Array(12));
const d=await refRng(new Uint8Array(32),new Uint8Array(),'cut');
let sequence=[];for(let i=0;i<513;i++){const x=await a.nextUint32();sequence.push(x);assert.equal(x,await b.nextUint32());}
assert.notEqual(sequence[0],await c.nextUint32());assert.notEqual(sequence[0],await d.nextUint32());
console.log('PASS HKDF design reference: 513 uint32 values / 3 blocks deterministic; sample and purpose separation');
const rng=await refRng(new Uint8Array(32));const order=[...ids];
for(let i=77;i>0;i--){const j=await uniformInt(rng,i+1);[order[i],order[j]]=[order[j],order[i]];}
const cards=[];for(const cardId of order)cards.push({cardId,orientation:(await uniformInt(rng,2))===0?'upright':'reversed'});
for(const cut of [1,23,39,77]){const deck=cards.slice(cut).concat(cards.slice(0,cut));assert.equal(new Set(deck.map(c=>c.cardId)).size,78);assert.equal(deck[0],cards[cut]);}
const canonical={algo:'fy-hkdf-2',deckVersion:'rws-1',cards:cards.map(c=>({id:c.cardId,o:c.orientation==='upright'?'u':'r'}))};
const vectorHash=createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
assert.equal(vectorHash,'0ac93c7f14a812cad31bc63e8cb06ac56d6a075567954e79f499907ea9f0190f');
console.log('REFERENCE_VECTOR_SHA256 '+vectorHash);
console.log('PASS design reference: 78 unique cards and boundary cuts 1/23/39/77');
const positions={single:['focus'],three:['past','present','future'],celtic:['present','challenge','foundation','past','crown','future','self','environment','hopes_fears','outcome']};
const longest=[...ids].sort((a,b)=>b.length-a.length);
const encode=p=>'1.'+Buffer.from(JSON.stringify(p),'utf8').toString('base64url');
for(const [spreadId,pos] of Object.entries(positions)){
  const payload={v:1,deckVersion:'rws-1',lexiconVersion:'zh-1',algo:'fy-hkdf-2',spreadId,q:null,reversals:true,cutIndex:77,commit:'f'.repeat(16),draws:pos.map((positionId,i)=>({positionId,cardId:longest[i],orientation:'reversed'})),ts:4102444800};
  const id=encode(payload);assert.ok(id.length<=1500);assert.deepEqual(JSON.parse(Buffer.from(id.slice(2),'base64url').toString('utf8')),payload);
  console.log(`SHARE_${spreadId.toUpperCase()}_NO_QUESTION_LENGTH ${id.length}`);
  if(spreadId==='celtic'){
    for(const q of ['问'.repeat(200),'🌙'.repeat(200)]){
      const len=encode({...payload,q}).length;assert.ok(len>1500);console.log(`SHARE_CELTIC_${q[0]==='问'?'CJK':'EMOJI'}_200_LENGTH ${len} (must show oversize prompt)`);
    }
  }
}
console.log('SPEC PROBES COMPLETE. No application, browser, or deployment tests were executed.');
