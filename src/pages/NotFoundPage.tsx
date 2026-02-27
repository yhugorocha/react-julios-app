import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="auth-page">
      <article className="auth-card">
        <h1>Página não encontrada</h1>
        <p className="subtitle">O caminho informado não existe.</p>
        <Link to="/transactions" className="btn btn-primary">
          Voltar para transações
        </Link>
      </article>
    </section>
  );
}

export default NotFoundPage;

