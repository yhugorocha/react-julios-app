import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { loginSchema, type LoginFormValues } from "../schemas/authSchemas";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { getFriendlyErrorMessage, mapFieldErrors } from "../utils/error";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/transactions";
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const session = await authService.login(values);
      setSession(session);
      navigate(from, { replace: true });
    } catch (error) {
      const fieldErrors = mapFieldErrors(error);
      if (fieldErrors.email) {
        setError("email", { message: fieldErrors.email });
      }
      if (fieldErrors.password) {
        setError("password", { message: fieldErrors.password });
      }
      setFormError(getFriendlyErrorMessage(error));
    }
  };

  return (
    <section className="auth-page">
      <article className="auth-card">
        <div className="logo-container">
          <img src={assets.logo} alt="Logo do sistema" width={250} height={250} />
          <h1>Entrar</h1>
        </div>
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="form-field">
            <span>E-mail</span>
            <input type="email" placeholder="seu@email.com" {...register("email")} />
            {errors.email && <small className="field-error">{errors.email.message}</small>}
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input type="password" placeholder="Sua senha" {...register("password")} />
            {errors.password && <small className="field-error">{errors.password.message}</small>}
          </label>

          {formError && <p className="form-error">{formError}</p>}

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-footer">
          Primeiro acesso? <Link to="/signup">Registre-se</Link>
        </p>
      </article>
    </section>
  );
}

export default LoginPage;
