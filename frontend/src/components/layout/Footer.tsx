// ============================================================
// Footer Component
// ============================================================

import './Footer.css';

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        <div className="footer__tricolor">
          <span className="footer__stripe footer__stripe--saffron"></span>
          <span className="footer__stripe footer__stripe--white"></span>
          <span className="footer__stripe footer__stripe--green"></span>
        </div>

        <div className="footer__content">
          <div className="footer__left">
            <p className="footer__brand">🗳️ AI Election Guide — India</p>
            <p className="footer__disclaimer">
              This tool provides general guidance only. For official information, visit{' '}
              <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">
                Election Commission of India
              </a>
            </p>
          </div>

          <div className="footer__right">
            <div className="footer__links">
              <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">
                ECI Official
              </a>
              <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">
                Voter Portal
              </a>
              <span className="footer__helpline">📞 1950 (Voter Helpline)</span>
            </div>
            <p className="footer__copy">
              © {new Date().getFullYear()} AI Election Guide. Built with ❤️ for Indian Democracy.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
