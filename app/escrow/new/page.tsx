'use client';
import Link from 'next/link';
import {useState} from 'react';
import {clientFor,connectWallet,readAllRecords,writeAndRead,requireContract,genToWei,Eip1193,type LifecycleEvent} from '../../../lib/genlayer';

function resolveEscrowId(rows: unknown[], planId: string, recipient: string): string|undefined {
  for (const raw of rows) { try { const row=JSON.parse(String(raw)) as {escrow_id?:string;plan_id?:string;recipient?:string}; if (row.plan_id===planId && row.recipient===recipient) return row.escrow_id; } catch {} }
  return undefined;
}

export default function NewEscrow(){
  const[planId,setPlanId]=useState('0'),[recipient,setRecipient]=useState(''),[amount,setAmount]=useState('0.001'),[deadline,setDeadline]=useState(''),[status,setStatus]=useState(''),[canonicalId,setCanonicalId]=useState<string>();
  const submit=async(e:React.FormEvent)=>{e.preventDefault();try{
    const p=(window as Window&{ethereum?:Eip1193}).ethereum;if(!p)throw Error('Wallet unavailable');
    const a=await connectWallet(p),c=clientFor(a as `0x${string}`,p),end=Math.floor(new Date(deadline).getTime()/1000),value=genToWei(amount);
    if(!Number.isFinite(end)||end<=Math.floor(Date.now()/1000))throw Error('Deadline must be in the future');
    if(value<=0n)throw Error('Escrow amount must be greater than zero.');
    setStatus('SUBMITTING ESCROW TERMS');
    const result=await writeAndRead(a as `0x${string}`,p,'create_escrow',[planId,recipient,value,BigInt(end)],()=>readAllRecords((o,l)=>c.readContract({address:requireContract(),functionName:'get_escrows',args:[o,l] as never[]}) as Promise<string[]>),rows=>resolveEscrowId(rows,planId,recipient)!==undefined,(x:LifecycleEvent)=>setStatus(x.phase),(rows)=>{const id=resolveEscrowId(rows,planId,recipient);if(id)setCanonicalId(id)});
    const id=resolveEscrowId(result.state,planId,recipient);if(id)setCanonicalId(id);
    setStatus('ESCROW CREATED · FUNDING REQUIRED ON CANONICAL DETAIL');
  }catch(e){setStatus(e instanceof Error?e.message:'Escrow creation failed')}};
  return <div className="shell narrow"><p className="kicker">ESCROW BUILDER / 01</p><h1>Create Escrow</h1><p className="lede">Create a plan-bound escrow, then deposit the exact GEN amount from its canonical detail page.</p><form className="form" onSubmit={submit}><fieldset><legend>01 — BINDING</legend><label>Plan ID<input required value={planId} onChange={e=>setPlanId(e.target.value)}/></label><label>Recipient wallet<input required value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="0x…"/></label></fieldset><fieldset><legend>02 — TERMS</legend><label>Amount (GEN)<input required inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/><small className="muted">The contract requires this exact amount in wei when funding.</small></label><label>Deadline<input required type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label></fieldset><button className="button primary">CREATE ESCROW →</button><Link className="button" href="/escrow">CANCEL</Link>{canonicalId&&<Link className="button" href={`/escrow/${canonicalId}`}>OPEN ESCROW / FUND →</Link>}{status&&<div className="tx-progress">{status}</div>}</form></div>
}
