import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ExecutionResult, executionResultNumberToName } from 'genlayer-js/types';

export const STUDIONET_CHAIN_ID = 61999;
export const FROZEN_TERMSRAIL_CONTRACT = '0xc515F0742D0d94cA3EE7d50702C0669c2B03EC0b' as const;
export const PREVIOUS_CUSTODY_TERMSRAIL_CONTRACT = '0x744102f8f1C89a7568c135f3cbB650f6995e1599' as const;
export const PREVIOUS_V3_TERMSRAIL_CONTRACT = '0x1Bdd534a9db2519F130462ea8666B25cB5764C4b' as const;
export const ACCEPTED_V2_LOGICAL_CONTRACT = '0xcbC2eD344cb21dB2Dc0E7a4C22C67BF350F037dF' as const;
export const ACCEPTED_V1_CONTRACT = '0x1de664E55F92BAcda496afBCfFA1b9b0Cf0a8457' as const;
const ADDRESS_PATTERN=/^0x[0-9a-fA-F]{40}$/;
export function resolveContractAddress(value:string|undefined): `0x${string}` { const candidate=(value??'').trim(); return (ADDRESS_PATTERN.test(candidate)?candidate:FROZEN_TERMSRAIL_CONTRACT) as `0x${string}`; }
// Keep the runtime value untrusted until requireContract validates it.  A
// missing or malformed production variable must surface as a configuration
// error instead of silently targeting a different deployment.
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS??'').trim() as `0x${string}`;
export type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void };

export function requireContract() { if (!ADDRESS_PATTERN.test(CONTRACT_ADDRESS)) throw new Error('TermsRail contract is not configured correctly.'); return CONTRACT_ADDRESS; }
export async function getAuthorizedAccount(provider: Eip1193): Promise<string> { const accounts = await provider.request({ method: 'eth_accounts' }) as string[]; return accounts?.[0] ?? ''; }
// StudioNet may place execution_result inside consensus_data.leader_receipt[], so arrays must be traversed.
export function normalizeExecutionResult(receipt: unknown): string | undefined { const seen=new Set<unknown>(); const scalar=(value:unknown):string|undefined=>{if(typeof value==='number'||typeof value==='bigint')return executionResultNumberToName[String(value) as keyof typeof executionResultNumberToName];if(typeof value==='string'){const n=value.trim().toUpperCase();if(n==='1'||n==='SUCCESS')return ExecutionResult.FINISHED_WITH_RETURN;if(n==='2'||n==='ERROR'||n==='FAILURE')return ExecutionResult.FINISHED_WITH_ERROR;if(n==='0')return 'NOT_VOTED';if(n==='FINISHED_WITH_RETURN'||n==='FINISHED_WITH_ERROR'||n==='NOT_VOTED')return n}return undefined};const visit=(value:unknown,allowScalar=false):string|undefined=>{if(value===null||value===undefined||seen.has(value))return undefined;if(allowScalar){const direct=scalar(value);if(direct)return direct}if(Array.isArray(value)){seen.add(value);let provisional:string|undefined;for(const item of value){const result=visit(item);if(result===ExecutionResult.FINISHED_WITH_RETURN)return result;if(result&&result!=='NOT_VOTED')provisional=result}return provisional}if(typeof value==='object'){seen.add(value);const record=value as Record<string,unknown>;for(const key of ['txExecutionResultName','tx_execution_result_name','txExecutionResult','tx_execution_result','execution_result','executionResult']){const result=visit(record[key],true);if(result)return result}for(const key of ['data','consensus_data','consensusData','leader_receipt','leaderReceipt','validators','genvm_result','genvmResult','receipt','receipts']){const result=visit(record[key]);if(result)return result}}return undefined};return scalar(receipt)??visit(receipt); }
function boundedExecutionReason(value: unknown): string | undefined {
  const seen = new Set<unknown>();
  const visit = (node: unknown): string | undefined => {
    if (node === null || node === undefined || seen.has(node)) return undefined;
    if (typeof node === 'string') {
      const text = node.trim().replace(/\s+/g, ' ');
      if (!text || text.length > 240 || /^(FINISHED_WITH_ERROR|ERROR|FAILURE)$/i.test(text)) return undefined;
      return text;
    }
    if (typeof node !== 'object') return undefined;
    seen.add(node);
    if (Array.isArray(node)) { for (const item of node) { const result = visit(item); if (result) return result; } return undefined; }
    const record = node as Record<string, unknown>;
    for (const key of ['error_description','errorDescription','revert_reason','revertReason','raw_error','rawError','result','message']) {
      const result = visit(record[key]);
      if (result) return result;
    }
    for (const key of ['data','genvm_result','genvmResult','consensus_data','consensusData','leader_receipt','leaderReceipt','receipt']) {
      const result = visit(record[key]);
      if (result) return result;
    }
    return undefined;
  };
  return visit(value);
}

export function executionFailureMessage(execution: unknown, hash?: string): string {
  const normalized = normalizeExecutionResult(execution);
  const reason = boundedExecutionReason(execution);
  const suffix = reason ? ` — ${reason}` : '';
  return `Transaction execution failed: ${normalized ?? 'UNKNOWN'}${suffix}${hash ? ` (${hash})` : ''}`;
}

export function assertSuccessfulExecution(execution: unknown): void {
  if (normalizeExecutionResult(execution) !== ExecutionResult.FINISHED_WITH_RETURN) throw new Error(executionFailureMessage(execution));
}
export const FINALITY_INTERVAL_MS=3000;
export const FINALITY_RETRIES=100;
const isFinalized=(receipt:unknown)=>{const r=receipt as {status?:unknown;statusName?:unknown;status_name?:unknown};const status=r?.status??r?.statusName??r?.status_name;return status===7||status==='7'||String(status).toUpperCase()==='FINALIZED'};
export async function waitForFinalizedReceipt(client:any,hash:string,interval=FINALITY_INTERVAL_MS,retries=FINALITY_RETRIES):Promise<any>{let receipt: any;try{receipt=await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval,retries,fullTransaction:true} as never);if(isFinalized(receipt))return receipt}catch{}for(let attempt=0;attempt<retries;attempt++){if(attempt>0||!receipt)await new Promise(resolve=>setTimeout(resolve,interval));try{receipt=await client.getTransaction({hash});}catch(error){if(attempt===retries-1)throw error;continue}if(isFinalized(receipt))return receipt;if(String((receipt as {status?:unknown})?.status).toUpperCase()==='CANCELED')throw new Error('Transaction was canceled');}throw new Error(`Timed out waiting for transaction ${hash} to reach FINALIZED.`)}
export async function waitForExecutionResult(client:any,hash:string,initialReceipt:unknown,interval=1500,retries=200):Promise<string>{let result=normalizeExecutionResult(initialReceipt);if(result===ExecutionResult.FINISHED_WITH_RETURN)return result;if(result===ExecutionResult.FINISHED_WITH_ERROR)throw new Error(executionFailureMessage(initialReceipt,hash));for(let i=0;i<retries;i++){const delay=i<20?interval:i<40?3000:5000;await new Promise(resolve=>setTimeout(resolve,delay));let candidate:unknown;try{candidate=await client.getTransaction({hash});result=normalizeExecutionResult(candidate);}catch(error){if(i===retries-1)throw error;continue}if(result===ExecutionResult.FINISHED_WITH_RETURN)return result;if(result===ExecutionResult.FINISHED_WITH_ERROR)throw new Error(executionFailureMessage(candidate,hash));}throw new Error(`Transaction finalized, but execution result could not yet be verified: ${hash}`)}
export function resolveServiceId(rows: unknown[], serviceKey: string): string | number | undefined { for (const raw of rows) { try { const value = (typeof raw==='string'?JSON.parse(raw):raw) as {service_key?:string;id?:string|number;service_id?:string|number}; if (value?.service_key === serviceKey) return value.id ?? value.service_id; } catch {} } return undefined; }
export function resolveActionId(rows: unknown[], actionKey: string, serviceId?: string | number): string | number | undefined { for (const raw of rows) { try { const value = (typeof raw==='string'?JSON.parse(raw):raw) as {action_key?:string;id?:string|number;action_id?:string|number;service_id?:string|number;spec?:{action_key?:string}}; if ((value?.spec?.action_key??value?.action_key) === actionKey && (serviceId===undefined || String(value?.service_id)===String(serviceId))) return value.id ?? value.action_id; } catch {} } return undefined; }
export function resolvePlanId(rows: unknown[], expected: {creator?: string; title: string; description: string; steps: unknown[]}): string | number | undefined { for (const raw of rows) { try { const value = (typeof raw==='string'?JSON.parse(raw):raw) as {plan_id?:string|number;id?:string|number;creator?:string;title?:string;description?:string;steps?:unknown[]}; if (value?.title!==expected.title || value?.description!==expected.description) continue; if (expected.creator && String(value?.creator).toLowerCase()!==expected.creator.toLowerCase()) continue; if (JSON.stringify(value?.steps??[])!==JSON.stringify(expected.steps)) continue; return value.plan_id ?? value.id; } catch {} } return undefined; }
export function verifyPlanAuthorizationAdvance(before: unknown, after: unknown, planId: string | number, planHash: string): boolean { try { const b=typeof before==='string'?(before?JSON.parse(before):undefined):before as any; const a=typeof after==='string'?JSON.parse(after):after as any; return String(a?.plan_id)===String(planId) && a?.plan_hash===planHash && Number(a?.plan_version)>=1 && (!b || Number(a?.issued_at)>Number(b.issued_at)); } catch { return false; } }
export function booleanLike(value:unknown):boolean{return value===true||String(value).toLowerCase()==='true'}
export type ActivityRecord={kind:'plan'|'escrow'|'receipt'|'completion'|'dispute'|string;raw:unknown};
export type ActivityEvent={event:string;id:string;timestamp:number;status?:string;href:string};
export function aggregateActivityEvents(records:ActivityRecord[]):ActivityEvent[]{const out:ActivityEvent[]=[];for(const item of records){let value:any;try{value=typeof item.raw==='string'?JSON.parse(item.raw):item.raw}catch{continue}if(!value||typeof value!=='object')continue;const id=String(value.plan_id??value.escrow_id??value.receipt_id??value.completion_id??value.dispute_id??value.id??'');if(!id)continue;const timestamp=Number(value.created_at??value.issued_at??value.submitted_at??value.timestamp??0);const status=value.status??value.current_status;const event=item.kind==='plan'?'PLAN_CREATED':item.kind==='escrow'?`ESCROW_${String(status??'CREATED').toUpperCase()}`:item.kind==='receipt'?'AUTHORIZATION_RECEIPT_CREATED':item.kind==='completion'?'COMPLETION_SUBMITTED':item.kind==='dispute'?`DISPUTE_${String(status??'OPEN').toUpperCase()}`:'CANONICAL_EVENT';const href=item.kind==='plan'?`/plans/${id}`:item.kind==='escrow'?`/escrow/${id}`:item.kind==='completion'||item.kind==='dispute'?`/escrow/${value.escrow_id??''}`:`/receipts/${id}`;out.push({event,id,timestamp,status,href})}return out.sort((a,b)=>b.timestamp-a.timestamp)}
export async function readAllRecords(readPage:(offset:bigint,limit:bigint)=>Promise<string[]>, pageSize=50n):Promise<string[]> { const out:string[]=[]; for(let offset=0n;;offset+=pageSize){const page=await readPage(offset,pageSize);out.push(...(page??[]));if((page??[]).length<Number(pageSize))return out;} }
export const ACTION_INVARIANTS:Record<string,(fields:Record<string,string>)=>boolean>={DATA_COLLECTION:f=>f.automation==='YES'||f.scraping==='YES'||f.bulk_collection==='YES',MODEL_TRAINING:f=>f.model_training==='YES',DATA_REDISTRIBUTION:f=>f.redistribution!=='NONE',AGENT_DELEGATION:f=>f.delegation==='YES',ACCOUNT_ACTION:f=>f.account_operation!=='NONE',AUTOMATED_MESSAGE:f=>f.automation==='YES',AUTOMATED_PURCHASE:f=>f.automation==='YES',API_CALL:f=>f.automation==='YES'};
export function validateActionInvariants(type:string,fields:Record<string,string>):string|undefined { const rule=ACTION_INVARIANTS[type]; return rule&&!rule(fields)?`Invalid fields for ${type}: required policy invariant is not satisfied.`:undefined; }
export function verifySnapshotAdvance(before:unknown,after:unknown):boolean { const b=JSON.stringify(before),a=JSON.stringify(after); return b!==a; }
export function verifyChangeReadback(value:unknown):boolean { return typeof value==='string' ? value.length>0 : Array.isArray(value) ? value.length>0 : !!value; }
export function verifyChangeHistoryAdvance(before:string[],after:string[]):boolean { return (after?.length??0)>(before?.length??0); }
export function verifyAuthorizationAdvance(before:string,after:string,actionId:string,currentPolicyVersion?:number):boolean { try { const b=before?JSON.parse(before):null; const a=JSON.parse(after); return String(a.action_id)===String(actionId) && (!b || Number(a.sequence)>Number(b.sequence)) && (currentPolicyVersion===undefined || Number(a.policy_version)===currentPolicyVersion); } catch { return false; } }
export async function connectWallet(provider: Eip1193) {
  const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
  const chain = await provider.request({ method: 'eth_chainId' });
  if (String(chain).toLowerCase() !== '0xf22f') await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xf22f' }] });
  return accounts[0] ?? '';
}
function appRpcEndpoint(){return typeof window==='undefined'?(process.env.GENLAYER_RPC_URL??'https://studio.genlayer.com/api'):`${window.location.origin}/api/genlayer-rpc`;}
const termsRailStudionet={...studionet,rpcUrls:{...studionet.rpcUrls,default:{...studionet.rpcUrls.default,http:[appRpcEndpoint()]}}};
export function clientFor(address: `0x${string}`, provider: Eip1193) { return createClient({ chain: termsRailStudionet, account: address, provider }); }
export type TransactionPhase='SUBMITTING'|'SUBMITTED'|'WAITING_FOR_FINALIZATION'|'FINALIZED'|'VERIFYING_EXECUTION'|'EXECUTION_VERIFIED'|'SYNCING_CANONICAL_STATE'|'CANONICAL_STATE_FOUND'|'SUCCESS'|'RPC_RETRYING'|'VERIFICATION_DELAYED';
export type LifecycleEvent={phase:TransactionPhase;hash?:string;attempt?:number;canonicalState?:unknown};
export async function waitForCanonicalState<T>({read,predicate,onRetry,maxDurationMs=300000}:{read:()=>Promise<T>;predicate:(value:T)=>boolean;onRetry?:(attempt:number)=>void;maxDurationMs?:number}):Promise<T>{const started=Date.now();let attempt=0;let last:T|undefined;while(Date.now()-started<maxDurationMs){try{last=await read();if(predicate(last))return last;}catch(error){if(Date.now()-started>=maxDurationMs)throw error;}attempt++;onRetry?.(attempt);const delay=attempt<10?1000:attempt<20?2000:4000;await new Promise(resolve=>setTimeout(resolve,delay));}if(last!==undefined)throw new Error('Canonical state synchronization is still in progress.');throw new Error('Canonical state synchronization timed out.');}
export async function writeAndRead<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[], readback: () => Promise<T>, expected: (value: T) => boolean, onPhase?: (event:LifecycleEvent)=>void, onCanonical?: (state:T)=>void, value: bigint = 0n) {
  const client = clientFor(address, provider);
  onPhase?.({phase:'SUBMITTING'});
  const hash = await client.writeContract({ address: requireContract(), functionName, args: args as never[], value });
  onPhase?.({phase:'SUBMITTED',hash});
  onPhase?.({phase:'WAITING_FOR_FINALIZATION',hash});
  const receipt = await waitForFinalizedReceipt(client,hash);
  if (!receipt) throw new Error('Transaction did not finalize');
  onPhase?.({phase:'FINALIZED',hash});
  onPhase?.({phase:'VERIFYING_EXECUTION',hash});
  onPhase?.({phase:'SYNCING_CANONICAL_STATE',hash});
  // StudioNet can publish canonical state before execution metadata. Start
  // both post-finality checks together so creation pages can expose the
  // resolved record without ever treating it as execution success. The
  // returned promise still requires both checks to complete successfully.
  const executionPromise=waitForExecutionResult(client,hash,receipt).then(execution=>{
    assertSuccessfulExecution(execution);
    onPhase?.({phase:'EXECUTION_VERIFIED',hash});
    return execution;
  });
  const canonicalPromise=waitForCanonicalState({read:readback,predicate:expected,onRetry:attempt=>onPhase?.({phase:'SYNCING_CANONICAL_STATE',hash,attempt})}).then(state=>{
    onPhase?.({phase:'CANONICAL_STATE_FOUND',hash,canonicalState:state});
    onCanonical?.(state);
    return state;
  });
  const [,state]=await Promise.all([executionPromise,canonicalPromise]);
  onPhase?.({phase:'SUCCESS',hash});
  return { hash, receipt, state };
}
export async function readContract<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[] = []) { return clientFor(address, provider).readContract({ address: requireContract(), functionName, args: args as never[] }) as Promise<T>; }
export function genToWei(value: string): bigint { const normalized=value.trim(); if(!/^\d+(?:\.\d{1,18})?$/.test(normalized)) throw new Error('Enter a valid GEN amount.'); const [whole,fraction='']=normalized.split('.'); return BigInt(whole)*10n**18n+BigInt((fraction+'0'.repeat(18)).slice(0,18)); }
export function weiToGen(value: unknown): string { try { const amount=BigInt(String(value??0)); const whole=amount/10n**18n; const fraction=(amount%10n**18n).toString().padStart(18,'0').replace(/0+$/,''); return fraction?`${whole}.${fraction}`:String(whole); } catch { return '0'; } }
