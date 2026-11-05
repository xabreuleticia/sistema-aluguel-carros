
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cadastrarCliente } from "../services/auth";
import "../styles/Login.css";
import "../styles/Cadastro.css";

const camposIniciais = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  cpf: "",
  rg: "",
  endereco: "",
  profissao: "",
};

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState(camposIniciais);
  const [empregos, setEmpregos] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function alterar(event) {
    const { name, value } = event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function adicionarEmprego() {
    if (empregos.length >= 3) return;

    setEmpregos((anterior) => [
      ...anterior,
      { empresa: "", rendimento: "" },
    ]);
  }

  function alterarEmprego(index, campo, valor) {
    setEmpregos((anterior) =>
      anterior.map((emprego, i) =>
        i === index
          ? { ...emprego, [campo]: valor }
          : emprego
      )
    );
  }

  function removerEmprego(index) {
    setEmpregos((anterior) =>
      anterior.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (form.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    const cpf = form.cpf.replace(/\D/g, "");

    if (cpf.length !== 11) {
      setErro("Informe um CPF com 11 dígitos.");
      return;
    }

    setCarregando(true);

    try {
      await cadastrarCliente({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
        cpf,
        rg: form.rg.trim(),
        endereco: form.endereco.trim(),
        profissao: form.profissao.trim(),
        empregos: empregos.map((emprego) => ({
          empresa: emprego.empresa.trim(),
          rendimento: Number(emprego.rendimento),
        })),
      });

      navigate("/login", {
        replace: true,
        state: {
          mensagem:
            "Cadastro realizado! Entre com seu e-mail e senha.",
        },
      });
    } catch (error) {
      setErro(
        error instanceof TypeError
          ? "Não foi possível conectar ao servidor."
          : error.message || "Erro ao criar cadastro."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page cadastro-page">
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
            UMA NOVA JORNADA COMEÇA AQUI
          </span>

          <h1>
            O próximo
            <br />
            capítulo é
            <br />
            <em>seu.</em>
          </h1>

          <p>
            Crie sua conta e descubra
            <br />
            uma nova forma de seguir.
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

        <div className="login-container cadastro-container">
          <span className="login-eyebrow">
            FAÇA PARTE DA VÉRTICE
          </span>

          <h2>
            Sua próxima jornada
            <br />
            começa aqui.
          </h2>

          <p className="login-description">
            Preencha seus dados para criar sua conta
            de cliente.
          </p>

          <form
            className="login-form cadastro-form"
            onSubmit={handleSubmit}
          >
            <h3>Dados de acesso</h3>

            <div className="login-field">
              <label htmlFor="cad-nome">Nome completo</label>
              <input
                id="cad-nome"
                name="nome"
                value={form.nome}
                onChange={alterar}
                placeholder="Seu nome completo"
                autoComplete="name"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="cad-email">E-mail</label>
              <input
                id="cad-email"
                name="email"
                type="email"
                value={form.email}
                onChange={alterar}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="cadastro-grid">
              <div className="login-field">
                <label htmlFor="cad-senha">Senha</label>
                <input
                  id="cad-senha"
                  name="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={form.senha}
                  onChange={alterar}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="cad-confirmar">
                  Confirmar senha
                </label>
                <input
                  id="cad-confirmar"
                  name="confirmarSenha"
                  type={mostrarSenha ? "text" : "password"}
                  value={form.confirmarSenha}
                  onChange={alterar}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <label className="cadastro-checkbox">
              <input
                type="checkbox"
                checked={mostrarSenha}
                onChange={(e) =>
                  setMostrarSenha(e.target.checked)
                }
              />
              Mostrar senhas
            </label>

            <h3>Dados pessoais</h3>

            <div className="cadastro-grid">
              <div className="login-field">
                <label htmlFor="cad-cpf">CPF</label>
                <input
                  id="cad-cpf"
                  name="cpf"
                  value={form.cpf}
                  onChange={alterar}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="cad-rg">RG</label>
                <input
                  id="cad-rg"
                  name="rg"
                  value={form.rg}
                  onChange={alterar}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="cad-endereco">
                Endereço completo
              </label>
              <input
                id="cad-endereco"
                name="endereco"
                value={form.endereco}
                onChange={alterar}
                placeholder="Rua, número, bairro, cidade e estado"
                autoComplete="street-address"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="cad-profissao">Profissão</label>
              <input
                id="cad-profissao"
                name="profissao"
                value={form.profissao}
                onChange={alterar}
                required
              />
            </div>

            <div className="cadastro-section-heading">
              <h3>Dados profissionais</h3>
              <span>Até 3 empregadores</span>
            </div>

            {empregos.map((emprego, index) => (
              <div className="cadastro-emprego" key={index}>
                <div className="cadastro-section-heading">
                  <strong>Empregador {index + 1}</strong>
                  <button
                    type="button"
                    className="cadastro-remove"
                    onClick={() => removerEmprego(index)}
                  >
                    Remover
                  </button>
                </div>

                <div className="cadastro-grid">
                  <div className="login-field">
                    <label htmlFor={`empresa-${index}`}>
                      Empresa
                    </label>
                    <input
                      id={`empresa-${index}`}
                      value={emprego.empresa}
                      onChange={(e) =>
                        alterarEmprego(
                          index,
                          "empresa",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor={`rendimento-${index}`}>
                      Rendimento mensal (R$)
                    </label>
                    <input
                      id={`rendimento-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={emprego.rendimento}
                      onChange={(e) =>
                        alterarEmprego(
                          index,
                          "rendimento",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            {empregos.length < 3 && (
              <button
                type="button"
                className="cadastro-add"
                onClick={adicionarEmprego}
              >
                + Adicionar empregador
              </button>
            )}

            {erro && (
              <p className="login-error" role="alert">
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
                  ? "Criando conta..."
                  : "Criar minha conta"}
              </span>
              <span aria-hidden="true"></span>
            </button>
          </form>

          <p className="login-register">
            Já possui uma conta?{" "}
            <Link to="/login">Entrar</Link>
          </p>
        </div>

        <div className="login-content-footer">
          <p>Seu próximo trajeto começa aqui.</p>
          <span>VÉRTICE © 2026</span>
        </div>
      </section>
    </main>
  );
}
