import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navItems = [{ path: "/dashboard", label: "Dashboard" }];

export const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -280 }}
        transition={{ duration: 0.25 }}
        className="fixed z-30 h-full w-64 border-r border-slate-800 bg-slate-950 p-4 md:static md:translate-x-0"
      >
        <div className="mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-xl font-semibold text-white">Volatrix Markets</h1>
          <p className="text-sm text-slate-400">Trading Platform Foundation</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};
