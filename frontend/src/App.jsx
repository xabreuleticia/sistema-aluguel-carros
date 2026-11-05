
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import PedidoAluguel from "./pages/PedidoAluguel";
import "./App.css";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<h1>Cadastro</h1>} />
        <Route path="/pedidos" element={<h1>Meus pedidos</h1>} />
        <Route path="/pedido/novo" element={<PedidoAluguel />} />
        <Route path="/agente" element={<h1>Painel do agente</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
