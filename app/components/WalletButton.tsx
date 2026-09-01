'use client';
import {useState} from 'react';
import {connectWallet} from '../../lib/genlayer';
export default function WalletButton(){const [address,setAddress]=useState(''); const connect=async()=>{const provider=(window as Window & {ethereum?:import('../../lib/genlayer').Eip1193}).ethereum;if(!provider){alert('No injected EIP-1193 wallet found.');return}try{setAddress(await connectWallet(provider) as string)}catch(e){console.error(e);alert(e instanceof Error?e.message:'Wallet connection rejected')}};return <button className="wallet" onClick={connect}>{address?`${address.slice(0,6)}…${address.slice(-4)}`:'CONNECT WALLET'}</button>}
