
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Users,
  Fuel,
  Settings2,
  ArrowUpRight,
} from "lucide-react";
import "../styles/Carros.css";

const catalogoVisual = [
  {
    marca: "Audi",
    modelo: "A5 Sportback",
    categoria: "Premium",
    imagem: "/images/carros/audi-a5.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
  },
  {
    marca: "Volvo",
    modelo: "XC60",
    categoria: "SUV",
    imagem: "/images/carros/volvo-xc60.jpg",
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
  },
  {
    marca: "MINI",
    modelo: "Cooper S",
    categoria: "Compacto",
    imagem: "/images/carros/mini-cooper.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 4,
  },
  {
    marca: "BMW",
    modelo: "320i",
    categoria: "Premium",
    imagem: "/images/carros/BMW3Series.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
  },
  {
    marca: "Mercedes-Benz",
    modelo: "Classe C",
    categoria: "Premium",
    imagem: "/images/carros/mercedes-Benz_C-Class.jpg",
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
  },
  {
    marca: "Porsche",
    modelo: "Macan",
    categoria: "SUV",
    imagem: "/images/carros/porsche-macan.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
  },
  {
    marca: "Toyota",
    modelo: "Corolla",
    categoria: "Sedan",
    imagem: "/images/carros/toyota-corolla.jpg",
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
  },
  {
    marca: "Jeep",
    modelo: "Compass",
    categoria: "SUV",
    imagem: "/images/carros/jeep-compass_au.jpg",
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
  },
  {
    marca: "Honda",
    modelo: "Civic",
    categoria: "Sedan",
    imagem: "/images/carros/honda-civic.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
  },
  {
    marca: "Range Rover",
    modelo: "Evoque",
    categoria: "SUV",
    imagem: "/images/carros/range-rover-evoque.jpg",
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
  },
  {
    marca: "Volkswagen",
    modelo: "Golf GTI",
    categoria: "Compacto",
    imagem: "/images/carros/volkswagen-golf.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
  },
  {
    marca: "Chevrolet",
    modelo: "Onix",
    categoria: "Compacto",
    imagem: "/images/carros/chevrolet-onix.JPG",
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
  },
  
  {
    marca: "BMW",
    modelo: "X5",
    categoria: "SUV",
    imagem: "/images/carros/bmw-x5.jpg",
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
  },
  {
    marca: "Mercedes-Benz",
    modelo: "GLA 200",
    categoria: "SUV",
    imagem: "/images/carros/mercedes-gla200.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
  },
  {
    marca: "Audi",
    modelo: "Q5",
    categoria: "SUV",
    imagem: "/images/carros/audi-q5.jpg",
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
  },
  {
    marca: "Ford",
    modelo: "Mustang GT",
    categoria: "Esportivo",
    imagem: "/images/carros/ford-mustang-gt.jpg",
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 4,
  },
  {
    marca: "Hyundai",
    modelo: "Creta",
    categoria: "SUV",
    imagem: "/images/carros/hyundai-creta.jpg",
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
  },
  {
    marca: "Nissan",
    modelo: "Kicks",
    categoria: "SUV",
    imagem: "/images/carros/nissan-kicks.jpg",
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
  },
  {
    marca: "Volkswagen",
    modelo: "T-Cross",
    categoria: "SUV",
    imagem: "/images/carros/vw-tcross.jpg",
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
  },
  {
    marca: "Fiat",
    modelo: "Fastback",
    categoria: "SUV",
    imagem: "/images/carros/fiat-fastback.png",
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
  },
  {
    marca: "BYD",
    modelo: "Dolphin",
    categoria: "Elétrico",
    imagem: "/images/carros/byd-dolphin.jpg",
    cambio: "Automático",
    combustivel: "Elétrico",
    lugares: 5,
  },
  {
    marca: "BMW",
    modelo: "i4",
    categoria: "Elétrico",
    imagem: "/images/carros/bmw-i4.jpg",
    cambio: "Automático",
    combustivel: "Elétrico",
    lugares: 5,
  },
  {
    marca: "Peugeot",
    modelo: "208",
    categoria: "Compacto",
    imagem: "/images/carros/peugeot-208.jpg",
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
  },
  {
    marca: "Toyota",
    modelo: "SW4",
    categoria: "SUV",
    imagem: "/images/carros/toyota-sw4.jpg",
    cambio: "Automático",
    combustivel: "Diesel",
    lugares: 7,
  },

];

const categorias = [
  "Todos",
  "Premium",
  "SUV",
  "Sedan",
  "Compacto",
  "Esportivo",
  "Elétrico",
];

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function encontrarVisual(carro) {
  const marca = normalizar(carro.marca);
  const modelo = normalizar(carro.modelo);

  return catalogoVisual.find(
    (item) =>
      normalizar(item.marca) === marca &&
      normalizar(item.modelo) === modelo
  );
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);
}

function ImagemCarro({ src, alt }) {
  const [falhou, setFalhou] = useState(false);

  if (!src || falhou) {
    return (
      <div className="catalogo-imagem-vazia">
        <span>VÉRTICE</span>
        <small>Imagem indisponível</small>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFalhou(true)}
    />
  );
}

export default function Carros() {
  const [carros, setCarros] = useState([]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("padrao");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function carregarCarros() {
      try {
        const resposta = await fetch("/api/automoveis", {
          signal: controller.signal,
        });

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar a frota.");
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
          throw new Error("Formato de catálogo inválido.");
        }

        setCarros(dados);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro(error.message || "Erro ao carregar veículos.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarCarros();

    return () => controller.abort();
  }, []);

  const carrosFiltrados = useMemo(() => {
    const resultado = carros
      .map((carro) => ({
        ...carro,
        visual: encontrarVisual(carro),
      }))
      .filter((carro) => {
        const texto = `${carro.marca} ${carro.modelo}`.toLowerCase();

        const correspondeBusca = texto.includes(
          busca.trim().toLowerCase()
        );

        const correspondeCategoria =
          categoria === "Todos" ||
          carro.visual?.categoria === categoria;

        return correspondeBusca && correspondeCategoria;
      });

    if (ordenacao === "menor") {
      resultado.sort(
        (a, b) =>
          Number(a.valorDiaria ?? a.valor_diaria ?? 0) -
          Number(b.valorDiaria ?? b.valor_diaria ?? 0)
      );
    }

    if (ordenacao === "maior") {
      resultado.sort(
        (a, b) =>
          Number(b.valorDiaria ?? b.valor_diaria ?? 0) -
          Number(a.valorDiaria ?? a.valor_diaria ?? 0)
      );
    }

    return resultado;
  }, [carros, busca, categoria, ordenacao]);

  return (
    <main className="catalogo-page">
      <section className="catalogo-hero">
        <div className="catalogo-hero-imagem">
          <img
            src="/images/capa-carros.png"
            alt=""
          />
        </div>

        <div className="catalogo-hero-conteudo">
          <span className="catalogo-eyebrow">
            VÉRTICE · NOSSA FROTA
          </span>

          <h1>
            Seu próximo destino
            <br />
            começa aqui.
          </h1>

          <p>
            Uma seleção de automóveis para transformar
            cada trajeto em uma experiência especial.
          </p>

          <a href="#catalogo-veiculos" className="catalogo-hero-botao">
            Explorar veículos
          </a>
        </div>
      </section>

      <section
        className="catalogo-conteudo"
        id="catalogo-veiculos"
      >
        <div className="catalogo-cabecalho">
          <div>
            <span className="catalogo-eyebrow">
              ENCONTRE SEU PRÓXIMO TRAJETO
            </span>

            <h2>Escolha sua próxima experiência.</h2>

            <p>
              Explore a frota VÉRTICE e encontre o
              automóvel ideal para você.
            </p>
          </div>

          <span className="catalogo-contagem">
            {carrosFiltrados.length} veículos
          </span>
        </div>

        <div className="catalogo-pesquisa">
          <div className="catalogo-campo-busca">
            <Search size={20} />

            <input
              type="search"
              placeholder="Busque por marca ou modelo"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              aria-label="Buscar veículos"
            />
          </div>

          <div className="catalogo-campo-filtro">
            <SlidersHorizontal size={18} />

            <select
              value={ordenacao}
              onChange={(event) => setOrdenacao(event.target.value)}
              aria-label="Ordenar veículos"
            >
              <option value="padrao">Ordenação padrão</option>
              <option value="menor">Menor diária</option>
              <option value="maior">Maior diária</option>
            </select>
          </div>
        </div>

        <div className="catalogo-categorias">
          {categorias.map((item) => (
            <button
              type="button"
              key={item}
              className={categoria === item ? "ativo" : ""}
              onClick={() => setCategoria(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {carregando && (
          <p className="catalogo-mensagem">
            Carregando nossa frota...
          </p>
        )}

        {erro && (
          <p className="catalogo-mensagem catalogo-erro" role="alert">
            {erro}
          </p>
        )}

        {!carregando && !erro && (
          <>
            <div className="catalogo-grid">
              {carrosFiltrados.map((carro) => {
                const valorDiaria =
                  carro.valorDiaria ?? carro.valor_diaria;

                return (
                  <article
                    className="catalogo-card"
                    key={carro.id}
                  >
                    <div className="catalogo-card-imagem">
                      <ImagemCarro
                        src={carro.visual?.imagem}
                        alt={`${carro.marca} ${carro.modelo}`}
                      />

                      {carro.visual?.categoria && (
                        <span className="catalogo-card-categoria">
                          {carro.visual.categoria}
                        </span>
                      )}

                      <span
                        className={
                          carro.disponivel
                            ? "catalogo-status disponivel"
                            : "catalogo-status indisponivel"
                        }
                      >
                        {carro.disponivel
                          ? "Disponível"
                          : "Indisponível"}
                      </span>
                    </div>

                    <div className="catalogo-card-conteudo">
                      <div className="catalogo-card-titulo">
                        <div>
                          <span className="catalogo-marca">
                            {carro.marca}
                          </span>

                          <h3>{carro.modelo}</h3>
                        </div>

                        <span className="catalogo-ano">
                          {carro.ano}
                        </span>
                      </div>

                      <div className="catalogo-especificacoes">
                        {carro.visual && (
                          <>
                            <span>
                              <Users size={15} />
                              {carro.visual.lugares} lugares
                            </span>

                            <span>
                              <Settings2 size={15} />
                              {carro.visual.cambio}
                            </span>

                            <span>
                              <Fuel size={15} />
                              {carro.visual.combustivel}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="catalogo-card-rodape">
                        <div className="catalogo-preco">
                          <strong>
                            {valorDiaria == null
                              ? "Sob consulta"
                              : formatarMoeda(valorDiaria)}
                          </strong>
                          <span>/ diária</span>
                        </div>

                        {carro.disponivel ? (
                          <Link
                            to={`/pedido/novo?automovelId=${encodeURIComponent(carro.id)}`}
                            className="catalogo-botao"
                          >
                            Solicitar
                          </Link>
                        ) : (
                          <span className="catalogo-botao bloqueado">
                            Indisponível
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {carrosFiltrados.length === 0 && (
              <div className="catalogo-vazio">
                <h3>Nenhum veículo encontrado</h3>
                <p>
                  Tente alterar sua busca ou escolher outra categoria.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setCategoria("Todos");
                    setOrdenacao("padrao");
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
