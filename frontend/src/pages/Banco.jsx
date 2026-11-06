
import { useEffect, useState } from "react";
import "../styles/Banco.css";

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));

const formatarData = (valor) => {
  if (!valor) return "Não informada";

  return new Date(valor).toLocaleString("pt-BR");
};

const nomesStatus = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
};

async function lerErro(resposta) {
  try {
    const dados = await resposta.json();

    return (
      dados.detail ||
      dados.message ||
      dados.reason ||
      `Erro ${resposta.status}`
    );
  } catch {
    return `Erro ${resposta.status}`;
  }
}

export default function Banco() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [formularios, setFormularios] = useState({});

  const [filtro, setFiltro] = useState("TODOS");
  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarSolicitacoes() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        "/api/banco/solicitacoes",
        {
          credentials: "include",
        }
      );

      if (!resposta.ok) {
        throw new Error(await lerErro(resposta));
      }

      const dados = await resposta.json();

      setSolicitacoes(
        Array.isArray(dados) ? dados : []
      );
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível carregar as solicitações."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  function atualizarFormulario(id, campo, valor) {
    setFormularios((atual) => ({
      ...atual,
      [id]: {
        ...atual[id],
        [campo]: valor,
      },
    }));
  }

  async function registrarDecisao(solicitacao) {
    const formulario =
      formularios[solicitacao.id] || {};

    setErro("");
    setMensagem("");

    if (!formulario.decisao) {
      setErro("Selecione a decisão bancária.");
      return;
    }

    if (!formulario.justificativa?.trim()) {
      setErro("Informe uma justificativa.");
      return;
    }

    const confirmar = window.confirm(
      "Deseja confirmar esta decisão? " +
      "Ela não poderá ser alterada posteriormente."
    );

    if (!confirmar) return;

    setProcessando(solicitacao.id);

    try {
      const respostaCsrf = await fetch(
        "/api/auth/csrf",
        {
          credentials: "include",
        }
      );

      if (!respostaCsrf.ok) {
        throw new Error(
          "Não foi possível validar a sessão."
        );
      }

      const csrf = await respostaCsrf.json();

      const resposta = await fetch(
        `/api/banco/solicitacoes/${solicitacao.id}/decisao`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            decisao: formulario.decisao,
            justificativa:
              formulario.justificativa.trim(),
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error(await lerErro(resposta));
      }

      const atualizado = await resposta.json();

      setSolicitacoes((lista) =>
        lista.map((item) =>
          item.id === atualizado.id
            ? atualizado
            : item
        )
      );

      setMensagem(
        "Decisão bancária registrada com sucesso."
      );

      setFormularios((atual) => {
        const novos = { ...atual };
        delete novos[solicitacao.id];
        return novos;
      });
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível registrar a decisão."
      );
    } finally {
      setProcessando(null);
    }
  }

  const total = solicitacoes.length;

  const pendentes = solicitacoes.filter(
    (item) =>
      item.statusCredito === "PENDENTE" &&
      item.statusPedido === "PENDENTE"
  ).length;

  const aprovadas = solicitacoes.filter(
    (item) => item.statusCredito === "APROVADO"
  ).length;

  const recusadas = solicitacoes.filter(
    (item) => item.statusCredito === "RECUSADO"
  ).length;

  const solicitacoesFiltradas =
    solicitacoes.filter((item) => {
      const correspondeFiltro =
        filtro === "TODOS" ||
        item.statusCredito === filtro;

      const texto = [
        item.id,
        item.clienteId,
        item.automovelId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        correspondeFiltro &&
        texto.includes(busca.trim().toLowerCase())
      );
    });

  return (
    <main className="banco-pagina">
      <div className="banco-container">
        <section className="banco-topo">
          <div>
            <span className="banco-etiqueta">
              VÉRTICE / OPERAÇÕES FINANCEIRAS
            </span>

            <h1>Painel Bancário</h1>

            <p>
              Gerencie as solicitações de crédito
              encaminhadas à sua instituição.
            </p>
          </div>

          <button
            type="button"
            className="banco-atualizar"
            onClick={carregarSolicitacoes}
            disabled={
              carregando ||
              processando !== null
            }
          >
            {carregando
              ? "Atualizando..."
              : "Atualizar solicitações"}
          </button>
        </section>

        <section className="banco-indicadores">
          <article className="banco-indicador">
            <span>Total de solicitações</span>
            <strong>{total}</strong>
          </article>

          <article className="banco-indicador">
            <span>Aguardando decisão</span>
            <strong>{pendentes}</strong>
          </article>

          <article className="banco-indicador">
            <span>Créditos aprovados</span>
            <strong>{aprovadas}</strong>
          </article>

          <article className="banco-indicador">
            <span>Créditos recusados</span>
            <strong>{recusadas}</strong>
          </article>
        </section>

        <section className="banco-listagem">
          <div className="banco-secao-topo">
            <span className="banco-etiqueta">
              CENTRAL DE CRÉDITO
            </span>

            <h2>Solicitações de financiamento</h2>

            <p>
              Consulte os dados financeiros declarados
              e registre as decisões de crédito.
            </p>
          </div>

          <div className="banco-filtros">
            <input
              type="search"
              placeholder="Buscar por identificador..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />

            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value)
              }
            >
              <option value="TODOS">
                Todas as solicitações
              </option>

              <option value="PENDENTE">
                Pendentes
              </option>

              <option value="APROVADO">
                Aprovadas
              </option>

              <option value="RECUSADO">
                Recusadas
              </option>
            </select>
          </div>

          {erro && (
            <div
              className="banco-alerta banco-erro"
              role="alert"
            >
              {erro}
            </div>
          )}

          {mensagem && (
            <div
              className="banco-alerta banco-sucesso"
              role="status"
            >
              {mensagem}
            </div>
          )}

          {carregando ? (
            <div className="banco-vazio">
              <h3>Carregando solicitações...</h3>
            </div>
          ) : solicitacoesFiltradas.length === 0 ? (
            <div className="banco-vazio">
              <h3>Nenhuma solicitação encontrada</h3>

              <p>
                Quando um financiamento for
                encaminhado para este banco,
                ele aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="banco-cards">
              {solicitacoesFiltradas.map((solicitacao) => {
                const formulario =
                  formularios[solicitacao.id] || {};

                const podeDecidir =
                  solicitacao.statusCredito ===
                    "PENDENTE" &&
                  solicitacao.statusPedido ===
                    "PENDENTE";

                const ocupado =
                  processando !== null;

                return (
                  <article
                    className="banco-card"
                    key={solicitacao.id}
                  >
                    <div className="banco-card-topo">
                      <div>
                        <span className="banco-etiqueta">
                          SOLICITAÇÃO DE CRÉDITO
                        </span>

                        <h3>
                          Pedido #
                          {solicitacao.id
                            .slice(0, 8)
                            .toUpperCase()}
                        </h3>

                        <small>
                          Recebido em{" "}
                          {formatarData(
                            solicitacao.criadoEm
                          )}
                        </small>
                      </div>

                      <span
                        className={
                          "banco-status banco-status-" +
                          (
                            solicitacao.statusCredito ||
                            "PENDENTE"
                          ).toLowerCase()
                        }
                      >
                        {nomesStatus[
                          solicitacao.statusCredito
                        ] || "Sem status"}
                      </span>
                    </div>

                    <div className="banco-dados">
                      <div>
                        <span>Valor do aluguel</span>
                        <strong>
                          {formatarMoeda(
                            solicitacao.valorTotal
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Crédito solicitado</span>
                        <strong>
                          {formatarMoeda(
                            solicitacao.valorCredito
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Renda declarada</span>
                        <strong>
                          {formatarMoeda(
                            solicitacao.rendaInformada
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Profissão</span>
                        <strong>
                          {solicitacao.profissao ||
                            "Não informada"}
                        </strong>
                      </div>
                    </div>

                    <div className="banco-empregos">
                      <h4>
                        Informações financeiras
                      </h4>

                      {!solicitacao.empregos?.length ? (
                        <p>
                          Nenhum emprego cadastrado.
                        </p>
                      ) : (
                        solicitacao.empregos.map(
                          (emprego, indice) => (
                            <p key={indice}>
                              {emprego.empresa ||
                                "Empresa não informada"}
                              {" — "}
                              <strong>
                                {formatarMoeda(
                                  emprego.rendimento
                                )}
                              </strong>
                            </p>
                          )
                        )
                      )}

                      <small>
                        Os rendimentos foram informados
                        pelo cliente e não representam
                        comprovação de renda.
                      </small>
                    </div>

                    {podeDecidir ? (
                      <div className="banco-formulario">
                        <h4>
                          Registrar decisão bancária
                        </h4>

                        <label>
                          Resultado da análise

                          <select
                            value={
                              formulario.decisao || ""
                            }
                            onChange={(event) =>
                              atualizarFormulario(
                                solicitacao.id,
                                "decisao",
                                event.target.value
                              )
                            }
                          >
                            <option value="">
                              Selecione uma decisão
                            </option>

                            <option value="APROVADO">
                              Aprovar crédito
                            </option>

                            <option value="RECUSADO">
                              Recusar crédito
                            </option>
                          </select>
                        </label>

                        <label>
                          Justificativa da decisão

                          <textarea
                            rows={4}
                            maxLength={2000}
                            placeholder="Descreva a justificativa da análise..."
                            value={
                              formulario.justificativa ||
                              ""
                            }
                            onChange={(event) =>
                              atualizarFormulario(
                                solicitacao.id,
                                "justificativa",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="banco-botao-decisao"
                          disabled={ocupado}
                          onClick={() =>
                            registrarDecisao(solicitacao)
                          }
                        >
                          {processando === solicitacao.id
                            ? "Registrando..."
                            : "Confirmar decisão"}
                        </button>
                      </div>
                    ) : (
                      <div className="banco-decisao">
                        <strong>
                          Decisão:{" "}
                          {nomesStatus[
                            solicitacao.statusCredito
                          ] || "Não registrada"}
                        </strong>

                        {solicitacao.justificativaCredito && (
                          <p>
                            {
                              solicitacao.justificativaCredito
                            }
                          </p>
                        )}

                        {solicitacao.creditoAnalisadoEm && (
                          <small>
                            Analisado em{" "}
                            {formatarData(
                              solicitacao.creditoAnalisadoEm
                            )}
                          </small>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
