import { Link } from "react-router-dom";
import { useState, memo } from "react";
import "./navbar.css";

// Import logo
import logo from "../images/logo.jpg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Brand Section with Logo */}
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <div className="navbar-logo-container">
          <img src={logo} alt="Hilltop Junior School Logo" className="navbar-logo" loading="lazy" />
        </div>
        <div className="navbar-brand-text">
          <span className="navbar-brand-name">Hilltop Junior School</span>
          <span className="navbar-brand-tagline">Excellence in Education</span>
        </div>
      </Link>

      {/* Mobile Menu Toggle */}
      <button 
        className={`navbar-toggle ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu} 
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/about" onClick={closeMenu}>About</Link></li>
        <li><Link to="/admissions" onClick={closeMenu}>Admissions</Link></li>
        <li><Link to="/academics" onClick={closeMenu}>Academics</Link></li>
        <li><Link to="/gallery" onClick={closeMenu}>Gallery</Link></li>
        <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
      </ul>
    </nav>
  );
}

export default memo(Navbar);
