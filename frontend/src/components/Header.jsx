
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usuarioAtual, sair } from "../service/auth";
import "../styles/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await usuarioAtual();

        if (ativo) {
          setUsuario(dados);
        }
      } catch {
        if (ativo) {
          setUsuario(null);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, [location.pathname, location.search]);

  async function handleSair() {
    setSaindo(true);
    setErro("");

    try {
      await sair();
      setUsuario(null);
      navigate("/", { replace: true });
    } catch {
      setErro("Não foi possível sair da conta.");
    } finally {
      setSaindo(false);
    }
  }

  function linkAtivo(caminho) {
    return location.pathname === caminho
      ? "ativo"
      : "";
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        VÉRTICE
      </Link>

      <nav className="site-nav" aria-label="Navegação principal">
        <Link to="/" className={linkAtivo("/")}>
          Início
        </Link>

        <Link to="/carros" className={linkAtivo("/carros")}>
          Carros
        </Link>

        <Link to="/sobre" className={linkAtivo("/sobre")}>
          Sobre
        </Link>

        {!carregando && usuario?.perfil === "CLIENTE" && (
          <>
            <Link
              to="/pedidos"
              className={linkAtivo("/pedidos")}
            >
              Meus pedidos
            </Link>

            <Link
              to="/perfil"
              className={linkAtivo("/perfil")}
            >
              Meu perfil
            </Link>
          </>
        )}

        {!carregando && usuario?.perfil === "AGENTE" && (
          <Link
            to="/agente"
            className={linkAtivo("/agente")}
          >
            Painel do agente
          </Link>
        )}
      </nav>

      <div className="header-actions">
        {carregando ? (
          <span className="header-session-loading">
            Carregando...
          </span>
        ) : usuario ? (
          <>
            <span className="header-user-name">
              {usuario.nome}
            </span>

            <button
              type="button"
              className="header-button"
              onClick={handleSair}
              disabled={saindo}
            >
              {saindo ? "Saindo..." : "Sair da conta"}
            </button>
          </>
        ) : (
          <Link to="/login" className="header-button">
            Entrar
          </Link>
        )}

        {erro && (
          <span className="header-error" role="alert">
            {erro}
          </span>
        )}
      </div>
    </header>
  );
}
