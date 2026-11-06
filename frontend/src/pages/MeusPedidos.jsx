
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usuarioAtual, obterCsrf } from "../service/auth";
import "../styles/MeusPedidos.css";

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor ?? 0));

const formatarData = (data) => {
  if (!data) return "—";

  const partes = data.substring(0, 10).split("-");

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return new Date(data).toLocaleDateString("pt-BR");
};

const formatarStatus = (status) => {
  const nomes = {
    PENDENTE: "Em análise",
    APROVADO: "Aprovado",
    APROVADA: "Aprovado",
    RECUSADO: "Recusado",
    REPROVADO: "Recusado",
    REJEITADO: "Recusado",
    CANCELADO: "Cancelado",
    CONCLUIDO: "Concluído",
  };

  return nomes[status] || status || "Não informado";
};

const classeStatus = (status) => {
  if (["APROVADO", "APROVADA"].includes(status)) {
    return "aprovado";
  }

  if (["RECUSADO", "REPROVADO", "REJEITADO"].includes(status)) {
    return "recusado";
  }

  if (status === "CANCELADO") return "cancelado";
  if (status === "CONCLUIDO") return "concluido";

  return "pendente";
};

const estilos = {
  acoes: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #e4e6dd",
  },

  editar: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",
    background: "#173f35",
    border: "1px solid #173f35",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
    transition: "background 0.2s ease",
    cursor: "pointer",
  },

  cancelar: {
    padding: "12px 20px",
    border: "1px solid #cda59e",
    background: "transparent",
    color: "#913c32",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },

  aviso: {
    margin: "24px 0",
    padding: "18px 22px",
    fontSize: "13px",
    lineHeight: 1.7,
    scrollMarginTop: "110px",
  },

  modalFundo: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 35, 29, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  modal: {
    background: "#f5f2e9",
    color: "#173f35",
    width: "100%",
    maxWidth: "580px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "32px",
    boxShadow: "0 20px 70px rgba(0, 0, 0, 0.2)",
  },

  modalLinha: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid #d8dcd1",
    fontSize: "14px",
  },

  modalRotulo: {
    color: "#66736a",
    fontSize: "12px",
  },
};

export default function MeusPedidos() {
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [cancelandoId, setCancelandoId] = useState(null);

  const [contratoAberto, setContratoAberto] = useState(null);
  const [carregandoContratoId, setCarregandoContratoId] =
    useState(null);
  const [baixandoPdf, setBaixandoPdf] = useState(false);

  const avisoRef = useRef(null);
  const fecharContratoRef = useRef(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErroCarregamento("");

      try {
        const [dadosUsuario, resposta] = await Promise.all([
          usuarioAtual(),
          fetch("/api/pedidos/meus", {
            credentials: "include",
          }),
        ]);

        if (!resposta.ok) {
          if (resposta.status === 401) {
            throw new Error(
              "Sua sessão expirou. Faça login novamente."
            );
          }

          throw new Error(
            `Não foi possível carregar seus pedidos (${resposta.status}).`
          );
        }

        const dadosPedidos = await resposta.json();

        if (ativo) {
          setUsuario(dadosUsuario);
          setPedidos(
            Array.isArray(dadosPedidos) ? dadosPedidos : []
          );
        }
      } catch (error) {
        if (ativo) {
          setErroCarregamento(
            error.message ||
              "Não foi possível carregar seus pedidos."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if ((erroAcao || mensagem) && avisoRef.current) {
      avisoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [erroAcao, mensagem]);

  useEffect(() => {
    if (!contratoAberto) return;

    fecharContratoRef.current?.focus();

    function aoPressionarTecla(evento) {
      if (evento.key === "Escape" && !baixandoPdf) {
        setContratoAberto(null);
      }
    }

    document.addEventListener("keydown", aoPressionarTecla);

    return () => {
      document.removeEventListener(
        "keydown",
        aoPressionarTecla
      );
    };
  }, [contratoAberto, baixandoPdf]);

  // CANCELAR PEDIDO
  async function cancelarPedido(id) {
    if (cancelandoId !== null) return;

    const confirmado = window.confirm(
      "Deseja realmente cancelar esta solicitação de aluguel?"
    );

    if (!confirmado) return;

    setCancelandoId(id);
    setErroAcao("");
    setMensagem("");

    try {
      const csrf = await obterCsrf();

      const resposta = await fetch(
        `/api/pedidos/${id}/cancelar`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            [csrf.headerName]: csrf.token,
          },
        }
      );

      if (!resposta.ok) {
        if (resposta.status === 409) {
          throw new Error(
            "Esta solicitação não está mais pendente. " +
              "Atualize a página para verificar seu status."
          );
        }

        if (resposta.status === 401) {
          throw new Error(
            "Sua sessão expirou. Faça login novamente."
          );
        }

        if (resposta.status === 403) {
          throw new Error(
            "Você não possui permissão para cancelar esta solicitação."
          );
        }

        if (resposta.status === 404) {
          throw new Error(
            "Esta solicitação não foi encontrada."
          );
        }

        throw new Error(
          "Não foi possível cancelar a solicitação. Tente novamente."
        );
      }

      const pedidoAtualizado = await resposta.json();

      setPedidos((anteriores) =>
        anteriores.map((pedido) =>
          pedido.id === id ? pedidoAtualizado : pedido
        )
      );

      setMensagem(
        "Solicitação cancelada com sucesso. " +
          "Ela continuará disponível no seu histórico."
      );
    } catch (error) {
      setErroAcao(
        error.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor. Verifique sua conexão."
          : error.message ||
              "Ocorreu um erro ao cancelar a solicitação."
      );
    } finally {
      setCancelandoId(null);
    }
  }

  // VISUALIZAR CONTRATO
  async function visualizarContrato(pedidoId) {
    if (carregandoContratoId !== null) return;

    setCarregandoContratoId(pedidoId);
    setErroAcao("");
    setMensagem("");

    try {
      const resposta = await fetch(
        `/api/contratos/pedido/${pedidoId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!resposta.ok) {
        if (resposta.status === 401) {
          throw new Error(
            "Sua sessão expirou. Faça login novamente."
          );
        }

        if (resposta.status === 403) {
          throw new Error(
            "Você não possui permissão para visualizar este contrato."
          );
        }

        if (resposta.status === 404) {
          throw new Error(
            "Este pedido ainda não possui um contrato registrado."
          );
        }

        if (resposta.status === 409) {
          throw new Error(
            "Este pedido ainda não está aprovado."
          );
        }

        throw new Error(
          `Não foi possível carregar o contrato (${resposta.status}).`
        );
      }

      const dadosContrato = await resposta.json();

      setContratoAberto(dadosContrato);
    } catch (error) {
      setErroAcao(
        error.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor."
          : error.message ||
              "Ocorreu um erro ao consultar o contrato."
      );
    } finally {
      setCarregandoContratoId(null);
    }
  }

  // BAIXAR CONTRATO EM PDF
  async function baixarContratoPdf(pedidoId) {
    if (baixandoPdf) return;

    setBaixandoPdf(true);
    setErroAcao("");
    setMensagem("");

    try {
      const resposta = await fetch(
        `/api/contratos/pedido/${pedidoId}/pdf`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!resposta.ok) {
        if (resposta.status === 401) {
          throw new Error(
            "Sua sessão expirou. Faça login novamente."
          );
        }

        if (resposta.status === 403) {
          throw new Error(
            "Você não possui permissão para baixar este contrato."
          );
        }

        if (resposta.status === 404) {
          throw new Error(
            "O contrato não foi encontrado."
          );
        }

        if (resposta.status === 409) {
          throw new Error(
            "O pedido não está aprovado."
          );
        }

        throw new Error(
          `Não foi possível gerar o PDF (${resposta.status}).`
        );
      }

      const tipoArquivo =
        resposta.headers.get("content-type") || "";

      if (!tipoArquivo.includes("application/pdf")) {
        throw new Error(
          "O servidor não retornou um arquivo PDF válido."
        );
      }

      const arquivo = await resposta.blob();

      if (arquivo.size === 0) {
        throw new Error(
          "O PDF gerado está vazio."
        );
      }

      const url = URL.createObjectURL(arquivo);
      const link = document.createElement("a");

      link.href = url;
      link.download = `contrato-vertice-${pedidoId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      setMensagem(
        "O download do contrato foi iniciado com sucesso."
      );
    } catch (error) {
      setErroAcao(
        error.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor."
          : error.message ||
              "Ocorreu um erro ao baixar o contrato."
      );

      setContratoAberto(null);
    } finally {
      setBaixandoPdf(false);
    }
  }

  // INDICADORES
  const aprovados = pedidos.filter((pedido) =>
    ["APROVADO", "APROVADA"].includes(pedido.status)
  ).length;

  const pendentes = pedidos.filter(
    (pedido) => pedido.status === "PENDENTE"
  ).length;

  const recusados = pedidos.filter((pedido) =>
    ["RECUSADO", "REPROVADO", "REJEITADO"].includes(
      pedido.status
    )
  ).length;

  const cancelados = pedidos.filter(
    (pedido) => pedido.status === "CANCELADO"
  ).length;

  // FILTROS E ORDENAÇÃO
  const pedidosFiltrados = pedidos
    .filter((pedido) => {
      if (filtro === "TODOS") return true;

      if (filtro === "APROVADOS") {
        return ["APROVADO", "APROVADA"].includes(
          pedido.status
        );
      }

      if (filtro === "RECUSADOS") {
        return [
          "RECUSADO",
          "REPROVADO",
          "REJEITADO",
        ].includes(pedido.status);
      }

      return pedido.status === filtro;
    })
    .sort((a, b) => {
      if (
        a.status === "PENDENTE" &&
        b.status !== "PENDENTE"
      ) {
        return -1;
      }

      if (
        a.status !== "PENDENTE" &&
        b.status === "PENDENTE"
      ) {
        return 1;
      }

      const dataA = a.criadoEm
        ? new Date(a.criadoEm).getTime()
        : 0;

      const dataB = b.criadoEm
        ? new Date(b.criadoEm).getTime()
        : 0;

      return dataB - dataA;
    });

  return (
    <main className="pedidos-page">
      {/* HERO */}
      <section className="pedidos-hero">
        <div className="pedidos-container">
          <div className="pedidos-hero-top">
            <span>ÁREA DO CLIENTE</span>
            <span>VÉRTICE / MEUS PEDIDOS</span>
          </div>

          <div className="pedidos-hero-content">
            <div>
              <span className="pedidos-eyebrow">
                SUA JORNADA CONTINUA
              </span>

              <h1>
                Seus caminhos.
                <br />
                <em>Suas escolhas.</em>
              </h1>

              <p>
                {usuario?.nome
                  ? `Bem-vindo, ${usuario.nome.split(" ")[0]}. `
                  : ""}
                Acompanhe suas solicitações e descubra
                o que vem pela frente.
              </p>
            </div>

            <Link
              to="/pedido/novo"
              className="pedidos-hero-button"
            >
              Solicitar novo aluguel
            </Link>
          </div>

          <div className="pedidos-hero-bottom">
            <span>EXPERIÊNCIAS QUE MOVEM</span>
            <span>01 — SUA ÁREA EXCLUSIVA</span>
          </div>
        </div>
      </section>

      {/* PAINEL */}
      <section className="pedidos-main">
        <div className="pedidos-container">
          <div className="pedidos-section-heading">
            <div>
              <span className="pedidos-eyebrow">
                VISÃO GERAL
              </span>
              <h2>Seu painel</h2>
            </div>

            <p>
              Todas as suas solicitações, organizadas
              em um só lugar.
            </p>
          </div>

          {/* ESTATÍSTICAS */}
          <div className="pedidos-stats">
            <div className="pedidos-stat">
              <span className="pedidos-stat-label">
                TOTAL DE PEDIDOS
              </span>

              <strong>
                {carregando ? "—" : pedidos.length}
              </strong>

              <span className="pedidos-stat-detail">
                Solicitações realizadas
              </span>
            </div>

            <div className="pedidos-stat">
              <span className="pedidos-stat-label">
                EM ANÁLISE
              </span>

              <strong>
                {carregando ? "—" : pendentes}
              </strong>

              <span className="pedidos-stat-detail">
                Aguardando avaliação
              </span>
            </div>

            <div className="pedidos-stat">
              <span className="pedidos-stat-label">
                APROVADOS
              </span>

              <strong>
                {carregando ? "—" : aprovados}
              </strong>

              <span className="pedidos-stat-detail">
                Solicitações aprovadas
              </span>
            </div>

            <div className="pedidos-stat">
              <span className="pedidos-stat-label">
                RECUSADOS
              </span>

              <strong>
                {carregando ? "—" : recusados}
              </strong>

              <span className="pedidos-stat-detail">
                Solicitações não aprovadas
              </span>
            </div>
          </div>

          {/* AVISOS */}
          {(erroAcao || mensagem) && (
            <div
              ref={avisoRef}
              role={erroAcao ? "alert" : "status"}
              style={{
                ...estilos.aviso,
                background: erroAcao
                  ? "#f9eeeb"
                  : "#eaf2e9",
                color: erroAcao
                  ? "#913c32"
                  : "#24573e",
                borderLeft: erroAcao
                  ? "4px solid #b75548"
                  : "4px solid #3c7655",
              }}
            >
              <strong>
                {erroAcao
                  ? "Não foi possível concluir a operação."
                  : "Operação concluída."}
              </strong>

              <p style={{ margin: "5px 0 0" }}>
                {erroAcao || mensagem}
              </p>
            </div>
          )}

          {/* FILTROS */}
          <div className="pedidos-lista-topo">
            <div>
              <span className="pedidos-eyebrow">
                HISTÓRICO DE SOLICITAÇÕES
              </span>

              <h2>Meus pedidos</h2>
            </div>

            <div className="pedidos-filtros">
              {[
                ["TODOS", "Todos"],
                ["PENDENTE", "Em análise"],
                ["APROVADOS", "Aprovados"],
                ["RECUSADOS", "Recusados"],
                ["CANCELADO", `Cancelados (${cancelados})`],
              ].map(([valor, texto]) => (
                <button
                  key={valor}
                  type="button"
                  className={
                    filtro === valor ? "ativo" : ""
                  }
                  onClick={() => setFiltro(valor)}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE PEDIDOS */}
          {carregando ? (
            <div className="pedidos-estado">
              <span className="pedidos-estado-simbolo">
                V
              </span>

              <h3>Preparando seu painel</h3>

              <p>Estamos carregando suas solicitações.</p>
            </div>
          ) : erroCarregamento ? (
            <div className="pedidos-estado" role="alert">
              <h3>Não foi possível carregar</h3>

              <p>{erroCarregamento}</p>

              <button
                type="button"
                className="pedidos-retry"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </button>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="pedidos-estado">
              <span className="pedidos-estado-simbolo">
                V
              </span>

              <span className="pedidos-eyebrow">
                SUA HISTÓRIA COMEÇA AQUI
              </span>

              <h3>
                Toda grande jornada
                <br />
                começa com uma escolha.
              </h3>

              <p>
                Você ainda não possui solicitações de
                aluguel. Explore nossa seleção de
                automóveis e encontre o próximo destino.
              </p>

              <Link
                to="/pedido/novo"
                className="pedidos-estado-button"
              >
                Fazer meu primeiro pedido
              </Link>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="pedidos-estado">
              <h3>Nenhum pedido encontrado</h3>

              <p>
                Não existem solicitações nessa categoria.
              </p>

              <button
                type="button"
                className="pedidos-retry"
                onClick={() => setFiltro("TODOS")}
              >
                Ver todos os pedidos
              </button>
            </div>
          ) : (
            <div className="pedidos-lista">
              {pedidosFiltrados.map((pedido, index) => (
                <article
                  className="pedido-card"
                  key={pedido.id}
                >
                  <div className="pedido-card-top">
                    <div>
                      <span className="pedido-card-numero">
                        SOLICITAÇÃO{" "}
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3>Aluguel de automóvel</h3>

                      <span className="pedido-card-id">
                        Nº{" "}
                        {pedido.id
                          .slice(0, 8)
                          .toUpperCase()}
                      </span>
                    </div>

                    <span
                      className={`pedido-status ${classeStatus(
                        pedido.status
                      )}`}
                    >
                      <span className="pedido-status-dot" />
                      {formatarStatus(pedido.status)}
                    </span>
                  </div>

                  <div className="pedido-card-dados">
                    <div>
                      <span>RETIRADA</span>
                      <strong>
                        {formatarData(pedido.dataInicio)}
                      </strong>
                    </div>

                    <div>
                      <span>DEVOLUÇÃO</span>
                      <strong>
                        {formatarData(pedido.dataFim)}
                      </strong>
                    </div>

                    <div>
                      <span>VALOR TOTAL</span>
                      <strong>
                        {formatarMoeda(pedido.valorTotal)}
                      </strong>
                    </div>
                  </div>

                  <div className="pedido-card-footer">
                    <span>
                      Automóvel:{" "}
                      {pedido.automovelId
                        ? pedido.automovelId
                            .slice(0, 8)
                            .toUpperCase()
                        : "Não informado"}
                    </span>

                    <span>
                      Pedido registrado em{" "}
                      {pedido.criadoEm
                        ? new Date(
                            pedido.criadoEm
                          ).toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </div>

                  {/* PEDIDOS PENDENTES */}
                  {pedido.status === "PENDENTE" && (
                    <div style={estilos.acoes}>
                      <Link
                        to={`/pedido/novo?editar=${pedido.id}`}
                        style={estilos.editar}
                      >
                        Editar solicitação
                      </Link>

                      <button
                        type="button"
                        style={{
                          ...estilos.cancelar,
                          opacity:
                            cancelandoId !== null ? 0.6 : 1,
                          cursor:
                            cancelandoId !== null
                              ? "not-allowed"
                              : "pointer",
                        }}
                        disabled={cancelandoId !== null}
                        onClick={() =>
                          cancelarPedido(pedido.id)
                        }
                      >
                        {cancelandoId === pedido.id
                          ? "Cancelando..."
                          : "Cancelar solicitação"}
                      </button>
                    </div>
                  )}

                  {/* PEDIDOS APROVADOS */}
                  {["APROVADO", "APROVADA"].includes(
                    pedido.status
                  ) && (
                    <div style={estilos.acoes}>
                      <button
                        type="button"
                        style={{
                          ...estilos.editar,
                          opacity:
                            carregandoContratoId !== null
                              ? 0.65
                              : 1,
                        }}
                        disabled={
                          carregandoContratoId !== null
                        }
                        onClick={() =>
                          visualizarContrato(pedido.id)
                        }
                      >
                        {carregandoContratoId === pedido.id
                          ? "Carregando contrato..."
                          : "Ver contrato"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEÇÃO FINAL */}
      <section className="pedidos-final">
        <div className="pedidos-container pedidos-final-content">
          <div>
            <span className="pedidos-eyebrow">
              O PRÓXIMO DESTINO É SEU
            </span>

            <h2>
              Ainda há muito
              <br />
              <em>para descobrir.</em>
            </h2>
          </div>

          <Link
            to="/"
            className="pedidos-final-link"
          >
            Explorar a VÉRTICE
          </Link>
        </div>
      </section>

      {/* MODAL DO CONTRATO */}
      {contratoAberto && (
        <div
          style={estilos.modalFundo}
          onClick={() => {
            if (!baixandoPdf) {
              setContratoAberto(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-contrato"
            style={estilos.modal}
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                }}
              >
                VÉRTICE / CONTRATOS
              </span>

              <button
                ref={fecharContratoRef}
                type="button"
                disabled={baixandoPdf}
                onClick={() =>
                  setContratoAberto(null)
                }
                aria-label="Fechar contrato"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#173f35",
                  fontSize: "26px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                marginTop: "30px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  color: "#66736a",
                }}
              >
                DOCUMENTO DE ALUGUEL
              </span>

              <h2
                id="titulo-contrato"
                style={{
                  fontSize: "30px",
                  margin: "12px 0",
                  color: "#173f35",
                }}
              >
                Seu contrato.
              </h2>

              <p
                style={{
                  fontSize: "12px",
                  color: "#66736a",
                  overflowWrap: "anywhere",
                }}
              >
                Nº {contratoAberto.numero}
              </p>
            </div>

            <div style={estilos.modalLinha}>
              <span style={estilos.modalRotulo}>
                SITUAÇÃO
              </span>

              <strong>
                {contratoAberto.status === "EM_EXECUCAO"
                  ? "Em execução"
                  : contratoAberto.status}
              </strong>
            </div>

            <div style={estilos.modalLinha}>
              <span style={estilos.modalRotulo}>
                DATA DE RETIRADA
              </span>

              <strong>
                {formatarData(
                  contratoAberto.dataInicio
                )}
              </strong>
            </div>

            <div style={estilos.modalLinha}>
              <span style={estilos.modalRotulo}>
                DATA DE DEVOLUÇÃO
              </span>

              <strong>
                {formatarData(
                  contratoAberto.dataFim
                )}
              </strong>
            </div>

            <div style={estilos.modalLinha}>
              <span style={estilos.modalRotulo}>
                VALOR TOTAL
              </span>

              <strong>
                {formatarMoeda(
                  contratoAberto.valorTotal
                )}
              </strong>
            </div>

            <div style={estilos.modalLinha}>
              <span style={estilos.modalRotulo}>
                GERADO EM
              </span>

              <strong>
                {contratoAberto.geradoEm
                  ? new Date(
                      contratoAberto.geradoEm
                    ).toLocaleString("pt-BR")
                  : "—"}
              </strong>
            </div>

            <p
              style={{
                marginTop: "26px",
                fontSize: "12px",
                lineHeight: 1.8,
                color: "#66736a",
              }}
            >
              Estas informações correspondem ao contrato
              registrado no sistema VÉRTICE. O PDF
              disponibilizado contém os dados do aluguel
              e não substitui um instrumento contratual
              completo com cláusulas e aceite das partes.
            </p>

            {/* BOTÕES DO CONTRATO */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                disabled={baixandoPdf}
                onClick={() =>
                  baixarContratoPdf(
                    contratoAberto.pedidoId
                  )
                }
                style={{
                  ...estilos.editar,
                  width: "100%",
                  opacity: baixandoPdf ? 0.6 : 1,
                  cursor: baixandoPdf
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {baixandoPdf
                  ? "Gerando PDF..."
                  : "Baixar contrato em PDF"}
              </button>

              <button
                type="button"
                disabled={baixandoPdf}
                onClick={() =>
                  setContratoAberto(null)
                }
                style={{
                  ...estilos.cancelar,
                  width: "100%",
                }}
              >
                Fechar contrato
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
