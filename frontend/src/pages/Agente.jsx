
import { useEffect, useState } from "react";
import "../styles/Agente.css";

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));

const formatarData = (data) => {
  if (!data) return "Não informada";

  const [ano, mes, dia] = data.substring(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
};

const statusTexto = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
};

export default function Agente() {
  const [pedidos, setPedidos] = useState([]);
  const [automoveis, setAutomoveis] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [resPedidos, resAutomoveis] = await Promise.all([
        fetch("/api/agente/pedidos", {
          credentials: "include",
        }),
        fetch("/api/automoveis", {
          credentials: "include",
        }),
      ]);

      if (!resPedidos.ok) {
        throw new Error(
          resPedidos.status === 403
            ? "Você não possui permissão de agente."
            : resPedidos.status === 401
            ? "Faça login para acessar o painel."
            : "Não foi possível carregar os pedidos."
        );
      }

      const dadosPedidos = await resPedidos.json();
      setPedidos(dadosPedidos);

      if (resAutomoveis.ok) {
        setAutomoveis(await resAutomoveis.json());
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function obterCsrf() {
    const resposta = await fetch("/api/auth/csrf", {
      credentials: "include",
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível validar a sessão.");
    }

    return resposta.json();
  }

  async function decidirPedido(id, decisao) {
    const acao = decisao === "aprovar" ? "aprovar" : "recusar";

    const confirmado = window.confirm(
      `Deseja realmente ${acao} esta solicitação?`
    );

    if (!confirmado) return;

    setProcessando(id);
    setErro("");
    setMensagem("");

    try {
      const csrf = await obterCsrf();

      const resposta = await fetch(
        `/api/agente/pedidos/${id}/${acao}`,
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
            "Este pedido já foi analisado. Atualize a lista."
          );
        }

        if (resposta.status === 403) {
          throw new Error(
            "Você não tem permissão para realizar esta ação."
          );
        }

        throw new Error("Não foi possível atualizar o pedido.");
      }

      const pedidoAtualizado = await resposta.json();

      setPedidos((anteriores) =>
        anteriores.map((pedido) =>
          pedido.id === id ? pedidoAtualizado : pedido
        )
      );

      setMensagem(
        acao === "aprovar"
          ? "Solicitação aprovada com sucesso."
          : "Solicitação recusada com sucesso."
      );
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(null);
    }
  }

  const quantidadePendentes = pedidos.filter(
    (pedido) => pedido.status === "PENDENTE"
  ).length;

  const quantidadeAprovados = pedidos.filter(
    (pedido) => pedido.status === "APROVADO"
  ).length;

  const quantidadeRecusados = pedidos.filter(
    (pedido) => pedido.status === "RECUSADO"
  ).length;

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const correspondeStatus =
      filtro === "TODOS" || pedido.status === filtro;

    const automovel = automoveis.find(
      (carro) => carro.id === pedido.automovelId
    );

    const textoBusca = [
      pedido.id,
      pedido.clienteId,
      automovel?.marca,
      automovel?.modelo,
      automovel?.placa,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      correspondeStatus &&
      textoBusca.includes(busca.toLowerCase().trim())
    );
  });

  function nomeAutomovel(id) {
    const carro = automoveis.find((item) => item.id === id);

    return carro
      ? `${carro.marca} ${carro.modelo}`
      : "Automóvel cadastrado";
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
              Acompanhe solicitações, analise pedidos e
              gerencie as reservas dos clientes.
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
          <article className="agente-indicador">
            <span>Total de solicitações</span>
            <strong>{pedidos.length}</strong>
            <small>Pedidos registrados</small>
          </article>

          <article className="agente-indicador">
            <span>Aguardando análise</span>
            <strong>{quantidadePendentes}</strong>
            <small>Solicitações pendentes</small>
          </article>

          <article className="agente-indicador">
            <span>Pedidos aprovados</span>
            <strong>{quantidadeAprovados}</strong>
            <small>Reservas autorizadas</small>
          </article>

          <article className="agente-indicador">
            <span>Pedidos recusados</span>
            <strong>{quantidadeRecusados}</strong>
            <small>Solicitações encerradas</small>
          </article>
        </section>

        <section className="agente-listagem">
          <div className="agente-listagem-topo">
            <div>
              <span className="agente-etiqueta">
                CENTRAL DE SOLICITAÇÕES
              </span>
              <h2>Pedidos de aluguel</h2>
              <p>
                Consulte as solicitações e registre sua decisão.
              </p>
            </div>
          </div>

          <div className="agente-ferramentas">
            <input
              type="search"
              placeholder="Buscar veículo, placa ou pedido..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              aria-label="Buscar pedidos"
            />

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
              aria-label="Filtrar pedidos"
            >
              <option value="TODOS">Todos os pedidos</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="APROVADO">Aprovados</option>
              <option value="RECUSADO">Recusados</option>
            </select>
          </div>

          {erro && (
            <div className="agente-alerta agente-alerta-erro" role="alert">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="agente-alerta agente-alerta-sucesso" role="status">
              {mensagem}
            </div>
          )}

          {carregando ? (
            <div className="agente-vazio">
              Carregando solicitações...
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="agente-vazio">
              <h3>Nenhuma solicitação encontrada</h3>
              <p>
                Não existem pedidos correspondentes aos filtros
                selecionados.
              </p>
            </div>
          ) : (
            <div className="agente-pedidos">
              {pedidosFiltrados.map((pedido) => (
                <article className="agente-pedido" key={pedido.id}>
                  <div className="agente-pedido-cabecalho">
                    <div>
                      <span className="agente-pedido-label">
                        SOLICITAÇÃO DE ALUGUEL
                      </span>

                      <h3>
                        {nomeAutomovel(pedido.automovelId)}
                      </h3>

                      <small>
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                      </small>
                    </div>

                    <span
                      className={`agente-status agente-status-${pedido.status.toLowerCase()}`}
                    >
                      {statusTexto[pedido.status] || pedido.status}
                    </span>
                  </div>

                  <div className="agente-pedido-dados">
                    <div>
                      <span>Retirada</span>
                      <strong>
                        {formatarData(pedido.dataInicio)}
                      </strong>
                    </div>

                    <div>
                      <span>Devolução</span>
                      <strong>
                        {formatarData(pedido.dataFim)}
                      </strong>
                    </div>

                    <div>
                      <span>Data da solicitação</span>
                      <strong>
                        {pedido.criadoEm
                          ? new Date(
                              pedido.criadoEm
                            ).toLocaleDateString("pt-BR")
                          : "Não informada"}
                      </strong>
                    </div>

                    <div>
                      <span>Valor total</span>
                      <strong className="agente-valor">
                        {formatarMoeda(pedido.valorTotal)}
                      </strong>
                    </div>
                  </div>

                  <div className="agente-pedido-rodape">
                    <span className="agente-cliente">
                      Cliente: {pedido.clienteId.slice(0, 8)}
                    </span>

                    {pedido.status === "PENDENTE" ? (
                      <div className="agente-acoes">
                        <button
                          className="agente-botao-recusar"
                          disabled={processando !== null}
                          onClick={() =>
                            decidirPedido(pedido.id, "recusar")
                          }
                        >
                          Recusar
                        </button>

                        <button
                          className="agente-botao-aprovar"
                          disabled={processando !== null}
                          onClick={() =>
                            decidirPedido(pedido.id, "aprovar")
                          }
                        >
                          {processando === pedido.id
                            ? "Processando..."
                            : "Aprovar pedido"}
                        </button>
                      </div>
                    ) : (
                      <span className="agente-finalizado">
                        Solicitação analisada
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
