import {describe,it,expect} from 'vitest';
import {connectWallet,assertSuccessfulExecution,resolveServiceId} from '../lib/genlayer';
describe('wallet finality prerequisites',()=>{
  it('requests accounts and accepts Studionet',async()=>{const calls:string[]=[];const p={request:async({method}:{method:string})=>{calls.push(method);return method==='eth_requestAccounts'?['0xabc']:'0xf22f'}};await expect(connectWallet(p)).resolves.toBe('0xabc');expect(calls).toEqual(['eth_requestAccounts','eth_chainId'])});
  it('switches a wrong network',async()=>{const calls:string[]=[];const p={request:async({method}:{method:string})=>{calls.push(method);return method==='eth_requestAccounts'?['0xabc']:method==='eth_chainId'?'0x1':null}};await connectWallet(p);expect(calls).toContain('wallet_switchEthereumChain')});
  it('rejects when wallet returns no account',async()=>{const p={request:async({method}:{method:string})=>method==='eth_requestAccounts'?[]:'0xf22f'};await expect(connectWallet(p)).resolves.toBe('')});
});
describe('canonical safety helpers',()=>{
  it('requires the exact successful execution result',()=>{expect(()=>assertSuccessfulExecution('FINISHED_WITH_RETURN')).not.toThrow();for(const value of ['ERROR','RETURN',undefined,'unexpected'])expect(()=>assertSuccessfulExecution(value)).toThrow()});
  it('resolves service IDs by canonical service key',()=>{const rows=['{"service_key":"other","id":4}','{"service_key":"target","service_id":"9"}'];expect(resolveServiceId(rows,'target')).toBe('9');expect(resolveServiceId(rows,'missing')).toBeUndefined()});
});
