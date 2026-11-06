
import "../styles/PainelAdministrativo.css";

export default function Admin() {
  return (
    <main className="painel-administrativo">
      <section className="painel-admin-intro">
        <span className="painel-admin-etiqueta">
          VÉRTICE / ADMINISTRAÇÃO DO SISTEMA
        </span>

        <h1>Painel do Administrador</h1>

        <p>
          Ambiente exclusivo para gerenciamento
          de contas e permissões.
        </p>
      </section>

      <section className="painel-admin-conteudo">
        <h2>Gerenciamento de usuários</h2>
        <p>
          Aqui será possível consultar usuários,
          alterar seus perfis, cadastrar agentes
          de empresa e agentes bancários e
          ativar ou desativar contas.
        </p>
        <p>
          Essas funcionalidades serão implementadas
          na próxima etapa do backend.
        </p>
      </section>
    </main>
  );
}
