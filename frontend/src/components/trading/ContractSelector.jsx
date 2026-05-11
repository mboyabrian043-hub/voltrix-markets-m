export const ContractSelector = ({ options, value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg border px-3 py-2 text-sm transition ${
            value === option.value
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
