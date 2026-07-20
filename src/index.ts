import axios, { AxiosInstance } from 'axios';
import type { components, operations } from './schema';

/** Default API base URL, used when none is supplied at construction. */
export const DEFAULT_BASE_URL = 'http://localhost:8080';

/** Options accepted by the {@link Recurso} constructor. */
export interface RecursoOptions {
    /** API base URL. Defaults to {@link DEFAULT_BASE_URL} when omitted. */
    baseUrl?: string;
}

/** Common list-endpoint query parameters (all optional, server-side). */
export interface ListParams {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    [key: string]: unknown;
}

/**
 * A JSON value returned by (or sent to) the API. The API speaks JSON, so any
 * payload or response is one of these shapes.
 */
export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

/** A JSON object body — the shape of every request payload and object response. */
export type JsonObject = { [key: string]: JsonValue };

/**
 * Generic API response. Used only as the fallback for endpoints the spec does
 * not model; typed endpoints resolve to their concrete resource shape instead.
 */
export type ApiResponse = JsonObject;

// --- Spec-derived types (generated from cmd/api/openapi.yaml into ./schema) ---
//
// Response and request shapes below are derived from the OpenAPI spec, the same
// source of truth the Python SDK is generated from. Regenerate `schema.d.ts`
// with `npm run generate` whenever the API changes so these can never drift.

/** Every resource/request model defined by the API, keyed by schema name. */
export type Schemas = components['schemas'];

// Ergonomic aliases for the resources these methods return, so callers can
// name them directly (e.g. `const s: Subscription = await ...`).
export type Customer = Schemas['Customer'];
export type Plan = Schemas['Plan'];
export type Price = Schemas['Price'];
export type Subscription = Schemas['Subscription'];
export type UnbilledCharge = Schemas['UnbilledCharge'];
export type SubscriptionUsage = Schemas['SubscriptionUsage'];
export type Invoice = Schemas['Invoice'];
export type Coupon = Schemas['Coupon'];
export type CreditNote = Schemas['CreditNote'];
export type Quote = Schemas['Quote'];
export type QuoteActionResponse = Schemas['QuoteActionResponse'];
export type WebhookEndpoint = Schemas['WebhookEndpoint'];
export type Event = Schemas['Event'];
export type EventDelivery = Schemas['EventDelivery'];
export type Mandate = Schemas['Mandate'];
export type Gift = Schemas['Gift'];
export type Referral = Schemas['Referral'];
export type MRRMetrics = Schemas['MRRMetrics'];
export type LedgerAccount = Schemas['LedgerAccount'];
export type LedgerTransaction = Schemas['LedgerTransaction'];
export type ChurnScoreResult = Schemas['ChurnScoreResult'];
export type Consent = Schemas['Consent'];
export type Tenant = Schemas['Tenant'];
export type BillableMetric = Schemas['BillableMetric'];
export type Charge = Schemas['Charge'];
export type ChargeAmounts = Schemas['ChargeAmounts'];
export type ChargeTier = Schemas['ChargeTier'];
export type UsageAmount = Schemas['UsageAmount'];
export type Wallet = Schemas['Wallet'];
export type WalletTransaction = Schemas['WalletTransaction'];
export type UsageAlert = Schemas['UsageAlert'];
export type AuditLog = Schemas['AuditLog'];
export type VirtualAccount = Schemas['VirtualAccount'];
export type OfflinePayment = Schemas['OfflinePayment'];
export type Organization = Schemas['Organization'];
export type OrgMRRMetrics = Schemas['OrgMRRMetrics'];
export type AccountingConnection = Schemas['AccountingConnection'];
export type AccountingSyncLog = Schemas['AccountingSyncLog'];
export type ChurnAlert = Schemas['ChurnAlert'];
export type CancelFlow = Schemas['CancelFlow'];
export type CancelFlowStep = Schemas['CancelFlowStep'];
export type CancelFlowSession = Schemas['CancelFlowSession'];
export type FlowStats = Schemas['FlowStats'];
export type DunningCampaign = Schemas['DunningCampaign'];
export type DunningCampaignStep = Schemas['DunningCampaignStep'];

/** The JSON body of an operation's success (2xx) response, per the spec. */
type SuccessJson<O> = O extends { responses: infer R }
    ? R extends { 200: { content: { 'application/json': infer B } } }
        ? B
        : R extends { 201: { content: { 'application/json': infer B } } }
          ? B
          : R extends { 202: { content: { 'application/json': infer B } } }
            ? B
            : ApiResponse
    : ApiResponse;

/** Response body type for a named operation. */
export type Res<K extends keyof operations> = SuccessJson<operations[K]>;

/** The JSON request body of an operation, if it defines one. */
type RequestJson<O> = O extends {
    requestBody?: { content: { 'application/json': infer B } };
}
    ? B
    : never;

/** Request body type for a named operation. */
export type Body<K extends keyof operations> = RequestJson<operations[K]>;

/** Payload for creating or updating a customer. */
export interface CustomerInput {
    email: string;
    name: string;
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    [key: string]: JsonValue | undefined;
}

/** Payload for creating a plan. */
export interface PlanInput {
    name: string;
    code: string;
    amount: number;
    currency: string;
    interval_unit: 'day' | 'week' | 'month' | 'year';
    interval_count?: number;
    [key: string]: JsonValue | undefined;
}

/** Payload for creating a subscription. */
export interface SubscriptionInput {
    customer_id: string;
    plan_id: string;
    coupon_code?: string;
    start_date?: string;
    payment_terms?: string;
    [key: string]: JsonValue | undefined;
}

/** Payload for creating a coupon. */
export interface CouponInput {
    code: string;
    discount_type: 'percent' | 'amount';
    discount_value: number;
    duration: 'forever' | 'once';
    [key: string]: JsonValue | undefined;
}

/** Payload for recording a metered usage event. */
export interface UsageEventInput {
    subscription_id: string;
    customer_id: string;
    dimension: string;
    quantity: number;
    /**
     * Optional free-form attributes (max 20; keys ≤100 chars, values ≤255).
     * The `unique` billable-metric aggregation counts distinct values of one
     * property (e.g. active users by `user_id`).
     */
    properties?: Record<string, string>;
    /**
     * Optional idempotency key (≤255 chars): a retried event with the same
     * (subscription, transaction_id) collapses to the original.
     */
    transaction_id?: string;
}

/** Payload for creating or updating a billable metric. */
export interface BillableMetricInput {
    name: string;
    /** Doubles as the usage event dimension; immutable after create. */
    code: string;
    aggregation_type: 'count' | 'sum' | 'max' | 'unique';
    /** Required for `unique` (the event property to count), forbidden otherwise. */
    field_name?: string;
}

/** One usage charge in a plan's charge set (PUT replace semantics). */
export interface ChargeInput {
    metric_id: string;
    charge_model: 'per_unit' | 'graduated' | 'volume' | 'package';
    /**
     * Pricing per ISO currency code. Rates (`unit_amount`) are decimal
     * strings in MAJOR currency units (e.g. "0.0035"); package/flat amounts
     * are integers in minor units.
     */
    amounts: Record<string, ChargeAmounts>;
    hsn_code?: string;
}

/** Query parameters for the time-windowed usage endpoint. */
export interface UsageQueryParams {
    subscription_id?: string;
    customer_id?: string;
    dimension?: string;
    from?: string;
    to?: string;
    granularity?: 'day' | 'month';
}

/** Payload for registering a webhook endpoint. */
export interface WebhookInput {
    url: string;
    event_types?: string[];
    [key: string]: JsonValue | undefined;
}

/** Query parameters for listing webhook deliveries. */
export interface WebhookDeliveriesParams {
    limit?: number;
    offset?: number;
    status?: 'pending' | 'succeeded' | 'failed';
}

/** Payload for redeeming a gift. */
export interface GiftRedeemInput {
    code: string;
    [key: string]: JsonValue | undefined;
}

/** A single entitlement in a plan's entitlement set. */
export interface Entitlement {
    feature_key: string;
    kind: 'boolean' | 'limit';
    bool_value?: boolean;
    limit_value?: number;
}

/** Query parameters for listing ledger entries. */
export interface LedgerEntriesParams {
    account_id?: string;
    [key: string]: JsonValue | undefined;
}

/**
 * Official Node.js SDK for the Recurso billing API.
 *
 * Method coverage mirrors the REST surface: list endpoints accept filter
 * params, mutations are grouped per resource, and lifecycle actions
 * (cancel, pause, resume, ...) live on their resource. Return types are
 * derived from the OpenAPI spec, so responses carry full field-level types.
 */
export class Recurso {
    private client: AxiosInstance;

    /**
     * @param apiKey  API key used for Bearer authentication.
     * @param options Client options. Pass `{ baseUrl }` to target a specific
     *                environment; a bare string is also accepted for backward
     *                compatibility. Defaults to {@link DEFAULT_BASE_URL}.
     */
    constructor(apiKey: string, options: string | RecursoOptions = {}) {
        const baseURL =
            (typeof options === 'string' ? options : options.baseUrl) ?? DEFAULT_BASE_URL;
        this.client = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    private get = async <T = ApiResponse>(path: string, params?: object): Promise<T> =>
        (await this.client.get<T>(path, { params })).data;
    private post = async <T = ApiResponse>(path: string, data?: unknown): Promise<T> =>
        (await this.client.post<T>(path, data)).data;
    private put = async <T = ApiResponse>(path: string, data?: unknown): Promise<T> =>
        (await this.client.put<T>(path, data)).data;
    private del = async <T = ApiResponse>(path: string): Promise<T> =>
        (await this.client.delete<T>(path)).data;

    public account = {
        get: () => this.get<Res<'getAccount'>>('/v1/account'),
        update: (data: Body<'updateAccount'>) =>
            this.put<Res<'updateAccount'>>('/v1/account', data),
    };

    public customers = {
        create: (data: CustomerInput) =>
            this.post<Res<'createCustomer'>>('/v1/customers', { country: 'US', ...data }),
        list: (params?: ListParams) => this.get<Res<'listCustomers'>>('/v1/customers', params),
        get: (id: string) => this.get<Res<'getCustomer'>>(`/v1/customers/${id}`),
        /**
         * Partial update — omitted fields are left unchanged. Set
         * `active: false` to archive (see {@link archive}) and `true` to
         * restore an archived customer.
         */
        update: (id: string, data: Body<'updateCustomer'>) =>
            this.put<Res<'updateCustomer'>>(`/v1/customers/${id}`, data),
        /**
         * Archive a customer. Refused while the customer has active
         * subscriptions (cancel or pause them first). Archived customers
         * keep full billing history; restore with `update(id, {active: true})`.
         */
        archive: (id: string) =>
            this.put<Res<'updateCustomer'>>(`/v1/customers/${id}`, { active: false }),
        updatePaymentMethod: (id: string, data: Body<'updateCustomerPaymentMethod'>) =>
            this.put<Res<'updateCustomerPaymentMethod'>>(
                `/v1/customers/${id}/payment-method`,
                data,
            ),
        churn: (id: string) => this.get<Res<'getCustomerChurn'>>(`/v1/customers/${id}/churn`),
        consents: (id: string) =>
            this.get<Res<'listCustomerConsents'>>(`/v1/customers/${id}/consents`),
    };

    public plans = {
        create: (data: PlanInput) =>
            this.post<Res<'createPlan'>>('/v1/plans', { interval_count: 1, ...data }),
        list: (params?: ListParams) => this.get<Res<'listPlans'>>('/v1/plans', params),
        get: (id: string) => this.get<Res<'getPlan'>>(`/v1/plans/${id}`),
        /**
         * Partial update of mutable plan fields — omitted fields are left
         * unchanged. The plan's price/amount is a separate versioned entity
         * and is not editable here. Set `active: false` to archive (see
         * {@link archive}) and `true` to restore.
         */
        update: (id: string, data: Body<'updatePlan'>) =>
            this.put<Res<'updatePlan'>>(`/v1/plans/${id}`, data),
        /**
         * Archive a plan: hides it from new subscriptions without affecting
         * existing ones. Restore with `update(id, {active: true})`.
         */
        archive: (id: string) => this.put<Res<'updatePlan'>>(`/v1/plans/${id}`, { active: false }),
        /**
         * Replace a plan's full usage-charge set (PUT semantics: charges
         * absent from the list are removed). Flat plan prices are untouched —
         * a plan holding both is hybrid: flat fee in advance, usage in
         * arrears on the same renewal invoice.
         */
        setCharges: (planId: string, charges: ChargeInput[]) =>
            this.put<Res<'setPlanCharges'>>(`/v1/plans/${planId}/charges`, charges),
        getCharges: (planId: string) =>
            this.get<Res<'getPlanCharges'>>(`/v1/plans/${planId}/charges`),
    };

    public subscriptions = {
        create: (data: SubscriptionInput) =>
            this.post<Res<'createSubscription'>>('/v1/subscriptions', data),
        list: (params?: ListParams) =>
            this.get<Res<'listSubscriptions'>>('/v1/subscriptions', params),
        update: (id: string, data: Body<'updateSubscription'>) =>
            this.put<Res<'updateSubscription'>>(`/v1/subscriptions/${id}`, data),
        /**
         * Preview switching this subscription to another plan without applying
         * it — returns the proration credit/charge breakdown (`PlanChangePreview`).
         */
        previewChange: (id: string, planId: string) =>
            this.get<Res<'previewPlanChange'>>(`/v1/subscriptions/${id}/preview-change`, {
                plan_id: planId,
            }),
        cancel: (id: string, data?: Body<'cancelSubscription'>) =>
            this.post<Res<'cancelSubscription'>>(`/v1/subscriptions/${id}/cancel`, data),
        pause: (id: string, data?: Body<'pauseSubscription'>) =>
            this.post<Res<'pauseSubscription'>>(`/v1/subscriptions/${id}/pause`, data),
        resume: (id: string) =>
            this.post<Res<'resumeSubscription'>>(`/v1/subscriptions/${id}/resume`),
        reactivate: (id: string) =>
            this.post<Res<'reactivateSubscription'>>(`/v1/subscriptions/${id}/reactivate`),
        /** Bill N future periods immediately (advance invoicing). */
        advance: (id: string, data: Body<'generateAdvanceInvoice'>) =>
            this.post<Res<'generateAdvanceInvoice'>>(`/v1/subscriptions/${id}/advance`, data),
        charges: (id: string) =>
            this.get<Res<'listUnbilledCharges'>>(`/v1/subscriptions/${id}/charges`),
        addCharge: (id: string, data: Body<'addUnbilledCharge'>) =>
            this.post<Res<'addUnbilledCharge'>>(`/v1/subscriptions/${id}/charges`, data),
        /**
         * Current billing period's usage per dimension plus lifetime
         * totals, with the customer's entitlement limit/remaining joined
         * in where a feature_key matches the dimension name.
         */
        usage: (id: string) =>
            this.get<Res<'getSubscriptionUsage'>>(`/v1/subscriptions/${id}/usage`),
        /**
         * Live usage-amount preview: what the current period's metered usage
         * would rate to if invoiced now, per charge, in minor currency units.
         * Includes commitment_amount and projected_true_up when set.
         */
        usageAmount: (id: string) =>
            this.get<Res<'getSubscriptionUsageAmount'>>(`/v1/subscriptions/${id}/usage-amount`),
        /**
         * Set the per-period minimum (minor units): shortfalls bill a
         * true-up line at period close. Amount 0 clears it.
         */
        setCommitment: (id: string, amount: number) =>
            this.put<Res<'setSubscriptionCommitment'>>(`/v1/subscriptions/${id}/commitment`, {
                amount,
            }),
    };

    public invoices = {
        list: (params?: ListParams) => this.get<Res<'listInvoices'>>('/v1/invoices', params),
        /** Public PDF download URL for an invoice. */
        pdfUrl: (id: string) => `${this.client.defaults.baseURL}/v1/invoices/${id}/pdf`,
        eInvoiceStatus: (id: string) =>
            this.get<Res<'getEInvoiceStatus'>>(`/v1/invoices/${id}/einvoice`),
        retryEInvoice: (id: string) =>
            this.post<Res<'retryEInvoice'>>(`/v1/invoices/${id}/einvoice/retry`),
        cancelEInvoice: (id: string, data?: Body<'cancelEInvoice'>) =>
            this.post<Res<'cancelEInvoice'>>(`/v1/invoices/${id}/einvoice/cancel`, data),
    };

    public coupons = {
        create: (data: CouponInput) => this.post<Res<'createCoupon'>>('/v1/coupons', data),
        list: (params?: ListParams) => this.get<Res<'listCoupons'>>('/v1/coupons', params),
        /**
         * Flip the redemption gate: `{active: false}` stops new
         * subscriptions from redeeming the code (existing subscriptions
         * keep their applied discount); `{active: true}` restores it.
         */
        update: (id: string, data: Body<'updateCoupon'>) =>
            this.put<Res<'updateCoupon'>>(`/v1/coupons/${id}`, data),
        /** Restore redeemability of a deactivated coupon. */
        activate: (id: string) =>
            this.put<Res<'updateCoupon'>>(`/v1/coupons/${id}`, { active: true }),
        /** Stop new redemptions; existing subscriptions keep their discount. */
        deactivate: (id: string) =>
            this.put<Res<'updateCoupon'>>(`/v1/coupons/${id}`, { active: false }),
    };

    public usage = {
        /** Record a metered usage event against a subscription. */
        record: (data: UsageEventInput) =>
            this.post<Res<'recordUsageEvent'>>('/v1/usage/events', data),
        /**
         * Time-windowed usage buckets: {data: [{period, dimension,
         * quantity}], from, to, granularity}. At least one of
         * subscription_id or customer_id is required; the window defaults
         * to the last 30 days at day granularity.
         */
        query: (params: UsageQueryParams) => this.get<Res<'queryUsage'>>('/v1/usage', params),
        /** The tenant's dimension catalog with first/last seen and event counts. */
        dimensions: () => this.get<Res<'listUsageDimensions'>>('/v1/usage/dimensions'),
        /**
         * Batch-record up to 500 events with per-item results. Events with
         * a transaction_id are idempotent (duplicates collapse).
         */
        recordBatch: (events: UsageEventInput[]) =>
            this.post<Res<'recordUsageEventsBatch'>>('/v1/usage/events/batch', { events }),
    };

    public wallets = {
        /** Create a prepaid wallet (one per customer+currency). */
        create: (data: Body<'createWallet'>) =>
            this.post<Res<'createWallet'>>('/v1/wallets', data),
        get: (id: string) => this.get<Res<'getWallet'>>(`/v1/wallets/${id}`),
        /** A customer's wallets across currencies. */
        forCustomer: (customerId: string) =>
            this.get<Res<'listCustomerWallets'>>(`/v1/customers/${customerId}/wallets`),
        /**
         * Add balance: source "manual" records money already received;
         * "promotional" grants credit (optionally expiring). Amounts are
         * minor units.
         */
        topUp: (id: string, data: Body<'topUpWallet'>) =>
            this.post<Res<'topUpWallet'>>(`/v1/wallets/${id}/top-up`, data),
        transactions: (id: string, params?: { limit?: number }) =>
            this.get<Res<'listWalletTransactions'>>(`/v1/wallets/${id}/transactions`, params),
        /** Set (both fields) or clear (both null) the auto-recharge rule. */
        setAutoRecharge: (id: string, data: Body<'updateWalletAutoRecharge'>) =>
            this.put<Res<'updateWalletAutoRecharge'>>(`/v1/wallets/${id}/auto-recharge`, data),
    };

    public usageAlerts = {
        /**
         * Threshold on a metric: fires once per billing period via the
         * usage.alert.triggered webhook event + email.
         */
        create: (data: Body<'createUsageAlert'>) =>
            this.post<Res<'createUsageAlert'>>('/v1/usage-alerts', data),
        list: (params?: { subscription_id?: string }) =>
            this.get<Res<'listUsageAlerts'>>('/v1/usage-alerts', params),
        delete: (id: string) => this.del<Res<'deleteUsageAlert'>>(`/v1/usage-alerts/${id}`),
    };

    public auditLogs = {
        /** The append-only config audit trail, newest first. */
        list: (params?: {
            entity_type?: string;
            entity_id?: string;
            actor?: string;
            from?: string;
            to?: string;
            limit?: number;
            offset?: number;
        }) => this.get<Res<'listAuditLogs'>>('/v1/audit-logs', params),
    };

    public billableMetrics = {
        /**
         * Create a tenant-defined meter over usage events. `code` doubles as
         * the event dimension it aggregates (count | sum | max | unique).
         */
        create: (data: BillableMetricInput) =>
            this.post<Res<'createBillableMetric'>>('/v1/billable-metrics', data),
        list: () => this.get<Res<'listBillableMetrics'>>('/v1/billable-metrics'),
        get: (id: string) =>
            this.get<Res<'getBillableMetric'>>(`/v1/billable-metrics/${id}`),
        /** Update name/aggregation/field. `code` is immutable. */
        update: (id: string, data: BillableMetricInput) =>
            this.put<Res<'updateBillableMetric'>>(`/v1/billable-metrics/${id}`, data),
        /** Delete a metric (409 while a plan charge references it). */
        delete: (id: string) =>
            this.del<Res<'deleteBillableMetric'>>(`/v1/billable-metrics/${id}`),
    };

    public creditNotes = {
        create: (data: Body<'createCreditNote'>) =>
            this.post<Res<'createCreditNote'>>('/v1/credit-notes', data),
        list: (params?: ListParams) =>
            this.get<Res<'listCreditNotes'>>('/v1/credit-notes', params),
    };

    public quotes = {
        create: (data: Body<'createQuote'>) => this.post<Res<'createQuote'>>('/v1/quotes', data),
        list: (params?: ListParams) => this.get<Res<'listQuotes'>>('/v1/quotes', params),
        get: (id: string) => this.get<Res<'getQuote'>>(`/v1/quotes/${id}`),
        update: (id: string, data: Body<'updateQuote'>) =>
            this.put<Res<'updateQuote'>>(`/v1/quotes/${id}`, data),
        send: (id: string) => this.post<Res<'sendQuote'>>(`/v1/quotes/${id}/send`),
        accept: (id: string) => this.post<Res<'acceptQuote'>>(`/v1/quotes/${id}/accept`),
        decline: (id: string) => this.post<Res<'declineQuote'>>(`/v1/quotes/${id}/decline`),
        /** Convert an accepted quote into a subscription. */
        convert: (id: string) =>
            this.post<Res<'convertQuoteToInvoice'>>(`/v1/quotes/${id}/convert`),
        delete: (id: string) => this.del<Res<'deleteQuote'>>(`/v1/quotes/${id}`),
    };

    public webhooks = {
        /** Register an endpoint to receive event deliveries. */
        create: (data: WebhookInput) =>
            this.post<Res<'createWebhookEndpoint'>>('/v1/webhooks', data),
        list: () => this.get<Res<'listWebhookEndpoints'>>('/v1/webhooks'),
        delete: (id: string) => this.del<Res<'deleteWebhookEndpoint'>>(`/v1/webhooks/${id}`),
        /**
         * Pause deliveries to an endpoint. Paused ("inactive") endpoints
         * stop receiving deliveries but keep their secret and configuration.
         */
        pause: (id: string) =>
            this.put<Res<'updateWebhookEndpointStatus'>>(`/v1/webhooks/${id}/status`, {
                status: 'inactive',
            }),
        /** Resume deliveries to a paused endpoint. */
        resume: (id: string) =>
            this.put<Res<'updateWebhookEndpointStatus'>>(`/v1/webhooks/${id}/status`, {
                status: 'active',
            }),
        /**
         * Recent delivery attempts to an endpoint, newest first. Filter by
         * derived status (pending | succeeded | failed) and paginate with
         * limit/offset.
         */
        deliveries: (id: string, params?: WebhookDeliveriesParams) =>
            this.get<Res<'listWebhookEndpointDeliveries'>>(
                `/v1/webhooks/${id}/deliveries`,
                params,
            ),
    };

    public events = {
        list: (params?: ListParams) => this.get<Res<'listEvents'>>('/v1/events', params),
        types: () => this.get<Res<'listEventTypes'>>('/v1/events/types'),
        /** Delivery attempts of an event across all webhook endpoints. */
        deliveries: (id: string) =>
            this.get<Res<'listEventDeliveries'>>(`/v1/events/${id}/deliveries`),
        /**
         * Re-enqueue delivery of an event to every active subscribed
         * endpoint (202: {event_id, deliveries_queued}). Idempotent.
         */
        redeliver: (id: string) => this.post<Res<'redeliverEvent'>>(`/v1/events/${id}/redeliver`),
    };

    public mandates = {
        create: (data: Body<'createMandate'>) =>
            this.post<Res<'createMandate'>>('/v1/mandates', data),
        list: (params?: ListParams) => this.get<Res<'listMandates'>>('/v1/mandates', params),
        get: (id: string) => this.get<Res<'getMandate'>>(`/v1/mandates/${id}`),
        revoke: (id: string) => this.post<Res<'revokeMandate'>>(`/v1/mandates/${id}/revoke`),
    };

    public gifts = {
        purchase: (data: Body<'purchaseGift'>) =>
            this.post<Res<'purchaseGift'>>('/v1/gifts/purchase', data),
        redeem: (data: GiftRedeemInput) => this.post<Res<'redeemGift'>>('/v1/gifts/redeem', data),
        list: (params?: ListParams) => this.get<Res<'listGifts'>>('/v1/gifts', params),
    };

    public referrals = {
        create: (data: Body<'createReferral'>) =>
            this.post<Res<'createReferral'>>('/v1/referrals', data),
        list: (params?: ListParams) => this.get<Res<'listReferrals'>>('/v1/referrals', params),
        generateCode: (data: Body<'generateReferralCode'>) =>
            this.post<Res<'generateReferralCode'>>('/v1/referrals/generate-code', data),
        qualify: (id: string) =>
            this.post<Res<'qualifyReferral'>>(`/v1/referrals/${id}/qualify`),
    };

    public entitlements = {
        /**
         * Replace a plan's full entitlement set (PUT semantics: feature
         * keys absent from the list are removed).
         */
        setForPlan: (planId: string, list: Entitlement[]) =>
            this.put<Res<'setPlanEntitlements'>>(`/v1/plans/${planId}/entitlements`, list),
        getForPlan: (planId: string) =>
            this.get<Res<'getPlanEntitlements'>>(`/v1/plans/${planId}/entitlements`),
        /**
         * Effective entitlements for a customer: the union over the plans
         * of their active/trialing subscriptions (boolean: any-true wins;
         * limit: max across plans).
         */
        forCustomer: (customerId: string) =>
            this.get<Res<'getCustomerEntitlements'>>(`/v1/customers/${customerId}/entitlements`),
        /** Fast single-feature check: {feature_key, granted, limit_value}. */
        check: (customerId: string, feature: string) =>
            this.get<Res<'checkEntitlement'>>('/v1/entitlements/check', {
                customer_id: customerId,
                feature,
            }),
    };

    public analytics = {
        /**
         * Monthly recurring revenue, FX-normalized to the tenant's reporting
         * currency: {mrr, normalized_mrr, reporting_currency, breakdown[],
         * fx: {rates, source, as_of}}.
         */
        mrr: () => this.get<Res<'getMRR'>>('/v1/analytics/mrr'),
    };

    public ledger = {
        accounts: () => this.get<Res<'listLedgerAccounts'>>('/v1/ledger/accounts'),
        entries: (params?: LedgerEntriesParams) =>
            this.get<Res<'listLedgerEntries'>>('/v1/ledger/entries', params),
    };

    public organizations = {
        create: (data: Body<'createOrganization'>) =>
            this.post<Res<'createOrganization'>>('/v1/organizations', data),
        list: () => this.get<Res<'listOrganizations'>>('/v1/organizations'),
        get: (id: string) => this.get<Res<'getOrganization'>>(`/v1/organizations/${id}`),
        update: (id: string, data: Body<'updateOrganization'>) =>
            this.put<Res<'updateOrganization'>>(`/v1/organizations/${id}`, data),
        delete: (id: string) => this.del<Res<'deleteOrganization'>>(`/v1/organizations/${id}`),
        /** Attach a tenant to the organization. */
        addTenant: (id: string, tenantId: string) =>
            this.post<Res<'addOrganizationTenant'>>(`/v1/organizations/${id}/tenants`, {
                tenant_id: tenantId,
            }),
        tenants: (id: string) =>
            this.get<Res<'listOrganizationTenants'>>(`/v1/organizations/${id}/tenants`),
        removeTenant: (id: string, tenantId: string) =>
            this.del<Res<'removeOrganizationTenant'>>(
                `/v1/organizations/${id}/tenants/${tenantId}`,
            ),
        /** Consolidated MRR across the organization's tenants, by currency and tenant. */
        mrr: (id: string) =>
            this.get<Res<'getOrganizationMRR'>>(`/v1/organizations/${id}/analytics/mrr`),
    };

    public accounting = {
        /** Accounting connections for the tenant (OAuth tokens are never serialized). */
        connections: () =>
            this.get<Res<'listAccountingConnections'>>('/v1/accounting/connections'),
        /**
         * Connect a token-based provider outside the browser OAuth flow.
         * `netsuite` requires `{account_id, access_token}` (SuiteTalk OAuth
         * 2.0); `tally` takes no credentials — it enables the local JSONL
         * export sync.
         */
        connectToken: (
            provider: 'netsuite' | 'tally',
            data?: Body<'connectAccountingProviderToken'>,
        ) =>
            this.post<Res<'connectAccountingProviderToken'>>(
                `/v1/accounting/connect-token/${provider}`,
                data,
            ),
        disconnect: (id: string) =>
            this.del<Res<'disconnectAccounting'>>(`/v1/accounting/connections/${id}`),
        /** Trigger a sync to connected accounting systems. */
        sync: () => this.post<Res<'triggerAccountingSync'>>('/v1/accounting/sync'),
        syncStatus: () => this.get<Res<'getAccountingSyncStatus'>>('/v1/accounting/sync/status'),
    };

    public virtualAccounts = {
        /**
         * Provision a virtual bank account (via Razorpay) that the customer
         * can wire money to. `amount` is the expected amount in minor units.
         */
        create: (data: Body<'createVirtualAccount'>) =>
            this.post<Res<'createVirtualAccount'>>('/v1/virtual-accounts', data),
        list: () => this.get<Res<'listVirtualAccounts'>>('/v1/virtual-accounts'),
    };

    public offlinePayments = {
        /**
         * Manually record a bank transfer, cash, or cheque payment
         * (optionally against an invoice). Amounts are minor units.
         */
        record: (data: Body<'recordOfflinePayment'>) =>
            this.post<Res<'recordOfflinePayment'>>('/v1/payments/offline', data),
        list: () => this.get<Res<'listOfflinePayments'>>('/v1/payments/offline'),
    };

    public churn = {
        /** Customers at or above a churn-score threshold (default 70). */
        highRisk: (params?: { threshold?: number }) =>
            this.get<Res<'listHighRiskCustomers'>>('/v1/churn/high-risk', params),
        /** Up to 100 unacknowledged churn alerts, newest first. */
        alerts: () => this.get<Res<'listChurnAlerts'>>('/v1/churn/alerts'),
        acknowledgeAlert: (id: string) =>
            this.post<Res<'acknowledgeChurnAlert'>>(`/v1/churn/alerts/${id}/ack`),
    };

    public cancelFlows = {
        create: (data: Body<'createCancelFlow'>) =>
            this.post<Res<'createCancelFlow'>>('/v1/cancel-flows', data),
        list: () => this.get<Res<'listCancelFlows'>>('/v1/cancel-flows'),
        /** Retrieve a cancel flow with its steps. */
        get: (id: string) => this.get<Res<'getCancelFlow'>>(`/v1/cancel-flows/${id}`),
        update: (id: string, data: Body<'updateCancelFlow'>) =>
            this.put<Res<'updateCancelFlow'>>(`/v1/cancel-flows/${id}`, data),
        addStep: (flowId: string, data: Body<'createCancelFlowStep'>) =>
            this.post<Res<'createCancelFlowStep'>>(`/v1/cancel-flows/${flowId}/steps`, data),
        updateStep: (stepId: string, data: Body<'updateCancelFlowStep'>) =>
            this.put<Res<'updateCancelFlowStep'>>(`/v1/cancel-flows/steps/${stepId}`, data),
        deleteStep: (stepId: string) =>
            this.del<Res<'deleteCancelFlowStep'>>(`/v1/cancel-flows/steps/${stepId}`),
        /**
         * Begin the tenant's default flow for a customer/subscription.
         * Rejected while the customer's offer cooldown is active.
         */
        startSession: (data: Body<'startCancelFlowSession'>) =>
            this.post<Res<'startCancelFlowSession'>>('/v1/cancel-flows/sessions/start', data),
        getSession: (id: string) =>
            this.get<Res<'getCancelFlowSession'>>(`/v1/cancel-flows/sessions/${id}`),
        /** Submit a step response; the result indicates the next step or completion. */
        submitStep: (sessionId: string, data: Body<'submitCancelFlowStep'>) =>
            this.post<Res<'submitCancelFlowStep'>>(
                `/v1/cancel-flows/sessions/${sessionId}/submit`,
                data,
            ),
        /** Aggregated save/churn statistics for a flow. */
        stats: (flowId: string) =>
            this.get<Res<'getCancelFlowStats'>>('/v1/cancel-flows/stats', { flow_id: flowId }),
    };

    public dunningCampaigns = {
        create: (data: Body<'createDunningCampaign'>) =>
            this.post<Res<'createDunningCampaign'>>('/v1/dunning-campaigns', data),
        list: () => this.get<Res<'listDunningCampaigns'>>('/v1/dunning-campaigns'),
        /** Retrieve a dunning campaign with its steps. */
        get: (id: string) => this.get<Res<'getDunningCampaign'>>(`/v1/dunning-campaigns/${id}`),
        update: (id: string, data: Body<'updateDunningCampaign'>) =>
            this.put<Res<'updateDunningCampaign'>>(`/v1/dunning-campaigns/${id}`, data),
        addStep: (campaignId: string, data: Body<'createDunningCampaignStep'>) =>
            this.post<Res<'createDunningCampaignStep'>>(
                `/v1/dunning-campaigns/${campaignId}/steps`,
                data,
            ),
        updateStep: (stepId: string, data: Body<'updateDunningCampaignStep'>) =>
            this.put<Res<'updateDunningCampaignStep'>>(
                `/v1/dunning-campaigns/steps/${stepId}`,
                data,
            ),
        deleteStep: (stepId: string) =>
            this.del<Res<'deleteDunningCampaignStep'>>(`/v1/dunning-campaigns/steps/${stepId}`),
    };
}
