
import { useEffect, useState } from "react";
import "../styles/Agente.css";

const moeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));

function dataBR(valor) {
  if (!valor) return "Não informada";
  const [ano, mes, dia] = valor.substring(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

const statusNome = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
};

async function mensagemErro(resposta) {
  try {
    const dados = await resposta.json();
    return (
      dados.detail ||
      dados.message ||
      dados.reason ||
      `Erro ${resposta.status}`
    );
  } catch {
    return `Erro ${resposta.status}. Verifique o servidor.`;
  }
}

export default function Agente() {
  const [pedidos, setPedidos] = useState([]);
  const [automoveis, setAutomoveis] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [analises, setAnalises] = useState({});
  const [formularios, setFormularios] = useState({});
  const [filtro, setFiltro] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");
    setMensagem("");

    try {
      const [rp, ra, rb] = await Promise.all([
        fetch("/api/agente/pedidos", {
          credentials: "include",
        }),
        fetch("/api/automoveis", {
          credentials: "include",
        }),
        fetch("/api/agente/bancos", {
          credentials: "include",
        }),
      ]);

      if (!rp.ok) {
        throw new Error(await mensagemErro(rp));
      }

      if (!rb.ok) {
        throw new Error(
          "Não foi possível carregar a lista de bancos: " +
          (await mensagemErro(rb))
        );
      }

      setPedidos(await rp.json());
      setBancos(await rb.json());

      if (ra.ok) {
        setAutomoveis(await ra.json());
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
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

  async function obterCsrf() {
    const resposta = await fetch("/api/auth/csrf", {
      credentials: "include",
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível validar a sessão.");
    }

    return resposta.json();
  }

  async function requisicaoSegura(url, metodo, corpo) {
    const csrf = await obterCsrf();

    const resposta = await fetch(url, {
      method: metodo,
      credentials: "include",
      headers: {
        [csrf.headerName]: csrf.token,
        ...(corpo ? { "Content-Type": "application/json" } : {}),
      },
      ...(corpo ? { body: JSON.stringify(corpo) } : {}),
    });

    if (!resposta.ok) {
      throw new Error(await mensagemErro(resposta));
    }

    return resposta.json();
  }

  async function consultarAnalise(id) {
    setProcessando(id);
    setErro("");
    setMensagem("");

    try {
      const resposta = await fetch(
        `/api/agente/pedidos/${id}/analise-financeira`,
        { credentials: "include" }
      );

      if (!resposta.ok) {
        throw new Error(await mensagemErro(resposta));
      }

      const dados = await resposta.json();

      setAnalises((atual) => ({
        ...atual,
        [id]: dados,
      }));
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
  }

  async function registrarParecer(pedido) {
    const form = formularios[pedido.id] || {};

    setErro("");
    setMensagem("");

    if (!analises[pedido.id]) {
      setErro("Consulte primeiro os dados financeiros.");
      return;
    }

    if (!form.parecer || !form.justificativa?.trim()) {
      setErro("Informe o parecer e a justificativa.");
      return;
    }

    const bancoAgenteId =
      form.parecer === "FAVORAVEL"
        ? form.bancoAgenteId || null
        : null;

    const valorCredito =
      form.parecer === "FAVORAVEL" && form.valorCredito
        ? Number(form.valorCredito)
        : null;

    if (
      Boolean(bancoAgenteId) !==
      (valorCredito !== null)
    ) {
      setErro(
        "Selecione um banco e informe o valor do crédito, ou deixe ambos vazios."
      );
      return;
    }

    if (
      valorCredito !== null &&
      (!Number.isFinite(valorCredito) ||
        valorCredito <= 0 ||
        valorCredito > Number(pedido.valorTotal))
    ) {
      setErro(
        "O crédito deve ser positivo e não pode superar o valor do pedido."
      );
      return;
    }

    if (
      bancoAgenteId &&
      !bancos.some((banco) => banco.id === bancoAgenteId)
    ) {
      setErro("Selecione um banco válido da lista.");
      return;
    }

    setProcessando(pedido.id);

    try {
      const atualizado = await requisicaoSegura(
        `/api/agente/pedidos/${pedido.id}/parecer-financeiro`,
        "POST",
        {
          parecer: form.parecer,
          justificativa: form.justificativa.trim(),
          bancoAgenteId,
          valorCredito,
        }
      );

      setPedidos((lista) =>
        lista.map((item) =>
          item.id === pedido.id ? atualizado : item
        )
      );

      setMensagem("Parecer financeiro registrado com sucesso.");
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
  }

  async function decidirPedido(pedido, acao) {
    if (
      acao === "aprovar" &&
      pedido.parecerFinanceiro !== "FAVORAVEL"
    ) {
      setErro(
        "Registre um parecer financeiro favorável antes de aprovar."
      );
      return;
    }

    if (!window.confirm(`Deseja realmente ${acao} este pedido?`)) {
      return;
    }

    setProcessando(pedido.id);
    setErro("");
    setMensagem("");

    try {
      const atualizado = await requisicaoSegura(
        `/api/agente/pedidos/${pedido.id}/${acao}`,
        "PATCH"
      );

      setPedidos((lista) =>
        lista.map((item) =>
          item.id === pedido.id ? atualizado : item
        )
      );

      setMensagem(
        acao === "aprovar"
          ? "Pedido aprovado e contrato gerado com sucesso."
          : "Pedido recusado com sucesso."
      );
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
  }

  const pendentes = pedidos.filter(
    (p) => p.status === "PENDENTE"
  ).length;

  const aprovados = pedidos.filter(
    (p) => p.status === "APROVADO"
  ).length;

  const recusados = pedidos.filter(
    (p) => p.status === "RECUSADO"
  ).length;

  const listaFiltrada = pedidos
    .filter((pedido) => {
      if (
        filtro !== "TODOS" &&
        pedido.status !== filtro
      ) {
        return false;
      }

      const carro = automoveis.find(
        (a) => a.id === pedido.automovelId
      );

      const texto = [
        pedido.id,
        pedido.clienteId,
        carro?.marca,
        carro?.modelo,
        carro?.placa,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(busca.toLowerCase().trim());
    })
    .sort((a, b) => {
      if (a.status === "PENDENTE" && b.status !== "PENDENTE") {
        return -1;
      }

      if (b.status === "PENDENTE" && a.status !== "PENDENTE") {
        return 1;
      }

      return new Date(b.criadoEm || 0) -
        new Date(a.criadoEm || 0);
    });

  function nomeCarro(id) {
    const carro = automoveis.find((a) => a.id === id);
    return carro
      ? `${carro.marca} ${carro.modelo}`
      : "Automóvel cadastrado";
  }

  function nomeBanco(id) {
    return bancos.find((b) => b.id === id)?.nome ||
      "Banco não encontrado na lista de ativos";
  }

  return (
    <main className="agente-pagina">
      <div className="agente-container">
        <section className="agente-topo">
          <div>
            <span className="agente-etiqueta">
              VÉRTICE / GESTÃO DE ALUGUÉIS
            </span>

            <h1>Painel do Agente</h1>

            <p>
              Analise solicitações, registre pareceres
              financeiros e gerencie contratos.
            </p>
          </div>

          <button
            className="agente-atualizar"
            onClick={carregarDados}
            disabled={carregando || processando !== null}
          >
            Atualizar pedidos
          </button>
        </section>

        <section className="agente-indicadores">
          {[
            ["Total de solicitações", pedidos.length, "Pedidos registrados"],
            ["Aguardando análise", pendentes, "Pedidos pendentes"],
            ["Pedidos aprovados", aprovados, "Reservas autorizadas"],
            ["Pedidos recusados", recusados, "Solicitações encerradas"],
          ].map(([titulo, quantidade, subtitulo]) => (
            <article className="agente-indicador" key={titulo}>
              <span>{titulo}</span>
              <strong>{quantidade}</strong>
              <small>{subtitulo}</small>
            </article>
          ))}
        </section>

        <section className="agente-listagem">
          <div className="agente-listagem-topo">
            <span className="agente-etiqueta">
              CENTRAL DE SOLICITAÇÕES
            </span>

            <h2>Pedidos de aluguel</h2>

            <p>
              Consulte os dados financeiros, registre
              o parecer e decida sobre o pedido.
            </p>
          </div>

          <div className="agente-ferramentas">
            <input
              type="search"
              placeholder="Buscar veículo, placa ou pedido..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="TODOS">Todos os pedidos</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="APROVADO">Aprovados</option>
              <option value="RECUSADO">Recusados</option>
            </select>
          </div>

          {erro && (
            <div
              className="agente-alerta agente-alerta-erro"
              role="alert"
            >
              <strong>Não foi possível concluir a operação.</strong>
              <span>{erro}</span>
            </div>
          )}

          {mensagem && (
            <div
              className="agente-alerta agente-alerta-sucesso"
              role="status"
            >
              <strong>Operação concluída.</strong>
              <span>{mensagem}</span>
            </div>
          )}

          {carregando ? (
            <div className="agente-vazio">
              Carregando solicitações...
            </div>
          ) : listaFiltrada.length === 0 ? (
            <div className="agente-vazio">
              <h3>Nenhum pedido encontrado</h3>
              <p>Não há solicitações para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="agente-pedidos">
              {listaFiltrada.map((pedido) => {
                const analise = analises[pedido.id];
                const form = formularios[pedido.id] || {};
                const ocupado = processando !== null;
                const pendente = pedido.status === "PENDENTE";
                const temParecer = Boolean(
                  pedido.parecerFinanceiro
                );

                return (
                  <article
                    className="agente-pedido"
                    key={pedido.id}
                  >
                    <div className="agente-pedido-cabecalho">
                      <div>
                        <span className="agente-pedido-label">
                          SOLICITAÇÃO DE ALUGUEL
                        </span>

                        <h3>{nomeCarro(pedido.automovelId)}</h3>

                        <small>
                          Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                        </small>
                      </div>

                      <span
                        className={`agente-status agente-status-${pedido.status.toLowerCase()}`}
                      >
                        {statusNome[pedido.status] || pedido.status}
                      </span>
                    </div>

                    <div className="agente-pedido-dados">
                      <div>
                        <span>Retirada</span>
                        <strong>{dataBR(pedido.dataInicio)}</strong>
                      </div>

                      <div>
                        <span>Devolução</span>
                        <strong>{dataBR(pedido.dataFim)}</strong>
                      </div>

                      <div>
                        <span>Solicitação</span>
                        <strong>
                          {pedido.criadoEm
                            ? new Date(pedido.criadoEm)
                                .toLocaleDateString("pt-BR")
                            : "Não informada"}
                        </strong>
                      </div>

                      <div>
                        <span>Valor total</span>
                        <strong className="agente-valor">
                          {moeda(pedido.valorTotal)}
                        </strong>
                      </div>
                    </div>

                    {pendente && (
                      <div className="agente-analise-financeira">
                        <button
                          type="button"
                          className="agente-botao-analise"
                          onClick={() =>
                            consultarAnalise(pedido.id)
                          }
                          disabled={ocupado}
                        >
                          {processando === pedido.id
                            ? "Aguarde..."
                            : "Consultar análise financeira"}
                        </button>

                        {analise && (
                          <div className="agente-analise-detalhes">
                            <strong>Dados financeiros do cliente</strong>

                            <p>
                              Profissão:{" "}
                              {analise.profissao || "Não informada"}
                            </p>

                            <p>
                              Renda total informada:{" "}
                              {moeda(analise.rendaTotalInformada)}
                            </p>

                            <p>
                              Valor do pedido:{" "}
                              {moeda(analise.valorPedido)}
                            </p>

                            {analise.empregos.map((emprego, i) => (
                              <p key={i}>
                                {emprego.empresa}:{" "}
                                {moeda(emprego.rendimento)}
                              </p>
                            ))}

                            <small>
                              Informações declaradas pelo cliente,
                              não verificadas.
                            </small>
                          </div>
                        )}

                        {temParecer ? (
                          <div className="agente-parecer-registrado">
                            <strong>
                              Parecer financeiro:{" "}
                              {pedido.parecerFinanceiro === "FAVORAVEL"
                                ? "Favorável"
                                : "Desfavorável"}
                            </strong>

                            <p>{pedido.justificativaFinanceira}</p>

                            {pedido.bancoAgenteId && (
                              <p>
                                Banco: {nomeBanco(pedido.bancoAgenteId)}
                              </p>
                            )}

                            {pedido.valorCredito != null && (
                              <p>
                                Crédito informado:{" "}
                                {moeda(pedido.valorCredito)}
                              </p>
                            )}
                          </div>
                        ) : analise ? (
                          <div className="agente-form-parecer">
                            <h4>Registrar parecer financeiro</h4>

                            <label>
                              Resultado da análise
                              <select
                                value={form.parecer || ""}
                                onChange={(e) =>
                                  atualizarFormulario(
                                    pedido.id,
                                    "parecer",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Selecione</option>
                                <option value="FAVORAVEL">
                                  Favorável
                                </option>
                                <option value="DESFAVORAVEL">
                                  Desfavorável
                                </option>
                              </select>
                            </label>

                            <label>
                              Justificativa
                              <textarea
                                rows={3}
                                maxLength={2000}
                                placeholder="Descreva o motivo da decisão..."
                                value={form.justificativa || ""}
                                onChange={(e) =>
                                  atualizarFormulario(
                                    pedido.id,
                                    "justificativa",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            {form.parecer === "FAVORAVEL" && (
                              <div className="agente-campos-credito">
                                <p>Crédito bancário opcional</p>

                                <label>
                                  Banco responsável
                                  <select
                                    value={form.bancoAgenteId || ""}
                                    onChange={(e) =>
                                      atualizarFormulario(
                                        pedido.id,
                                        "bancoAgenteId",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">
                                      Sem crédito bancário
                                    </option>

                                    {bancos.map((banco) => (
                                      <option
                                        key={banco.id}
                                        value={banco.id}
                                      >
                                        {banco.nome}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                {bancos.length === 0 && (
                                  <small>
                                    Nenhum banco ativo cadastrado.
                                    Cadastre ou classifique um agente
                                    como banco no Supabase.
                                  </small>
                                )}

                                <label>
                                  Valor do crédito (R$)
                                  <input
                                    type="number"
                                    min="0.01"
                                    max={pedido.valorTotal}
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.valorCredito || ""}
                                    onChange={(e) =>
                                      atualizarFormulario(
                                        pedido.id,
                                        "valorCredito",
                                        e.target.value
                                      )
                                    }
                                  />
                                </label>

                                <small>
                                  Para conceder crédito, selecione
                                  um banco e informe o valor.
                                  Para aluguel sem financiamento,
                                  deixe o banco e o valor vazios.
                                </small>
                              </div>
                            )}

                            <button
                              type="button"
                              className="agente-botao-salvar-parecer"
                              disabled={ocupado}
                              onClick={() =>
                                registrarParecer(pedido)
                              }
                            >
                              Salvar parecer financeiro
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="agente-pedido-rodape">
                      <span className="agente-cliente">
                        Cliente: {pedido.clienteId.slice(0, 8)}
                      </span>

                      {pendente ? (
                        <div className="agente-acoes">
                          <button
                            className="agente-botao-recusar"
                            disabled={ocupado}
                            onClick={() =>
                              decidirPedido(pedido, "recusar")
                            }
                          >
                            Recusar
                          </button>

                          <button
                            className="agente-botao-aprovar"
                            disabled={
                              ocupado ||
                              pedido.parecerFinanceiro !== "FAVORAVEL"
                            }
                            onClick={() =>
                              decidirPedido(pedido, "aprovar")
                            }
                          >
                            Aprovar pedido
                          </button>
                        </div>
                      ) : (
                        <span className="agente-finalizado">
                          Solicitação analisada
                        </span>
                      )}
                    </div>
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
