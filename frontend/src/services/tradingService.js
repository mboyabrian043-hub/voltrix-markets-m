import { derivWebSocket } from "./derivWebSocket";

const contractTypeMap = {
  DIGITODD: "DIGITODD",
  DIGITEVEN: "DIGITEVEN",
  DIGITOVER: "DIGITOVER",
  DIGITUNDER: "DIGITUNDER",
  DIGITMATCH: "DIGITMATCH",
  DIGITDIFF: "DIGITDIFF",
  CALL: "CALL",
  PUT: "PUT",
};

export const tradingService = {
  async getProposal({
    symbol,
    contractType,
    stake,
    duration,
    durationUnit,
    barrier,
    basis = "stake",
    currency = "USD",
  }) {
    const payload = {
      symbol,
      contract_type: contractTypeMap[contractType] || contractType,
      amount: Number(stake),
      basis,
      duration: Number(duration),
      duration_unit: durationUnit,
      currency,
    };

    if (barrier !== undefined && barrier !== null && barrier !== "") {
      payload.barrier = String(barrier);
    }

    return derivWebSocket.requestProposal(payload);
  },

  async buy({ proposalId, price }) {
    return derivWebSocket.buyContract(proposalId, Number(price));
  },

  async subscribeOpenContract(contractId, callback) {
    return derivWebSocket.subscribeOpenContract(contractId, callback);
  },

  async subscribeTransactions(callback) {
    return derivWebSocket.subscribeTransactions(callback);
  },
};
