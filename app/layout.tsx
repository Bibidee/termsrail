import './styles.css';
import Link from 'next/link';
import WalletButton from './components/WalletButton';
export const metadata={title:'TERMSRAIL — policy execution control',description:'Consensus-backed policy gates for autonomous agents'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header className="topbar"><Link href="/" className="brand"><span className="brand-mark" aria-hidden="true"/><span>TermsRail</span></Link><nav aria-label="Primary"><Link href="/">OVERVIEW</Link><Link href="/services">SERVICES</Link><Link href="/action/new">ACTIONS</Link><Link href="/changes">POLICY CHANGES</Link><Link href="/about">ABOUT</Link></nav><div className="network-stamp">● STUDIONET</div><WalletButton/></header><main>{children}</main><footer>GENLAYER / STUDIONET · CHAIN 61999 · AGENT POLICY INFRASTRUCTURE</footer></body></html>}
