import { useDeriv } from "../hooks/useDeriv";

const statusTone = {
  connected: "text-green-400",
  connecting: "text-amber-300",
  reconnecting: "text-amber-300",
  auth_error: "text-red-400",
  disconnected: "text-red-400",
  idle: "text-slate-400",
};

const marketSections = [
  { key: "volatility", title: "Volatility Indices" },
  { key: "boomCrash", title: "Boom & Crash" },
  { key: "jump", title: "Jump Indices" },
  { key: "step", title: "Step Indices" },
];

export const DashboardPage = () => {
  const {
    connectionStatus,
    reconnectAttempt,
    isAuthorized,
    accountBalance,
    accountCurrency,
    groupedSymbols,
    tickBySymbol,
    lastError,
    reconnect,
  } = useDeriv();

  const isStreaming = connectionStatus === "connected" && isAuthorized;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <h3 className="text-xl font-semibold text-white">Deriv Live Connection</h3>
        <p className="mt-2 text-slate-400">
          Streaming real synthetic market data and account metrics from Deriv WebSocket API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Connection Status</p>
          <p className={`mt-1 text-lg font-semibold ${statusTone[connectionStatus]}`}>
            {connectionStatus}
          </p>
          {reconnectAttempt > 0 ? (
            <p className="mt-1 text-xs text-slate-500">Reconnect attempts: {reconnectAttempt}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Authorization</p>
          <p className={`mt-1 text-lg font-semibold ${isAuthorized ? "text-green-400" : "text-red-400"}`}>
            {isAuthorized ? "Authorized" : "Not Authorized"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Account Balance</p>
          <p className="mt-1 text-lg font-semibold text-indigo-300">
            {accountBalance !== null
              ? `${Number(accountBalance).toFixed(2)} ${accountCurrency || ""}`
              : "--"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">Stream Control</p>
          <button
            type="button"
            onClick={reconnect}
            className="mt-1 rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-500"
          >
            Reconnect
          </button>
        </div>
      </div>

      {lastError ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {lastError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {marketSections.map((section) => (
          <div key={section.key} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold text-white">{section.title}</h4>
              <span className="text-xs text-slate-400">
                {groupedSymbols[section.key]?.length || 0} active
              </span>
            </div>
            <div className="space-y-2">
              {(groupedSymbols[section.key] || []).slice(0, 8).map((symbol) => {
                const tick = tickBySymbol[symbol.symbol];
                return (
                  <div
                    key={symbol.symbol}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-white">{symbol.display_name}</p>
                      <p className="text-xs text-slate-500">{symbol.symbol}</p>
                    </div>
                    <p className={`text-sm font-semibold ${isStreaming ? "text-green-300" : "text-slate-400"}`}>
                      {tick ? Number(tick.quote).toFixed(4) : "--"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
