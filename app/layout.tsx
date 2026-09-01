import './styles.css';
import Link from 'next/link';
import WalletButton from './components/WalletButton';
export const metadata={title:'TERMSRAIL — policy execution control',description:'Consensus-backed policy gates for autonomous agents'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header className="topbar"><Link href="/" className="brand"><span className="brand-mark">◆</span><span>TERMSRAIL</span></Link><nav aria-label="Primary"><Link href="/">BOARD</Link><Link href="/changes">CHANGES</Link><Link href="/about">ABOUT</Link></nav><WalletButton/></header><main>{children}</main><footer>GENLAYER / STUDIONET · CHAIN 61999 · POLICY CONTROL INFRASTRUCTURE</footer></body></html>}
