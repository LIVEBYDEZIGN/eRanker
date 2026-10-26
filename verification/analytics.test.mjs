import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../site/tracking.js',import.meta.url),'utf8');
function boot(host='eranker.net') {
  const requests=[], timers=[], meta=[], links=[];
  const document={title:'eRanker',referrer:'https://example.org/path?email=private@example.com',head:{appendChild:s=>requests.push(s.src)},createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore:s=>requests.push(s.src)}}],querySelectorAll:()=>[{addEventListener:(_event,fn)=>links.push(fn)}]};
  const window={crypto:{randomUUID:()=> 'event-id'},fbq:(...args)=>meta.push(args)};window.parent=window;
  const context={window,document,location:{hostname:host,origin:'https://'+host,pathname:'/checkout.html',search:'?email=private@example.com&text=secret&keyword1=secret&utm_source=meta'},URL,URLSearchParams,setTimeout:fn=>timers.push(fn),Date,Object};
  Object.defineProperty(context,'gtag',{get:()=>window.gtag});Object.defineProperty(context,'dataLayer',{get:()=>window.dataLayer});Object.defineProperty(context,'fbq',{get:()=>window.fbq});Object.defineProperty(context,'rdt',{get:()=>window.rdt});
  vm.createContext(context);vm.runInContext(source,context);return{window,requests,timers,meta,links,context};
}
const commands=b=>Array.from(b.window.dataLayer).filter(x=>typeof x[0]==='string').map(x=>Array.from(x));
test('private and localhost previews send no analytics',()=>{for(const host of ['localhost','127.0.0.1','eranker-paid-flow-check-20261026.eranker.chatgpt.site']){const b=boot(host);assert.equal(b.requests.length,0);assert.equal(b.window.erankerTrack,undefined);}});
test('one GA4 page view, correct IDs and no duplicate bootstrap',()=>{const b=boot();vm.runInContext(source,b.context);const c=commands(b);assert.equal(c.filter(x=>x[0]==='config'&&x[1]==='G-FQ5CDMGQ6G').length,1);assert.equal(c.filter(x=>x[1]==='page_view').length,1);assert.ok(c.some(x=>x[1]==='AW-18518626177'));});
test('GA4 mirrors Meta intent, lead and contact without personal data',()=>{const b=boot();for(const name of ['InitiateCheckout','Lead','Contact'])b.window.erankerTrack(name,{email:'private@example.com',whatsapp:'+37378328893',listing:'secret listing',keyword1:'secret keyword'});const ga=commands(b).filter(x=>x[0]==='event'&&x[2]?.send_to==='G-FQ5CDMGQ6G');assert.deepEqual(ga.map(x=>x[1]),['page_view','begin_checkout','generate_lead','whatsapp_contact']);const text=JSON.stringify(ga);for(const forbidden of ['private@example.com','37378328893','secret'])assert.ok(!text.includes(forbidden));assert.ok(text.includes('utm_source=meta'));assert.ok(!text.includes('purchase'));assert.deepEqual(b.meta.filter(x=>x[0]==='track').map(x=>x[1]),['PageView','InitiateCheckout','Lead','Contact']);assert.ok(ga.find(x=>x[1]==='begin_checkout')[2].items.length===1);assert.equal(commands(b).filter(x=>x[0]==='set'&&x[1]==='user_data').length,0);});
test('navigation runs once and still runs with blocked Google scripts',()=>{const b=boot();let count=0;b.window.erankerTrack('Contact',{},()=>count++);b.timers.forEach(f=>f());const event=commands(b).find(x=>x[1]==='whatsapp_contact');event[2].event_callback();assert.equal(count,1);});
