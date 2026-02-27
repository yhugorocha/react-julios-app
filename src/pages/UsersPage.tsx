import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { userSchema, type UserFormValues } from "../schemas/userSchemas";
import { usersService } from "../services/usersService";
import { useFeedbackStore } from "../store/feedbackStore";
import type { User } from "../types/user";
import { mapFieldErrors } from "../utils/error";

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pushSuccess = useFeedbackStore((state) => state.pushSuccess);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await usersService.listUsers();
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const onSubmit = async (values: UserFormValues) => {
    try {
      const created = await usersService.createUser(values);
      setUsers((current) => [created, ...current]);
      pushSuccess("Usuário criado com sucesso.");
      reset({ name: "", email: "", password: "", role: values.role });
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
      if (fieldErrors.role) {
        setError("role", { message: fieldErrors.role });
      }
    }
  };

  return (
    <section className="page-grid">
      <article className="panel">
        <h1>Usuários</h1>
        <p className="subtitle">Acesso exclusivo para perfil ADMIN.</p>
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-row">
            <label className="form-field">
              <span>Nome</span>
              <input type="text" {...register("name")} />
              {errors.name && <small className="field-error">{errors.name.message}</small>}
            </label>

            <label className="form-field">
              <span>E-mail</span>
              <input type="email" {...register("email")} />
              {errors.email && <small className="field-error">{errors.email.message}</small>}
            </label>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Senha</span>
              <input type="password" {...register("password")} />
              {errors.password && <small className="field-error">{errors.password.message}</small>}
            </label>

            <label className="form-field">
              <span>Perfil</span>
              <select {...register("role")}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {errors.role && <small className="field-error">{errors.role.message}</small>}
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Criar usuário"}
          </button>
        </form>
      </article>

      <article className="panel">
        <h2>Lista</h2>
        {isLoading ? (
          <p>Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

export default UsersPage;

