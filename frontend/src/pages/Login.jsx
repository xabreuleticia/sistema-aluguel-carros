
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { entrar } from "../service/auth";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const mensagemCadastro = location.state?.mensagem;

  const [tipoUsuario, setTipoUsuario] = useState("cliente");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const dados = await entrar(usuario.trim(), senha);

      if (dados.perfil === "AGENTE") {
        navigate("/agente", { replace: true });
      } else if (dados.perfil === "CLIENTE") {
        navigate("/pedidos", { replace: true });
      } else {
        setErro(
          "Não foi possível identificar o perfil da sua conta."
        );
      }
    } catch (error) {
      setErro(
        error instanceof TypeError
          ? "Não foi possível conectar ao servidor."
          : error.message ||
              "Não foi possível realizar o login."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual-top">
          <span className="login-monograma">V</span>

          <div className="login-marca">
            <strong>VÉRTICE</strong>
            <span>AUTOMÓVEIS · GRAND TOURING</span>
          </div>
        </div>

        <div className="login-visual-content">
          <span className="login-eyebrow">
            PARA QUEM SABE APRECIAR O CAMINHO
          </span>

          <h1>
            A liberdade
            <br />
            tem uma direção.
            <br />
            <em>A sua.</em>
          </h1>

          <p>
            Automóveis com personalidade.
            <br />
            Uma experiência à altura de cada trajeto.
          </p>
        </div>

        <div className="login-visual-footer">
          <span>VÉRTICE · BRASIL</span>
          <span>UMA NOVA FORMA DE SEGUIR</span>
        </div>
      </section>

      <section className="login-content">
        <div className="login-content-top">
          <Link to="/" className="login-back">
            Voltar ao início
          </Link>

          <span>SEU ESPAÇO VÉRTICE</span>
        </div>

        <div className="login-container">
          <span className="login-eyebrow">
            BEM-VINDO DE VOLTA
          </span>

          <h2>
            Seu próximo trajeto
            <br />
            começa aqui.
          </h2>

          <p className="login-description">
            Acesse sua conta para explorar nossa frota
            e acompanhar seus pedidos.
          </p>

          {mensagemCadastro && (
            <p
              className="cadastro-success"
              role="status"
            >
              {mensagemCadastro}
            </p>
          )}

          <div className="login-tabs">
            <button
              type="button"
              className={
                tipoUsuario === "cliente" ? "active" : ""
              }
              onClick={() => {
                setTipoUsuario("cliente");
                setErro("");
              }}
            >
              Sou cliente
            </button>

            <button
              type="button"
              className={
                tipoUsuario === "agente" ? "active" : ""
              }
              onClick={() => {
                setTipoUsuario("agente");
                setErro("");
              }}
            >
              Sou agente
            </button>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-field">
              <label htmlFor="usuario">
                E-mail
              </label>

              <input
                id="usuario"
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={usuario}
                onChange={(event) =>
                  setUsuario(event.target.value)
                }
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="senha">
                Senha
              </label>

              <div className="login-password">
                <input
                  id="senha"
                  name="senha"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(event) =>
                    setSenha(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-show-password"
                  onClick={() =>
                    setMostrarSenha(!mostrarSenha)
                  }
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {mostrarSenha
                    ? "Ocultar"
                    : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  name="manterConectado"
                />
                <span>Manter conectado</span>
              </label>

              <Link to="/recuperar-senha">
                Esqueci minha senha
              </Link>
            </div>

            {erro && (
              <p
                role="alert"
                className="login-error"
              >
                {erro}
              </p>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={carregando}
            >
              <span>
                {carregando
                  ? "Entrando..."
                  : "Entrar na minha conta"}
              </span>

              <span aria-hidden="true"></span>
            </button>
          </form>

          <p className="login-register">
            Primeira vez por aqui?{" "}
            <Link to="/cadastro">
              Criar meu cadastro
            </Link>
          </p>
        </div>

        <div className="login-content-footer">
          <p>
            Acesso exclusivo para clientes
            e agentes cadastrados.
          </p>

          <span>VÉRTICE © 2026</span>
        </div>
      </section>
    </main>
  );
}
