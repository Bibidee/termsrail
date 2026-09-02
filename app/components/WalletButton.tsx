'use client';
import {useEffect,useState} from 'react';
import {connectWallet,Eip1193} from '../../lib/genlayer';
export default function WalletButton(){
 const [address,setAddress]=useState(''),[chain,setChain]=useState(''),[error,setError]=useState('');
 const provider=()=> (window as Window&{ethereum?:Eip1193}).ethereum;
 useEffect(()=>{const p=provider();if(!p)return;const accounts=(...args:unknown[])=>{const a=args[0] as string[]|undefined;setAddress(a?.[0]??'');if(!a?.length)setChain('')};const changed=(...args:unknown[])=>setChain(String(args[0]??''));void p.request({method:'eth_accounts'}).then(async v=>{const a=v as string[];if(a?.[0]){setAddress(a[0]);setChain(String(await p.request({method:'eth_chainId'})))}}).catch(()=>{});p.on?.('accountsChanged',accounts);p.on?.('chainChanged',changed);return()=>{p.removeListener?.('accountsChanged',accounts);p.removeListener?.('chainChanged',changed)}},[]);
 const connect=async()=>{const p=provider();if(!p){setError('Wallet unavailable.');return}try{setError('');const a=await connectWallet(p);setAddress(String(a));setChain(String(await p.request({method:'eth_chainId'})))}catch(e){setError(e instanceof Error?e.message:'Wallet connection rejected')}};
 const switchNetwork=async()=>{const p=provider();if(!p){setError('Wallet unavailable.');return}try{setError('');await p.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xf22f'}]});setChain('0xf22f')}catch(e){setError(e instanceof Error?e.message:'Could not switch to Studionet')}};
 const wrong=!!address&&!!chain&&chain.toLowerCase()!=='0xf22f';
 return <div className="wallet-wrap"><span className={wrong?'network-wrong':address?'network-ok':'network-off'} role="status">● {wrong?'WRONG NETWORK':address?'STUDIONET':'NOT CONNECTED'}</span>{wrong&&<button className="button" onClick={switchNetwork}>SWITCH TO STUDIONET</button>}<button className="wallet" onClick={address?()=>{setAddress('');setChain('');setError('')}:connect}>{address?`${address.slice(0,6)}…${address.slice(-4)} · DISCONNECT`:'CONNECT WALLET'}</button>{error&&<span className="wallet-error" role="status">{error}</span>}</div>
}
