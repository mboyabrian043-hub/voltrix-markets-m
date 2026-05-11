import { motion } from "framer-motion";
import { ContractSelector } from "./ContractSelector";
import { MarketSelector } from "./MarketSelector";

export const TradePanel = ({
  groupedSymbols,
  tickBySymbol,
  selectedCategory,
  selectedSymbol,
  contractType,
  contractOptions,
  stake,
  duration,
  durationUnit,
  barrier,
  proposal,
  isRequestingProposal,
  isBuying,
  tradingError,
  onSelectCategory,
  onSelectSymbol,
  onSetContractType,
  onSetStake,
  onSetDuration,
  onSetDurationUnit,
  onSetBarrier,
  onRequestProposal,
  onBuy,
}) => {
  const selectedContract = contractOptions.find((item) => item.value === contractType);
  const liveTick = tickBySymbol[selectedSymbol];
  const canBuy = Boolean(proposal?.id) && !isBuying;

  return (
    <aside className="sticky top-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Trade Panel</h3>
      <p className="mb-4 text-sm text-slate-400">Deriv-style execution panel</p>

      <div className="space-y-4">
        <MarketSelector
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={onSelectSymbol}
          groupedSymbols={groupedSymbols}
        />

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Live Tick</p>
          <motion.p
            key={liveTick?.epoch || "empty"}
            initial={{ opacity: 0.45, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-1 text-2xl font-semibold text-emerald-300"
          >
            {liveTick ? Number(liveTick.quote).toFixed(4) : "--"}
          </motion.p>
          <p className="text-xs text-slate-500">{selectedSymbol || "No symbol selected"}</p>
        </div>

        <ContractSelector options={contractOptions} value={contractType} onChange={onSetContractType} />

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-slate-400">Stake</span>
            <input
              type="number"
              min="0.35"
              step="0.01"
              value={stake}
              onChange={(event) => onSetStake(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-slate-400">Duration</span>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(event) => onSetDuration(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-slate-400">Duration Unit</span>
            <select
              value={durationUnit}
              onChange={(event) => onSetDurationUnit(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            >
              <option value="t">Ticks</option>
              <option value="m">Minutes</option>
              <option value="h">Hours</option>
              <option value="d">Days</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-slate-400">Barrier</span>
            <input
              type="text"
              value={barrier}
              disabled={!selectedContract?.requiresBarrier}
              onChange={(event) => onSetBarrier(event.target.value)}
              placeholder={selectedContract?.requiresBarrier ? selectedContract.barrierHint || "Barrier" : "N/A"}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 disabled:opacity-40"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRequestProposal}
            disabled={isRequestingProposal || !selectedSymbol}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isRequestingProposal ? "Loading..." : "Get Proposal"}
          </button>
          <button
            type="button"
            onClick={onBuy}
            disabled={!canBuy}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isBuying ? "Buying..." : "Buy"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm">
          <p className="text-slate-400">Payout</p>
          <p className="font-semibold text-white">
            {proposal ? Number(proposal.payout || 0).toFixed(2) : "--"}
          </p>
          <p className="mt-2 text-slate-400">Potential Profit</p>
          <p className="font-semibold text-emerald-300">
            {proposal ? Number(proposal.payout - proposal.ask_price).toFixed(2) : "--"}
          </p>
        </div>

        {tradingError ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {tradingError}
          </div>
        ) : null}
      </div>
    </aside>
  );
};
