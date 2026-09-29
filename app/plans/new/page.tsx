'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {clientFor,connectWallet,writeAndRead,requireContract,Eip1193,type LifecycleEvent,readAllRecords,resolvePlanId} from '../../../lib/genlayer';

const parse=(raw:string)=>{try{return JSON.parse(raw)}catch{return {}}};

export default function NewPlan(){
  const router=useRouter();
  const[title,setTitle]=useState(''),[description,setDescription]=useState(''),[serviceId,setServiceId]=useState('0'),[actionId,setActionId]=useState('0'),[status,setStatus]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();try{
    const p=(window as Window&{ethereum?:Eip1193}).ethereum;if(!p)throw Error('Wallet unavailable');
    const a=await connectWallet(p),c=clientFor(a as `0x${string}`,p),steps=[{service_id:serviceId,action_id:actionId,required:true}],encoded=JSON.stringify(steps);
    const readPlans=()=>readAllRecords((o,l)=>c.readContract({address:requireContract(),functionName:'get_plans',args:[o,l] as never[]}) as Promise<string[]>);
    const before=await readPlans(),beforeIds=new Set(before.map(raw=>String(parse(raw).plan_id??parse(raw).id??'')));
    const expected={creator:a,title,description,steps};
    setStatus('SUBMITTING');
    const result=await writeAndRead(a as `0x${string}`,p,'create_plan',[title,description,encoded],readPlans,rows=>{const id=resolvePlanId(rows,expected);return id!==undefined&&!beforeIds.has(String(id))},(x:LifecycleEvent)=>setStatus(x.phase));
    const id=resolvePlanId(result.state as string[],expected);if(id===undefined)throw Error('Canonical plan ID could not be resolved.');
    setStatus('PLAN CREATED · CANONICAL READBACK COMPLETE');router.push(`/plans/${id}`);
  }catch(e){setStatus(e instanceof Error?e.message:'Plan creation failed')}};
  return <div className="shell narrow"><p className="kicker">PLAN BUILDER / 01</p><h1>Create an Agent Plan</h1><p className="lede">Bind a bounded sequence to canonical services and actions.</p><form className="form" onSubmit={submit}><fieldset><legend>01 — PLAN</legend><label>Title<input required value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Description<textarea required value={description} onChange={e=>setDescription(e.target.value)}/></label></fieldset><fieldset><legend>02 — FIRST STEP</legend><label>Service ID<input required value={serviceId} onChange={e=>setServiceId(e.target.value)}/></label><label>Action ID<input required value={actionId} onChange={e=>setActionId(e.target.value)}/></label></fieldset><button className="button primary">CREATE PLAN →</button><Link className="button" href="/plans">CANCEL</Link>{status&&<div className="tx-progress">{status}</div>}</form></div>;
}
