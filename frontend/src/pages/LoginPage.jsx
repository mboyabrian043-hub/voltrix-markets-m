import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    clearError();
    const result = await login(form);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">Sign in</h1>
        <p className="mb-6 text-sm text-slate-400">Access your Volatrix Markets dashboard.</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none focus:border-indigo-400"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none focus:border-indigo-400"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-400">
          No account?{" "}
          <Link to="/register" className="text-indigo-300 hover:text-indigo-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
