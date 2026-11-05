
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { obterCsrf } from "../services/auth";
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

export default function PedidoAluguel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [carros, setCarros] = useState([]);
  const [carroId, setCarroId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [retirada, setRetirada] = useState("");
  const [devolucao, setDevolucao] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");

  const hoje = dataLocalISO(new Date());

  useEffect(() => {
    let ativo = true;

    async function carregarCarros() {
      try {
        const resposta = await fetch("/api/automoveis");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os automóveis.");
        }

        const dados = await resposta.json();

        if (!ativo) return;

        setCarros(dados);

        const parametro = searchParams.get("carro");

        // Compatibilidade com os links antigos que usam IDs de 1 a 12.
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

        const carroPorUuid = dados.find(
          (item) => item.id === parametro
        );

        const indiceAntigo = Number(parametro) - 1;
        const chaveAntiga = ordemAntiga[indiceAntigo];

        const carroPorNumero = chaveAntiga
          ? dados.find(
              (item) =>
                `${item.marca}|${item.modelo}` === chaveAntiga
            )
          : null;

        const selecionado =
          carroPorUuid || carroPorNumero || dados[0];

        setCarroId(selecionado?.id || "");
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

    carregarCarros();

    return () => {
      ativo = false;
    };
  }, [searchParams]);

  const carro = carros.find(
    (item) => item.id === carroId
  );

  const dias =
    retirada && devolucao
      ? Math.round(
          (new Date(`${devolucao}T12:00:00`) -
            new Date(`${retirada}T12:00:00`)) /
            86400000
        )
      : 0;

  const total =
    dias > 0 && carro
      ? dias * Number(carro.valorDiaria)
      : 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!carro) {
      setErro("Selecione um automóvel.");
      return;
    }

    if (!retirada || !devolucao || !local.trim()) {
      setErro("Preencha as datas e o local de retirada.");
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

    setEnviando(true);

    try {
      const csrf = await obterCsrf();

      const resposta = await fetch("/api/pedidos", {
        method: "POST",
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
      });

      if (!resposta.ok) {
        let mensagem = "Não foi possível enviar o pedido.";

        try {
          const dadosErro = await resposta.json();

          mensagem =
            dadosErro.detail ||
            dadosErro.mensagem ||
            mensagem;
        } catch {
          // Mantém a mensagem padrão.
        }

        throw new Error(mensagem);
      }

      navigate("/pedidos", { replace: true });
    } catch (error) {
      setErro(
        error.message || "Erro ao enviar a solicitação."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main className="pedido-page">
        <div className="pedido-container">
          <p>Carregando automóveis disponíveis...</p>
        </div>
      </main>
    );
  }

  if (!carros.length) {
    return (
      <main className="pedido-page">
        <div className="pedido-container">
          <Link to="/" className="pedido-voltar">
            <ArrowLeft size={18} />
            Voltar para a frota
          </Link>

          <h1>Automóveis indisponíveis</h1>
          <p>
            {erro ||
              "Não há automóveis disponíveis no momento."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="pedido-page">
      <div className="pedido-container">
        <Link to="/" className="pedido-voltar">
          <ArrowLeft size={18} />
          Voltar para a frota
        </Link>

        <header className="pedido-heading">
          <span className="pedido-eyebrow">
            VÉRTICE · RESERVA
          </span>

          <h1>Solicite seu aluguel</h1>
          <p>Informe os detalhes da sua próxima viagem.</p>
        </header>

        <div className="pedido-layout">
          <form
            className="pedido-form"
            onSubmit={handleSubmit}
          >
            <section className="pedido-form-section">
              <h2>Veículo selecionado</h2>

              <label>
                Escolha o automóvel
                <select
                  value={carroId}
                  onChange={(event) =>
                    setCarroId(event.target.value)
                  }
                  required
                >
                  {carros.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
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
                    onChange={(event) =>
                      setRetirada(event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Data de devolução
                  <input
                    type="date"
                    min={retirada || hoje}
                    value={devolucao}
                    onChange={(event) =>
                      setDevolucao(event.target.value)
                    }
                    required
                  />
                </label>
              </div>
            </section>

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

            {erro && (
              <p className="pedido-mensagem pedido-erro" role="alert">
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="pedido-submit"
              disabled={enviando || !carro}
            >
              {enviando
                ? "Enviando solicitação..."
                : "Confirmar solicitação"}
            </button>
          </form>

          {carro && (
            <aside className="pedido-resumo">
              <span className="pedido-resumo-label">
                VEÍCULO SELECIONADO
              </span>

              <img
                src={
                  imagens[
                    `${carro.marca}|${carro.modelo}`
                  ]
                }
                alt={`${carro.marca} ${carro.modelo}`}
              />

              <h2>{carro.marca}</h2>
              <p className="pedido-modelo">
                {carro.modelo}
              </p>

              <div className="pedido-resumo-linha">
                <span>Valor da diária</span>
                <strong>
                  {formatarMoeda(carro.valorDiaria)}
                </strong>
              </div>

              <div className="pedido-resumo-linha">
                <span>Quantidade de diárias</span>
                <strong>
                  {dias > 0 ? dias : "—"}
                </strong>
              </div>

              <div className="pedido-resumo-total">
                <span>Valor estimado</span>
                <strong>
                  {formatarMoeda(total)}
                </strong>
              </div>

              <p className="pedido-nota">
                O valor definitivo é calculado pelo
                sistema ao registrar sua solicitação.
              </p>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
