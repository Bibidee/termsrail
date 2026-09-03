import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ExecutionResult, executionResultNumberToName } from 'genlayer-js/types';

export const STUDIONET_CHAIN_ID = 61999;
export const FROZEN_TERMSRAIL_CONTRACT = '0xd4FB52094c1DED0Ca71fc29D6E85Eff8E9089a8A' as const;
const ADDRESS_PATTERN=/^0x[0-9a-fA-F]{40}$/;
export function resolveContractAddress(value:string|undefined): `0x${string}` { const candidate=(value??'').trim(); return (ADDRESS_PATTERN.test(candidate)?candidate:FROZEN_TERMSRAIL_CONTRACT) as `0x${string}`; }
export const CONTRACT_ADDRESS = resolveContractAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
export type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void };

export function requireContract() { if (!ADDRESS_PATTERN.test(CONTRACT_ADDRESS)) throw new Error('TermsRail contract is not configured correctly.'); return CONTRACT_ADDRESS; }
export async function getAuthorizedAccount(provider: Eip1193): Promise<string> { const accounts = await provider.request({ method: 'eth_accounts' }) as string[]; return accounts?.[0] ?? ''; }
// StudioNet may place execution_result inside consensus_data.leader_receipt[], so arrays must be traversed.
export function normalizeExecutionResult(receipt: unknown): string | undefined { const seen=new Set<unknown>(); const scalar=(value:unknown):string|undefined=>{if(typeof value==='number'||typeof value==='bigint')return executionResultNumberToName[String(value) as keyof typeof executionResultNumberToName];if(typeof value==='string'){const n=value.trim().toUpperCase();if(n==='1')return ExecutionResult.FINISHED_WITH_RETURN;if(n==='2')return ExecutionResult.FINISHED_WITH_ERROR;if(n==='0')return 'NOT_VOTED';if(n==='FINISHED_WITH_RETURN'||n==='FINISHED_WITH_ERROR'||n==='NOT_VOTED')return n}return undefined};const visit=(value:unknown,allowScalar=false):string|undefined=>{if(value===null||value===undefined||seen.has(value))return undefined;if(allowScalar){const direct=scalar(value);if(direct)return direct}if(Array.isArray(value)){seen.add(value);let provisional:string|undefined;for(let i=value.length-1;i>=0;i--){const result=visit(value[i]);if(result&&result!=='NOT_VOTED')return result;if(result)provisional=result}return provisional}if(typeof value==='object'){seen.add(value);const record=value as Record<string,unknown>;for(const key of ['txExecutionResultName','tx_execution_result_name','txExecutionResult','tx_execution_result','execution_result','executionResult']){const result=visit(record[key],true);if(result)return result}for(const key of ['data','consensus_data','consensusData','leader_receipt','leaderReceipt','validators','genvm_result','genvmResult','receipt','receipts']){const result=visit(record[key]);if(result)return result}}return undefined};return scalar(receipt)??visit(receipt); }
export function assertSuccessfulExecution(execution: unknown): void { const normalized=normalizeExecutionResult(execution); if(normalized!==ExecutionResult.FINISHED_WITH_RETURN) throw new Error(`Transaction execution failed: ${normalized ?? 'UNKNOWN'}`); }
export const FINALITY_INTERVAL_MS=3000;
export const FINALITY_RETRIES=100;
const isFinalized=(receipt:unknown)=>{const r=receipt as {status?:unknown;statusName?:unknown;status_name?:unknown};const status=r?.status??r?.statusName??r?.status_name;return status===7||status==='7'||String(status).toUpperCase()==='FINALIZED'};
export async function waitForFinalizedReceipt(client:any,hash:string,interval=FINALITY_INTERVAL_MS,retries=FINALITY_RETRIES):Promise<any>{let receipt=await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval,retries,fullTransaction:true} as never);if(isFinalized(receipt))return receipt;for(let attempt=0;attempt<retries;attempt++){await new Promise(resolve=>setTimeout(resolve,interval));receipt=await client.getTransaction({hash});if(isFinalized(receipt))return receipt;if(String((receipt as {status?:unknown})?.status).toUpperCase()==='CANCELED')throw new Error('Transaction was canceled');}throw new Error(`Timed out waiting for transaction ${hash} to reach FINALIZED.`)}
export async function waitForExecutionResult(client:any,hash:string,initialReceipt:unknown,interval=1500,retries=200):Promise<string>{let result=normalizeExecutionResult(initialReceipt);if(result===ExecutionResult.FINISHED_WITH_RETURN||result===ExecutionResult.FINISHED_WITH_ERROR)return result;for(let i=0;i<retries;i++){const delay=i<20?interval:i<40?3000:5000;await new Promise(resolve=>setTimeout(resolve,delay));try{result=normalizeExecutionResult(await client.getTransaction({hash}));}catch(error){if(i===retries-1)throw error;continue}if(result===ExecutionResult.FINISHED_WITH_RETURN||result===ExecutionResult.FINISHED_WITH_ERROR)return result}throw new Error(`Transaction finalized, but execution result could not yet be verified: ${hash}`)}
export function resolveServiceId(rows: unknown[], serviceKey: string): string | number | undefined { for (const raw of rows) { try { const value = (typeof raw==='string'?JSON.parse(raw):raw) as {service_key?:string;id?:string|number;service_id?:string|number}; if (value?.service_key === serviceKey) return value.id ?? value.service_id; } catch {} } return undefined; }
export function resolveActionId(rows: unknown[], actionKey: string): string | number | undefined { for (const raw of rows) { try { const value = (typeof raw==='string'?JSON.parse(raw):raw) as {action_key?:string;id?:string|number;action_id?:string|number}; if (value?.action_key === actionKey) return value.id ?? value.action_id; } catch {} } return undefined; }
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
export type TransactionPhase='SUBMITTING'|'SUBMITTED'|'WAITING_FOR_FINALIZATION'|'FINALIZED'|'VERIFYING_EXECUTION'|'SYNCING_CANONICAL_STATE'|'SUCCESS'|'RPC_RETRYING'|'VERIFICATION_DELAYED';
export type LifecycleEvent={phase:TransactionPhase;hash?:string;attempt?:number};
export async function waitForCanonicalState<T>({read,predicate,onRetry,maxDurationMs=300000}:{read:()=>Promise<T>;predicate:(value:T)=>boolean;onRetry?:(attempt:number)=>void;maxDurationMs?:number}):Promise<T>{const started=Date.now();let attempt=0;let last:T|undefined;while(Date.now()-started<maxDurationMs){try{last=await read();if(predicate(last))return last;}catch(error){if(Date.now()-started>=maxDurationMs)throw error;}attempt++;onRetry?.(attempt);const delay=attempt<10?1000:attempt<20?2000:4000;await new Promise(resolve=>setTimeout(resolve,delay));}if(last!==undefined)throw new Error('Canonical state synchronization is still in progress.');throw new Error('Canonical state synchronization timed out.');}
export async function writeAndRead<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[], readback: () => Promise<T>, expected: (value: T) => boolean, onPhase?: (event:LifecycleEvent)=>void) {
  const client = clientFor(address, provider);
  onPhase?.({phase:'SUBMITTING'});
  const hash = await client.writeContract({ address: requireContract(), functionName, args: args as never[], value: 0n });
  onPhase?.({phase:'SUBMITTED',hash});
  onPhase?.({phase:'WAITING_FOR_FINALIZATION',hash});
  const receipt = await waitForFinalizedReceipt(client,hash);
  if (!receipt) throw new Error('Transaction did not finalize');
  onPhase?.({phase:'FINALIZED',hash});
  onPhase?.({phase:'VERIFYING_EXECUTION',hash});
  onPhase?.({phase:'SYNCING_CANONICAL_STATE',hash});
  const executionPromise=waitForExecutionResult(client,hash,receipt);
  const statePromise=waitForCanonicalState({read:readback,predicate:expected,onRetry:attempt=>onPhase?.({phase:'RPC_RETRYING',hash,attempt})});
  const [execution,state]=await Promise.allSettled([executionPromise,statePromise]);
  if(state.status==='rejected') throw state.reason;
  if(execution.status==='fulfilled') { assertSuccessfulExecution(execution.value); onPhase?.({phase:'SUCCESS',hash}); }
  else onPhase?.({phase:'VERIFICATION_DELAYED',hash});
  return { hash, receipt, state: state.value };
}
export async function readContract<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[] = []) { return clientFor(address, provider).readContract({ address: requireContract(), functionName, args: args as never[] }) as Promise<T>; }
