import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus, ExecutionResult } from 'genlayer-js/types';

export const STUDIONET_CHAIN_ID = 61999;
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '').trim();
export type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void };

export function requireContract() { if (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS)) throw new Error('TermsRail contract is not configured correctly.'); return CONTRACT_ADDRESS as `0x${string}`; }
export async function getAuthorizedAccount(provider: Eip1193): Promise<string> { const accounts = await provider.request({ method: 'eth_accounts' }) as string[]; return accounts?.[0] ?? ''; }
export function assertSuccessfulExecution(execution: unknown): void { if (execution !== ExecutionResult.FINISHED_WITH_RETURN) throw new Error(`Transaction execution failed: ${execution ?? 'UNKNOWN'}`); }
export function resolveServiceId(rows: string[], serviceKey: string): string | number | undefined { for (const raw of rows) { try { const value = JSON.parse(raw) as {service_key?:string;id?:string|number;service_id?:string|number}; if (value.service_key === serviceKey) return value.id ?? value.service_id; } catch {} } return undefined; }
export function resolveActionId(rows: string[], actionKey: string): string | number | undefined { for (const raw of rows) { try { const value = JSON.parse(raw) as {action_key?:string;id?:string|number;action_id?:string|number}; if (value.action_key === actionKey) return value.id ?? value.action_id; } catch {} } return undefined; }
export async function readAllRecords(readPage:(offset:bigint,limit:bigint)=>Promise<string[]>, pageSize=50n):Promise<string[]> { const out:string[]=[]; for(let offset=0n;;offset+=pageSize){const page=await readPage(offset,pageSize);out.push(...(page??[]));if((page??[]).length<Number(pageSize))return out;} }
export const ACTION_INVARIANTS:Record<string,(fields:Record<string,string>)=>boolean>={MODEL_TRAINING:f=>f.model_training==='YES',DATA_REDISTRIBUTION:f=>f.redistribution!=='NONE',AGENT_DELEGATION:f=>f.delegation==='YES',ACCOUNT_ACTION:f=>f.account_operation!=='NONE',AUTOMATED_MESSAGE:f=>f.automation==='YES',AUTOMATED_PURCHASE:f=>f.automation==='YES',API_CALL:f=>f.automation==='YES'};
export function validateActionInvariants(type:string,fields:Record<string,string>):string|undefined { const rule=ACTION_INVARIANTS[type]; return rule&&!rule(fields)?`Invalid fields for ${type}: required policy invariant is not satisfied.`:undefined; }
export function verifySnapshotAdvance(before:unknown,after:unknown):boolean { const b=JSON.stringify(before),a=JSON.stringify(after); return b!==a; }
export function verifyChangeReadback(value:unknown):boolean { return typeof value==='string' ? value.length>0 : Array.isArray(value) ? value.length>0 : !!value; }
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
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED });
  if (!receipt) throw new Error('Transaction did not finalize');
  const execution = (receipt as { txExecutionResultName?: string }).txExecutionResultName;
  assertSuccessfulExecution(execution);
  const state = await readback();
  if (!expected(state)) throw new Error('Canonical readback mismatch after finality');
  return { hash, receipt, state };
}
export async function readContract<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[] = []) { return clientFor(address, provider).readContract({ address: requireContract(), functionName, args: args as never[] }) as Promise<T>; }
