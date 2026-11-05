
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Users,
  Fuel,
  Settings2,
} from "lucide-react";
import "../styles/Home.css";

const carros = [
  {
    id: 1,
    marca: "Audi",
    modelo: "A5 Sportback",
    categoria: "Premium",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
    diaria: 489,
    imagem: "/images/carros/audi-a5.jpg",
  },
  {
    id: 2,
    marca: "Volvo",
    modelo: "XC60",
    categoria: "SUV",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
    diaria: 559,
    imagem: "/images/carros/volvo-xc60.jpg",
  },
  {
    id: 3,
    marca: "MINI",
    modelo: "Cooper S",
    categoria: "Compacto",
    ano: 2024,
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 4,
    diaria: 329,
    imagem: "/images/carros/mini-cooper.jpg",
  },
  {
    id: 4,
    marca: "BMW",
    modelo: "320i",
    categoria: "Premium",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
    diaria: 529,
    imagem: "/images/carros/BMW3Series.jpg",
  },
  {
    id: 5,
    marca: "Mercedes-Benz",
    modelo: "Classe C",
    categoria: "Premium",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
    diaria: 599,
    imagem: "/images/carros/mercedes-Benz_C-Class.jpg",
  },
  {
    id: 6,
    marca: "Porsche",
    modelo: "Macan",
    categoria: "SUV",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
    diaria: 799,
    imagem: "/images/carros/porsche-macan.jpg",
  },
  {
    id: 7,
    marca: "Toyota",
    modelo: "Corolla",
    categoria: "Sedan",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
    diaria: 279,
    imagem: "/images/carros/toyota-corolla.jpg",
  },
  {
    id: 8,
    marca: "Jeep",
    modelo: "Compass",
    categoria: "SUV",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
    diaria: 359,
    imagem: "/images/carros/jeep-compass_au.jpg",
  },
  {
    id: 9,
    marca: "Honda",
    modelo: "Civic",
    categoria: "Sedan",
    ano: 2024,
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
    diaria: 319,
    imagem: "/images/carros/honda-civic.jpg",
  },
  {
    id: 10,
    marca: "Range Rover",
    modelo: "Evoque",
    categoria: "SUV",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Híbrido",
    lugares: 5,
    diaria: 689,
    imagem: "/images/carros/range-rover-evoque.jpg",
  },
  {
    id: 11,
    marca: "Volkswagen",
    modelo: "Golf GTI",
    categoria: "Compacto",
    ano: 2024,
    cambio: "Automático",
    combustivel: "Gasolina",
    lugares: 5,
    diaria: 389,
    imagem: "/images/carros/volkswagen-golf.jpg",
  },
  {
    id: 12,
    marca: "Chevrolet",
    modelo: "Onix",
    categoria: "Compacto",
    ano: 2025,
    cambio: "Automático",
    combustivel: "Flex",
    lugares: 5,
    diaria: 199,
    imagem: "/images/carros/chevrolet-onix.JPG",
  },
];

const categorias = ["Todos", "Premium", "SUV", "Sedan", "Compacto"];

function ImagemCarro({ src, alt }) {
  const [erro, setErro] = useState(false);

  return (
    <img
      src={erro ? "/images/carros/audi-a5.jpg" : src}
      alt={alt}
      onError={() => setErro(true)}
    />
  );
}

export default function Home() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const carrosFiltrados = carros.filter((carro) => {
    const textoBusca = `${carro.marca} ${carro.modelo}`.toLowerCase();
    const correspondeBusca = textoBusca.includes(busca.toLowerCase());
    const correspondeCategoria =
      categoria === "Todos" || carro.categoria === categoria;

    return correspondeBusca && correspondeCategoria;
  });

  return (
    <main className="fleet-page">
      <section className="fleet-hero">
        <div className="fleet-hero-content">
          <span className="eyebrow">VÉRTICE · ALUGUEL PREMIUM</span>

          <h1>
            O prazer está
            <br />
            no percurso.
          </h1>

          <p>
            Encontre o carro ideal para sua próxima viagem.
            Uma experiência de direção feita para você.
          </p>

          <a href="#catalogo" className="hero-link">
            Explore nossa frota 
          </a>
        </div>

        <div className="fleet-hero-image">
          <ImagemCarro
            src="/images/capa-inicial.png"
            alt="Audi A5 Sportback"
          />
        </div>
      </section>

      <section className="fleet-search-section" id="catalogo">
        <div className="fleet-section-heading">
          <div>
            <span className="eyebrow">ENCONTRE SEU PRÓXIMO TRAJETO</span>
            <h2>Uma frota, muitas possibilidades.</h2>
          </div>

          <span className="fleet-count">
            {carrosFiltrados.length} veículos
          </span>
        </div>

        <div className="fleet-search">
          <div className="fleet-search-input">
            <Search size={20} />

            <input
              type="search"
              placeholder="Busque por marca ou modelo"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              aria-label="Buscar veículos"
            />
          </div>

          <div className="fleet-filter">
            <SlidersHorizontal size={18} />

            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              aria-label="Filtrar por categoria"
            >
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item === "Todos" ? "Todas as categorias" : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="fleet-category-list">
          {categorias.map((item) => (
            <button
              key={item}
              className={categoria === item ? "category-active" : ""}
              onClick={() => setCategoria(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="fleet-grid">
          {carrosFiltrados.map((carro) => (
            <article className="car-card" key={carro.id}>
              <div className="car-image">
                <ImagemCarro
                  src={carro.imagem}
                  alt={`${carro.marca} ${carro.modelo}`}
                />

                <span className="car-category">{carro.categoria}</span>
              </div>

              <div className="car-card-content">
                <div className="car-title-row">
                  <div>
                    <span className="car-brand">{carro.marca}</span>
                    <h3>{carro.modelo}</h3>
                  </div>

                  <span className="car-year">{carro.ano}</span>
                </div>

                <div className="car-specs">
                  <span>
                    <Users size={15} /> {carro.lugares} lugares
                  </span>

                  <span>
                    <Settings2 size={15} /> {carro.cambio}
                  </span>

                  <span>
                    <Fuel size={15} /> {carro.combustivel}
                  </span>
                </div>

                <div className="car-card-footer">
                  <div className="car-price">
                    <strong>
                      {carro.diaria.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                    <span>/ diária</span>
                  </div>

                  <Link
                    to={`/pedido/novo?carro=${carro.id}`}
                    className="car-book-button"
                  >
                    Solicitar 
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {carrosFiltrados.length === 0 && (
          <div className="fleet-empty">
            <h3>Nenhum veículo encontrado</h3>
            <p>Tente alterar a busca ou escolher outra categoria.</p>

            <button
              onClick={() => {
                setBusca("");
                setCategoria("Todos");
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
