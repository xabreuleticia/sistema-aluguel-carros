
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ShieldCheck,
  CarFront,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import "../styles/Home.css";

const destaques = [
  {
    marca: "Audi",
    modelo: "A5 Sportback",
    categoria: "Premium",
    imagem: "/images/carros/audi-a5.jpg",
  },
  {
    marca: "Volvo",
    modelo: "XC60",
    categoria: "SUV",
    imagem: "/images/carros/volvo-xc60.jpg",
  },
  {
    marca: "Porsche",
    modelo: "Macan",
    categoria: "SUV Premium",
    imagem: "/images/carros/porsche-macan.jpg",
  },
];

const diferenciais = [
  {
    titulo: "Uma frota selecionada",
    descricao:
      "Automóveis para diferentes estilos de viagem, do conforto cotidiano às experiências premium.",
    Icone: CarFront,
  },
  {
    titulo: "Solicitação simplificada",
    descricao:
      "Escolha seu veículo, informe o período desejado e acompanhe sua solicitação pela plataforma.",
    Icone: CalendarCheck,
  },
  {
    titulo: "Atendimento dedicado",
    descricao:
      "Cada solicitação é analisada para oferecer uma experiência organizada e transparente.",
    Icone: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="fleet-page">
      <section className="fleet-hero">
        <div className="fleet-hero-content">
          <span className="eyebrow">
            VÉRTICE · ALUGUEL PREMIUM
          </span>

          <h1>
            O prazer está
            <br />
            no percurso.
          </h1>

          <p>
            Mais do que escolher um automóvel,
            descubra uma nova maneira de viver
            cada trajeto.
          </p>

          <Link to="/carros" className="hero-link">
            Explore nossa frota
          </Link>
        </div>

        <div className="fleet-hero-image">
          <img
            src="/images/capa-inicial.png"
            alt="Automóvel em destaque da VÉRTICE"
          />
        </div>
      </section>

      <section className="home-introducao">
        <span className="eyebrow">
          BEM-VINDO À VÉRTICE
        </span>

        <h2>
          A liberdade de escolher
          <br />
          como chegar.
        </h2>

        <p>
          Acreditamos que a experiência começa antes
          mesmo de ligar o motor. Por isso, reunimos
          uma seleção de automóveis em uma plataforma
          criada para tornar sua próxima escolha
          mais simples.
        </p>

        <Link to="/sobre" className="home-link-texto">
          Conheça a VÉRTICE

        </Link>
      </section>

      <section className="home-diferenciais">
        <div className="home-secao-titulo">
          <span className="eyebrow">
            A EXPERIÊNCIA VÉRTICE
          </span>

          <h2>
            Cada detalhe importa.
          </h2>
        </div>

        <div className="home-diferenciais-grid">
          {diferenciais.map(({ titulo, descricao, Icone }) => (
            <article
              className="home-diferencial"
              key={titulo}
            >
              <Icone size={30} strokeWidth={1.4} />

              <h3>{titulo}</h3>

              <p>{descricao}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-destaques">
        <div className="home-destaques-cabecalho">
          <div>
            <span className="eyebrow">
              UMA AMOSTRA DA NOSSA FROTA
            </span>

            <h2>
              Escolhas que inspiram
              novos caminhos.
            </h2>
          </div>

          <Link to="/carros" className="home-link-texto">
            Ver todos os carros
          </Link>
        </div>

        <div className="home-destaques-grid">
          {destaques.map((carro) => (
            <article
              className="home-destaque-card"
              key={carro.modelo}
            >
              <div className="home-destaque-imagem">
                <img
                  src={carro.imagem}
                  alt={`${carro.marca} ${carro.modelo}`}
                  loading="lazy"
                />

                <span>{carro.categoria}</span>
              </div>

              <div className="home-destaque-conteudo">
                <span className="home-destaque-marca">
                  {carro.marca}
                </span>

                <h3>{carro.modelo}</h3>

                <Link to="/carros">
                  Explorar a frota
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <span className="eyebrow">
          SUA PRÓXIMA JORNADA
        </span>

        <h2>
          O próximo destino
          <br />
          é você quem escolhe.
        </h2>

        <p>
          Explore os automóveis da VÉRTICE
          e encontre a opção ideal para sua viagem.
        </p>

        <Link to="/carros">
          Conhecer a frota completa
        </Link>
      </section>
    </main>
  );
}
