
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { obterCsrf } from "../service/auth";
import "../styles/PedidoAluguel.css";

const imagens = {
  "Audi|A5 Sportback": "/images/carros/audi-a5.jpg",
  "Volvo|XC60": "/images/carros/volvo-xc60.jpg",
  "MINI|Cooper S": "/images/carros/mini-cooper.jpg",
  "BMW|320i": "/images/carros/BMW3Series.jpg",
  "Mercedes-Benz|Classe C": "/images/carros/mercedes-Benz_C-Class.jpg",
  "Porsche|Macan": "/images/carros/porsche-macan.jpg",
  "Toyota|Corolla": "/images/carros/toyota-corolla.jpg",
  "Jeep|Compass": "/images/carros/jeep-compass_au.jpg",
  "Honda|Civic": "/images/carros/honda-civic.jpg",
  "Range Rover|Evoque": "/images/carros/range-rover-evoque.jpg",
  "Volkswagen|Golf GTI": "/images/carros/volkswagen-golf.jpg",
  "Chevrolet|Onix": "/images/carros/chevrolet-onix.JPG",
};

const ordemAntiga = [
  "Audi|A5 Sportback",
  "Volvo|XC60",
  "MINI|Cooper S",
  "BMW|320i",
  "Mercedes-Benz|Classe C",
  "Porsche|Macan",
  "Toyota|Corolla",
  "Jeep|Compass",
  "Honda|Civic",
  "Range Rover|Evoque",
  "Volkswagen|Golf GTI",
  "Chevrolet|Onix",
];

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));

function dataLocalISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function calcularDias(inicio, fim) {
  if (!inicio || !fim || fim <= inicio) return 0;

  const dataInicio = new Date(`${inicio}T12:00:00`);
  const dataFim = new Date(`${fim}T12:00:00`);

  return Math.round((dataFim - dataInicio) / 86400000);
}

async function mensagemErro(resposta, padrao) {
  try {
    const dados = await resposta.json();
    return dados.detail || dados.mensagem || dados.message || padrao;
  } catch {
    return padrao;
  }
}

export default function PedidoAluguel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pedidoId = searchParams.get("editar");
  const modoEdicao = Boolean(pedidoId);
  const parametroCarro = searchParams.get("carro");

  const [carros, setCarros] = useState([]);
  const [carroId, setCarroId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [retirada, setRetirada] = useState("");
  const [devolucao, setDevolucao] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [erro, setErro] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("inicial");
  const [erroDisponibilidade, setErroDisponibilidade] = useState("");
  const [consultaConfirmada, setConsultaConfirmada] = useState("");

  const hoje = dataLocalISO(new Date());

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");

      try {
        const respostaCarros = await fetch("/api/automoveis", {
          credentials: "include",
        });

        if (!respostaCarros.ok) {
          throw new Error("Não foi possível carregar os automóveis.");
        }

        const dadosCarros = await respostaCarros.json();

        if (!Array.isArray(dadosCarros)) {
          throw new Error("A lista de automóveis é inválida.");
        }

        if (!ativo) return;

        setCarros(dadosCarros);

        if (modoEdicao) {
          const respostaPedido = await fetch(
            `/api/pedidos/${pedidoId}`,
            { credentials: "include" }
          );

          if (!respostaPedido.ok) {
            throw new Error(
              await mensagemErro(
                respostaPedido,
                "Não foi possível carregar a solicitação."
              )
            );
          }

          const pedido = await respostaPedido.json();

          if (pedido.status !== "PENDENTE") {
            throw new Error(
              "Somente solicitações pendentes podem ser editadas."
            );
          }

          if (!ativo) return;

          setCarroId(pedido.automovelId);
          setRetirada(pedido.dataInicio?.substring(0, 10) || "");
          setDevolucao(pedido.dataFim?.substring(0, 10) || "");
        } else {
          const carroPorUuid = dadosCarros.find(
            (item) => item.id === parametroCarro
          );

          const indiceAntigo = Number(parametroCarro) - 1;
          const chaveAntiga = ordemAntiga[indiceAntigo];

          const carroPorNumero = chaveAntiga
            ? dadosCarros.find(
                (item) =>
                  `${item.marca}|${item.modelo}` === chaveAntiga
              )
            : null;

          const selecionado =
            carroPorUuid || carroPorNumero || dadosCarros[0];

          setCarroId(selecionado?.id || "");
          setRetirada("");
          setDevolucao("");
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
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
  }, [modoEdicao, pedidoId, parametroCarro]);

  const carro = carros.find((item) => item.id === carroId);
  const dias = calcularDias(retirada, devolucao);
  const total = dias * Number(carro?.valorDiaria || 0);

  const datasValidas =
    Boolean(carroId && retirada && devolucao) &&
    retirada >= hoje &&
    devolucao > retirada;

  const chaveConsulta = `${carroId}|${retirada}|${devolucao}`;

  useEffect(() => {
    if (!datasValidas || carregando) return;

    const controlador = new AbortController();

    async function consultarDisponibilidade() {
      setDisponibilidade("consultando");
      setErroDisponibilidade("");
      setConsultaConfirmada("");

      try {
        const parametros = new URLSearchParams({
          automovelId: carroId,
          dataInicio: retirada,
          dataFim: devolucao,
        });

        const resposta = await fetch(
          `/api/automoveis/disponibilidade?${parametros.toString()}`,
          {
            credentials: "include",
            signal: controlador.signal,
          }
        );

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível verificar a disponibilidade."
          );
        }

        const dados = await resposta.json();

        if (controlador.signal.aborted) return;

        setDisponibilidade(
          dados.disponivel ? "disponivel" : "indisponivel"
        );
        setConsultaConfirmada(chaveConsulta);
      } catch (error) {
        if (controlador.signal.aborted) return;

        setDisponibilidade("erro");
        setErroDisponibilidade(error.message);
      }
    }

    consultarDisponibilidade();

    return () => controlador.abort();
  }, [
    carroId,
    retirada,
    devolucao,
    datasValidas,
    carregando,
    chaveConsulta,
  ]);

  const statusDisponibilidade =
    !datasValidas || consultaConfirmada !== chaveConsulta
      ? "inicial"
      : disponibilidade;

  const podeEnviar =
    !carregando &&
    !enviando &&
    Boolean(carro) &&
    datasValidas &&
    statusDisponibilidade === "disponivel" &&
    (!modoEdicao || Boolean(pedidoId));

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!carro) {
      setErro("Selecione um automóvel.");
      return;
    }

    if (!retirada || !devolucao) {
      setErro("Preencha as datas do aluguel.");
      return;
    }

    if (retirada < hoje) {
      setErro("A data de retirada não pode estar no passado.");
      return;
    }

    if (devolucao <= retirada) {
      setErro("A devolução deve ocorrer depois da retirada.");
      return;
    }

    if (!modoEdicao && !local.trim()) {
      setErro("Informe o local de retirada.");
      return;
    }

    if (!podeEnviar) {
      setErro(
        "Aguarde a confirmação da disponibilidade do automóvel."
      );
      return;
    }

    setEnviando(true);

    try {
      const parametros = new URLSearchParams({
        automovelId: carro.id,
        dataInicio: retirada,
        dataFim: devolucao,
      });

      const consulta = await fetch(
        `/api/automoveis/disponibilidade?${parametros.toString()}`,
        { credentials: "include" }
      );

      if (!consulta.ok) {
        throw new Error(
          "Não foi possível confirmar a disponibilidade."
        );
      }

      const resultado = await consulta.json();

      if (!resultado.disponivel) {
        setDisponibilidade("indisponivel");
        throw new Error(
          "Este automóvel já está reservado para o período selecionado."
        );
      }

      const csrf = await obterCsrf();

      const resposta = await fetch(
        modoEdicao ? `/api/pedidos/${pedidoId}` : "/api/pedidos",
        {
          method: modoEdicao ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            automovelId: carro.id,
            dataInicio: retirada,
            dataFim: devolucao,
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error(
          await mensagemErro(
            resposta,
            modoEdicao
              ? "Não foi possível atualizar a solicitação."
              : "Não foi possível enviar a solicitação."
          )
        );
      }

      navigate("/pedidos", { replace: true });
    } catch (error) {
      setErro(
        error.message || "Não foi possível concluir a operação."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main className="pedido-page">
        <div className="pedido-container">
          <p>Carregando informações do aluguel...</p>
        </div>
      </main>
    );
  }

  if (!carros.length || (modoEdicao && erro && !carroId)) {
    return (
      <main className="pedido-page">
        <div className="pedido-container">
          <Link to="/pedidos" className="pedido-voltar">
            <ArrowLeft size={18} />
            Voltar para meus pedidos
          </Link>

          <h1>Não foi possível carregar a solicitação</h1>
          <p>{erro || "Nenhum automóvel encontrado."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pedido-page">
      <div className="pedido-container">
        <Link
          to={modoEdicao ? "/pedidos" : "/"}
          className="pedido-voltar"
        >
          <ArrowLeft size={18} />
          {modoEdicao
            ? "Voltar para meus pedidos"
            : "Voltar para a frota"}
        </Link>

        <header className="pedido-heading">
          <span className="pedido-eyebrow">
            VÉRTICE · {modoEdicao ? "EDIÇÃO" : "RESERVA"}
          </span>

          <h1>
            {modoEdicao
              ? "Edite sua solicitação"
              : "Solicite seu aluguel"}
          </h1>

          <p>
            {modoEdicao
              ? "Atualize o veículo ou as datas do seu pedido pendente."
              : "Informe os detalhes da sua próxima viagem."}
          </p>
        </header>

        <div className="pedido-layout">
          <form className="pedido-form" onSubmit={handleSubmit}>
            <section className="pedido-form-section">
              <h2>Veículo selecionado</h2>

              <label>
                Escolha o automóvel
                <select
                  value={carroId}
                  onChange={(event) => {
                    setCarroId(event.target.value);
                    setErro("");
                  }}
                  required
                >
                  {carros.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.marca} {item.modelo}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="pedido-form-section">
              <h2>
                <CalendarDays size={20} />
                Período do aluguel
              </h2>

              <div className="pedido-fields">
                <label>
                  Data de retirada
                  <input
                    type="date"
                    min={hoje}
                    value={retirada}
                    onChange={(event) => {
                      setRetirada(event.target.value);
                      setErro("");
                    }}
                    required
                  />
                </label>

                <label>
                  Data de devolução
                  <input
                    type="date"
                    min={retirada || hoje}
                    value={devolucao}
                    onChange={(event) => {
                      setDevolucao(event.target.value);
                      setErro("");
                    }}
                    required
                  />
                </label>
              </div>

              {datasValidas &&
                statusDisponibilidade === "inicial" && (
                  <p className="pedido-mensagem">
                    Verificando disponibilidade...
                  </p>
                )}

              {statusDisponibilidade === "consultando" && (
                <p className="pedido-mensagem">
                  Verificando disponibilidade...
                </p>
              )}

              {statusDisponibilidade === "disponivel" && (
                <p
                  className="pedido-mensagem"
                  role="status"
                  style={{ color: "#24573e" }}
                >
                  Automóvel disponível para o período selecionado.
                </p>
              )}

              {statusDisponibilidade === "indisponivel" && (
                <p
                  className="pedido-mensagem pedido-erro"
                  role="alert"
                >
                  Este automóvel já possui uma reserva aprovada
                  nesse período. Escolha outras datas ou outro veículo.
                </p>
              )}

              {statusDisponibilidade === "erro" && (
                <p
                  className="pedido-mensagem pedido-erro"
                  role="alert"
                >
                  {erroDisponibilidade}
                </p>
              )}
            </section>

            {!modoEdicao && (
              <>
                <section className="pedido-form-section">
                  <h2>
                    <MapPin size={20} />
                    Local de retirada
                  </h2>

                  <label>
                    Endereço ou unidade
                    <input
                      type="text"
                      placeholder="Ex.: Unidade Vértice - Belo Horizonte"
                      value={local}
                      onChange={(event) =>
                        setLocal(event.target.value)
                      }
                      required
                    />
                  </label>
                </section>

                <section className="pedido-form-section">
                  <h2>Observações</h2>

                  <label>
                    Informações adicionais (opcional)
                    <textarea
                      rows="4"
                      placeholder="Digite alguma preferência ou observação..."
                      value={observacoes}
                      onChange={(event) =>
                        setObservacoes(event.target.value)
                      }
                    />
                  </label>
                </section>
              </>
            )}

            {modoEdicao && (
              <p className="pedido-mensagem">
                A edição mantém sua solicitação em análise.
                O valor será recalculado com base nas novas datas
                e no automóvel escolhido.
              </p>
            )}

            {erro && (
              <p
                className="pedido-mensagem pedido-erro"
                role="alert"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="pedido-submit"
              disabled={!podeEnviar}
            >
              {enviando
                ? modoEdicao
                  ? "Salvando alterações..."
                  : "Enviando solicitação..."
                : datasValidas &&
                    statusDisponibilidade !== "disponivel"
                  ? "Verificando disponibilidade..."
                  : modoEdicao
                    ? "Salvar alterações"
                    : "Confirmar solicitação"}
            </button>
          </form>

          {carro && (
            <aside className="pedido-resumo">
              <span className="pedido-resumo-label">
                VEÍCULO SELECIONADO
              </span>

              {imagens[`${carro.marca}|${carro.modelo}`] && (
                <img
                  src={
                    imagens[`${carro.marca}|${carro.modelo}`]
                  }
                  alt={`${carro.marca} ${carro.modelo}`}
                />
              )}

              <h2>{carro.marca}</h2>
              <p className="pedido-modelo">{carro.modelo}</p>

              <div className="pedido-resumo-linha">
                <span>Valor da diária</span>
                <strong>
                  {formatarMoeda(carro.valorDiaria)}
                </strong>
              </div>

              <div className="pedido-resumo-linha">
                <span>Quantidade de diárias</span>
                <strong>{dias > 0 ? dias : "—"}</strong>
              </div>

              <div className="pedido-resumo-total">
                <span>Valor estimado</span>
                <strong>{formatarMoeda(total)}</strong>
              </div>

              <p className="pedido-nota">
                O valor definitivo é calculado pelo sistema
                ao {modoEdicao ? "atualizar" : "registrar"} sua
                solicitação.
              </p>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
