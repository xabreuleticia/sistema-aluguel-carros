
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header";
import RotaProtegida from "./components/RotaProtegida";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PedidoAluguel from "./pages/PedidoAluguel";
import MeusPedidos from "./pages/MeusPedidos";
import MeuPerfil from "./pages/MeuPerfil";
import Agente from "./pages/Agente";
import Banco from "./pages/Banco";
import Admin from "./pages/Admin";
import Carros from "./pages/Carros";
import Sobre from "./pages/Sobre";

import { usuarioAtual } from "./service/auth";
import { rotaInicial } from "./utils/rotasPerfil";

import "./App.css";

function PaginaComercial({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    usuarioAtual()
      .then((dados) => {
        if (ativo) setUsuario(dados);
      })
      .catch(() => {
        if (ativo) setUsuario(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return <main>Carregando...</main>;
  }

  if (
    usuario?.perfil === "ADMIN" ||
    usuario?.perfil === "AGENTE"
  ) {
    return (
      <Navigate to={rotaInicial(usuario)} replace />
    );
  }

  return children;
}

function Estrutura() {
  const location = useLocation();

  const paginaLogin = location.pathname === "/login";

  return (
    <>
      {!paginaLogin && <Header />}

      <Routes>
        <Route
          path="/"
          element={
            <PaginaComercial>
              <Home />
            </PaginaComercial>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/cadastro"
          element={
            <PaginaComercial>
              <Cadastro />
            </PaginaComercial>
          }
        />

        <Route
          path="/carros"
          element={
            <PaginaComercial>
              <Carros />
            </PaginaComercial>
          }
        />

        <Route
          path="/sobre"
          element={
            <PaginaComercial>
              <Sobre />
            </PaginaComercial>
          }
        />

        <Route
          path="/perfil"
          element={
            <RotaProtegida
              perfisPermitidos={["CLIENTE"]}
            >
              <MeuPerfil />
            </RotaProtegida>
          }
        />

        <Route
          path="/pedidos"
          element={
            <RotaProtegida
              perfisPermitidos={["CLIENTE"]}
            >
              <MeusPedidos />
            </RotaProtegida>
          }
        />

        <Route
          path="/pedido/novo"
          element={
            <RotaProtegida
              perfisPermitidos={["CLIENTE"]}
            >
              <PedidoAluguel />
            </RotaProtegida>
          }
        />

        <Route
          path="/agente"
          element={
            <RotaProtegida
              perfisPermitidos={["AGENTE_EMPRESA"]}
            >
              <Agente />
            </RotaProtegida>
          }
        />

        <Route
          path="/banco"
          element={
            <RotaProtegida
              perfisPermitidos={["AGENTE_BANCO"]}
            >
              <Banco />
            </RotaProtegida>
          }
        />

        <Route
          path="/admin"
          element={
            <RotaProtegida
              perfisPermitidos={["ADMIN"]}
            >
              <Admin />
            </RotaProtegida>
          }
        />

        <Route
          path="/acesso-negado"
          element={
            <main className="acesso-estado">
              <h1>Acesso não autorizado</h1>
              <p>
                Sua conta não possui um perfil
                válido para esta área.
              </p>
            </main>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Estrutura />
    </BrowserRouter>
  );
}
