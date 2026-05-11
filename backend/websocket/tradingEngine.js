const { DerivConnection } = require("./derivConnection");

class TradingEngine {
  constructor() {
    this.connection = new DerivConnection({
      appId: process.env.DERIV_APP_ID,
      apiToken: process.env.DERIV_API_TOKEN,
    });
  }

  async connect() {
    await this.connection.connect();
  }

  async getProposal({
    symbol,
    contractType,
    stake,
    duration,
    durationUnit = "t",
    barrier,
    basis = "stake",
    currency = "USD",
  }) {
    const payload = {
      proposal: 1,
      symbol,
      contract_type: contractType,
      amount: Number(stake),
      basis,
      duration: Number(duration),
      duration_unit: durationUnit,
      currency,
    };

    if (barrier !== undefined && barrier !== null && barrier !== "") {
      payload.barrier = String(barrier);
    }

    const response = await this.connection.request(payload);
    if (response.error) {
      throw new Error(response.error.message || "Proposal request failed.");
    }
    return response.proposal;
  }

  async buyContract({ proposalId, price }) {
    const response = await this.connection.request({
      buy: proposalId,
      price: Number(price),
    });
    if (response.error) {
      throw new Error(response.error.message || "Buy request failed.");
    }
    return response.buy;
  }

  async subscribeOpenContract(contractId) {
    return this.connection.request({
      proposal_open_contract: 1,
      contract_id: Number(contractId),
      subscribe: 1,
    });
  }

  async subscribeTransactions() {
    return this.connection.request({
      transaction: 1,
      subscribe: 1,
    });
  }

  close() {
    this.connection.close();
  }
}

module.exports = { TradingEngine };
