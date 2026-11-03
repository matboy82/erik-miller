import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { operatorPage } from '../src/operator.ts';
import { defaultConversionConfig } from '../src/conversion.ts';

test('operator settings load before editing and preserve partially entered rows on save and reload', async () => {
  const html = await operatorPage().text();
  assert.match(html, /id="conversion-fields" disabled/);
  assert.match(html, /id="conversion-form" novalidate/);
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script);
  type Element = { id: string; value: string; checked: boolean; disabled: boolean; textContent: string; style: Record<string, string>; append: (...items: unknown[]) => void; oninput?: () => void; onclick?: () => Promise<void>; onsubmit?: (event: {preventDefault:()=>void}) => Promise<void> };
  const elements = new Map<string, Element>();
  const create = (): Element => {
    let id='';
    return { get id(){return id;}, set id(value:string){id=value;elements.set(value,this);}, value:'', checked:false, disabled:false, textContent:'', style:{}, append(){} };
  };
  const get=(id:string):Element => { if(!elements.has(id)){const item=create();item.id=id;} return elements.get(id)!; };
  let saved=structuredClone(defaultConversionConfig) as unknown;
  const existing={...structuredClone(defaultConversionConfig),nurture:{enabled:true,touches:[{day:1,subject:'Existing subject',text:'Existing message'}]}};
  saved=existing;
  const calls:string[]=[];
  const fetch=async (_url:string, options?:{method?:string;body?:string})=>{
    const method=options?.method ?? 'GET';calls.push(method);
    if(method==='PUT'){saved=JSON.parse(options!.body!);return {ok:true,json:async()=>({revision:'new-revision'})};}
    return {ok:true,json:async()=>({revision:'old-revision',draft:saved,approvedBy:null,enabled:false,emailBound:false})};
  };
  runInNewContext(script,{document:{getElementById:get,createElement:create,querySelectorAll:()=>[]},fetch,JSON,Number,URL});
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(calls,['GET']);
  assert.equal(get('conversion-fields').disabled,false);
  assert.equal(get('touch-subject-0').value,'Existing subject');
  get('band-scope-0').value='Cabinetry and layout';
  get('link-label-1').value='Google';
  get('touch-subject-2').value='Third message draft';
  get('conversion-form').oninput!();
  assert.equal(get('conversion-load').disabled,true);
  assert.equal(get('conversion-approve').disabled,true);
  await get('conversion-form').onsubmit!({preventDefault(){}});
  assert.match(get('conversion-result').textContent,/Draft saved/);
  const draft=saved as {budgetBands:{min:number|null;max:number|null;scope:string}[]; reviews:{links:{label:string;url:string}[]};nurture:{touches:{day:number|null;subject:string}[]}};
  assert.deepEqual(JSON.parse(JSON.stringify(draft.budgetBands)),[{projectType:'Kitchen',min:null,max:null,scope:'Cabinetry and layout'}]);
  assert.deepEqual(JSON.parse(JSON.stringify(draft.reviews.links)),[{label:'',url:''},{label:'Google',url:''}]);
  assert.equal(draft.nurture.touches[2].subject,'Third message draft');
  assert.equal(draft.nurture.touches[2].day,null);
  await get('conversion-load').onclick!();
  assert.equal(get('band-scope-0').value,'Cabinetry and layout');
  assert.equal(get('band-min-0').value,'');
  assert.equal(get('link-label-1').value,'Google');
  assert.equal(get('touch-subject-2').value,'Third message draft');
  assert.equal(get('touch-day-2').value,'');
});
