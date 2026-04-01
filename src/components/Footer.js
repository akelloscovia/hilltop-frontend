import { Link } from "react-router-dom";
import { memo } from "react";
import "./footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column brand-column">
          <h4>Hilltop Junior School</h4>
          <p>
            Kasangati, Wakiso District<br />
            +256 771 234 567 | +256 705 987 654<br />
            info@hilltopjunior.ug
          </p>
          <p className="address">
            P.O. Box 12345, Kampala, Uganda
          </p>
        </div>

        <div className="footer-column links-column">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/academics">Academics</Link></li>
            <li><Link to="/admissions">Admissions</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-column socials-column">
          <h4>Connect With Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Facebook">f</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter" title="Twitter">𝕏</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">📷</a>
          </div>
          <p className="small-note">Stay updated on events and admissions.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Hilltop Junior School. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default memo(Footer);