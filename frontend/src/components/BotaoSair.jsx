
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sair } from "../service/auth";

export default function BotaoSair() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSair() {
    setCarregando(true);
    setErro("");

    try {
      await sair();
      navigate("/login", { replace: true });
    } catch (error) {
      setErro(
        error.message || "Não foi possível sair da conta."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSair}
        disabled={carregando}
        className="header-button"
      >
        {carregando ? "Saindo..." : "Sair da conta"}
      </button>

      {erro && <p role="alert">{erro}</p>}
    </div>
  );
}
