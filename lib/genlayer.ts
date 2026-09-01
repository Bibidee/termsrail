import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

export const STUDIONET_CHAIN_ID = 61999;
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';
export type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void };

export function requireContract() { if (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS)) throw new Error('Contract not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.'); return CONTRACT_ADDRESS as `0x${string}`; }
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
  const receiptStatus = String((receipt as { status?: unknown }).status ?? '').toLowerCase();
  if (receiptStatus && !['finalized','success','succeeded','1','0x1'].includes(receiptStatus)) throw new Error(`Transaction execution failed: ${receiptStatus}`);
  const state = await readback();
  if (!expected(state)) throw new Error('Canonical readback mismatch after finality');
  return { hash, receipt, state };
}
export async function readContract<T>(address: `0x${string}`, provider: Eip1193, functionName: string, args: unknown[] = []) { return clientFor(address, provider).readContract({ address: requireContract(), functionName, args: args as never[] }) as Promise<T>; }
