export const DashboardPage = () => {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <h3 className="text-xl font-semibold text-white">Foundation Ready</h3>
        <p className="mt-2 text-slate-400">
          Volatrix Markets architecture is set up for authentication, API services, and future
          trading modules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Status</p>
          <p className="mt-1 text-lg font-semibold text-green-400">Backend Connected</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Security</p>
          <p className="mt-1 text-lg font-semibold text-indigo-300">JWT + bcrypt Enabled</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Next Phase</p>
          <p className="mt-1 text-lg font-semibold text-amber-300">Trading Logic (Pending)</p>
        </div>
      </div>
    </section>
  );
};
