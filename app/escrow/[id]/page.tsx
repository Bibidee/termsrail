'use client';

import {useParams} from 'next/navigation';
import {useEffect,useState} from 'react';
import {clientFor,connectWallet,getAuthorizedAccount,writeAndRead,requireContract,weiToGen,Eip1193,type LifecycleEvent} from '../../../lib/genlayer';

const parse=(value:string)=>{try{return JSON.parse(value)}catch{return {}}};

export default function EscrowDetail(){
  const id=String(useParams<{id:string}>().id??'');
  const [escrow,setEscrow]=useState<any>(),[execution,setExecution]=useState<any>(),[balance,setBalance]=useState('0'),[completionId,setCompletionId]=useState(''),[completionVerdict,setCompletionVerdict]=useState(''),[completionEvidenceState,setCompletionEvidenceState]=useState('PENDING'),[disputeId,setDisputeId]=useState(''),[disputeVerdict,setDisputeVerdict]=useState(''),[disputeEvidenceCount,setDisputeEvidenceCount]=useState(0),[status,setStatus]=useState('LOADING CANONICAL ESCROW…'),[statement,setStatement]=useState(''),[urls,setUrls]=useState(''),[hashes,setHashes]=useState(''),[disputeText,setDisputeText]=useState(''),[disputeUrls,setDisputeUrls]=useState(''),[disputeHashes,setDisputeHashes]=useState('');

  const load=async()=>{try{
    const p=(window as Window&{ethereum?:Eip1193}).ethereum;if(!p)throw Error('CONNECT WALLET TO LOAD CANONICAL ESCROW');
    const a=await getAuthorizedAccount(p);if(!a)throw Error('CONNECT WALLET TO LOAD CANONICAL ESCROW');
    const c=clientFor(a as `0x${string}`,p);
    const [raw,state,custody,completions,disputes]=await Promise.all([
      c.readContract({address:requireContract(),functionName:'get_escrow',args:[id] as never[]}) as Promise<string>,
      c.readContract({address:requireContract(),functionName:'get_escrow_execution_state',args:[id] as never[]}) as Promise<string>,
      c.readContract({address:requireContract(),functionName:'get_custody_balance',args:[] as never[]}) as Promise<bigint>,
      c.readContract({address:requireContract(),functionName:'get_completions',args:[id,0n,50n] as never[]}) as Promise<string[]>,
      c.readContract({address:requireContract(),functionName:'get_disputes',args:[id,0n,50n] as never[]}) as Promise<string[]>,
    ]);
    if(!raw)throw Error('ESCROW NOT FOUND');
    setEscrow(parse(raw));setExecution(parse(state));setBalance(String(custody));
    const latest=Array.isArray(completions)?completions.at(-1):undefined;setCompletionId(latest?parse(latest).completion_id:'');
    const latestCompletionId=latest?String(parse(latest).completion_id??''):'';
    const latestDispute=Array.isArray(disputes)?disputes.at(-1):undefined;const latestDisputeRecord=latestDispute?parse(latestDispute):{};const latestDisputeId=latestDispute?String(latestDisputeRecord.dispute_id??''):'';setDisputeId(latestDisputeId);setDisputeVerdict(String(latestDisputeRecord.adjudication_verdict??''));
    const [adjudications,evidence]=await Promise.all([
      latestCompletionId?c.readContract({address:requireContract(),functionName:'get_completion_adjudications',args:[latestCompletionId,0n,50n] as never[]}).catch(()=>[]) as Promise<string[]>:Promise.resolve([]),
      latestDisputeId?c.readContract({address:requireContract(),functionName:'get_dispute_evidence',args:[latestDisputeId] as never[]}).catch(()=> '[]') as Promise<string>:Promise.resolve('[]'),
    ]);
    const latestAdjudication=adjudications.length?parse(adjudications.at(-1)??''):{}; setCompletionVerdict(String(latestAdjudication.verdict??'')); setCompletionEvidenceState(String(latestAdjudication.evidence_state??'PENDING'));
    const parsedEvidence=parse(evidence);setDisputeEvidenceCount(Array.isArray(parsedEvidence)?parsedEvidence.length:parsedEvidence?.statement?1:0);
    setStatus('CANONICAL ESCROW LOADED');
  }catch(e){setStatus(e instanceof Error?e.message:'Escrow read failed')}};

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{const timer=window.setTimeout(()=>void load(),0);return()=>window.clearTimeout(timer)},[id]);

  const mutate=async(method:string,args:unknown[],predicate:(v:string)=>boolean,label:string,value:bigint=0n)=>{try{
    const p=(window as Window&{ethereum?:Eip1193}).ethereum;if(!p)throw Error('Wallet unavailable');
    const a=await connectWallet(p),c=clientFor(a as `0x${string}`,p);
    const recordRead=()=>{
      if(method==='adjudicate_completion')return c.readContract({address:requireContract(),functionName:'get_completion',args:[String(args[0])] as never[]}) as Promise<string>;
      if(method==='adjudicate_dispute')return c.readContract({address:requireContract(),functionName:'get_dispute',args:[String(args[0])] as never[]}) as Promise<string>;
      if(method==='submit_dispute_evidence')return c.readContract({address:requireContract(),functionName:'get_dispute_evidence',args:[String(args[0])] as never[]}) as Promise<string>;
      return c.readContract({address:requireContract(),functionName:'get_escrow',args:[id] as never[]}) as Promise<string>;
    };
    await writeAndRead(a as `0x${string}`,p,method,args,recordRead,predicate,(x:LifecycleEvent)=>setStatus(x.phase),undefined,value);
    setStatus(label);await load();
  }catch(e){setStatus(e instanceof Error?e.message:'Transaction failed')}};

  const submitEvidence=async(e:React.FormEvent)=>{e.preventDefault();await mutate('submit_completion',[id,statement,JSON.stringify(urls.split(',').map(x=>x.trim()).filter(Boolean)),JSON.stringify(hashes.split(',').map(x=>x.trim()).filter(Boolean))],v=>parse(v).status==='UNDER_REVIEW','EVIDENCE SUBMITTED · CANONICAL READBACK COMPLETE')};
  const submitDisputeEvidence=async(e:React.FormEvent)=>{e.preventDefault();if(!disputeId)return;await mutate('submit_dispute_evidence',[disputeId,disputeText,JSON.stringify(disputeUrls.split(',').map(x=>x.trim()).filter(Boolean)),JSON.stringify(disputeHashes.split(',').map(x=>x.trim()).filter(Boolean))],v=>{const evidence=parse(v);return Array.isArray(evidence)&&evidence.length>disputeEvidenceCount},'DISPUTE EVIDENCE APPENDED')};
  const active=escrow?.custody==='HELD'&&!['RELEASED','REFUNDED','EXPIRED'].includes(escrow?.status);
  const refundable=active||(escrow?.custody==='HELD'&&escrow?.status==='EXPIRED');
  const settlementOutcome=String(execution?.settlement_outcome??escrow?.settlement_outcome??'');

  return <div className="shell narrow"><p className="kicker">ESCROW / {id}</p><h1>Escrow {id}</h1><div className="notice">{status}</div>{escrow&&<><section className="panel"><div className="dimension"><span>PLAN</span><strong>{escrow.plan_id}</strong></div><div className="dimension"><span>STATUS</span><strong>{escrow.status}</strong></div><div className="dimension"><span>CUSTODY</span><strong>{escrow.custody??'UNFUNDED'}</strong></div><div className="dimension"><span>AMOUNT</span><strong>{weiToGen(escrow.amount)} GEN</strong></div><div className="dimension"><span>CONTRACT CUSTODY BALANCE</span><strong>{weiToGen(balance)} GEN</strong></div><div className="dimension"><span>SETTLEMENT</span><strong>{escrow.settlement_status??'NONE'}</strong></div><div className="dimension"><span>CANONICAL OUTCOME</span><strong>{settlementOutcome||'UNRESOLVED'}</strong></div><div className="dimension"><span>COMPLETION EVIDENCE STATE</span><strong>{completionEvidenceState}</strong></div><div className="dimension"><span>COMPLETION ADJUDICATION</span><strong>{completionVerdict||'PENDING'}</strong></div><div className="dimension"><span>DISPUTE ADJUDICATION</span><strong>{disputeVerdict||'PENDING'}</strong></div><div className="dimension"><span>RECIPIENT</span><strong className="mono">{escrow.recipient}</strong></div></section><section className="panel"><div className="panel-title">EXECUTION / SETTLEMENT GATE</div><div className="dimension"><span>PLAN AUTHORIZATION BINDING</span><strong>{execution?.authorization_identity_match?'CURRENT':'STALE'}</strong></div><div className="dimension"><span>EXECUTION ALLOWED</span><strong>{execution?.execution_allowed?'YES':'NO'}</strong></div><div className="dimension"><span>DEADLINE VALID</span><strong>{execution?.deadline_valid?'YES':'NO'}</strong></div><div className="dimension"><span>WHY THE GATE IS CLOSED</span><strong>{execution?.reason??'UNKNOWN'}</strong></div><p className="muted">Settlement follows the canonical outcome. Callers cannot redirect a finalized RELEASE or REFUND.</p></section><div className="actions"><button className="button" disabled={escrow.status!=='CREATED'} onClick={()=>mutate('fund_escrow',[id],v=>v.includes('FUNDED'),'ESCROW FUNDED · GEN HELD',BigInt(escrow.amount??0))}>FUND WITH GEN</button><button className="button" disabled={escrow.status!=='FUNDED'} onClick={()=>mutate('lock_escrow',[id],v=>v.includes('LOCKED'),'ESCROW LOCKED')}>LOCK</button><button className="button" disabled={!active||execution?.authorization_identity_match} onClick={()=>mutate('resume_escrow_after_reassessment',[id],v=>Boolean(parse(v).authorization_id),'ESCROW REBOUND TO CURRENT PLAN AUTHORIZATION')}>REBIND AFTER REASSESSMENT</button><button className="button" disabled={!active||execution?.deadline_valid} onClick={()=>mutate('expire_escrow',[id],v=>v.includes('EXPIRED'),'ESCROW EXPIRED · REFUND NOW AVAILABLE')}>MARK EXPIRED</button><button className="button" disabled={!completionId||escrow.status!=='UNDER_REVIEW'||!!completionVerdict} onClick={()=>mutate('adjudicate_completion',[completionId],v=>parse(v).status==='ADJUDICATED','COMPLETION ADJUDICATED')}>ADJUDICATE COMPLETION</button><button className="button primary" disabled={!active||settlementOutcome!=='RELEASE'} onClick={()=>mutate('release_escrow',[id],v=>v.includes('RELEASED'),'FUNDS RELEASE QUEUED')}>RELEASE TO RECIPIENT</button><button className="button" disabled={!refundable||(settlementOutcome!==''&&settlementOutcome!=='REFUND')} onClick={()=>mutate('refund_escrow',[id],v=>v.includes('REFUNDED'),'REFUND QUEUED')}>REFUND TO PAYER</button></div></>}
  {completionId&&<section className="panel"><div className="panel-title">LATEST COMPLETION REVIEW</div><div className="dimension"><span>COMPLETION ID</span><strong>{completionId}</strong></div><div className="dimension"><span>ADJUDICATION</span><strong>{completionVerdict||'PENDING'}</strong></div></section>}
  <form className="form" onSubmit={submitEvidence}><fieldset><legend>COMPLETION EVIDENCE</legend><label>Statement<textarea required value={statement} onChange={e=>setStatement(e.target.value)}/></label><label>Evidence URLs<input value={urls} onChange={e=>setUrls(e.target.value)} placeholder="https://… (comma separated)"/></label><label>Evidence hashes<input value={hashes} onChange={e=>setHashes(e.target.value)} placeholder="sha256… (comma separated)"/></label></fieldset><button className="button primary" disabled={!execution?.execution_allowed}>SUBMIT EVIDENCE →</button></form>
  <form className="form" onSubmit={async e=>{e.preventDefault();await mutate('open_dispute',[id,disputeText],v=>v.includes('DISPUTED'),'DISPUTE OPENED')}}><fieldset><legend>DISPUTE</legend><label>Statement<textarea required value={disputeText} onChange={e=>setDisputeText(e.target.value)}/></label></fieldset><button className="button" disabled={!execution?.execution_allowed&&escrow?.status!=='UNDER_REVIEW'}>OPEN DISPUTE</button></form>
  {disputeId&&<><form className="form" onSubmit={submitDisputeEvidence}><fieldset><legend>DISPUTE EVIDENCE / {disputeId} · {disputeEvidenceCount} SUBMISSIONS</legend><label>Statement<textarea required value={disputeText} onChange={e=>setDisputeText(e.target.value)}/></label><label>Evidence URLs<input value={disputeUrls} onChange={e=>setDisputeUrls(e.target.value)}/></label><label>Evidence hashes<input value={disputeHashes} onChange={e=>setDisputeHashes(e.target.value)}/></label></fieldset><button className="button">APPEND DISPUTE EVIDENCE</button></form><div className="actions"><button className="button" disabled={disputeVerdict!==''} onClick={()=>mutate('adjudicate_dispute',[disputeId],v=>parse(v).status==='UNDER_REVIEW','DISPUTE ADJUDICATED · OUTCOME PENDING')}>ADJUDICATE DISPUTE</button><button className="button primary" disabled={!['RELEASE','REFUND'].includes(disputeVerdict)||settlementOutcome!==disputeVerdict} onClick={()=>mutate('resolve_dispute',[disputeId],v=>v.includes('RESOLVED_'),'EXECUTING CANONICAL DISPUTE OUTCOME')}>EXECUTE CANONICAL OUTCOME</button><button className="button" disabled={disputeVerdict!=='OTHER'} onClick={()=>mutate('resolve_dispute_choice',[disputeId,'REFUND'],v=>v.includes('RESOLVED_REFUND'),'PAYER CHOICE RECORDED · REFUND')}>PAYER CHOICE · REFUND</button><button className="button" disabled={disputeVerdict!=='OTHER'} onClick={()=>mutate('resolve_dispute_choice',[disputeId,'RELEASE'],v=>v.includes('RESOLVED_RELEASE'),'PAYER CHOICE RECORDED · RELEASE')}>PAYER CHOICE · RELEASE</button></div></>}
  </div>;
}
