
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CarFront,
  Clock3,
  HeartHandshake,
  Compass,
  Eye,
  Gem,
} from "lucide-react";

import "../styles/Sobre.css";

const valores = [
  {
    numero: "01",
    titulo: "Transparência",
    descricao:
      "Valorizamos relações claras e informações acessíveis em cada etapa da experiência.",
  },
  {
    numero: "02",
    titulo: "Excelência",
    descricao:
      "Buscamos oferecer uma experiência de qualidade, com atenção aos detalhes.",
  },
  {
    numero: "03",
    titulo: "Liberdade",
    descricao:
      "Acreditamos que cada pessoa deve ter liberdade para escolher seu próprio caminho.",
  },
  {
    numero: "04",
    titulo: "Confiança",
    descricao:
      "Construímos nossa proposta sobre responsabilidade, segurança e respeito.",
  },
];

const diferenciais = [
  {
    Icone: CarFront,
    titulo: "Frota diversificada",
    descricao:
      "De compactos a SUVs e modelos premium, diferentes opções para cada ocasião.",
  },
  {
    Icone: ShieldCheck,
    titulo: "Processo transparente",
    descricao:
      "Informações sobre veículos, valores e solicitações reunidas em um único lugar.",
  },
  {
    Icone: Clock3,
    titulo: "Praticidade digital",
    descricao:
      "Explore o catálogo e acompanhe suas solicitações diretamente pela plataforma.",
  },
  {
    Icone: HeartHandshake,
    titulo: "Experiência personalizada",
    descricao:
      "Uma proposta pensada para conectar cada cliente ao automóvel ideal.",
  },
];

export default function Sobre() {
  return (
    <main className="sobre-page">
      <section className="sobre-hero">
        <div className="sobre-hero-conteudo">
          <span className="sobre-eyebrow">
            VÉRTICE · SOBRE NÓS
          </span>

          <h1>
            Mais do que
            <br />
            chegar. <em>Viver.</em>
          </h1>

          <p>
            Uma nova perspectiva sobre mobilidade,
            liberdade e a experiência de dirigir.
          </p>

          <a href="#nossa-historia" className="sobre-hero-link">
            Conheça nossa proposta
          </a>
        </div>

      </section>

      <section className="sobre-introducao" id="nossa-historia">
        <div className="sobre-introducao-lateral">
          <span className="sobre-eyebrow">
            QUEM SOMOS
          </span>

          <div className="sobre-linha" />

        </div>

        <div className="sobre-introducao-texto">
          <h2>
            O caminho importa
            <br />
            tanto quanto o destino.
          </h2>

          <p>
            A VÉRTICE é uma plataforma de aluguel de
            automóveis desenvolvida para aproximar
            pessoas de novas possibilidades de mobilidade.
          </p>

          <p>
            Nossa proposta é reunir uma frota diversificada
            em uma experiência digital intuitiva, na qual
            cada cliente possa explorar veículos, solicitar
            um aluguel e acompanhar seu pedido.
          </p>

          <p>
            Acreditamos que escolher um carro deve ser
            uma experiência simples, transparente e
            alinhada às necessidades de cada jornada.
          </p>
        </div>
      </section>

      <section className="sobre-manifesto">
        <span className="sobre-eyebrow">
          NOSSA FILOSOFIA
        </span>

        <p>
          "A verdadeira liberdade não está apenas
          no destino, mas em todas as possibilidades
          que existem pelo caminho."
        </p>

        <span className="sobre-assinatura">
          VÉRTICE
        </span>
      </section>

      <section className="sobre-proposito">
        <div className="sobre-secao-cabecalho">
          <span className="sobre-eyebrow">
            O QUE NOS MOVE
          </span>

          <h2>
            Nossa essência.
            <br />
            Nossa direção.
          </h2>
        </div>

        <div className="sobre-proposito-grid">
          <article className="sobre-proposito-card">
            <Compass size={32} strokeWidth={1.3} />

            <span>01 — MISSÃO</span>

            <h3>Nossa missão</h3>

            <p>
              Simplificar o acesso ao aluguel de
              automóveis por meio de uma plataforma
              intuitiva, organizada e transparente.
            </p>
          </article>

          <article className="sobre-proposito-card">
            <Eye size={32} strokeWidth={1.3} />

            <span>02 — VISÃO</span>

            <h3>Nossa visão</h3>

            <p>
              Ser uma referência em experiências
              digitais de mobilidade, combinando
              praticidade, confiança e inovação.
            </p>
          </article>

          <article className="sobre-proposito-card">
            <Gem size={32} strokeWidth={1.3} />

            <span>03 — PROPÓSITO</span>

            <h3>Nosso propósito</h3>

            <p>
              Transformar a escolha de um automóvel
              em uma experiência que valoriza a
              liberdade e as necessidades de cada pessoa.
            </p>
          </article>
        </div>
      </section>

      <section className="sobre-valores">
        <div className="sobre-valores-cabecalho">
          <span className="sobre-eyebrow">
            NOSSOS PRINCÍPIOS
          </span>

          <h2>
            Valores que nos
            <br />
            acompanham.
          </h2>
        </div>

        <div className="sobre-valores-lista">
          {valores.map((valor) => (
            <article
              className="sobre-valor"
              key={valor.numero}
            >
              <span className="sobre-valor-numero">
                {valor.numero}
              </span>

              <h3>{valor.titulo}</h3>

              <p>{valor.descricao}</p>

            </article>
          ))}
        </div>
      </section>

      <section className="sobre-diferenciais">
        <div className="sobre-secao-cabecalho">
          <span className="sobre-eyebrow">
            POR QUE A VÉRTICE?
          </span>

          <h2>
            Uma experiência
            <br />
            pensada para você.
          </h2>
        </div>

        <div className="sobre-diferenciais-grid">
          {diferenciais.map(({ Icone, titulo, descricao }) => (
            <article
              className="sobre-diferencial"
              key={titulo}
            >
              <Icone size={30} strokeWidth={1.4} />

              <h3>{titulo}</h3>

              <p>{descricao}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sobre-cta">
        <span className="sobre-eyebrow">
          SUA PRÓXIMA EXPERIÊNCIA
        </span>

        <h2>
          Novos caminhos
          <br />
          começam com uma escolha.
        </h2>

        <p>
          Conheça nossa frota e descubra
          o automóvel ideal para sua próxima jornada.
        </p>

        <Link to="/carros">
          Explorar nossa frota
        </Link>
      </section>
    </main>
  );
}
