
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usuarioAtual } from "../service/auth";

export default function RotaProtegida({
  children,
  perfisPermitidos,
}) {
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await usuarioAtual();

        if (ativo) {
          setUsuario(dados);
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível verificar sua sessão.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, [location.pathname]);

  if (carregando) {
    return (
      <main style={{ padding: "60px", textAlign: "center" }}>
        Verificando acesso...
      </main>
    );
  }

  if (erro) {
    return (
      <main role="alert" style={{ padding: "60px" }}>
        {erro}
      </main>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!perfisPermitidos.includes(usuario.perfil)) {
    return (
      <main style={{ padding: "60px" }}>
        <h1>Acesso não autorizado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </main>
    );
  }

  return children;
}
