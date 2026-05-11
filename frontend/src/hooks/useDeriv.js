import { useEffect } from "react";
import { useTradingStore } from "../store/tradingStore";

export const useDeriv = () => {
  const initialize = useTradingStore((state) => state.initialize);
  const connectionStatus = useTradingStore((state) => state.connectionStatus);
  const reconnectAttempt = useTradingStore((state) => state.reconnectAttempt);
  const isAuthorized = useTradingStore((state) => state.isAuthorized);
  const accountBalance = useTradingStore((state) => state.accountBalance);
  const accountCurrency = useTradingStore((state) => state.accountCurrency);
  const groupedSymbols = useTradingStore((state) => state.groupedSymbols);
  const tickBySymbol = useTradingStore((state) => state.tickBySymbol);
  const lastError = useTradingStore((state) => state.lastError);
  const reconnect = useTradingStore((state) => state.reconnect);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    connectionStatus,
    reconnectAttempt,
    isAuthorized,
    accountBalance,
    accountCurrency,
    groupedSymbols,
    tickBySymbol,
    lastError,
    reconnect,
  };
};
