import React from 'react';
import {render,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {describe,it,expect,vi,afterEach} from 'vitest';
import WalletButton from '../app/components/WalletButton';

const account='0x1111111111111111111111111111111111111111';
function provider(initial:string[]=[], chain='0xf22f'){
  const listeners:Record<string,((...args:unknown[])=>void)[]>={};
  const calls:string[]=[];
  const p={calls,listeners,request:vi.fn(async({method}:{method:string})=>{calls.push(method);if(method==='eth_accounts')return initial;if(method==='eth_chainId')return chain;if(method==='eth_requestAccounts')return [account];if(method==='wallet_switchEthereumChain')return null;return null}),on:(e:string,h:(...a:unknown[])=>void)=>{(listeners[e]??=[]).push(h)},removeListener:(e:string,h:(...a:unknown[])=>void)=>{listeners[e]=(listeners[e]??[]).filter(x=>x!==h)}};
  return p;
}
describe('WalletButton',()=>{
 afterEach(()=>cleanup());
 it('restores silently and supports explicit connect',async()=>{const p=provider();Object.defineProperty(window,'ethereum',{value:p,configurable:true});const v=render(<WalletButton/>);await waitFor(()=>expect(v.getByRole('status').textContent).toContain('NOT CONNECTED'));expect(p.calls).not.toContain('eth_requestAccounts');fireEvent.click(v.getByText('CONNECT WALLET'));await waitFor(()=>expect(v.getByRole('status').textContent).toContain('STUDIONET'));expect(p.calls).toContain('eth_requestAccounts')});
 it('shows wrong network and switches without requesting accounts',async()=>{const p=provider([account],'0x1');Object.defineProperty(window,'ethereum',{value:p,configurable:true});const v=render(<WalletButton/>);await waitFor(()=>expect(v.container.querySelector('.network-wrong')?.textContent).toContain('WRONG NETWORK'));fireEvent.click(v.getByText('SWITCH TO STUDIONET'));await waitFor(()=>expect(v.container.querySelector('.network-ok')?.textContent).toContain('STUDIONET'));expect(p.calls).toContain('wallet_switchEthereumChain');expect(p.calls).not.toContain('eth_requestAccounts')});
 it('responds to account and chain events and cleans up',async()=>{const p=provider([account]);Object.defineProperty(window,'ethereum',{value:p,configurable:true});const v=render(<WalletButton/>);await waitFor(()=>expect(v.container.querySelector('.network-ok')?.textContent).toContain('STUDIONET'));p.listeners.accountsChanged?.[0]?.([]);await waitFor(()=>expect(v.container.querySelector('.network-off')?.textContent).toContain('NOT CONNECTED'));p.listeners.accountsChanged?.[0]?.([account]);p.listeners.chainChanged?.[0]?.('0x1');await waitFor(()=>expect(v.container.querySelector('.network-wrong')?.textContent).toContain('WRONG NETWORK'));v.unmount();expect(p.listeners.accountsChanged).toHaveLength(0);expect(p.listeners.chainChanged).toHaveLength(0)});
});
