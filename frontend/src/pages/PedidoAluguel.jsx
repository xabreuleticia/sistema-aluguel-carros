
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, CarFront } from "lucide-react";
import "../styles/PedidoAluguel.css";


const carros = [
  {
    id: 1,
    marca: "Audi",
    modelo: "A5 Sportback",
    diaria: 489,
    imagem: "/images/carros/audi-a5.jpg",
  },
  {
    id: 2,
    marca: "Volvo",
    modelo: "XC60",
    diaria: 559,
    imagem: "/images/carros/volvo-xc60.jpg",
  },
  {
    id: 3,
    marca: "MINI",
    modelo: "Cooper S",
    diaria: 329,
    imagem: "/images/carros/mini-cooper.jpg",
  },
  {
    id: 4,
    marca: "BMW",
    modelo: "320i",
    diaria: 529,
    imagem: "/images/carros/BMW3Series.jpg",
  },
  {
    id: 5,
    marca: "Mercedes-Benz",
    modelo: "Classe C",
    diaria: 599,
    imagem: "/images/carros/mercedes-Benz_C-Class.jpg",
  },
  {
    id: 6,
    marca: "Porsche",
    modelo: "Macan",
    diaria: 799,
    imagem: "/images/carros/porsche-macan.jpg",
  },
  {
    id: 7,
    marca: "Toyota",
    modelo: "Corolla",
    diaria: 279,
    imagem: "/images/carros/toyota-corolla.jpg",
  },
  {
    id: 8,
    marca: "Jeep",
    modelo: "Compass",
    diaria: 359,
    imagem: "/images/carros/jeep-compass_au.jpg",
  },
  {
    id: 9,
    marca: "Honda",
    modelo: "Civic",
    diaria: 319,
    imagem: "/images/carros/honda-civic.jpg",
  },
  {
    id: 10,
    marca: "Range Rover",
    modelo: "Evoque",
    diaria: 689,
    imagem: "/images/carros/range-rover-evoque.jpg",
  },
  {
    id: 11,
    marca: "Volkswagen",
    modelo: "Golf GTI",
    diaria: 389,
    imagem: "/images/carros/volkswagen-golf.jpg",
  },
  {
    id: 12,
    marca: "Chevrolet",
    modelo: "Onix",
    diaria: 199,
    imagem: "/images/carros/chevrolet-onix.JPG",
  },
];


function dataLocalISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function PedidoAluguel() {
  const [searchParams] = useSearchParams();
  const carroId = Number(searchParams.get("carro"));
  const carro = carros.find((item) => item.id === carroId) || carros[0];

  const hoje = dataLocalISO(new Date());

  const [retirada, setRetirada] = useState("");
  const [devolucao, setDevolucao] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const dias =
    retirada && devolucao
      ? Math.ceil(
          (new Date(`${devolucao}T12:00:00`) -
            new Date(`${retirada}T12:00:00`)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const total = dias > 0 ? dias * carro.diaria : 0;

  function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setEnviado(false);

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

    setEnviado(true);
  }

  return (
    <main className="pedido-page">
      <div className="pedido-container">
        <Link to="/" className="pedido-voltar">
          <ArrowLeft size={18} /> Voltar para a frota
        </Link>

        <header className="pedido-heading">
          <span className="pedido-eyebrow">VÉRTICE · RESERVA</span>
          <h1>Solicite seu aluguel</h1>
          <p>Informe os detalhes da sua próxima viagem.</p>
        </header>

        <div className="pedido-layout">
          <form className="pedido-form" onSubmit={handleSubmit}>
            <section className="pedido-form-section">
              <h2><CalendarDays size={20} /> Período do aluguel</h2>

              <div className="pedido-fields">
                <label>
                  Data de retirada
                  <input
                    type="date"
                    min={hoje}
                    value={retirada}
                    onChange={(event) => {
                      setRetirada(event.target.value);
                      setEnviado(false);
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
                      setEnviado(false);
                    }}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="pedido-form-section">
              <h2><MapPin size={20} /> Local de retirada</h2>

              <label>
                Endereço ou unidade
                <input
                  type="text"
                  placeholder="Ex.: Unidade Vértice - Belo Horizonte"
                  value={local}
                  onChange={(event) => {
                    setLocal(event.target.value);
                    setEnviado(false);
                  }}
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
                  onChange={(event) => {
                    setObservacoes(event.target.value);
                    setEnviado(false);
                  }}
                />
              </label>
            </section>

            {erro && <p className="pedido-mensagem pedido-erro">{erro}</p>}

            {enviado && (
              <div className="pedido-mensagem pedido-sucesso">
                <strong>Formulário validado!</strong>
                <p>
                  O próximo passo será enviar sua solicitação para o sistema.
                  Ainda não foi criada uma reserva no banco de dados.
                </p>
              </div>
            )}

            <button type="submit" className="pedido-submit">
              Revisar solicitação
            </button>
          </form>

          <aside className="pedido-resumo">
            <span className="pedido-resumo-label">VEÍCULO SELECIONADO</span>

            
            <img
              src={carro.imagem}
              alt={`${carro.marca} ${carro.modelo}`}
            />


            <h2>{carro.marca}</h2>
            <p className="pedido-modelo">{carro.modelo}</p>

            <div className="pedido-resumo-linha">
              <span>Valor da diária</span>
              <strong>
                {carro.diaria.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
            </div>

            <div className="pedido-resumo-linha">
              <span>Quantidade de diárias</span>
              <strong>{dias > 0 ? dias : "—"}</strong>
            </div>

            <div className="pedido-resumo-total">
              <span>Valor estimado</span>
              <strong>
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
            </div>

            <p className="pedido-nota">
              O valor é uma estimativa e poderá ser confirmado após a análise
              da solicitação.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
