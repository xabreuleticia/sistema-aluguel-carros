
import { useCallback, useEffect, useState } from "react";
import "../styles/Admin.css";

const PERFIS = {
  CLIENTE: "Cliente",
  AGENTE: "Agente",
  ADMIN: "Administrador",
};

const TIPOS = {
  EMPRESA: "Empresa",
  BANCO: "Banco",
};

const formularioAgenteInicial = {
  nome: "",
  email: "",
  senha: "",
  tipoAgente: "EMPRESA",
};

async function mensagemErro(resposta) {
  try {
    const dados = await resposta.json();
    return (
      dados.detail ||
      dados.message ||
      dados.reason ||
      `Erro ${resposta.status}`
    );
  } catch {
    return `Erro ${resposta.status}`;
  }
}

async function requisicao(url, opcoes = {}) {
  const metodo = opcoes.method || "GET";

  const headers = {
    ...(opcoes.headers || {}),
  };

  if (metodo !== "GET") {
    const csrfResposta = await fetch("/api/auth/csrf", {
      credentials: "include",
    });

    if (!csrfResposta.ok) {
      throw new Error(
        "Não foi possível validar a sessão."
      );
    }

    const csrf = await csrfResposta.json();
    headers[csrf.headerName] = csrf.token;
    headers["Content-Type"] = "application/json";
  }

  const resposta = await fetch(url, {
    ...opcoes,
    credentials: "include",
    headers,
  });

  if (!resposta.ok) {
    throw new Error(await mensagemErro(resposta));
  }

  return resposta.json();
}

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [aba, setAba] = useState("usuarios");
  const [busca, setBusca] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("TODOS");

  const [novoAgente, setNovoAgente] = useState(
    formularioAgenteInicial
  );

  const [editando, setEditando] = useState(null);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const [lista, sessao] = await Promise.all([
        requisicao("/api/admin/usuarios"),
        requisicao("/api/auth/me"),
      ]);

      setUsuarios(Array.isArray(lista) ? lista : []);
      setUsuarioAtual(sessao);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível carregar os usuários."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  function atualizarNovoAgente(campo, valor) {
    setNovoAgente((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  async function cadastrarAgente(event) {
    event.preventDefault();
    limparMensagens();
    setSalvando(true);

    try {
      const criado = await requisicao(
        "/api/admin/agentes",
        {
          method: "POST",
          body: JSON.stringify(novoAgente),
        }
      );

      setUsuarios((lista) => [...lista, criado]);

      setNovoAgente(formularioAgenteInicial);

      setSucesso(
        "Agente cadastrado com sucesso. " +
        "A conta já pode acessar o sistema."
      );

      setAba("usuarios");
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível cadastrar o agente."
      );
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(usuario) {
    limparMensagens();

    setEditando({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      tipoAgente: usuario.tipoAgente || "",
      ativo: usuario.ativo,
    });
  }

  function atualizarEdicao(campo, valor) {
    setEditando((atual) => ({
      ...atual,
      [campo]: valor,
      ...(campo === "perfil" && valor !== "AGENTE"
        ? { tipoAgente: "" }
        : {}),
      ...(campo === "perfil" &&
      valor === "AGENTE" &&
      !atual.tipoAgente
        ? { tipoAgente: "EMPRESA" }
        : {}),
    }));
  }

  async function salvarEdicao(event) {
    event.preventDefault();

    if (!editando) return;

    limparMensagens();
    setSalvando(true);

    try {
      const atualizado = await requisicao(
        `/api/admin/usuarios/${editando.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            nome: editando.nome,
            perfil: editando.perfil,
            tipoAgente:
              editando.perfil === "AGENTE"
                ? editando.tipoAgente
                : null,
            ativo: editando.ativo,
          }),
        }
      );

      setUsuarios((lista) =>
        lista.map((usuario) =>
          usuario.id === atualizado.id
            ? atualizado
            : usuario
        )
      );

      setEditando(null);
      setSucesso("Usuário atualizado com sucesso.");
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível atualizar o usuário."
      );
    } finally {
      setSalvando(false);
    }
  }

  const clientes = usuarios.filter(
    (usuario) => usuario.perfil === "CLIENTE"
  ).length;

  const agentes = usuarios.filter(
    (usuario) => usuario.perfil === "AGENTE"
  ).length;

  const administradores = usuarios.filter(
    (usuario) => usuario.perfil === "ADMIN"
  ).length;

  const ativos = usuarios.filter(
    (usuario) => usuario.ativo
  ).length;

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = [
      usuario.nome,
      usuario.email,
      usuario.perfil,
      usuario.tipoAgente,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (filtroPerfil === "TODOS" ||
        usuario.perfil === filtroPerfil) &&
      texto.includes(busca.trim().toLowerCase())
    );
  });

  return (
    <main className="admin-pagina">
      <div className="admin-container">
        <header className="admin-topo">
          <div>
            <span className="admin-etiqueta">
              VÉRTICE / ADMINISTRAÇÃO
            </span>

            <h1>Gestão do sistema</h1>

            <p>
              Gerencie contas, permissões e acessos
              dos usuários do VÉRTICE.
            </p>
          </div>

          <button
            type="button"
            className="admin-botao-secundario"
            onClick={carregarDados}
            disabled={carregando || salvando}
          >
            Atualizar dados
          </button>
        </header>

        <section className="admin-indicadores">
          {[
            ["Total de usuários", usuarios.length],
            ["Clientes", clientes],
            ["Agentes", agentes],
            ["Administradores", administradores],
            ["Contas ativas", ativos],
          ].map(([titulo, quantidade]) => (
            <article
              className="admin-indicador"
              key={titulo}
            >
              <span>{titulo}</span>
              <strong>{quantidade}</strong>
            </article>
          ))}
        </section>

        <div className="admin-abas">
          <button
            type="button"
            className={
              aba === "usuarios" ? "ativo" : ""
            }
            onClick={() => {
              setAba("usuarios");
              limparMensagens();
            }}
          >
            Gerenciar usuários
          </button>

          <button
            type="button"
            className={
              aba === "cadastro" ? "ativo" : ""
            }
            onClick={() => {
              setAba("cadastro");
              limparMensagens();
            }}
          >
            Cadastrar agente
          </button>
        </div>

        {erro && (
          <div
            className="admin-alerta admin-erro"
            role="alert"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            className="admin-alerta admin-sucesso"
            role="status"
          >
            {sucesso}
          </div>
        )}

        {aba === "usuarios" && (
          <section className="admin-painel">
            <div className="admin-secao-topo">
              <span className="admin-etiqueta">
                CONTROLE DE ACESSOS
              </span>

              <h2>Usuários cadastrados</h2>

              <p>
                Consulte as contas e atualize suas
                permissões.
              </p>
            </div>

            <div className="admin-filtros">
              <input
                type="search"
                placeholder="Buscar por nome ou e-mail..."
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
              />

              <select
                value={filtroPerfil}
                onChange={(event) =>
                  setFiltroPerfil(event.target.value)
                }
              >
                <option value="TODOS">
                  Todos os perfis
                </option>
                <option value="CLIENTE">
                  Clientes
                </option>
                <option value="AGENTE">
                  Agentes
                </option>
                <option value="ADMIN">
                  Administradores
                </option>
              </select>
            </div>

            {carregando ? (
              <div className="admin-vazio">
                Carregando usuários...
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="admin-vazio">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <div className="admin-tabela-container">
                <table className="admin-tabela">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Perfil</th>
                      <th>Tipo</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>
                          <strong>
                            {usuario.nome}
                          </strong>

                          <small>
                            {usuario.email}
                          </small>
                        </td>

                        <td>
                          {PERFIS[usuario.perfil] ||
                            usuario.perfil}
                        </td>

                        <td>
                          {TIPOS[usuario.tipoAgente] ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={
                              usuario.ativo
                                ? "admin-status admin-status-ativo"
                                : "admin-status admin-status-inativo"
                            }
                          >
                            {usuario.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-botao-editar"
                            onClick={() =>
                              iniciarEdicao(usuario)
                            }
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {aba === "cadastro" && (
          <section className="admin-painel">
            <div className="admin-secao-topo">
              <span className="admin-etiqueta">
                NOVO ACESSO
              </span>

              <h2>Cadastrar agente</h2>

              <p>
                Crie uma conta para um agente de
                empresa ou instituição bancária.
              </p>
            </div>

            <form
              className="admin-formulario"
              onSubmit={cadastrarAgente}
            >
              <label>
                Nome completo
                <input
                  type="text"
                  value={novoAgente.nome}
                  onChange={(event) =>
                    atualizarNovoAgente(
                      "nome",
                      event.target.value
                    )
                  }
                  required
                  maxLength={150}
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  value={novoAgente.email}
                  onChange={(event) =>
                    atualizarNovoAgente(
                      "email",
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                Tipo de agente
                <select
                  value={novoAgente.tipoAgente}
                  onChange={(event) =>
                    atualizarNovoAgente(
                      "tipoAgente",
                      event.target.value
                    )
                  }
                >
                  <option value="EMPRESA">
                    Agente de empresa
                  </option>

                  <option value="BANCO">
                    Agente bancário
                  </option>
                </select>
              </label>

              <label>
                Senha inicial
                <input
                  type="password"
                  value={novoAgente.senha}
                  onChange={(event) =>
                    atualizarNovoAgente(
                      "senha",
                      event.target.value
                    )
                  }
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />
              </label>

              <p className="admin-observacao">
                Use uma senha temporária exclusiva e
                compartilhe-a com o agente por um
                canal seguro. Antes de disponibilizar
                o sistema publicamente, implemente
                troca obrigatória da senha inicial.
              </p>

              <button
                type="submit"
                className="admin-botao-principal"
                disabled={salvando}
              >
                {salvando
                  ? "Cadastrando..."
                  : "Cadastrar agente"}
              </button>
            </form>
          </section>
        )}

        {editando && (
          <div
            className="admin-modal-fundo"
            role="presentation"
          >
            <section
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-editar-titulo"
            >
              <div className="admin-modal-topo">
                <div>
                  <span className="admin-etiqueta">
                    GERENCIAMENTO DE CONTA
                  </span>

                  <h2 id="admin-editar-titulo">
                    Editar usuário
                  </h2>
                </div>

                <button
                  type="button"
                  className="admin-fechar"
                  onClick={() => setEditando(null)}
                  aria-label="Fechar"
                  disabled={salvando}
                >
                  ×
                </button>
              </div>

              <form
                className="admin-formulario"
                onSubmit={salvarEdicao}
              >
                <label>
                  Nome
                  <input
                    type="text"
                    value={editando.nome}
                    onChange={(event) =>
                      atualizarEdicao(
                        "nome",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  E-mail
                  <input
                    type="email"
                    value={editando.email}
                    disabled
                  />
                </label>

                <label>
                  Perfil
                  <select
                    value={editando.perfil}
                    onChange={(event) =>
                      atualizarEdicao(
                        "perfil",
                        event.target.value
                      )
                    }
                  >
                    <option value="CLIENTE">
                      Cliente
                    </option>

                    <option value="AGENTE">
                      Agente
                    </option>

                    <option value="ADMIN">
                      Administrador
                    </option>
                  </select>
                </label>

                {editando.perfil === "AGENTE" && (
                  <label>
                    Tipo de agente
                    <select
                      value={editando.tipoAgente}
                      onChange={(event) =>
                        atualizarEdicao(
                          "tipoAgente",
                          event.target.value
                        )
                      }
                    >
                      <option value="EMPRESA">
                        Empresa
                      </option>

                      <option value="BANCO">
                        Banco
                      </option>
                    </select>
                  </label>
                )}

                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={editando.ativo}
                    onChange={(event) =>
                      atualizarEdicao(
                        "ativo",
                        event.target.checked
                      )
                    }
                    disabled={
                      editando.id === usuarioAtual?.id
                    }
                  />

                  Conta ativa
                </label>

                {editando.id === usuarioAtual?.id && (
                  <p className="admin-observacao">
                    Você não pode desativar sua
                    própria conta administrativa.
                  </p>
                )}

                <div className="admin-modal-acoes">
                  <button
                    type="button"
                    className="admin-botao-secundario"
                    onClick={() => setEditando(null)}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="admin-botao-principal"
                    disabled={salvando}
                  >
                    {salvando
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
