export const OpenContracts = ({ openContracts }) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="text-lg font-semibold text-white">Open Contracts</h3>
      <p className="mb-3 text-sm text-slate-400">Live proposal_open_contract stream</p>

      <div className="space-y-2">
        {openContracts.length === 0 ? (
          <p className="text-sm text-slate-500">No open contracts.</p>
        ) : null}

        {openContracts.map((contract) => {
          const liveProfit = Number(contract.profit || 0);
          const tone = liveProfit >= 0 ? "text-emerald-300" : "text-red-300";
          return (
            <div
              key={contract.contract_id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{contract.underlying}</p>
                <p className="text-xs text-slate-400">
                  {contract.is_sold ? "Closed" : "Open"} #{contract.contract_id}
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-500">{contract.longcode}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-400">Entry</p>
                  <p className="text-slate-100">{contract.entry_tick ?? "--"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Current/Exit</p>
                  <p className="text-slate-100">{contract.current_spot ?? contract.exit_tick ?? "--"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Buy Price</p>
                  <p className="text-slate-100">{Number(contract.buy_price || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400">P/L</p>
                  <p className={tone}>{liveProfit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
