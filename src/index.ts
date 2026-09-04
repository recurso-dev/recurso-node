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
    offset?: number;
    q?: string;
    status?: string;
    [key: string]: unknown;
}

/** Subscription list filters (all server-side). */
export interface SubscriptionListParams extends ListParams {
    /** Filter to one plan's subscriptions. */
    plan_id?: string;
    /** Filter to one customer's subscriptions. */
    customer_id?: string;
    /** Keep subscriptions whose current period started at/after this RFC 3339 instant. */
    started_after?: string;
}

/** Invoice list filters (all server-side). */
export interface InvoiceListParams extends ListParams {
    /** Filter to one customer's invoices. */
    customer_id?: string;
    /** Filter to one subscription's invoices. Ignored when customer_id is also set. */
    subscription_id?: string;
}

/** Plan list filters (all server-side). */
export interface PlanListParams extends ListParams {
    /** Keep plans that have a price in this currency (e.g. "USD"). */
    currency?: string;
    /** Filter by billing interval unit (e.g. "month", "year"). */
    interval_unit?: string;
}

/** Event feed filters (all server-side). */
export interface EventListParams extends ListParams {
    /** Filter to one event type (e.g. "invoice.paid"); `events.types()` lists the catalog. */
    type?: string;
    /** Filter to one object's events — the per-object timeline. Takes precedence over `type`. */
    object_id?: string;
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
    /**
     * Optional per-event exact price in minor units (non-negative). A
     * `dynamic` charge bills the sum of these over the period.
     */
    dynamic_amount?: number;
}

/** Payload for creating or updating a billable metric. */
export interface BillableMetricInput {
    name: string;
    /** Doubles as the usage event dimension; immutable after create. */
    code: string;
    aggregation_type:
        | 'count'
        | 'sum'
        | 'max'
        | 'unique'
        | 'latest'
        | 'percentile'
        /** Time-weighted average of a running level from per-event signed deltas. */
        | 'weighted_sum'
        /** Per-event expression (see `expression`), summed over the period. */
        | 'custom';
    /**
     * Required for `unique` (the event property to count) and `percentile`
     * (the percentile 1-99), forbidden otherwise.
     */
    field_name?: string;
    /**
     * Required for `custom`: a sandboxed per-event formula over `quantity` and
     * numeric `properties.*` (e.g. `quantity * properties.multiplier`), summed
     * over the period. Forbidden for every other aggregation.
     */
    expression?: string;
}

/** One usage charge in a plan's charge set (PUT replace semantics). */
export interface ChargeInput {
    metric_id: string;
    charge_model:
        | 'per_unit'
        | 'graduated'
        | 'volume'
        | 'package'
        | 'percentage'
        | 'graduated_percentage'
        | 'dynamic';
    /**
     * Pricing per ISO currency code. Rates (`unit_amount`) are decimal
     * strings in MAJOR currency units (e.g. "0.0035"); package/flat amounts
     * are integers in minor units. `percentage` uses `rate` + optional
     * fixed_amount/free_units/min_amount/max_amount; `dynamic` carries no
     * pricing (the price is supplied per event as dynamic_amount).
     */
    amounts: Record<string, ChargeAmounts>;
    /**
     * Rate the charge per usage event at ingestion time (captured as an
     * unbilled charge, folded onto the next invoice) instead of at period
     * close. Only per_unit/percentage/dynamic may set it.
     */
    pay_in_advance?: boolean;
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

/** Payment-attempt log filters (all server-side). */
export interface PaymentAttemptListParams {
    status?: 'initiated' | 'processing' | 'succeeded' | 'failed' | 'returned';
    /** Substring search on invoice number or gateway reference; ignores `status`. */
    q?: string;
    page?: number;
    per_page?: number;
}

/** A calendar month, optionally scoped to one legal entity. */
export interface PeriodParams {
    /** 1-12. */
    month: number;
    year: number;
    entity_id?: string;
}

/** Trial-balance scoping: one entity, or every entity rolled up by account code. */
export interface TrialBalanceParams {
    entity_id?: string;
    consolidated?: boolean;
}

/** General-ledger CSV export scoping; pass `month` and `year` together for one period. */
export interface LedgerExportParams {
    entity_id?: string;
    month?: number;
    year?: number;
}

/** MRR waterfall window (ISO dates); defaults to the trailing month. */
export interface MRRWaterfallParams {
    start?: string;
    end?: string;
    entity_id?: string;
}

/** US sales-tax liability period: `from`+`to` (to exclusive) or `year`. */
export interface TaxLiabilityParams {
    year?: number;
    from?: string;
    to?: string;
}

/** Query parameters of the accounting OAuth redirect target. */
export interface AccountingCallbackParams {
    code: string;
    state: string;
    /** QuickBooks company id, sent by Intuit on the redirect. */
    realmId?: string;
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
    private patch = async <T = ApiResponse>(path: string, data?: unknown): Promise<T> =>
        (await this.client.patch<T>(path, data)).data;
    private del = async <T = ApiResponse>(path: string): Promise<T> =>
        (await this.client.delete<T>(path)).data;
    /** GET a non-JSON document (HTML/CSV/plain text) as a string. */
    private getText = async (path: string, params?: object): Promise<string> =>
        (await this.client.get<string>(path, { params, responseType: 'text' })).data;

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
        /**
         * The customer's account-credit statement: spendable balances,
         * grants, invoice draw-downs, and a per-currency rollup.
         */
        creditStatement: (id: string) =>
            this.get<Res<'getCreditStatement'>>(`/v1/customers/${id}/credit-statement`),
        /** Lifetime billed/paid/outstanding totals and credit balance for one customer. */
        financialSummary: (id: string) =>
            this.get<Res<'getCustomerFinancialSummary'>>(`/v1/customers/${id}/financial-summary`),
    };

    public plans = {
        create: (data: PlanInput) =>
            this.post<Res<'createPlan'>>('/v1/plans', { interval_count: 1, ...data }),
        list: (params?: PlanListParams) => this.get<Res<'listPlans'>>('/v1/plans', params),
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
        /**
         * Rate a PROPOSED charge set against sample usage (read-only): rated
         * lines, subtotal, and a balanced ledger preview. Nothing is persisted.
         */
        simulateCharges: (planId: string, data: Body<'simulateCharges'>) =>
            this.post<Res<'simulateCharges'>>(`/v1/plans/${planId}/simulate-charges`, data),
    };

    public subscriptions = {
        create: (data: SubscriptionInput) =>
            this.post<Res<'createSubscription'>>('/v1/subscriptions', data),
        list: (params?: SubscriptionListParams) =>
            this.get<Res<'listSubscriptions'>>('/v1/subscriptions', params),
        get: (id: string) => this.get<Res<'getSubscription'>>(`/v1/subscriptions/${id}`),
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
        /** Attach a plan as a priced add-on (quantity × add-on price from the next invoice). */
        addAddon: (id: string, data: Body<'addSubscriptionAddon'>) =>
            this.post<Res<'addSubscriptionAddon'>>(`/v1/subscriptions/${id}/addons`, data),
        addons: (id: string) =>
            this.get<Res<'listSubscriptionAddons'>>(`/v1/subscriptions/${id}/addons`),
        /** Detach an add-on; takes effect from the next recurring invoice. */
        removeAddon: (id: string, addonId: string) =>
            this.del<Res<'removeSubscriptionAddon'>>(`/v1/subscriptions/${id}/addons/${addonId}`),
        /**
         * Bill accrued progressive usage now (interim invoice) once the
         * threshold is reached; `data: null` when nothing is due.
         */
        billUsageNow: (id: string) =>
            this.post<Res<'billUsageNow'>>(`/v1/subscriptions/${id}/bill-usage`),
        /** Deterministic financial forecast of a cancel, before mutating anything. */
        cancelPreview: (id: string, params?: { immediately?: boolean }) =>
            this.get<Res<'getSubscriptionCancelPreview'>>(
                `/v1/subscriptions/${id}/cancel-preview`,
                params,
            ),
        /** The consent record tied to a subscription. */
        consent: (id: string) =>
            this.get<Res<'getSubscriptionConsent'>>(`/v1/subscriptions/${id}/consent`),
        financialSummary: (id: string) =>
            this.get<Res<'getSubscriptionFinancialSummary'>>(
                `/v1/subscriptions/${id}/financial-summary`,
            ),
        /** Every status transition and plan switch, oldest first (trigger-captured). */
        history: (id: string) =>
            this.get<Res<'getSubscriptionHistory'>>(`/v1/subscriptions/${id}/history`),
        /** The catalog of cancellation reasons a cancel may cite. */
        cancellationReasons: () =>
            this.get<Res<'listCancellationReasons'>>('/v1/cancellation-reasons'),
    };

    public invoices = {
        list: (params?: InvoiceListParams) => this.get<Res<'listInvoices'>>('/v1/invoices', params),
        /** One invoice, tenant-scoped; a foreign or missing id is a flat 404. */
        get: (id: string) => this.get<Res<'getInvoice'>>(`/v1/invoices/${id}`),
        /** Public PDF download URL for an invoice. */
        pdfUrl: (id: string) => `${this.client.defaults.baseURL}/v1/invoices/${id}/pdf`,
        eInvoiceStatus: (id: string) =>
            this.get<Res<'getEInvoiceStatus'>>(`/v1/invoices/${id}/einvoice`),
        retryEInvoice: (id: string) =>
            this.post<Res<'retryEInvoice'>>(`/v1/invoices/${id}/einvoice/retry`),
        cancelEInvoice: (id: string, data?: Body<'cancelEInvoice'>) =>
            this.post<Res<'cancelEInvoice'>>(`/v1/invoices/${id}/einvoice/cancel`, data),
        /** Print-ready HTML rendering of the invoice (authenticated; not public). */
        pdf: (id: string) => this.getText(`/v1/invoices/${id}/pdf`),
        /** HTML preview of the invoice as the customer would see it. */
        previewHtml: (id: string) => this.getText(`/v1/invoices/${id}/preview`),
        /** (Re)send the invoice email with its hosted Pay Now link. */
        send: (id: string) => this.post<Res<'sendInvoiceEmail'>>(`/v1/invoices/${id}/send`),
        /** EU e-invoice (EN 16931 / UBL) transmission status. */
        euEInvoiceStatus: (id: string) =>
            this.get<Res<'getEUEInvoice'>>(`/v1/invoices/${id}/eu-einvoice`),
        /** Regenerate and re-transmit the EU e-invoice. */
        retryEUEInvoice: (id: string) =>
            this.post<Res<'retryEUEInvoice'>>(`/v1/invoices/${id}/eu-einvoice/retry`),
        /** Ledger drill: the journal entries this invoice posted. */
        journalEntries: (id: string) =>
            this.get<Res<'getInvoiceJournalEntries'>>(`/v1/invoices/${id}/journal-entries`),
        /** Retry/settlement history: every payment attempt, oldest first. */
        paymentAttempts: (id: string) =>
            this.get<Res<'getInvoicePaymentAttempts'>>(`/v1/invoices/${id}/payment-attempts`),
        /** Whether the dunning payment wall is active for this invoice. */
        paymentWall: (id: string) =>
            this.get<Res<'getPaymentWallStatus'>>(`/v1/invoices/${id}/payment-wall`),
        /** The invoice's status timeline. */
        statusHistory: (id: string) =>
            this.get<Res<'getInvoiceStatusHistory'>>(`/v1/invoices/${id}/status-history`),
    };

    /** Tenant-wide gateway payment attempts (the operator's payments log). */
    public paymentAttempts = {
        list: (params?: PaymentAttemptListParams) =>
            this.get<Res<'listPaymentAttempts'>>('/v1/payment-attempts', params),
        get: (id: string) => this.get<Res<'getPaymentAttempt'>>(`/v1/payment-attempts/${id}`),
    };

    public payments = {
        /** Create a gateway payment order for an invoice (public, rate-limited). */
        createOrder: (data: Body<'createPaymentOrder'>) =>
            this.post<Res<'createPaymentOrder'>>('/payments/order', data),
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
        /**
         * Close the wallet and settle its balance: paid residue is refunded
         * (out of band), promotional residue is forfeited. No further top-ups
         * or drains are accepted.
         */
        close: (id: string) => this.post<Res<'closeWallet'>>(`/v1/wallets/${id}/close`),
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
        /**
         * Re-aim the threshold (subscription + metric are the alert's
         * identity). Editing resets the once-per-period fired lock, so the
         * new threshold can fire in the current billing period.
         */
        update: (id: string, data: Body<'updateUsageAlert'>) =>
            this.put<Res<'updateUsageAlert'>>(`/v1/usage-alerts/${id}`, data),
        delete: (id: string) => this.del<Res<'deleteUsageAlert'>>(`/v1/usage-alerts/${id}`),
    };

    /**
     * The operator layer over payment recovery: the worklist of failing
     * invoices, the recovery funnel, and guarded manual controls (409 when an
     * action could double-charge — paused, mandate, or still-settling ACH).
     */
    public collections = {
        queue: (params?: {
            status?: 'past_due' | 'uncollectible';
            managed_by?: 'scheduler' | 'worker' | 'campaign';
            page?: number;
            per_page?: number;
        }) => this.get<Res<'getCollectionsQueue'>>('/v1/collections/queue', params),
        funnel: () => this.get<Res<'getCollectionsFunnel'>>('/v1/analytics/collections/funnel'),
        failures: () => this.get<Res<'getCollectionsFailures'>>('/v1/analytics/collections/failures'),
        retryNow: (invoiceId: string) =>
            this.post<Res<'collectionsRetryNow'>>(`/v1/collections/invoices/${invoiceId}/retry-now`),
        pauseDunning: (invoiceId: string, paused: boolean) =>
            this.post<Res<'collectionsPauseDunning'>>(`/v1/collections/invoices/${invoiceId}/pause`, { paused }),
        markUncollectible: (invoiceId: string) =>
            this.post<Res<'collectionsMarkUncollectible'>>(
                `/v1/collections/invoices/${invoiceId}/mark-uncollectible`,
            ),
    };

    /**
     * Legal entities (Multi-Entity Books): each has its own ledger, gapless
     * invoice series, and tax identity; every workspace has one primary.
     */
    public entities = {
        list: () => this.get<Res<'listEntities'>>('/v1/entities'),
        create: (data: Body<'createEntity'>) => this.post<Res<'createEntity'>>('/v1/entities', data),
        get: (id: string) => this.get<Res<'getEntity'>>(`/v1/entities/${id}`),
        update: (id: string, data: Body<'updateEntity'>) =>
            this.put<Res<'updateEntity'>>(`/v1/entities/${id}`, data),
        delete: (id: string) => this.del<Res<'deleteEntity'>>(`/v1/entities/${id}`),
        /** Per-entity MRR + open AR side by side, with consolidated totals. */
        overview: () => this.get<Res<'getEntitiesOverview'>>('/v1/analytics/entities-overview'),
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
        /** Reverse lookup: the plan charges priced on this meter. */
        charges: (id: string) =>
            this.get<Res<'getMetricCharges'>>(`/v1/billable-metrics/${id}/charges`),
    };

    public creditNotes = {
        create: (data: Body<'createCreditNote'>) =>
            this.post<Res<'createCreditNote'>>('/v1/credit-notes', data),
        list: (params?: ListParams) =>
            this.get<Res<'listCreditNotes'>>('/v1/credit-notes', params),
        /** One credit note, tenant-scoped; a foreign or missing id is a flat 404. */
        get: (id: string) => this.get<Res<'getCreditNote'>>(`/v1/credit-notes/${id}`),
        /** Approve a pending credit note (posts its ledger legs). */
        approve: (id: string) =>
            this.post<Res<'approveCreditNote'>>(`/v1/credit-notes/${id}/approve`),
        /** Reject a pending credit note. */
        reject: (id: string) =>
            this.post<Res<'rejectCreditNote'>>(`/v1/credit-notes/${id}/reject`),
        /** Void an issued account-credit note (reversing entry, never a delete). */
        void: (id: string) => this.post<Res<'voidCreditNote'>>(`/v1/credit-notes/${id}/void`),
        /** Ledger drill: the journal entries this credit note posted. */
        journalEntries: (id: string) =>
            this.get<Res<'getCreditNoteJournalEntries'>>(`/v1/credit-notes/${id}/journal-entries`),
        /** Print-ready HTML rendering of the credit note (authenticated; not public). */
        pdf: (id: string) => this.getText(`/v1/credit-notes/${id}/pdf`),
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
        list: (params?: EventListParams) => this.get<Res<'listEvents'>>('/v1/events', params),
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

    public disputes = {
        /** List invoice disputes (tenant-scoped). */
        list: (params?: ListParams) => this.get<Res<'listDisputes'>>('/v1/disputes', params),
        /** One dispute; a missing or cross-tenant id is a flat 404. */
        get: (id: string) => this.get<Res<'getDispute'>>(`/v1/disputes/${id}`),
        /** Mark an open dispute resolved, with an optional note. */
        resolve: (id: string, data?: Body<'resolveDispute'>) =>
            this.post<Res<'resolveDispute'>>(`/v1/disputes/${id}/resolve`, data),
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
        /**
         * Cancel an unredeemed gift. A paid purchase credits the buyer's
         * account; an unpaid purchase invoice is voided. Redeemed gifts 409.
         */
        cancel: (id: string) => this.post<Res<'cancelGift'>>(`/v1/gifts/${id}/cancel`),
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
        mrr: (params?: { entity_id?: string }) =>
            this.get<Res<'getMRR'>>('/v1/analytics/mrr', params),
        /** MRR broken down by legal entity, sorted by MRR descending. */
        mrrByEntity: () => this.get<Res<'getMRRByEntity'>>('/v1/analytics/mrr/by-entity'),
        /** Outstanding AR bucketed by age; entity_id scopes to one entity. */
        invoiceAging: (params?: { entity_id?: string }) =>
            this.get<Res<'getInvoiceAging'>>('/v1/analytics/invoice-aging', params),
        /** Best-time-to-retry insights from historical dunning outcomes. */
        dunningTiming: () => this.get<Res<'getDunningTiming'>>('/v1/analytics/dunning/timing'),
        /** Recent dunning retry attempts, newest first (limit ≤ 200). */
        dunningHistory: (params?: { limit?: number }) =>
            this.get<Res<'getDunningHistory'>>('/v1/analytics/dunning/history', params),
        dunningOverview: () =>
            this.get<Res<'getDunningOverview'>>('/v1/analytics/dunning/overview'),
        /** Revenue recovered by the retry engine: totals + last-12-months series. */
        dunningRecovered: () =>
            this.get<Res<'getDunningRecovered'>>('/v1/analytics/dunning/recovered'),
        /** The learned retry-timing weights. */
        dunningWeights: () => this.get<Res<'getDunningWeights'>>('/v1/analytics/dunning/weights'),
        /** MRR movement (new/expansion/contraction/churn/reactivation) + NDR/GDR. */
        mrrWaterfall: (params?: MRRWaterfallParams) =>
            this.get<Res<'getMRRWaterfall'>>('/v1/analytics/mrr/waterfall', params),
        revenueByGeography: () =>
            this.get<Res<'getRevenueByGeography'>>('/v1/analytics/revenue-by-geography'),
        revenueByPlan: () => this.get<Res<'getRevenueByPlan'>>('/v1/analytics/revenue-by-plan'),
        /** ARPA / ARPU / LTV. */
        unitEconomics: () => this.get<Res<'getUnitEconomics'>>('/v1/analytics/unit-economics'),
        /** Aggregate metered usage by dimension. */
        usage: () => this.get<Res<'getUsageStats'>>('/v1/analytics/usage'),
        /** Ask a natural-language analytics question; the answer carries the query it ran. */
        ask: (data: Body<'askAnalytics'>) =>
            this.post<Res<'askAnalytics'>>('/v1/analytics/ask', data),
    };

    public ledger = {
        accounts: (params?: ListParams) =>
            this.get<Res<'listLedgerAccounts'>>('/v1/ledger/accounts', params),
        entries: (params?: LedgerEntriesParams) =>
            this.get<Res<'listLedgerEntries'>>('/v1/ledger/entries', params),
        /** One posted double-entry journal entry, with both legs' accounts. */
        transaction: (id: string) =>
            this.get<Res<'getLedgerTransaction'>>(`/v1/ledger/transactions/${id}`),
        /** Every account's debit/credit totals and the double-entry invariant. */
        trialBalance: (params?: TrialBalanceParams) =>
            this.get<Res<'getTrialBalance'>>('/v1/ledger/trial-balance', params),
        /** Deferred Revenue movement for a month: opening + added - released = closing. */
        deferredRollforward: (params: PeriodParams) =>
            this.get<Res<'getDeferredRollforward'>>('/v1/ledger/deferred-rollforward', params),
        /** The general ledger as CSV text; scope with entity_id and/or month+year. */
        export: (params?: LedgerExportParams) => this.getText('/v1/ledger/export', params),
    };

    /** Month-end close, reconciliation, and revenue recognition. */
    public finance = {
        /** One read-only close artifact for a month, with a `ready_to_close` verdict. */
        closePack: (params: PeriodParams) =>
            this.get<Res<'getClosePack'>>('/v1/finance/close-pack', params),
        /** On-demand invoice-vs-ledger reconciliation; nothing is persisted. */
        reconciliation: () => this.get<Res<'runReconciliation'>>('/v1/finance/reconciliation'),
        /** Run a reconciliation AND record it to the audit trail. */
        recordReconciliation: () =>
            this.post<Res<'recordReconciliation'>>('/v1/finance/reconciliation/runs'),
        /** Recorded reconciliation runs, newest first (limit ≤ 200). */
        reconciliationRuns: (params?: { limit?: number }) =>
            this.get<Res<'listReconciliationRuns'>>('/v1/finance/reconciliation/runs', params),
        /** One recorded run with its persisted discrepancy rows. */
        reconciliationRun: (id: string) =>
            this.get<Res<'getReconciliationRun'>>(`/v1/finance/reconciliation/runs/${id}`),
        /** Revenue recognition report for a month. */
        revRecReport: (params: PeriodParams) =>
            this.get<Res<'getRevRecReport'>>('/v1/finance/revrec/report', params),
        /** Recognition curve: recognized vs still-scheduled revenue by month. */
        revenueWaterfall: () =>
            this.get<Res<'getRevenueWaterfall'>>('/v1/finance/revrec/waterfall'),
    };

    /** Indian GST statutory returns, assembled from finalized invoices. */
    public india = {
        /** GSTR-1 outward-supply return (readable sections + GSTN `gov_schema`). */
        gstr1: (params: PeriodParams) => this.get<Res<'getGSTR1'>>('/v1/india/gstr1', params),
        /** GSTR-3B summary return. */
        gstr3b: (params: PeriodParams) => this.get<Res<'getGSTR3B'>>('/v1/india/gstr3b', params),
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
        /** Start the browser OAuth flow for QuickBooks/Xero; returns `{auth_url}` to redirect to. */
        connect: (provider: string) =>
            this.post<Res<'connectAccountingProvider'>>(`/v1/accounting/connect/${provider}`),
        /**
         * The OAuth redirect target (exchanges `code` for tokens, then 302s
         * back to the dashboard). Normally hit by the browser, not the SDK.
         */
        oauthCallback: (provider: string, params: AccountingCallbackParams) =>
            this.get<Res<'accountingOAuthCallback'>>(
                `/v1/accounting/callback/${provider}`,
                params,
            ),
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
        list: (params?: ListParams) =>
            this.get<Res<'listVirtualAccounts'>>('/v1/virtual-accounts', params),
    };

    public offlinePayments = {
        /**
         * Manually record a bank transfer, cash, or cheque payment
         * (optionally against an invoice). Amounts are minor units.
         */
        record: (data: Body<'recordOfflinePayment'>) =>
            this.post<Res<'recordOfflinePayment'>>('/v1/payments/offline', data),
        list: (params?: ListParams) =>
            this.get<Res<'listOfflinePayments'>>('/v1/payments/offline', params),
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

    /** Customer consent records (recurring billing, marketing, ToS, ...). */
    public consents = {
        record: (data: Body<'recordConsent'>) =>
            this.post<Res<'recordConsent'>>('/v1/consents', data),
        revoke: (consentId: string) =>
            this.post<Res<'revokeConsent'>>('/v1/consents/revoke', { consent_id: consentId }),
    };

    /** Tenant settings: tax identities, e-invoicing, branding, MCP opt-in. */
    public settings = {
        getEUEInvoice: () => this.get<Res<'getEUEInvoiceConfig'>>('/v1/settings/eu-einvoice'),
        updateEUEInvoice: (data: Body<'updateEUEInvoiceConfig'>) =>
            this.put<Res<'updateEUEInvoiceConfig'>>('/v1/settings/eu-einvoice', data),
        getGST: () => this.get<Res<'getGSTConfig'>>('/v1/settings/gst'),
        updateGST: (data: Body<'updateGSTConfig'>) =>
            this.put<Res<'updateGSTConfig'>>('/v1/settings/gst', data),
        /** Validate a 15-character GSTIN. */
        validateGSTIN: (gstin: string) =>
            this.post<Res<'validateGSTIN'>>('/v1/settings/gst/validate', { gstin }),
        getInvoiceBranding: () =>
            this.get<Res<'getInvoiceBranding'>>('/v1/settings/invoice-branding'),
        updateInvoiceBranding: (data: Body<'updateInvoiceBranding'>) =>
            this.put<Res<'updateInvoiceBranding'>>('/v1/settings/invoice-branding', data),
        /** IRP (Indian e-invoicing) configuration; credentials are write-only. */
        getIRP: () => this.get<Res<'getIRPConfig'>>('/v1/settings/irp'),
        updateIRP: (data: Body<'updateIRPConfig'>) =>
            this.put<Res<'updateIRPConfig'>>('/v1/settings/irp', data),
        testIRP: () => this.post<Res<'testIRPConnection'>>('/v1/settings/irp/test'),
        getMCP: () => this.get<Res<'getMCPSettings'>>('/v1/settings/mcp'),
        /** Upsert the MCP opt-in; `tier3_enabled` unlocks money-path agent tools. */
        updateMCP: (data: Body<'updateMCPSettings'>) =>
            this.put<Res<'updateMCPSettings'>>('/v1/settings/mcp', data),
        /** Per-state US sales-tax liability for a filing period. */
        taxLiability: (params?: TaxLiabilityParams) =>
            this.get<Res<'getTaxLiabilityReport'>>('/v1/settings/tax/liability', params),
        getTaxNexus: (params?: { entity_id?: string }) =>
            this.get<Res<'getTaxNexus'>>('/v1/settings/tax/nexus', params),
        /** Replace the declared US nexus states. */
        setTaxNexus: (data: Body<'setTaxNexus'>) =>
            this.put<Res<'setTaxNexus'>>('/v1/settings/tax/nexus', data),
        /** Per-state economic-nexus proximity for a year; crossings auto-establish nexus. */
        taxNexusStatus: (params?: { year?: number }) =>
            this.get<Res<'getTaxNexusStatus'>>('/v1/settings/tax/nexus/status', params),
        getTaxRegistrations: () =>
            this.get<Res<'getTaxRegistrations'>>('/v1/settings/tax/registrations'),
        setTaxRegistrations: (data: Body<'setTaxRegistrations'>) =>
            this.put<Res<'setTaxRegistrations'>>('/v1/settings/tax/registrations', data),
        /** US tax identity (W-9). */
        getUSTax: () => this.get<Res<'getUSTaxConfig'>>('/v1/settings/tax/us'),
        updateUSTax: (data: Body<'updateUSTaxConfig'>) =>
            this.put<Res<'updateUSTaxConfig'>>('/v1/settings/tax/us', data),
    };

    /** Team members of the tenant (owner/admin/member). */
    public users = {
        list: () => this.get<Res<'listUsers'>>('/v1/users'),
        /** Add a teammate with a password chosen by the admin. */
        create: (data: Body<'createUser'>) => this.post<Res<'createUser'>>('/v1/users', data),
        /** Invite a teammate by email; they set their own password via a one-time link. */
        invite: (data: Body<'inviteUser'>) =>
            this.post<Res<'inviteUser'>>('/v1/users/invite', data),
        updateRole: (id: string, role: 'owner' | 'admin' | 'member') =>
            this.patch<Res<'updateUserRole'>>(`/v1/users/${id}`, { role }),
        delete: (id: string) => this.del<Res<'deleteUser'>>(`/v1/users/${id}`),
    };

    /** API keys for programmatic access; the raw key is returned only on create. */
    public apiKeys = {
        list: () => this.get<Res<'listAPIKeys'>>('/v1/developer/keys'),
        create: (data?: Body<'createAPIKey'>) =>
            this.post<Res<'createAPIKey'>>('/v1/developer/keys', data),
        revoke: (id: string) => this.del<Res<'revokeAPIKey'>>(`/v1/developer/keys/${id}`),
    };

    /**
     * Session-scoped auth management (TOTP MFA, active sessions). These
     * require a logged-in dashboard session cookie, not an API key.
     */
    public auth = {
        /** Begin TOTP enrolment: returns the secret + provisioning URI. */
        mfaSetup: () => this.post<Res<'mfaSetup'>>('/v1/auth/mfa/setup'),
        /** Confirm the TOTP code, enable MFA, and receive one-time backup codes. */
        mfaVerify: (code: string) => this.post<Res<'mfaVerify'>>('/v1/auth/mfa/verify', { code }),
        /** Disable MFA after verifying a TOTP or unused backup code. */
        mfaDisable: (code: string) =>
            this.post<Res<'mfaDisable'>>('/v1/auth/mfa/disable', { code }),
        sessions: () => this.get<Res<'listSessions'>>('/v1/auth/sessions'),
        /** Log out everywhere else: revoke every session except the current one. */
        revokeOtherSessions: () => this.del<Res<'revokeOtherSessions'>>('/v1/auth/sessions'),
        revokeSession: (id: string) =>
            this.del<Res<'revokeSession'>>(`/v1/auth/sessions/${id}`),
    };

    /** The tenant's SAML SSO connection (owner/admin only to change). */
    public sso = {
        get: () => this.get<Res<'getSSOConnection'>>('/v1/sso/connection'),
        /** Provide `idp_metadata_xml`, or `idp_entity_id` + `idp_sso_url` + `idp_certificate`. */
        upsert: (data: Body<'upsertSSOConnection'>) =>
            this.put<Res<'upsertSSOConnection'>>('/v1/sso/connection', data),
        delete: () => this.del<Res<'deleteSSOConnection'>>('/v1/sso/connection'),
    };

    /** Bring-your-own payment-gateway credentials (Stripe/Razorpay), sealed at rest. */
    public gatewayConnections = {
        list: () => this.get<Res<'listGatewayConnections'>>('/v1/gateway-connections'),
        /** Store (or replace) the tenant's own gateway keys; secrets are write-only. */
        create: (data: Body<'createGatewayConnection'>) =>
            this.post<Res<'createGatewayConnection'>>('/v1/gateway-connections', data),
        delete: (provider: 'stripe' | 'razorpay') =>
            this.del<Res<'deleteGatewayConnection'>>(`/v1/gateway-connections/${provider}`),
        /** Set the webhook signing secret in place (the connection id stays stable). */
        setWebhookSecret: (provider: 'stripe' | 'razorpay', webhookSecret: string) =>
            this.put<Res<'setGatewayWebhookSecret'>>(
                `/v1/gateway-connections/${provider}/webhook-secret`,
                { webhook_secret: webhookSecret },
            ),
    };

    /** Bring-your-own tax (TaxJar/Avalara), CRM (HubSpot) and storage (S3) integrations. */
    public integrationConnections = {
        list: () => this.get<Res<'listIntegrationConnections'>>('/v1/integration-connections'),
        /** Store (or replace) credentials for a (category, provider); secrets are write-only. */
        create: (data: Body<'createIntegrationConnection'>) =>
            this.post<Res<'createIntegrationConnection'>>('/v1/integration-connections', data),
        delete: (category: 'tax' | 'crm' | 'storage', provider: string) =>
            this.del<Res<'deleteIntegrationConnection'>>(
                `/v1/integration-connections/${category}/${provider}`,
            ),
    };

    public crm = {
        /** Push this workspace's customers to its connected CRM now. */
        sync: () => this.post<Res<'syncCRMNow'>>('/v1/crm/sync'),
    };

    /** Migration from Stripe / Chargebee / RevenueCat exports: preview → compare → commit. */
    public migration = {
        /** Dry-run: what a commit would create, link, skip, or refuse. No side effects. */
        previewStripe: (data: Body<'previewStripeImport'>) =>
            this.post<Res<'previewStripeImport'>>('/v1/import/stripe/preview', data),
        /** Compare gate: prove the migration ties out before cut-over. */
        compareStripe: (data: Body<'compareStripeImport'>) =>
            this.post<Res<'compareStripeImport'>>('/v1/import/stripe/compare', data),
        commitStripe: (data: Body<'commitStripeImport'>) =>
            this.post<Res<'commitStripeImport'>>('/v1/import/stripe/commit', data),
        previewChargebee: (data: Body<'previewChargebeeImport'>) =>
            this.post<Res<'previewChargebeeImport'>>('/v1/import/chargebee/preview', data),
        compareChargebee: (data: Body<'compareChargebeeImport'>) =>
            this.post<Res<'compareChargebeeImport'>>('/v1/import/chargebee/compare', data),
        commitChargebee: (data: Body<'commitChargebeeImport'>) =>
            this.post<Res<'commitChargebeeImport'>>('/v1/import/chargebee/commit', data),
        previewRevenueCat: (data: Body<'previewRevenueCatImport'>) =>
            this.post<Res<'previewRevenueCatImport'>>('/v1/import/revenuecat/preview', data),
        compareRevenueCat: (data: Body<'compareRevenueCatImport'>) =>
            this.post<Res<'compareRevenueCatImport'>>('/v1/import/revenuecat/compare', data),
        commitRevenueCat: (data: Body<'commitRevenueCatImport'>) =>
            this.post<Res<'commitRevenueCatImport'>>('/v1/import/revenuecat/commit', data),
        /** Stored Compare runs, newest first (limit ≤ 200). */
        compareReports: (params?: { limit?: number }) =>
            this.get<Res<'listCompareReports'>>('/v1/import/compare-reports', params),
        compareReport: (id: string) =>
            this.get<Res<'getCompareReport'>>(`/v1/import/compare-reports/${id}`),
        /** The printable Compare receipt as HTML. */
        compareReportDocument: (id: string) =>
            this.getText(`/v1/import/compare-reports/${id}/document`),
    };

    /** Recurso Cloud managed-billing status for this tenant. */
    public billing = {
        /** The managed-cloud plan catalog. */
        plans: () => this.get<Res<'getBillingPlans'>>('/v1/billing/plans'),
        /** The tenant's own billing/trial status. */
        status: () => this.get<Res<'getBillingStatus'>>('/v1/billing/status'),
    };

    /** Unversioned platform endpoints: build info, metrics, waitlist. */
    public system = {
        /** Build version and gateway mode (public). */
        version: () => this.get<Res<'getVersion'>>('/version'),
        /** Prometheus text-format metrics (optionally METRICS_TOKEN-gated). */
        metrics: () => this.getText('/metrics'),
        /** Founder-only cross-tenant funnel snapshot (FOUNDER_TOKEN-gated). */
        platformMetrics: () => this.get<Res<'getPlatformMetrics'>>('/platform/metrics'),
        /** Join the Recurso Cloud waitlist (public, rate-limited). */
        joinWaitlist: (data: Body<'joinWaitlist'>) =>
            this.post<Res<'joinWaitlist'>>('/waitlist', data),
    };
}
