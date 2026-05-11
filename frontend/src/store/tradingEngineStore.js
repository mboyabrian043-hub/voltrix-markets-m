import { create } from "zustand";
import { tradingService } from "../services/tradingService";
import { useTradingStore } from "./tradingStore";

const contractOptions = [
  { value: "DIGITEVEN", label: "Digit Even", requiresBarrier: false },
  { value: "DIGITODD", label: "Digit Odd", requiresBarrier: false },
  { value: "DIGITOVER", label: "Digit Over", requiresBarrier: true, barrierHint: "0-9" },
  { value: "DIGITUNDER", label: "Digit Under", requiresBarrier: true, barrierHint: "0-9" },
  { value: "DIGITMATCH", label: "Digit Matches", requiresBarrier: true, barrierHint: "0-9" },
  { value: "DIGITDIFF", label: "Digit Differs", requiresBarrier: true, barrierHint: "0-9" },
  { value: "CALL", label: "Rise", requiresBarrier: false },
  { value: "PUT", label: "Fall", requiresBarrier: false },
];

export const useTradingEngineStore = create((set, get) => ({
  initialized: false,
  selectedCategory: "volatility",
  selectedSymbol: "",
  contractType: "DIGITEVEN",
  duration: 5,
  durationUnit: "t",
  stake: 1,
  barrier: "",
  proposal: null,
  openContracts: [],
  tradeHistory: [],
  isRequestingProposal: false,
  isBuying: false,
  tradingError: null,
  proposalTimestamp: null,
  transactionUnsubscribe: null,
  contractUnsubscribers: {},

  contractOptions,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    set({ initialized: true });
    await useTradingStore.getState().initialize();

    const grouped = useTradingStore.getState().groupedSymbols;
    const defaultSymbol = grouped.volatility[0]?.symbol || grouped.boomCrash[0]?.symbol || "";
    set({ selectedSymbol: defaultSymbol });

    const transactionUnsubscribe = await tradingService.subscribeTransactions((payload) => {
      const tx = payload.transaction;
      if (!tx) {
        return;
      }

      set((prev) => ({
        tradeHistory: [
          {
            id: tx.transaction_id || `${tx.action_type}-${tx.transaction_time}`,
            actionType: tx.action_type,
            symbol: tx.symbol,
            amount: tx.amount,
            balanceAfter: tx.balance_after,
            contractId: tx.contract_id,
            transactionTime: tx.transaction_time,
            longcode: tx.longcode,
          },
          ...prev.tradeHistory,
        ].slice(0, 100),
      }));
    });

    set({ transactionUnsubscribe });
  },

  setSelectedCategory: (selectedCategory) => {
    const grouped = useTradingStore.getState().groupedSymbols;
    const symbol = grouped[selectedCategory]?.[0]?.symbol || "";
    set({
      selectedCategory,
      selectedSymbol: symbol,
      proposal: null,
      tradingError: null,
    });
  },

  setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol, proposal: null, tradingError: null }),
  setContractType: (contractType) => set({ contractType, proposal: null, tradingError: null }),
  setDuration: (duration) => set({ duration, proposal: null, tradingError: null }),
  setDurationUnit: (durationUnit) => set({ durationUnit, proposal: null, tradingError: null }),
  setStake: (stake) => set({ stake, proposal: null, tradingError: null }),
  setBarrier: (barrier) => set({ barrier, proposal: null, tradingError: null }),

  requestProposal: async () => {
    const state = get();
    set({ isRequestingProposal: true, tradingError: null });

    try {
      const selectedContract = state.contractOptions.find((item) => item.value === state.contractType);
      const requiresBarrier = selectedContract?.requiresBarrier;
      const proposal = await tradingService.getProposal({
        symbol: state.selectedSymbol,
        contractType: state.contractType,
        stake: state.stake,
        duration: state.duration,
        durationUnit: state.durationUnit,
        barrier: requiresBarrier ? state.barrier : undefined,
      });

      set({
        proposal,
        proposalTimestamp: Date.now(),
        isRequestingProposal: false,
      });
    } catch (error) {
      set({
        isRequestingProposal: false,
        tradingError: error.message || "Failed to request proposal.",
      });
    }
  },

  buyContract: async () => {
    const state = get();
    if (!state.proposal?.id) {
      set({ tradingError: "Request a proposal before buying." });
      return;
    }

    set({ isBuying: true, tradingError: null });
    try {
      const buyResult = await tradingService.buy({
        proposalId: state.proposal.id,
        price: state.stake,
      });

      const contractId = buyResult.contract_id;
      if (!contractId) {
        throw new Error("No contract id returned by Deriv.");
      }

      const unsubscribe = await tradingService.subscribeOpenContract(contractId, (payload) => {
        const openContract = payload.proposal_open_contract;
        if (!openContract) {
          return;
        }

        set((prev) => {
          const current = prev.openContracts.filter((item) => item.contract_id !== openContract.contract_id);
          const next = [openContract, ...current];
          const status = openContract.is_sold ? (openContract.profit >= 0 ? "won" : "lost") : "open";

          const updatedHistory = openContract.is_sold
            ? [
                {
                  id: `contract-${openContract.contract_id}-${openContract.date_expiry}`,
                  contractId: openContract.contract_id,
                  symbol: openContract.underlying,
                  status,
                  entrySpot: openContract.entry_tick,
                  exitSpot: openContract.exit_tick,
                  buyPrice: openContract.buy_price,
                  payout: openContract.payout,
                  profit: openContract.profit,
                  sellTime: openContract.date_expiry,
                  startTime: openContract.date_start,
                  longcode: openContract.longcode,
                },
                ...prev.tradeHistory,
              ].slice(0, 100)
            : prev.tradeHistory;

          return {
            openContracts: next.slice(0, 30),
            tradeHistory: updatedHistory,
          };
        });
      });

      set((prev) => ({
        isBuying: false,
        proposal: null,
        contractUnsubscribers: {
          ...prev.contractUnsubscribers,
          [contractId]: unsubscribe,
        },
      }));
    } catch (error) {
      set({ isBuying: false, tradingError: error.message || "Failed to buy contract." });
    }
  },

  clearError: () => set({ tradingError: null }),

  teardown: () => {
    const { transactionUnsubscribe, contractUnsubscribers } = get();
    if (transactionUnsubscribe) {
      transactionUnsubscribe();
    }
    for (const unsubscribe of Object.values(contractUnsubscribers)) {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    }
    set({ transactionUnsubscribe: null, contractUnsubscribers: {} });
  },
}));
