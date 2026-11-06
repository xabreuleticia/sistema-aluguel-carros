
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usuarioAtual } from "../service/auth";
import {
  podeAcessar,
  rotaInicial,
} from "../utils/rotasPerfil";

export default function RotaProtegida({
  children,
  perfisPermitidos = [],
}) {
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await usuarioAtual();

        if (ativo) {
          setUsuario(dados);
        }
      } catch (error) {
        if (ativo) {
          if (error?.status === 401) {
            setUsuario(null);
          } else {
            setErro(
              "Não foi possível verificar sua sessão."
            );
          }
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    verificar();

    return () => {
      ativo = false;
    };
  }, [location.pathname]);

  if (carregando) {
    return (
      <main className="acesso-estado">
        <p>Verificando permissões...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="acesso-estado" role="alert">
        <p>{erro}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!podeAcessar(usuario, perfisPermitidos)) {
    return (
      <Navigate
        to={rotaInicial(usuario)}
        replace
      />
    );
  }

  return children;
}
