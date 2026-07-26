import { Link } from 'react-router-dom'
import { HikmahLogoIcon } from '@/components/Icons/HikmahLogoIcon'
import './Footer.scss'

export function Footer() {
  return (
    <footer className="hikmah-footer">
      <div className="footer-inner">
        <Link to="/" className="footer-logo">
          <HikmahLogoIcon size={26} />
          <span className="footer-logo-text">Hikmah AI</span>
        </Link>
        <p className="footer-copy">© 2026 HikmahAI. All rights reserved.</p>
      </div>
    </footer>
  )
}
