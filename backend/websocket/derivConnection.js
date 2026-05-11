const WebSocket = require("ws");

class DerivConnection {
  constructor({ appId, apiToken }) {
    this.appId = appId;
    this.apiToken = apiToken;
    this.url = `wss://ws.derivws.com/websockets/v3?app_id=${appId}`;
    this.ws = null;
    this.requestId = 1;
    this.pendingRequests = new Map();
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
    this.manualClose = false;
    this.subscriptions = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.manualClose = false;
      this.ws = new WebSocket(this.url);

      this.ws.once("open", async () => {
        try {
          await this.authorize();
          await this.restoreSubscriptions();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.ws.on("message", (buffer) => this.handleMessage(buffer.toString()));

      this.ws.on("close", () => {
        this.rejectPending(new Error("Deriv websocket disconnected."));
        if (!this.manualClose) {
          this.scheduleReconnect();
        }
      });

      this.ws.on("error", (error) => {
        reject(error);
      });
    });
  }

  scheduleReconnect() {
    clearTimeout(this.reconnectTimer);
    this.reconnectAttempt += 1;
    const delay = Math.min(1000 * 2 ** (this.reconnectAttempt - 1), 15000);
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        this.scheduleReconnect();
      });
    }, delay);
  }

  request(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("Deriv websocket is not connected."));
    }

    const reqId = this.requestId++;
    this.ws.send(JSON.stringify({ ...payload, req_id: reqId }));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(reqId);
        reject(new Error("Deriv request timeout."));
      }, 15000);
      this.pendingRequests.set(reqId, { resolve, reject, timeout });
    });
  }

  async authorize() {
    if (!this.apiToken) {
      throw new Error("DERIV_API_TOKEN is required.");
    }

    const response = await this.request({ authorize: this.apiToken });
    if (response.error) {
      throw new Error(response.error.message || "Deriv authorization failed.");
    }
    return response.authorize;
  }

  async subscribeTicks(symbol) {
    this.subscriptions.push({ ticks: symbol, subscribe: 1 });
    return this.request({ ticks: symbol, subscribe: 1 });
  }

  async subscribeBalance() {
    this.subscriptions.push({ balance: 1, subscribe: 1 });
    return this.request({ balance: 1, subscribe: 1 });
  }

  async getActiveSymbols() {
    const response = await this.request({
      active_symbols: "brief",
      product_type: "basic",
      landing_company: "world",
    });
    if (response.error) {
      throw new Error(response.error.message || "Failed to load active symbols.");
    }
    return response.active_symbols || [];
  }

  async restoreSubscriptions() {
    for (const payload of this.subscriptions) {
      await this.request(payload);
    }
  }

  handleMessage(raw) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!parsed.req_id || !this.pendingRequests.has(parsed.req_id)) {
      return;
    }

    const pending = this.pendingRequests.get(parsed.req_id);
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(parsed.req_id);
    pending.resolve(parsed);
  }

  rejectPending(error) {
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.pendingRequests.clear();
  }

  close() {
    this.manualClose = true;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = { DerivConnection };
