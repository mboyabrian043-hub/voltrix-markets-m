const categories = [
  { key: "volatility", label: "Volatility" },
  { key: "boomCrash", label: "Boom & Crash" },
  { key: "jump", label: "Jump" },
  { key: "step", label: "Step" },
];

export const MarketSelector = ({
  selectedCategory,
  onSelectCategory,
  selectedSymbol,
  onSelectSymbol,
  groupedSymbols,
}) => {
  const symbols = groupedSymbols[selectedCategory] || [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => onSelectCategory(category.key)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              selectedCategory === category.key
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <select
        value={selectedSymbol}
        onChange={(event) => onSelectSymbol(event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
      >
        {symbols.map((symbol) => (
          <option key={symbol.symbol} value={symbol.symbol}>
            {symbol.display_name}
          </option>
        ))}
      </select>
    </div>
  );
};
