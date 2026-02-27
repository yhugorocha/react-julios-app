import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signupSchema, type SignupFormValues } from "../schemas/authSchemas";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { useFeedbackStore } from "../store/feedbackStore";
import { getFriendlyErrorMessage, mapFieldErrors } from "../utils/error";

function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const pushSuccess = useFeedbackStore((state) => state.pushSuccess);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);
    try {
      const session = await authService.signup(values);
      if (session) {
        setSession(session);
        pushSuccess("Conta criada com sucesso.");
        navigate("/transactions", { replace: true });
        return;
      }
      pushSuccess("Conta criada com sucesso. Faça login para continuar.");
      reset({ name: "", email: "", password: "" });
      navigate("/login", { replace: true });
    } catch (error) {
      const fieldErrors = mapFieldErrors(error);
      if (fieldErrors.name) {
        setError("name", { message: fieldErrors.name });
      }
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
          <img src="/src/assets/logo.png" alt="Logo do sistema" width={250} height={250}/>
          <h1>Registre-se</h1>
        </div>
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="form-field">
            <span>Nome</span>
            <input type="text" placeholder="Seu nome" {...register("name")} />
            {errors.name && <small className="field-error">{errors.name.message}</small>}
          </label>

          <label className="form-field">
            <span>E-mail</span>
            <input type="email" placeholder="seu@email.com" {...register("email")} />
            {errors.email && <small className="field-error">{errors.email.message}</small>}
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input type="password" placeholder="Mínimo 8 caracteres" {...register("password")} />
            {errors.password && <small className="field-error">{errors.password.message}</small>}
          </label>

          {formError && <p className="form-error">{formError}</p>}

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-footer">
          Já possui conta? <Link to="/login">Entrar</Link>
        </p>
      </article>
    </section>
  );
}

export default SignupPage;

