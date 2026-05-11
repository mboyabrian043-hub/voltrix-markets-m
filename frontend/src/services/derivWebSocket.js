const DEFAULT_APP_ID = import.meta.env.VITE_DERIV_APP_ID || "";
const DEFAULT_API_TOKEN = import.meta.env.VITE_DERIV_API_TOKEN || "";
const BASE_WS_URL = "wss://ws.derivws.com/websockets/v3";

class DerivWebSocketService {
  constructor() {
    this.ws = null;
    this.status = "idle";
    this.manualClose = false;
    this.authFailed = false;
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
    this.maxReconnectDelay = 15000;
    this.requestId = 1;
    this.pendingRequests = new Map();
    this.subscriptionRegistry = new Map();
    this.subscriptionIdToKeys = new Map();

    this.listeners = {
      status: new Set(),
      error: new Set(),
      authorize: new Set(),
    };

    this.credentials = {
      appId: DEFAULT_APP_ID,
      apiToken: DEFAULT_API_TOKEN,
    };
  }

  buildUrl() {
    if (!this.credentials.appId) {
      throw new Error("VITE_DERIV_APP_ID is missing.");
    }
    return `${BASE_WS_URL}?app_id=${this.credentials.appId}`;
  }

  setCredentials({ appId, apiToken }) {
    if (appId) {
      this.credentials.appId = appId;
    }
    if (apiToken) {
      this.credentials.apiToken = apiToken;
    }
  }

  onStatusChange(callback) {
    this.listeners.status.add(callback);
    callback(this.status, this.reconnectAttempt);
    return () => this.listeners.status.delete(callback);
  }

  onError(callback) {
    this.listeners.error.add(callback);
    return () => this.listeners.error.delete(callback);
  }

  onAuthorize(callback) {
    this.listeners.authorize.add(callback);
    return () => this.listeners.authorize.delete(callback);
  }

  setStatus(status) {
    this.status = status;
    for (const listener of this.listeners.status) {
      listener(status, this.reconnectAttempt);
    }
  }

  emitError(error) {
    for (const listener of this.listeners.error) {
      listener(error);
    }
  }

  async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.manualClose = false;
    this.authFailed = false;
    this.setStatus(this.reconnectAttempt > 0 ? "reconnecting" : "connecting");

    this.ws = new WebSocket(this.buildUrl());

    this.ws.onopen = async () => {
      this.reconnectAttempt = 0;
      this.setStatus("connected");
      try {
        await this.authorize();
        await this.restoreSubscriptions();
      } catch (error) {
        this.emitError(error);
      }
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onerror = () => {
      this.emitError(new Error("Deriv WebSocket error."));
    };

    this.ws.onclose = () => {
      this.flushPendingRequests(new Error("WebSocket disconnected."));
      if (this.manualClose || this.authFailed) {
        this.setStatus(this.authFailed ? "auth_error" : "disconnected");
        return;
      }
      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.manualClose = true;
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
  }

  forceReconnect() {
    this.manualClose = false;
    if (this.ws) {
      this.ws.close();
    }
    this.scheduleReconnect(true);
  }

  scheduleReconnect(immediate = false) {
    this.clearReconnectTimer();
    this.reconnectAttempt += 1;
    const delay = immediate
      ? 0
      : Math.min(1000 * 2 ** (this.reconnectAttempt - 1), this.maxReconnectDelay);

    this.setStatus("reconnecting");
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => this.emitError(error));
    }, delay);
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  flushPendingRequests(error) {
    for (const { reject, timeout } of this.pendingRequests.values()) {
      clearTimeout(timeout);
      reject(error);
    }
    this.pendingRequests.clear();
  }

  send(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected.");
    }

    const reqId = this.requestId++;
    this.ws.send(JSON.stringify({ ...payload, req_id: reqId }));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(reqId);
        reject(new Error("Request timeout."));
      }, 15000);

      this.pendingRequests.set(reqId, { resolve, reject, timeout });
    });
  }

  async authorize() {
    if (!this.credentials.apiToken) {
      throw new Error("VITE_DERIV_API_TOKEN is missing.");
    }
    const response = await this.send({ authorize: this.credentials.apiToken });
    if (response.error) {
      this.handleApiError(response.error);
      throw new Error(response.error.message || "Authorization failed.");
    }

    for (const listener of this.listeners.authorize) {
      listener(response.authorize);
    }
    return response.authorize;
  }

  async getActiveSymbols() {
    const response = await this.send({
      active_symbols: "brief",
      product_type: "basic",
      landing_company: "world",
    });

    if (response.error) {
      this.handleApiError(response.error);
      throw new Error(response.error.message || "Failed to fetch active symbols.");
    }

    return response.active_symbols || [];
  }

  async subscribeTicks(symbol, callback) {
    const key = `ticks:${symbol}`;
    const existing = this.subscriptionRegistry.get(key);
    if (existing) {
      existing.callbacks.add(callback);
      return () => {
        existing.callbacks.delete(callback);
      };
    }

    const entry = {
      payload: { ticks: symbol, subscribe: 1 },
      callbacks: new Set([callback]),
      subscriptionId: null,
    };
    this.subscriptionRegistry.set(key, entry);

    if (this.ws?.readyState === WebSocket.OPEN) {
      await this.attachSubscription(key, entry);
    }

    return () => {
      const target = this.subscriptionRegistry.get(key);
      if (!target) {
        return;
      }
      target.callbacks.delete(callback);
      if (target.callbacks.size === 0) {
        this.subscriptionRegistry.delete(key);
      }
    };
  }

  async subscribeBalance(callback) {
    const key = "balance";
    const existing = this.subscriptionRegistry.get(key);
    if (existing) {
      existing.callbacks.add(callback);
      return () => {
        existing.callbacks.delete(callback);
      };
    }

    const entry = {
      payload: { balance: 1, subscribe: 1 },
      callbacks: new Set([callback]),
      subscriptionId: null,
    };
    this.subscriptionRegistry.set(key, entry);

    if (this.ws?.readyState === WebSocket.OPEN) {
      await this.attachSubscription(key, entry);
    }

    return () => {
      const target = this.subscriptionRegistry.get(key);
      if (!target) {
        return;
      }
      target.callbacks.delete(callback);
      if (target.callbacks.size === 0) {
        this.subscriptionRegistry.delete(key);
      }
    };
  }

  async restoreSubscriptions() {
    for (const [key, entry] of this.subscriptionRegistry.entries()) {
      entry.subscriptionId = null;
      await this.attachSubscription(key, entry);
    }
  }

  async attachSubscription(key, entry) {
    const response = await this.send(entry.payload);
    if (response.error) {
      this.handleApiError(response.error);
      return;
    }

    const subscriptionId = response.subscription?.id;
    if (!subscriptionId) {
      return;
    }
    entry.subscriptionId = subscriptionId;
    this.subscriptionIdToKeys.set(subscriptionId, key);

    this.dispatchSubscriptionEvent(key, response);
  }

  dispatchSubscriptionEvent(key, payload) {
    const entry = this.subscriptionRegistry.get(key);
    if (!entry) {
      return;
    }

    for (const callback of entry.callbacks) {
      callback(payload);
    }
  }

  handleApiError(error) {
    const details = new Error(error.message || "Deriv API error.");
    details.code = error.code;
    this.emitError(details);

    const isInvalidToken = error.code === "InvalidToken" || error.code === "AuthorizationRequired";
    if (isInvalidToken) {
      this.authFailed = true;
      this.manualClose = true;
      if (this.ws) {
        this.ws.close();
      }
      this.setStatus("auth_error");
    }
  }

  handleMessage(raw) {
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      this.emitError(new Error("Failed to parse Deriv WebSocket payload."));
      return;
    }

    if (payload.req_id && this.pendingRequests.has(payload.req_id)) {
      const pending = this.pendingRequests.get(payload.req_id);
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(payload.req_id);

      if (payload.error) {
        pending.reject(new Error(payload.error.message || "Deriv request failed."));
      } else {
        pending.resolve(payload);
      }
      return;
    }

    if (payload.error) {
      this.handleApiError(payload.error);
      return;
    }

    const subscriptionId = payload.subscription?.id;
    if (subscriptionId && this.subscriptionIdToKeys.has(subscriptionId)) {
      const key = this.subscriptionIdToKeys.get(subscriptionId);
      this.dispatchSubscriptionEvent(key, payload);
      return;
    }

    if (payload.msg_type === "balance") {
      this.dispatchSubscriptionEvent("balance", payload);
    }
  }
}

export const derivWebSocket = new DerivWebSocketService();
