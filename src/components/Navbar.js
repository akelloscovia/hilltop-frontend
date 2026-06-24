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
      <div className="logo">
        <img src={logo} alt="Hilltop Junior School Logo" loading="lazy" />
      </div>

      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        ☰
      </button>

      <div className={`links ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/about" onClick={closeMenu}>About</Link>
        <Link to="/admissions" onClick={closeMenu}>Admissions</Link>
        <Link to="/academics" onClick={closeMenu}>Academics</Link>
        <Link to="/gallery" onClick={closeMenu}>Gallery</Link>
        <Link to="/contact" onClick={closeMenu}>Contact</Link>
      </div>
    </nav>
  );
}

export default memo(Navbar);
