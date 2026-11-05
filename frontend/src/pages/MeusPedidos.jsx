
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usuarioAtual } from "../service/auth";
import "../styles/MeusPedidos.css";

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor ?? 0));

const formatarData = (data) => {
  if (!data) return "—";

  const partes = data.split("-");

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

  if (
    ["RECUSADO", "REPROVADO", "REJEITADO"].includes(status)
  ) {
    return "recusado";
  }

  if (status === "CANCELADO") {
    return "cancelado";
  }

  if (status === "CONCLUIDO") {
    return "concluido";
  }

  return "pendente";
};

export default function MeusPedidos() {
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("TODOS");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");

      try {
        const [dadosUsuario, resposta] = await Promise.all([
          usuarioAtual(),
          fetch("/api/pedidos/meus", {
            credentials: "include",
          }),
        ]);

        if (!resposta.ok) {
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
          setErro(
            error.message ||
              "Não foi possível carregar seus pedidos."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

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

  const pedidosFiltrados = pedidos.filter((pedido) => {
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
  });

  return (
    <main className="pedidos-page">
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

          {carregando ? (
            <div className="pedidos-estado">
              <span className="pedidos-estado-simbolo">
                V
              </span>
              <h3>Preparando seu painel</h3>
              <p>Estamos carregando suas solicitações.</p>
            </div>
          ) : erro ? (
            <div className="pedidos-estado" role="alert">
              <h3>Não foi possível carregar</h3>
              <p>{erro}</p>
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
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <h3>
                        Aluguel de automóvel
                      </h3>

                      <span className="pedido-card-id">
                        Nº {pedido.id.slice(0, 8).toUpperCase()}
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
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

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

          <Link to="/" className="pedidos-final-link">
            Explorar a VÉRTICE
          </Link>
        </div>
      </section>
    </main>
  );
}
