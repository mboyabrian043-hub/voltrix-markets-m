import { create } from "zustand";
import { derivWebSocket } from "../services/derivWebSocket";

const categoryConfig = [
  { key: "volatility", label: "Volatility Indices", match: /volatility/i },
  { key: "boomCrash", label: "Boom & Crash", match: /(boom|crash)/i },
  { key: "jump", label: "Jump Indices", match: /jump/i },
  { key: "step", label: "Step Indices", match: /step/i },
];

const classifySymbol = (symbol) => {
  const haystack = `${symbol.display_name || ""} ${symbol.market_display_name || ""}`;
  const category = categoryConfig.find((rule) => rule.match.test(haystack));
  return category ? category.key : null;
};

export const useTradingStore = create((set, get) => ({
  initialized: false,
  connectionStatus: "idle",
  reconnectAttempt: 0,
  isAuthorized: false,
  accountBalance: null,
  accountCurrency: null,
  activeSymbols: [],
  groupedSymbols: {
    volatility: [],
    boomCrash: [],
    jump: [],
    step: [],
  },
  tickBySymbol: {},
  lastError: null,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    set({ initialized: true });

    derivWebSocket.setCredentials({
      appId: import.meta.env.VITE_DERIV_APP_ID,
      apiToken: import.meta.env.VITE_DERIV_API_TOKEN,
    });

    derivWebSocket.onStatusChange((status, reconnectAttempt) => {
      set({ connectionStatus: status, reconnectAttempt });
    });

    derivWebSocket.onError((error) => {
      set({ lastError: error.message || "Deriv stream error." });
    });

    derivWebSocket.onAuthorize(() => {
      set({ isAuthorized: true, lastError: null });
    });

    try {
      await derivWebSocket.connect();
      await get().loadActiveSymbols();
      await get().subscribeBalance();
      await get().subscribeDefaultTicks();
    } catch (error) {
      set({
        lastError: error.message || "Failed to initialize Deriv streaming.",
      });
    }
  },

  loadActiveSymbols: async () => {
    try {
      const symbols = await derivWebSocket.getActiveSymbols();
      const grouped = {
        volatility: [],
        boomCrash: [],
        jump: [],
        step: [],
      };

      for (const symbol of symbols) {
        const category = classifySymbol(symbol);
        if (!category) {
          continue;
        }
        grouped[category].push(symbol);
      }

      set({
        activeSymbols: symbols,
        groupedSymbols: grouped,
      });
    } catch (error) {
      set({ lastError: error.message || "Failed to load active symbols." });
    }
  },

  subscribeBalance: async () => {
    await derivWebSocket.subscribeBalance((payload) => {
      const balance = payload.balance;
      if (!balance) {
        return;
      }
      set({
        accountBalance: balance.balance,
        accountCurrency: balance.currency,
      });
    });
  },

  subscribeDefaultTicks: async () => {
    const state = get();
    const selectedSymbols = [
      ...state.groupedSymbols.volatility.slice(0, 4),
      ...state.groupedSymbols.boomCrash.slice(0, 4),
      ...state.groupedSymbols.jump.slice(0, 4),
      ...state.groupedSymbols.step.slice(0, 4),
    ];

    for (const market of selectedSymbols) {
      await derivWebSocket.subscribeTicks(market.symbol, (payload) => {
        const tick = payload.tick;
        if (!tick) {
          return;
        }

        set((prev) => ({
          tickBySymbol: {
            ...prev.tickBySymbol,
            [tick.symbol]: {
              quote: tick.quote,
              epoch: tick.epoch,
              id: tick.id,
            },
          },
        }));
      });
    }
  },

  reconnect: () => {
    derivWebSocket.forceReconnect();
  },
}));
