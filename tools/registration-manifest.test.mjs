import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root,'docs/registration-manifest.json'),'utf8'));
const html = fs.readFileSync(path.join(root,'client/src/content/registration-reference.html'),'utf8');
const decode = (s='') => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
function attrs(tag){const out={};for(const m of tag.matchAll(/([^\s=<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)){if(['input','select','textarea'].includes(m[1].toLowerCase()))continue;out[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]??'');}return out;}
function staticFields(form){const out=[];const re=/<(input|select|textarea)\b([^>]*)>/gi;let m;while((m=re.exec(form))){const tag=m[1].toLowerCase(),a=attrs(m[2]);let inner='';if(tag!=='input'){const close=new RegExp('</'+tag+'\\s*>','ig');close.lastIndex=re.lastIndex;const end=close.exec(form);if(end){inner=form.slice(re.lastIndex,end.index);re.lastIndex=close.lastIndex;}}const options=[...inner.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option\s*>/gi)].map(x=>decode(x[2].replace(/<[^>]+>/g,'').trim()));out.push({name:a.name||a.id||'',type:a.type||(tag==='textarea'?'textarea':tag==='select'?'select':'text'),placeholder:a.placeholder??null,required:Object.hasOwn(a,'required'),options,accept:a.accept??null,maxlength:a.maxlength??null,readonly:Object.hasOwn(a,'readonly'),defaultValue:a.value??null});}return out;}
function textContent(html){return decode(html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());}
function formFragment(id){const start=html.indexOf(`<form id="${id}"`);assert.notEqual(start,-1,`missing form ${id}`);const end=html.indexOf('</form>',start);assert.notEqual(end,-1,`unclosed form ${id}`);return html.slice(start,end+7);}
for(const [id,expected] of Object.entries(manifest.forms)){
 if(!id.endsWith('Form')) continue;
 test(`registration manifest contract: ${id}`,()=>{
  const fragment=formFragment(id), actual=staticFields(fragment);
  assert.equal(actual.length,expected.fields.length,`${id}: static field count changed`);
  assert.deepEqual(actual,expected.fields.map(({name,type,placeholder,required,options,accept,maxlength,readonly,defaultValue})=>({name,type,placeholder,required,options,accept,maxlength,readonly,defaultValue})),`${id}: field order or attributes changed`);
  const visibleText=textContent(fragment); for(const field of expected.fields) if(field.label) assert.ok(visibleText.includes(field.label.replace(/\s+/g,' ').trim()),`${id}: label missing: ${field.label}`);
  for(const button of expected.buttons) assert.ok(fragment.includes(button),`${id}: button text missing: ${button}`);
  for(const section of expected.sections) assert.ok(fragment.includes(section.title),`${id}: section title missing: ${section.title}`);
 });
}
test('registration manifest contract: dynamic registration behavior stays documented',()=>{
 assert.deepEqual(manifest.dynamicBehavior.registrationTypeOptions,['Member','Cadet','Volunteer','Intern & Alumni Member']);
 assert.ok(manifest.dynamicBehavior.behavior.some(x=>x.includes('State selection')));
 assert.ok(manifest.dynamicBehavior.behavior.some(x=>x.includes('simulated payment')));
});
