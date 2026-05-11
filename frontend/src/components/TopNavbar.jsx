export const TopNavbar = ({ onMenuClick, username, onLogout }) => {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-200 md:hidden"
          onClick={onMenuClick}
        >
          Menu
        </button>
        <h2 className="text-lg font-semibold text-white">Dashboard</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300">{username}</span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-md bg-red-500/20 px-3 py-1 text-sm text-red-300 hover:bg-red-500/30"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
