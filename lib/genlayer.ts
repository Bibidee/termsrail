import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ExecutionResult, executionResultNumberToName } from 'genlayer-js/types';

export const STUDIONET_CHAIN_ID = 61999;
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '').trim();
export type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void };

export function requireContract() { if (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS)) throw new Error('TermsRail contract is not configured correctly.'); return CONTRACT_ADDRESS as `0x${string}`; }
export async function getAuthorizedAccount(provider: Eip1193): Promise<string> { const accounts = await provider.request({ method: 'eth_accounts' }) as string[]; return accounts?.[0] ?? ''; }
// StudioNet may place execution_result inside consensus_data.leader_receipt[], so arrays must be traversed.
export function normalizeExecutionResult(receipt: unknown): string | undefined { const seen=new Set<unknown>(); const scalar=(value:unknown):string|undefined=>{if(typeof value==='number'||typeof value==='bigint')return executionResultNumberToName[String(value) as keyof typeof executionResultNumberToName];if(typeof value==='string'){const n=value.trim().toUpperCase();if(n==='1')return ExecutionResult.FINISHED_WITH_RETURN;if(n==='2')return ExecutionResult.FINISHED_WITH_ERROR;if(n==='0')return 'NOT_VOTED';if(n==='FINISHED_WITH_RETURN'||n==='FINISHED_WITH_ERROR'||n==='NOT_VOTED')return n}return undefined};const visit=(value:unknown,allowScalar=false):string|undefined=>{if(value===null||value===undefined||seen.has(value))return undefined;if(allowScalar){const direct=scalar(value);if(direct)return direct}if(Array.isArray(value)){seen.add(value);let provisional:string|undefined;for(let i=value.length-1;i>=0;i--){const result=visit(value[i]);if(result&&result!=='NOT_VOTED')return result;if(result)provisional=result}return provisional}if(typeof value==='object'){seen.add(value);const record=value as Record<string,unknown>;for(const key of ['txExecutionResultName','tx_execution_result_name','txExecutionResult','tx_execution_result','execution_result','executionResult']){const result=visit(record[key],true);if(result)return result}for(const key of ['data','consensus_data','consensusData','leader_receipt','leaderReceipt','validators','genvm_result','genvmResult','receipt','receipts']){const result=visit(record[key]);if(result)return result}}return undefined};return scalar(receipt)??visit(receipt); }
export function assertSuccessfulExecution(execution: unknown): void { const normalized=normalizeExecutionResult(execution); if(normalized!==ExecutionResult.FINISHED_WITH_RETURN) throw new Error(`Transaction execution failed: ${normalized ?? 'UNKNOWN'}`); }
export const FINALITY_INTERVAL_MS=3000;
export const FINALITY_RETRIES=100;
const isFinalized=(receipt:unknown)=>{const status=(receipt as {status?:unknown})?.status;return status===7||status==='7'||String(status).toUpperCase()==='FINALIZED'};
export async function waitForFinalizedReceipt(client:any,hash:string,interval=FINALITY_INTERVAL_MS,retries=FINALITY_RETRIES):Promise<any>{let receipt=await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval,retries,fullTransaction:true} as never);if(isFinalized(receipt))return receipt;for(let attempt=0;attempt<retries;attempt++){await new Promise(resolve=>setTimeout(resolve,interval));receipt=await client.getTransaction({hash});if(isFinalized(receipt))return receipt;if(String((receipt as {status?:unknown})?.status).toUpperCase()==='CANCELED')throw new Error('Transaction was canceled');}throw new Error(`Timed out waiting for transaction ${hash} to reach FINALIZED.`)}
export async function waitForExecutionResult(client:any,hash:string,initialReceipt:unknown,interval=1500,retries=20):Promise<string>{let result=normalizeExecutionResult(initialReceipt);if(result===ExecutionResult.FINISHED_WITH_RETURN||result===ExecutionResult.FINISHED_WITH_ERROR)return result;for(let i=0;i<retries;i++){await new Promise(resolve=>setTimeout(resolve,interval));result=normalizeExecutionResult(await client.getTransaction({hash}));if(result===ExecutionResult.FINISHED_WITH_RETURN||result===ExecutionResult.FINISHED_WITH_ERROR)return result}throw new Error(`Transaction finalized, but execution result could not yet be verified: ${hash}`)}
export function resolveServiceId(rows: string[], serviceKey: string): string | number | undefined { for (const raw of rows) { try { const value = JSON.parse(raw) as {service_key?:string;id?:string|number;service_id?:string|number}; if (value.service_key === serviceKey) return value.id ?? value.service_id; } catch {} } return undefined; }
export function resolveActionId(rows: string[], actionKey: string): string | number | undefined { for (const raw of rows) { try { const value = JSON.parse(raw) as {action_key?:string;id?:string|number;action_id?:string|number}; if (value.action_key === actionKey) return value.id ?? value.action_id; } catch {} } return undefined; }
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
export function clientFor(address: `0x${string}`, provider: Eip1193) { return createClient({ chain: studionet, account: address, provider }); }
export async function writeAndRead<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[], readback: () => Promise<T>, expected: (value: T) => boolean) {
  const client = clientFor(address, provider);
  const hash = await client.writeContract({ address: requireContract(), functionName, args: args as never[], value: 0n });
  const receipt = await waitForFinalizedReceipt(client,hash);
  if (!receipt) throw new Error('Transaction did not finalize');
  const execution = await waitForExecutionResult(client,hash,receipt);
  assertSuccessfulExecution(execution);
  const state = await readback();
  if (!expected(state)) throw new Error('Canonical readback mismatch after finality');
  return { hash, receipt, state };
}
export async function readContract<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[] = []) { return clientFor(address, provider).readContract({ address: requireContract(), functionName, args: args as never[] }) as Promise<T>; }
