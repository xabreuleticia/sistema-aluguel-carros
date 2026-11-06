
export function rotaInicial(usuario) {
  if (!usuario) {
    return "/login";
  }

  if (usuario.perfil === "ADMIN") {
    return "/admin";
  }

  if (usuario.perfil === "CLIENTE") {
    return "/pedidos";
  }

  if (usuario.perfil === "AGENTE") {
    if (usuario.tipoAgente === "EMPRESA") {
      return "/agente";
    }

    if (usuario.tipoAgente === "BANCO") {
      return "/banco";
    }
  }

  return "/acesso-negado";
}

export function podeAcessar(usuario, perfisPermitidos) {
  if (!usuario) return false;

  return perfisPermitidos.some((permissao) => {
    if (permissao === "CLIENTE") {
      return usuario.perfil === "CLIENTE";
    }

    if (permissao === "ADMIN") {
      return usuario.perfil === "ADMIN";
    }

    if (permissao === "AGENTE_EMPRESA") {
      return (
        usuario.perfil === "AGENTE" &&
        usuario.tipoAgente === "EMPRESA"
      );
    }

    if (permissao === "AGENTE_BANCO") {
      return (
        usuario.perfil === "AGENTE" &&
        usuario.tipoAgente === "BANCO"
      );
    }

    return false;
  });
}
