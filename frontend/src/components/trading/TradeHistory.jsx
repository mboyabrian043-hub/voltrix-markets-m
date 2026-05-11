const formatEpoch = (epoch) => {
  if (!epoch) {
    return "--";
  }
  return new Date(epoch * 1000).toLocaleString();
};

export const TradeHistory = ({ tradeHistory }) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="text-lg font-semibold text-white">Transaction & Trade History</h3>
      <p className="mb-3 text-sm text-slate-400">Real transaction and contract settlement records</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">Symbol</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Entry</th>
              <th className="px-3 py-2 font-medium">Exit</th>
              <th className="px-3 py-2 font-medium">Buy</th>
              <th className="px-3 py-2 font-medium">Payout</th>
              <th className="px-3 py-2 font-medium">P/L</th>
              <th className="px-3 py-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {tradeHistory.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-slate-500">
                  No trades yet.
                </td>
              </tr>
            ) : null}

            {tradeHistory.map((item) => {
              const profit = Number(item.profit ?? item.amount ?? 0);
              const tone = profit >= 0 ? "text-emerald-300" : "text-red-300";
              return (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="px-3 py-2 text-slate-100">{item.symbol || "--"}</td>
                  <td className="px-3 py-2 text-slate-300">{item.status || item.actionType || "--"}</td>
                  <td className="px-3 py-2 text-slate-300">{item.entrySpot ?? "--"}</td>
                  <td className="px-3 py-2 text-slate-300">{item.exitSpot ?? "--"}</td>
                  <td className="px-3 py-2 text-slate-300">
                    {item.buyPrice !== undefined ? Number(item.buyPrice).toFixed(2) : "--"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {item.payout !== undefined ? Number(item.payout).toFixed(2) : "--"}
                  </td>
                  <td className={`px-3 py-2 ${tone}`}>{Number.isFinite(profit) ? profit.toFixed(2) : "--"}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {formatEpoch(item.sellTime || item.transactionTime || item.startTime)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
