
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import RotaProtegida from "./components/RotaProtegida";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PedidoAluguel from "./pages/PedidoAluguel";
import MeusPedidos from "./pages/MeusPedidos";
import MeuPerfil from "./pages/MeuPerfil";
import Agente from "./pages/Agente";
import Carros from "./pages/Carros";
import Sobre from "./pages/Sobre";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/perfil"
          element={
            <RotaProtegida perfisPermitidos={["CLIENTE"]}>
              <MeuPerfil />
            </RotaProtegida>
          }
        />

        <Route
          path="/pedidos"
          element={
            <RotaProtegida perfisPermitidos={["CLIENTE"]}>
              <MeusPedidos />
            </RotaProtegida>
          }
        />

        <Route
          path="/pedido/novo"
          element={
            <RotaProtegida perfisPermitidos={["CLIENTE"]}>
              <PedidoAluguel />
            </RotaProtegida>
          }
        />

        <Route path="/carros" element={<Carros />} />

        <Route path="/sobre" element={<Sobre />} />

        <Route
          path="/agente"
          element={
            <RotaProtegida perfisPermitidos={["AGENTE"]}>
              <Agente />
            </RotaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
