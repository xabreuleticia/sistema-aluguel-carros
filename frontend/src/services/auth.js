
async function lerResposta(response) {
  const texto = await response.text();

  let dados = {};

  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch {
    dados = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
        throw new Error(
            "A solicitação não foi autorizada pelo servidor."
        );
    }

    if (response.status === 403) {
      throw new Error("Acesso negado ou sessão expirada.");
    }

    throw new Error(
      dados.mensagem ||
      dados.detail ||
      "Não foi possível concluir a operação."
    );
  }

  return dados;
}

export async function obterCsrf() {
  const response = await fetch("/api/auth/csrf", {
    credentials: "include",
  });

  return lerResposta(response);
}

export async function entrar(email, senha) {
  const csrf = await obterCsrf();

  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ email, senha }),
  });

  return lerResposta(response);
}

export async function usuarioAtual() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  return lerResposta(response);
}

export async function sair() {
  const csrf = await obterCsrf();

  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      [csrf.headerName]: csrf.token,
    },
  });

  return lerResposta(response);
}

export async function cadastrarCliente(dados) {
  const csrf = await obterCsrf();

  const response = await fetch("/api/auth/cadastro", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(dados),
  });

  return lerResposta(response);
}
