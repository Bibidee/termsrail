'use client';
import Link from 'next/link';
import {useState} from 'react';
import {clientFor,connectWallet,readAllRecords,writeAndRead,requireContract,genToWei,Eip1193,type LifecycleEvent} from '../../../lib/genlayer';

const MAX_ESCROW_DURATION_SECONDS=2592000;

function resolveEscrowId(rows: unknown[], planId: string, recipient: string, payer: string, amount: bigint, excluded = new Set<string>()): string|undefined {
  for (const raw of [...rows].reverse()) { try { const row=JSON.parse(String(raw)) as {escrow_id?:string;plan_id?:string;recipient?:string;payer?:string;amount?:string|number}; const id=String(row.escrow_id??''); if (id&&!excluded.has(id)&&row.plan_id===planId&&row.recipient?.toLowerCase()===recipient.toLowerCase()&&row.payer?.toLowerCase()===payer.toLowerCase()&&BigInt(row.amount??0)===amount) return id; } catch {} }
  return undefined;
}

export default function NewEscrow(){
  const[planId,setPlanId]=useState('0'),[recipient,setRecipient]=useState(''),[amount,setAmount]=useState('0.001'),[deadline,setDeadline]=useState(''),[milestoneSpec,setMilestoneSpec]=useState('{"deliverable":"","acceptance_criteria":[""],"evidence_requirements":"Hash-verified evidence must identify the deliverable.","completion_definition":"All acceptance criteria are satisfied."}'),[status,setStatus]=useState(''),[txHash,setTxHash]=useState(''),[canonicalId,setCanonicalId]=useState<string>();
  const submit=async(e:React.FormEvent)=>{e.preventDefault();try{
    const p=(window as Window&{ethereum?:Eip1193}).ethereum;if(!p)throw Error('Wallet unavailable');
    let parsedSpec:unknown;try{parsedSpec=JSON.parse(milestoneSpec);if(!parsedSpec||typeof parsedSpec!=='object')throw Error()}catch{throw Error('Milestone specification must be valid JSON with a deliverable and acceptance_criteria.')}
    const a=await connectWallet(p),c=clientFor(a as `0x${string}`,p),end=Math.floor(new Date(deadline).getTime()/1000),value=genToWei(amount);
    if(!/^0x[0-9a-fA-F]{40}$/.test(recipient.trim()))throw Error('Enter a valid recipient wallet address.');
    const planRaw=await c.readContract({address:requireContract(),functionName:'get_plan',args:[planId] as never[]}) as string;
    if(!planRaw)throw Error('Plan not found.');
    const plan=JSON.parse(planRaw) as {creator?:string};
    if(String(plan.creator??'').toLowerCase()!==a.toLowerCase())throw Error('Connect the wallet that created this plan to create the escrow.');
    const executable=await c.readContract({address:requireContract(),functionName:'is_plan_executable',args:[planId] as never[]}) as boolean;
    if(!executable)throw Error('Plan authorization is not currently executable. Authorize or reassess the plan first.');
    const now=Math.floor(Date.now()/1000);if(!Number.isFinite(end)||end<=now)throw Error('Deadline must be in the future');
    if(end>now+MAX_ESCROW_DURATION_SECONDS)throw Error('Deadline cannot exceed 30 days from now.');
    if(value<=0n)throw Error('Escrow amount must be greater than zero.');
    setStatus('SUBMITTING ESCROW TERMS');
    const before=await readAllRecords((o,l)=>c.readContract({address:requireContract(),functionName:'get_escrows',args:[o,l] as never[]}) as Promise<string[]>);
    const existing=new Set(before.map(raw=>{try{return String(JSON.parse(raw).escrow_id??'')}catch{return ''}}).filter(Boolean));
    const result=await writeAndRead(a as `0x${string}`,p,'create_escrow',[planId,recipient.trim(),value,BigInt(end),JSON.stringify(parsedSpec)],()=>readAllRecords((o,l)=>c.readContract({address:requireContract(),functionName:'get_escrows',args:[o,l] as never[]}) as Promise<string[]>),rows=>resolveEscrowId(rows,planId,recipient.trim(),a,value,existing)!==undefined,(x:LifecycleEvent)=>{setStatus(x.phase);if(x.hash)setTxHash(x.hash)},(rows)=>{const id=resolveEscrowId(rows,planId,recipient.trim(),a,value,existing);if(id)setCanonicalId(id)});
    const id=resolveEscrowId(result.state,planId,recipient,a,value,existing);if(id)setCanonicalId(id);
    setStatus('ESCROW CREATED · FUNDING REQUIRED ON CANONICAL DETAIL');
  }catch(e){setStatus(e instanceof Error?e.message:'Escrow creation failed')}};
  return <div className="shell narrow"><p className="kicker">ESCROW BUILDER / 01</p><h1>Create Escrow</h1><p className="lede">Create a plan-bound escrow, then deposit the exact GEN amount from its canonical detail page.</p><form className="form" onSubmit={submit}><fieldset><legend>01 — BINDING</legend><label>Plan ID<input required value={planId} onChange={e=>setPlanId(e.target.value)}/></label><label>Recipient wallet<input required value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="0x…"/></label></fieldset><fieldset><legend>02 — ACCEPTANCE CRITERIA</legend><label>Immutable milestone specification<textarea required value={milestoneSpec} onChange={e=>setMilestoneSpec(e.target.value)} rows={8}/><small className="muted">This bounded JSON is hashed before funding and copied into the funding snapshot. It cannot be changed after GEN is deposited.</small></label></fieldset><fieldset><legend>03 — TERMS</legend><label>Amount (GEN)<input required inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/><small className="muted">The contract requires this exact amount in wei when funding.</small></label><label>Deadline<input required type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/><small className="muted">The deadline must be in the future and within 30 days. A valid plan authorization is required when creating and funding; once GEN is held, recovery follows the immutable funding snapshot.</small></label></fieldset><button className="button primary">CREATE ESCROW →</button><Link className="button" href="/escrow">CANCEL</Link>{canonicalId&&<Link className="button" href={`/escrow/${canonicalId}`}>OPEN ESCROW / FUND →</Link>}{(status||txHash)&&<div className="tx-progress">{status}{txHash&&<><br/><span className="mono">{txHash}</span> <a href={`https://explorer-studio.genlayer.com/tx/${txHash}`} target="_blank" rel="noreferrer">VIEW TRANSACTION ↗</a></>}</div>}</form></div>
}
