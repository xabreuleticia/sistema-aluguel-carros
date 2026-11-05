
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obterCsrf } from "../service/auth";
import "../styles/MeuPerfil.css";

const empregoVazio = () => ({
  empresa: "",
  rendimento: "",
});

function formatarCpf(cpf) {
  const numeros = String(cpf || "").replace(/\D/g, "");

  if (numeros.length !== 11) return cpf || "";

  return numeros.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );
}

async function lerErro(resposta, mensagemPadrao) {
  try {
    const dados = await resposta.json();

    return (
      dados.detail ||
      dados.mensagem ||
      dados.message ||
      mensagemPadrao
    );
  } catch {
    return mensagemPadrao;
  }
}

function normalizarPerfil(dados) {
  return {
    nome: dados.nome || "",
    email: dados.email || "",
    cpf: dados.cpf || "",
    rg: dados.rg || "",
    endereco: dados.endereco || "",
    profissao: dados.profissao || "",
    empregos: Array.isArray(dados.empregos)
      ? dados.empregos.map((emprego) => ({
          empresa: emprego.empresa || "",
          rendimento: String(emprego.rendimento ?? ""),
        }))
      : [],
  };
}

export default function MeuPerfil() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    cpf: "",
    rg: "",
    endereco: "",
    profissao: "",
    empregos: [],
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [confirmando, setConfirmando] = useState(false);
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [desativando, setDesativando] = useState(false);
  const [erroDesativacao, setErroDesativacao] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch("/api/perfil", {
          credentials: "include",
        });

        if (!resposta.ok) {
          throw new Error(
            await lerErro(
              resposta,
              "Não foi possível carregar seu perfil."
            )
          );
        }

        const dados = await resposta.json();

        if (ativo) {
          setFormulario(normalizarPerfil(dados));
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error.message ||
              "Não foi possível carregar seu perfil."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, []);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setSucesso("");
  }

  function alterarEmprego(indice, campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      empregos: anterior.empregos.map((emprego, i) =>
        i === indice
          ? { ...emprego, [campo]: valor }
          : emprego
      ),
    }));

    setSucesso("");
  }

  function adicionarEmprego() {
    if (formulario.empregos.length >= 3) return;

    setFormulario((anterior) => ({
      ...anterior,
      empregos: [...anterior.empregos, empregoVazio()],
    }));

    setSucesso("");
  }

  function removerEmprego(indice) {
    setFormulario((anterior) => ({
      ...anterior,
      empregos: anterior.empregos.filter(
        (_, i) => i !== indice
      ),
    }));

    setSucesso("");
  }

  async function salvarPerfil(evento) {
    evento.preventDefault();
    setErro("");
    setSucesso("");

    if (
      !formulario.nome.trim() ||
      !formulario.rg.trim() ||
      !formulario.endereco.trim() ||
      !formulario.profissao.trim()
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    for (const emprego of formulario.empregos) {
      const rendimento = Number(emprego.rendimento);

      if (
        !emprego.empresa.trim() ||
        emprego.rendimento === "" ||
        !Number.isFinite(rendimento) ||
        rendimento < 0
      ) {
        setErro(
          "Preencha corretamente os dados de cada emprego."
        );
        return;
      }
    }

    setSalvando(true);

    try {
      const csrf = await obterCsrf();

      const resposta = await fetch("/api/perfil", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          nome: formulario.nome.trim(),
          email: formulario.email,
          cpf: formulario.cpf,
          rg: formulario.rg.trim(),
          endereco: formulario.endereco.trim(),
          profissao: formulario.profissao.trim(),
          empregos: formulario.empregos.map((emprego) => ({
            empresa: emprego.empresa.trim(),
            rendimento: Number(emprego.rendimento),
          })),
        }),
      });

      if (!resposta.ok) {
        throw new Error(
          await lerErro(
            resposta,
            "Não foi possível salvar as alterações."
          )
        );
      }

      const dados = await resposta.json();

      setFormulario(normalizarPerfil(dados));
      setSucesso("Seu perfil foi atualizado com sucesso.");
    } catch (error) {
      setErro(
        error.message ||
          "Ocorreu um erro ao atualizar seu perfil."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function desativarConta(evento) {
    evento.preventDefault();

    setErroDesativacao("");

    if (!senhaConfirmacao) {
      setErroDesativacao(
        "Digite sua senha para confirmar."
      );
      return;
    }

    setDesativando(true);

    try {
      const csrf = await obterCsrf();

      const resposta = await fetch("/api/perfil/desativar", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          senha: senhaConfirmacao,
        }),
      });

      if (!resposta.ok) {
        throw new Error(
          await lerErro(
            resposta,
            "Não foi possível desativar a conta."
          )
        );
      }

      setSenhaConfirmacao("");
      setConfirmando(false);

      navigate("/", {
        replace: true,
        state: {
          mensagemConta:
            "Sua conta foi desativada com sucesso.",
        },
      });
    } catch (error) {
      setErroDesativacao(
        error.message ||
          "Não foi possível desativar a conta."
      );
    } finally {
      setDesativando(false);
    }
  }

  if (carregando) {
    return (
      <main className="perfil-page">
        <div className="perfil-container perfil-carregando">
          <p>Carregando seus dados...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="perfil-page">
      <section className="perfil-hero">
        <div className="perfil-container">
          <div className="perfil-hero-topo">
            <span>ÁREA DO CLIENTE</span>
            <span>VÉRTICE / MEU PERFIL</span>
          </div>

          <span className="perfil-eyebrow">
            SUA CONTA VÉRTICE
          </span>

          <h1>
            Seu perfil.
            <br />
            <em>Do seu jeito.</em>
          </h1>

          <p>
            Mantenha seus dados atualizados para uma
            experiência de aluguel mais completa.
          </p>
        </div>
      </section>

      <section className="perfil-conteudo">
        <div className="perfil-container">
          <div className="perfil-navegacao">
            <Link to="/pedidos">
              ← Voltar para meus pedidos
            </Link>
          </div>

          <div className="perfil-introducao">
            <div>
              <span className="perfil-eyebrow">
                INFORMAÇÕES CADASTRAIS
              </span>
              <h2>Meus dados</h2>
            </div>

            <p>
              Atualize suas informações pessoais e
              profissionais sempre que necessário.
            </p>
          </div>

          {erro && (
            <div
              className="perfil-alerta perfil-alerta-erro"
              role="alert"
            >
              {erro}
            </div>
          )}

          {sucesso && (
            <div
              className="perfil-alerta perfil-alerta-sucesso"
              role="status"
            >
              {sucesso}
            </div>
          )}

          <form
            className="perfil-formulario"
            onSubmit={salvarPerfil}
          >
            <section className="perfil-secao">
              <div className="perfil-secao-cabecalho">
                <span>01</span>
                <div>
                  <h3>Informações pessoais</h3>
                  <p>
                    Dados utilizados para identificação
                    e contato.
                  </p>
                </div>
              </div>

              <div className="perfil-campos">
                <label className="perfil-campo-largo">
                  Nome completo
                  <input
                    type="text"
                    name="nome"
                    value={formulario.nome}
                    onChange={alterarCampo}
                    required
                  />
                </label>

                <label>
                  E-mail
                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    readOnly
                  />
                  <small>
                    Utilizado para acessar sua conta.
                  </small>
                </label>

                <label>
                  CPF
                  <input
                    type="text"
                    value={formatarCpf(formulario.cpf)}
                    readOnly
                  />
                  <small>
                    Documento registrado no cadastro.
                  </small>
                </label>

                <label>
                  RG
                  <input
                    type="text"
                    name="rg"
                    value={formulario.rg}
                    onChange={alterarCampo}
                    required
                  />
                </label>

                <label className="perfil-campo-largo">
                  Endereço
                  <input
                    type="text"
                    name="endereco"
                    value={formulario.endereco}
                    onChange={alterarCampo}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="perfil-secao">
              <div className="perfil-secao-cabecalho">
                <span>02</span>
                <div>
                  <h3>Informações profissionais</h3>
                  <p>
                    Mantenha sua ocupação atualizada.
                  </p>
                </div>
              </div>

              <div className="perfil-campos">
                <label className="perfil-campo-largo">
                  Profissão
                  <input
                    type="text"
                    name="profissao"
                    value={formulario.profissao}
                    onChange={alterarCampo}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="perfil-secao">
              <div className="perfil-secao-cabecalho">
                <span>03</span>
                <div>
                  <h3>Vínculos empregatícios</h3>
                  <p>
                    Informe até três empresas e seus
                    rendimentos mensais.
                  </p>
                </div>
              </div>

              {formulario.empregos.length === 0 && (
                <p className="perfil-sem-empregos">
                  Nenhum vínculo empregatício informado.
                </p>
              )}

              <div className="perfil-empregos">
                {formulario.empregos.map(
                  (emprego, indice) => (
                    <div
                      className="perfil-emprego"
                      key={indice}
                    >
                      <div className="perfil-emprego-topo">
                        <strong>
                          Emprego {indice + 1}
                        </strong>

                        <button
                          type="button"
                          className="perfil-remover"
                          onClick={() =>
                            removerEmprego(indice)
                          }
                        >
                          Remover
                        </button>
                      </div>

                      <div className="perfil-campos">
                        <label>
                          Nome da empresa
                          <input
                            type="text"
                            value={emprego.empresa}
                            onChange={(evento) =>
                              alterarEmprego(
                                indice,
                                "empresa",
                                evento.target.value
                              )
                            }
                            required
                          />
                        </label>

                        <label>
                          Rendimento mensal (R$)
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={emprego.rendimento}
                            onChange={(evento) =>
                              alterarEmprego(
                                indice,
                                "rendimento",
                                evento.target.value
                              )
                            }
                            required
                          />
                        </label>
                      </div>
                    </div>
                  )
                )}
              </div>

              {formulario.empregos.length < 3 && (
                <button
                  type="button"
                  className="perfil-adicionar"
                  onClick={adicionarEmprego}
                >
                  + Adicionar emprego
                </button>
              )}
            </section>

            <div className="perfil-acoes">
              <Link
                to="/pedidos"
                className="perfil-voltar"
              >
                Cancelar alterações
              </Link>

              <button
                type="submit"
                className="perfil-salvar"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando alterações..."
                  : "Salvar alterações"}
              </button>
            </div>
          </form>

          <section className="perfil-secao perfil-seguranca">
            <div className="perfil-secao-cabecalho">
              <span>04</span>
              <div>
                <h3>Segurança da conta</h3>
                <p>
                  Gerencie o acesso à sua conta VÉRTICE.
                </p>
              </div>
            </div>

            <div className="perfil-desativacao">
              <div>
                <h4>Desativar minha conta</h4>
                <p>
                  Sua conta deixará de permitir novos
                  acessos. O histórico de pedidos será
                  preservado no sistema.
                </p>
                <p>
                  Contas com pedidos não finalizados
                  não podem ser desativadas.
                </p>
              </div>

              {!confirmando && (
                <button
                  type="button"
                  className="perfil-botao-desativar"
                  onClick={() => {
                    setErroDesativacao("");
                    setConfirmando(true);
                  }}
                >
                  Desativar minha conta
                </button>
              )}
            </div>

            {confirmando && (
              <form
                className="perfil-confirmacao"
                onSubmit={desativarConta}
              >
                <h4>Confirmar desativação</h4>

                <p>
                  Para confirmar, informe sua senha
                  atual. Depois da desativação,
                  você será desconectado.
                </p>

                <label>
                  Senha atual
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={senhaConfirmacao}
                    onChange={(evento) =>
                      setSenhaConfirmacao(
                        evento.target.value
                      )
                    }
                    required
                  />
                </label>

                {erroDesativacao && (
                  <div
                    className="perfil-alerta perfil-alerta-erro"
                    role="alert"
                  >
                    {erroDesativacao}
                  </div>
                )}

                <div className="perfil-confirmacao-acoes">
                  <button
                    type="button"
                    className="perfil-voltar-confirmacao"
                    disabled={desativando}
                    onClick={() => {
                      setConfirmando(false);
                      setSenhaConfirmacao("");
                      setErroDesativacao("");
                    }}
                  >
                    Manter minha conta
                  </button>

                  <button
                    type="submit"
                    className="perfil-botao-desativar"
                    disabled={desativando}
                  >
                    {desativando
                      ? "Desativando..."
                      : "Confirmar desativação"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
