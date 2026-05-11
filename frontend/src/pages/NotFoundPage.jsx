import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
      <h1 className="text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-slate-400">The route you requested does not exist.</p>
      <Link to="/dashboard" className="mt-6 rounded-lg bg-indigo-500 px-4 py-2 text-white">
        Back to dashboard
      </Link>
    </div>
  );
};
