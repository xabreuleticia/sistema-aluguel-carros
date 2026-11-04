import { Link } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        VÉRTICE
      </Link>

      <nav className="site-nav">
        <Link to="/">Início</Link>
        <Link to="/carros">Carros</Link>
        <Link to="/sobre">Sobre</Link>
      </nav>

      <Link to="/login" className="header-button">
        Entrar
      </Link>
    </header>
  );
}
