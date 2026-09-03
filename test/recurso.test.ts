import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Recurso } from '../src/index';
import axios from 'axios';

/**
 * The SDK is a thin typed wrapper over one axios instance, so the whole
 * suite runs against a mocked `axios.create()` that returns a capture
 * client. Every resource method is exercised from a table asserting:
 * verb, path (incl. path params), query/body passthrough, and that the
 * axios response envelope is unwrapped to `.data`.
 */

const mocks = vi.hoisted(() => {
    const client = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        defaults: { baseURL: undefined as string | undefined },
    };
    const create = vi.fn((config?: { baseURL?: string }) => {
        client.defaults.baseURL = config?.baseURL;
        return client;
    });
    return { client, create };
});

vi.mock('axios', () => ({ default: { create: mocks.create } }));

/** Sentinel payload: proves `.data` unwrapping, not just call success. */
const PAYLOAD = { id: 'obj_123', unwrapped: true };
const RESPONSE = { status: 200, data: PAYLOAD };

const API_KEY = 'rsk_test_abc123';
const BASE_URL = 'https://billing.example.com';

let recurso: Recurso;

beforeEach(() => {
    mocks.create.mockClear();
    for (const verb of VERBS) {
        mocks.client[verb].mockReset().mockResolvedValue(RESPONSE);
    }
    recurso = new Recurso(API_KEY, BASE_URL);
});

const VERBS = ['get', 'post', 'put', 'patch', 'delete'] as const;
type Verb = (typeof VERBS)[number];

interface MethodCase {
    /** Method name, for the subtest title. */
    method: string;
    /** Invokes the SDK method under test. */
    call: (r: Recurso) => Promise<unknown>;
    verb: Verb;
    path: string;
    /** Expected query params object (GET) — omit for "no params passed". */
    params?: object;
    /** Expected request body (POST/PUT/PATCH) — omit for "no body passed". */
    body?: unknown;
    /** Set for non-JSON document endpoints (HTML/CSV/text) fetched via `responseType: 'text'`. */
    responseType?: 'text';
}

const listParams = { page: 2, limit: 50, q: 'search', status: 'active' };
const body = { any: 'payload', nested: { n: 1 } };

const cases: Record<string, MethodCase[]> = {
    account: [
        { method: 'get', call: (r) => r.account.get(), verb: 'get', path: '/v1/account' },
        { method: 'update', call: (r) => r.account.update(body), verb: 'put', path: '/v1/account', body },
    ],

    customers: [
        {
            method: 'create',
            call: (r) => r.customers.create({ email: 'jane@example.com', name: 'Jane', country: 'IN' }),
            verb: 'post',
            path: '/v1/customers',
            body: { email: 'jane@example.com', name: 'Jane', country: 'IN' },
        },
        { method: 'list', call: (r) => r.customers.list(listParams), verb: 'get', path: '/v1/customers', params: listParams },
        { method: 'get', call: (r) => r.customers.get('cus_1'), verb: 'get', path: '/v1/customers/cus_1' },
        {
            method: 'update',
            call: (r) => r.customers.update('cus_1', { name: 'Jane II', city: 'Pune' }),
            verb: 'put',
            path: '/v1/customers/cus_1',
            body: { name: 'Jane II', city: 'Pune' },
        },
        {
            method: 'archive',
            call: (r) => r.customers.archive('cus_1'),
            verb: 'put',
            path: '/v1/customers/cus_1',
            body: { active: false },
        },
        {
            method: 'updatePaymentMethod',
            call: (r) => r.customers.updatePaymentMethod('cus_1', body),
            verb: 'put',
            path: '/v1/customers/cus_1/payment-method',
            body,
        },
        { method: 'churn', call: (r) => r.customers.churn('cus_1'), verb: 'get', path: '/v1/customers/cus_1/churn' },
        { method: 'consents', call: (r) => r.customers.consents('cus_1'), verb: 'get', path: '/v1/customers/cus_1/consents' },
        {
            method: 'creditStatement',
            call: (r) => r.customers.creditStatement('cus_1'),
            verb: 'get',
            path: '/v1/customers/cus_1/credit-statement',
        },
        {
            method: 'financialSummary',
            call: (r) => r.customers.financialSummary('cus_1'),
            verb: 'get',
            path: '/v1/customers/cus_1/financial-summary',
        },
    ],

    plans: [
        {
            method: 'create',
            call: (r) =>
                r.plans.create({ name: 'Pro', code: 'PRO', amount: 2900, currency: 'USD', interval_unit: 'month', interval_count: 3 }),
            verb: 'post',
            path: '/v1/plans',
            body: { name: 'Pro', code: 'PRO', amount: 2900, currency: 'USD', interval_unit: 'month', interval_count: 3 },
        },
        { method: 'list', call: (r) => r.plans.list(listParams), verb: 'get', path: '/v1/plans', params: listParams },
        { method: 'get', call: (r) => r.plans.get('plan_1'), verb: 'get', path: '/v1/plans/plan_1' },
        {
            method: 'update',
            call: (r) => r.plans.update('plan_1', { name: 'Pro v2', interval_count: 6 }),
            verb: 'put',
            path: '/v1/plans/plan_1',
            body: { name: 'Pro v2', interval_count: 6 },
        },
        {
            method: 'archive',
            call: (r) => r.plans.archive('plan_1'),
            verb: 'put',
            path: '/v1/plans/plan_1',
            body: { active: false },
        },
        {
            method: 'setCharges',
            call: (r) =>
                r.plans.setCharges('plan_1', [
                    { metric_id: 'bm_1', charge_model: 'per_unit', amounts: { INR: { unit_amount: '0.0035' } } },
                ]),
            verb: 'put',
            path: '/v1/plans/plan_1/charges',
            body: [{ metric_id: 'bm_1', charge_model: 'per_unit', amounts: { INR: { unit_amount: '0.0035' } } }],
        },
        { method: 'getCharges', call: (r) => r.plans.getCharges('plan_1'), verb: 'get', path: '/v1/plans/plan_1/charges' },
        {
            method: 'simulateCharges',
            call: (r) => r.plans.simulateCharges('plan_1', { currency: 'USD', usage: [{ metric_id: 'bm_1', quantity: 100 }] }),
            verb: 'post',
            path: '/v1/plans/plan_1/simulate-charges',
            body: { currency: 'USD', usage: [{ metric_id: 'bm_1', quantity: 100 }] },
        },
    ],

    subscriptions: [
        {
            method: 'create',
            call: (r) => r.subscriptions.create({ customer_id: 'cus_1', plan_id: 'plan_1', coupon_code: 'SAVE10' }),
            verb: 'post',
            path: '/v1/subscriptions',
            body: { customer_id: 'cus_1', plan_id: 'plan_1', coupon_code: 'SAVE10' },
        },
        { method: 'list', call: (r) => r.subscriptions.list(listParams), verb: 'get', path: '/v1/subscriptions', params: listParams },
        { method: 'get', call: (r) => r.subscriptions.get('sub_1'), verb: 'get', path: '/v1/subscriptions/sub_1' },
        { method: 'update', call: (r) => r.subscriptions.update('sub_1', body), verb: 'put', path: '/v1/subscriptions/sub_1', body },
        {
            method: 'previewChange',
            call: (r) => r.subscriptions.previewChange('sub_1', 'plan_2'),
            verb: 'get',
            path: '/v1/subscriptions/sub_1/preview-change',
            params: { plan_id: 'plan_2' },
        },
        {
            method: 'cancel',
            call: (r) => r.subscriptions.cancel('sub_1', { at_period_end: true }),
            verb: 'post',
            path: '/v1/subscriptions/sub_1/cancel',
            body: { at_period_end: true },
        },
        {
            method: 'pause',
            call: (r) => r.subscriptions.pause('sub_1', { resume_at: '2026-08-01' }),
            verb: 'post',
            path: '/v1/subscriptions/sub_1/pause',
            body: { resume_at: '2026-08-01' },
        },
        { method: 'resume', call: (r) => r.subscriptions.resume('sub_1'), verb: 'post', path: '/v1/subscriptions/sub_1/resume' },
        {
            method: 'reactivate',
            call: (r) => r.subscriptions.reactivate('sub_1'),
            verb: 'post',
            path: '/v1/subscriptions/sub_1/reactivate',
        },
        {
            method: 'advance',
            call: (r) => r.subscriptions.advance('sub_1', { periods: 3 }),
            verb: 'post',
            path: '/v1/subscriptions/sub_1/advance',
            body: { periods: 3 },
        },
        { method: 'charges', call: (r) => r.subscriptions.charges('sub_1'), verb: 'get', path: '/v1/subscriptions/sub_1/charges' },
        {
            method: 'addCharge',
            call: (r) => r.subscriptions.addCharge('sub_1', body),
            verb: 'post',
            path: '/v1/subscriptions/sub_1/charges',
            body,
        },
        { method: 'usage', call: (r) => r.subscriptions.usage('sub_1'), verb: 'get', path: '/v1/subscriptions/sub_1/usage' },
        {
            method: 'usageAmount',
            call: (r) => r.subscriptions.usageAmount('sub_1'),
            verb: 'get',
            path: '/v1/subscriptions/sub_1/usage-amount',
        },
        {
            method: 'setCommitment',
            call: (r) => r.subscriptions.setCommitment('sub_1', 5000000),
            verb: 'put',
            path: '/v1/subscriptions/sub_1/commitment',
            body: { amount: 5000000 },
        },
        {
            method: 'addAddon',
            call: (r) => r.subscriptions.addAddon('sub_1', { plan_id: 'plan_9', quantity: 2 }),
            verb: 'post',
            path: '/v1/subscriptions/sub_1/addons',
            body: { plan_id: 'plan_9', quantity: 2 },
        },
        { method: 'addons', call: (r) => r.subscriptions.addons('sub_1'), verb: 'get', path: '/v1/subscriptions/sub_1/addons' },
        {
            method: 'removeAddon',
            call: (r) => r.subscriptions.removeAddon('sub_1', 'addon_1'),
            verb: 'delete',
            path: '/v1/subscriptions/sub_1/addons/addon_1',
        },
        {
            method: 'billUsageNow',
            call: (r) => r.subscriptions.billUsageNow('sub_1'),
            verb: 'post',
            path: '/v1/subscriptions/sub_1/bill-usage',
        },
        {
            method: 'cancelPreview',
            call: (r) => r.subscriptions.cancelPreview('sub_1', { immediately: true }),
            verb: 'get',
            path: '/v1/subscriptions/sub_1/cancel-preview',
            params: { immediately: true },
        },
        { method: 'consent', call: (r) => r.subscriptions.consent('sub_1'), verb: 'get', path: '/v1/subscriptions/sub_1/consent' },
        {
            method: 'financialSummary',
            call: (r) => r.subscriptions.financialSummary('sub_1'),
            verb: 'get',
            path: '/v1/subscriptions/sub_1/financial-summary',
        },
        { method: 'history', call: (r) => r.subscriptions.history('sub_1'), verb: 'get', path: '/v1/subscriptions/sub_1/history' },
        {
            method: 'cancellationReasons',
            call: (r) => r.subscriptions.cancellationReasons(),
            verb: 'get',
            path: '/v1/cancellation-reasons',
        },
    ],

    wallets: [
        {
            method: 'create',
            call: (r) => r.wallets.create({ customer_id: 'cus_1', currency: 'INR' }),
            verb: 'post',
            path: '/v1/wallets',
            body: { customer_id: 'cus_1', currency: 'INR' },
        },
        { method: 'get', call: (r) => r.wallets.get('wal_1'), verb: 'get', path: '/v1/wallets/wal_1' },
        {
            method: 'forCustomer',
            call: (r) => r.wallets.forCustomer('cus_1'),
            verb: 'get',
            path: '/v1/customers/cus_1/wallets',
        },
        {
            method: 'topUp',
            call: (r) => r.wallets.topUp('wal_1', { amount: 500000, source: 'manual' }),
            verb: 'post',
            path: '/v1/wallets/wal_1/top-up',
            body: { amount: 500000, source: 'manual' },
        },
        {
            method: 'transactions',
            call: (r) => r.wallets.transactions('wal_1', { limit: 20 }),
            verb: 'get',
            path: '/v1/wallets/wal_1/transactions',
            params: { limit: 20 },
        },
        {
            method: 'setAutoRecharge',
            call: (r) => r.wallets.setAutoRecharge('wal_1', { auto_recharge_threshold: 100000, auto_recharge_amount: 500000 }),
            verb: 'put',
            path: '/v1/wallets/wal_1/auto-recharge',
            body: { auto_recharge_threshold: 100000, auto_recharge_amount: 500000 },
        },
        { method: 'close', call: (r) => r.wallets.close('wal_1'), verb: 'post', path: '/v1/wallets/wal_1/close' },
    ],

    usageAlerts: [
        {
            method: 'create',
            call: (r) =>
                r.usageAlerts.create({ subscription_id: 'sub_1', metric_code: 'api_calls', threshold_type: 'quantity', threshold: 1000000 }),
            verb: 'post',
            path: '/v1/usage-alerts',
            body: { subscription_id: 'sub_1', metric_code: 'api_calls', threshold_type: 'quantity', threshold: 1000000 },
        },
        {
            method: 'list',
            call: (r) => r.usageAlerts.list({ subscription_id: 'sub_1' }),
            verb: 'get',
            path: '/v1/usage-alerts',
            params: { subscription_id: 'sub_1' },
        },
        {
            method: 'update',
            call: (r) => r.usageAlerts.update('ua_1', { threshold_type: 'quantity', threshold: 5000 }),
            verb: 'put',
            path: '/v1/usage-alerts/ua_1',
            body: { threshold_type: 'quantity', threshold: 5000 },
        },
        { method: 'delete', call: (r) => r.usageAlerts.delete('ua_1'), verb: 'delete', path: '/v1/usage-alerts/ua_1' },
    ],

    auditLogs: [
        {
            method: 'list',
            call: (r) => r.auditLogs.list({ entity_type: 'plans', limit: 50 }),
            verb: 'get',
            path: '/v1/audit-logs',
            params: { entity_type: 'plans', limit: 50 },
        },
    ],

    invoices: [
        { method: 'list', call: (r) => r.invoices.list(listParams), verb: 'get', path: '/v1/invoices', params: listParams },
        { method: 'get', call: (r) => r.invoices.get('inv_1'), verb: 'get', path: '/v1/invoices/inv_1' },
        { method: 'eInvoiceStatus', call: (r) => r.invoices.eInvoiceStatus('inv_1'), verb: 'get', path: '/v1/invoices/inv_1/einvoice' },
        {
            method: 'retryEInvoice',
            call: (r) => r.invoices.retryEInvoice('inv_1'),
            verb: 'post',
            path: '/v1/invoices/inv_1/einvoice/retry',
        },
        {
            method: 'cancelEInvoice',
            call: (r) => r.invoices.cancelEInvoice('inv_1', { reason: 'data entry error' }),
            verb: 'post',
            path: '/v1/invoices/inv_1/einvoice/cancel',
            body: { reason: 'data entry error' },
        },
        { method: 'pdf', call: (r) => r.invoices.pdf('inv_1'), verb: 'get', path: '/v1/invoices/inv_1/pdf', responseType: 'text' },
        {
            method: 'previewHtml',
            call: (r) => r.invoices.previewHtml('inv_1'),
            verb: 'get',
            path: '/v1/invoices/inv_1/preview',
            responseType: 'text',
        },
        { method: 'send', call: (r) => r.invoices.send('inv_1'), verb: 'post', path: '/v1/invoices/inv_1/send' },
        {
            method: 'euEInvoiceStatus',
            call: (r) => r.invoices.euEInvoiceStatus('inv_1'),
            verb: 'get',
            path: '/v1/invoices/inv_1/eu-einvoice',
        },
        {
            method: 'retryEUEInvoice',
            call: (r) => r.invoices.retryEUEInvoice('inv_1'),
            verb: 'post',
            path: '/v1/invoices/inv_1/eu-einvoice/retry',
        },
        {
            method: 'journalEntries',
            call: (r) => r.invoices.journalEntries('inv_1'),
            verb: 'get',
            path: '/v1/invoices/inv_1/journal-entries',
        },
        {
            method: 'paymentAttempts',
            call: (r) => r.invoices.paymentAttempts('inv_1'),
            verb: 'get',
            path: '/v1/invoices/inv_1/payment-attempts',
        },
        { method: 'paymentWall', call: (r) => r.invoices.paymentWall('inv_1'), verb: 'get', path: '/v1/invoices/inv_1/payment-wall' },
        {
            method: 'statusHistory',
            call: (r) => r.invoices.statusHistory('inv_1'),
            verb: 'get',
            path: '/v1/invoices/inv_1/status-history',
        },
    ],

    coupons: [
        {
            method: 'create',
            call: (r) => r.coupons.create({ code: 'SAVE10', discount_type: 'percent', discount_value: 10, duration: 'forever' }),
            verb: 'post',
            path: '/v1/coupons',
            body: { code: 'SAVE10', discount_type: 'percent', discount_value: 10, duration: 'forever' },
        },
        { method: 'list', call: (r) => r.coupons.list(listParams), verb: 'get', path: '/v1/coupons', params: listParams },
        {
            method: 'update',
            call: (r) => r.coupons.update('cpn_1', { active: true }),
            verb: 'put',
            path: '/v1/coupons/cpn_1',
            body: { active: true },
        },
        {
            method: 'activate',
            call: (r) => r.coupons.activate('cpn_1'),
            verb: 'put',
            path: '/v1/coupons/cpn_1',
            body: { active: true },
        },
        {
            method: 'deactivate',
            call: (r) => r.coupons.deactivate('cpn_1'),
            verb: 'put',
            path: '/v1/coupons/cpn_1',
            body: { active: false },
        },
    ],

    usage: [
        {
            method: 'record',
            call: (r) => r.usage.record({ subscription_id: 'sub_1', customer_id: 'cus_1', dimension: 'api_calls', quantity: 42 }),
            verb: 'post',
            path: '/v1/usage/events',
            body: { subscription_id: 'sub_1', customer_id: 'cus_1', dimension: 'api_calls', quantity: 42 },
        },
        {
            method: 'query',
            call: (r) =>
                r.usage.query({
                    subscription_id: 'sub_1',
                    dimension: 'api_calls',
                    from: '2026-06-01T00:00:00Z',
                    to: '2026-07-01T00:00:00Z',
                    granularity: 'day',
                }),
            verb: 'get',
            path: '/v1/usage',
            params: {
                subscription_id: 'sub_1',
                dimension: 'api_calls',
                from: '2026-06-01T00:00:00Z',
                to: '2026-07-01T00:00:00Z',
                granularity: 'day',
            },
        },
        { method: 'dimensions', call: (r) => r.usage.dimensions(), verb: 'get', path: '/v1/usage/dimensions' },
        {
            method: 'recordBatch',
            call: (r) =>
                r.usage.recordBatch([
                    { subscription_id: 'sub_1', customer_id: 'cus_1', dimension: 'api_calls', quantity: 10, transaction_id: 't-1' },
                ]),
            verb: 'post',
            path: '/v1/usage/events/batch',
            body: {
                events: [
                    { subscription_id: 'sub_1', customer_id: 'cus_1', dimension: 'api_calls', quantity: 10, transaction_id: 't-1' },
                ],
            },
        },
        {
            method: 'record (with properties)',
            call: (r) =>
                r.usage.record({
                    subscription_id: 'sub_1',
                    customer_id: 'cus_1',
                    dimension: 'active_users',
                    quantity: 1,
                    properties: { user_id: 'u_42' },
                }),
            verb: 'post',
            path: '/v1/usage/events',
            body: {
                subscription_id: 'sub_1',
                customer_id: 'cus_1',
                dimension: 'active_users',
                quantity: 1,
                properties: { user_id: 'u_42' },
            },
        },
    ],

    billableMetrics: [
        {
            method: 'create',
            call: (r) => r.billableMetrics.create({ name: 'API calls', code: 'api_calls', aggregation_type: 'sum' }),
            verb: 'post',
            path: '/v1/billable-metrics',
            body: { name: 'API calls', code: 'api_calls', aggregation_type: 'sum' },
        },
        { method: 'list', call: (r) => r.billableMetrics.list(), verb: 'get', path: '/v1/billable-metrics' },
        { method: 'get', call: (r) => r.billableMetrics.get('bm_1'), verb: 'get', path: '/v1/billable-metrics/bm_1' },
        {
            method: 'update',
            call: (r) => r.billableMetrics.update('bm_1', { name: 'API calls v2', code: 'api_calls', aggregation_type: 'max' }),
            verb: 'put',
            path: '/v1/billable-metrics/bm_1',
            body: { name: 'API calls v2', code: 'api_calls', aggregation_type: 'max' },
        },
        { method: 'delete', call: (r) => r.billableMetrics.delete('bm_1'), verb: 'delete', path: '/v1/billable-metrics/bm_1' },
        { method: 'charges', call: (r) => r.billableMetrics.charges('bm_1'), verb: 'get', path: '/v1/billable-metrics/bm_1/charges' },
    ],

    creditNotes: [
        { method: 'create', call: (r) => r.creditNotes.create(body), verb: 'post', path: '/v1/credit-notes', body },
        { method: 'list', call: (r) => r.creditNotes.list(listParams), verb: 'get', path: '/v1/credit-notes', params: listParams },
        { method: 'get', call: (r) => r.creditNotes.get('cn_1'), verb: 'get', path: '/v1/credit-notes/cn_1' },
        { method: 'approve', call: (r) => r.creditNotes.approve('cn_1'), verb: 'post', path: '/v1/credit-notes/cn_1/approve' },
        { method: 'reject', call: (r) => r.creditNotes.reject('cn_1'), verb: 'post', path: '/v1/credit-notes/cn_1/reject' },
        { method: 'void', call: (r) => r.creditNotes.void('cn_1'), verb: 'post', path: '/v1/credit-notes/cn_1/void' },
        {
            method: 'journalEntries',
            call: (r) => r.creditNotes.journalEntries('cn_1'),
            verb: 'get',
            path: '/v1/credit-notes/cn_1/journal-entries',
        },
        { method: 'pdf', call: (r) => r.creditNotes.pdf('cn_1'), verb: 'get', path: '/v1/credit-notes/cn_1/pdf', responseType: 'text' },
    ],

    quotes: [
        { method: 'create', call: (r) => r.quotes.create(body), verb: 'post', path: '/v1/quotes', body },
        { method: 'list', call: (r) => r.quotes.list(listParams), verb: 'get', path: '/v1/quotes', params: listParams },
        { method: 'get', call: (r) => r.quotes.get('qt_1'), verb: 'get', path: '/v1/quotes/qt_1' },
        { method: 'update', call: (r) => r.quotes.update('qt_1', body), verb: 'put', path: '/v1/quotes/qt_1', body },
        { method: 'send', call: (r) => r.quotes.send('qt_1'), verb: 'post', path: '/v1/quotes/qt_1/send' },
        { method: 'accept', call: (r) => r.quotes.accept('qt_1'), verb: 'post', path: '/v1/quotes/qt_1/accept' },
        { method: 'decline', call: (r) => r.quotes.decline('qt_1'), verb: 'post', path: '/v1/quotes/qt_1/decline' },
        { method: 'convert', call: (r) => r.quotes.convert('qt_1'), verb: 'post', path: '/v1/quotes/qt_1/convert' },
        { method: 'delete', call: (r) => r.quotes.delete('qt_1'), verb: 'delete', path: '/v1/quotes/qt_1' },
    ],

    webhooks: [
        {
            method: 'create',
            call: (r) => r.webhooks.create({ url: 'https://example.com/hook', event_types: ['invoice.paid'] }),
            verb: 'post',
            path: '/v1/webhooks',
            body: { url: 'https://example.com/hook', event_types: ['invoice.paid'] },
        },
        { method: 'list', call: (r) => r.webhooks.list(), verb: 'get', path: '/v1/webhooks' },
        { method: 'delete', call: (r) => r.webhooks.delete('wh_1'), verb: 'delete', path: '/v1/webhooks/wh_1' },
        {
            method: 'pause',
            call: (r) => r.webhooks.pause('wh_1'),
            verb: 'put',
            path: '/v1/webhooks/wh_1/status',
            body: { status: 'inactive' },
        },
        {
            method: 'resume',
            call: (r) => r.webhooks.resume('wh_1'),
            verb: 'put',
            path: '/v1/webhooks/wh_1/status',
            body: { status: 'active' },
        },
        {
            method: 'deliveries',
            call: (r) => r.webhooks.deliveries('wh_1', { limit: 25, offset: 50, status: 'failed' }),
            verb: 'get',
            path: '/v1/webhooks/wh_1/deliveries',
            params: { limit: 25, offset: 50, status: 'failed' },
        },
    ],

    events: [
        { method: 'list', call: (r) => r.events.list(listParams), verb: 'get', path: '/v1/events', params: listParams },
        { method: 'types', call: (r) => r.events.types(), verb: 'get', path: '/v1/events/types' },
        { method: 'deliveries', call: (r) => r.events.deliveries('evt_1'), verb: 'get', path: '/v1/events/evt_1/deliveries' },
        { method: 'redeliver', call: (r) => r.events.redeliver('evt_1'), verb: 'post', path: '/v1/events/evt_1/redeliver' },
    ],

    disputes: [
        { method: 'list', call: (r) => r.disputes.list(listParams), verb: 'get', path: '/v1/disputes', params: listParams },
        { method: 'resolve', call: (r) => r.disputes.resolve('dsp_1', body), verb: 'post', path: '/v1/disputes/dsp_1/resolve', body },
        { method: 'get', call: (r) => r.disputes.get('dsp_1'), verb: 'get', path: '/v1/disputes/dsp_1' },
    ],

    mandates: [
        { method: 'create', call: (r) => r.mandates.create(body), verb: 'post', path: '/v1/mandates', body },
        { method: 'list', call: (r) => r.mandates.list(listParams), verb: 'get', path: '/v1/mandates', params: listParams },
        { method: 'get', call: (r) => r.mandates.get('mnd_1'), verb: 'get', path: '/v1/mandates/mnd_1' },
        { method: 'revoke', call: (r) => r.mandates.revoke('mnd_1'), verb: 'post', path: '/v1/mandates/mnd_1/revoke' },
    ],

    gifts: [
        { method: 'purchase', call: (r) => r.gifts.purchase(body), verb: 'post', path: '/v1/gifts/purchase', body },
        { method: 'cancel', call: (r) => r.gifts.cancel('gft_1'), verb: 'post', path: '/v1/gifts/gft_1/cancel' },
        {
            method: 'redeem',
            call: (r) => r.gifts.redeem({ code: 'GIFT-1234' }),
            verb: 'post',
            path: '/v1/gifts/redeem',
            body: { code: 'GIFT-1234' },
        },
        { method: 'list', call: (r) => r.gifts.list(listParams), verb: 'get', path: '/v1/gifts', params: listParams },
    ],

    referrals: [
        { method: 'create', call: (r) => r.referrals.create(body), verb: 'post', path: '/v1/referrals', body },
        { method: 'list', call: (r) => r.referrals.list(listParams), verb: 'get', path: '/v1/referrals', params: listParams },
        {
            method: 'generateCode',
            call: (r) => r.referrals.generateCode({ customer_id: 'cus_1' }),
            verb: 'post',
            path: '/v1/referrals/generate-code',
            body: { customer_id: 'cus_1' },
        },
        { method: 'qualify', call: (r) => r.referrals.qualify('ref_1'), verb: 'post', path: '/v1/referrals/ref_1/qualify' },
    ],

    entitlements: [
        {
            method: 'setForPlan',
            call: (r) =>
                r.entitlements.setForPlan('plan_1', [
                    { feature_key: 'sso', kind: 'boolean', bool_value: true },
                    { feature_key: 'seats', kind: 'limit', limit_value: 25 },
                ]),
            verb: 'put',
            path: '/v1/plans/plan_1/entitlements',
            body: [
                { feature_key: 'sso', kind: 'boolean', bool_value: true },
                { feature_key: 'seats', kind: 'limit', limit_value: 25 },
            ],
        },
        {
            method: 'getForPlan',
            call: (r) => r.entitlements.getForPlan('plan_1'),
            verb: 'get',
            path: '/v1/plans/plan_1/entitlements',
        },
        {
            method: 'forCustomer',
            call: (r) => r.entitlements.forCustomer('cus_1'),
            verb: 'get',
            path: '/v1/customers/cus_1/entitlements',
        },
        {
            method: 'check',
            call: (r) => r.entitlements.check('cus_1', 'sso'),
            verb: 'get',
            path: '/v1/entitlements/check',
            params: { customer_id: 'cus_1', feature: 'sso' },
        },
    ],

    analytics: [
        { method: 'mrr', call: (r) => r.analytics.mrr(), verb: 'get', path: '/v1/analytics/mrr' },
        {
            method: 'mrr (entity scoped)',
            call: (r) => r.analytics.mrr({ entity_id: 'ent_1' }),
            verb: 'get',
            path: '/v1/analytics/mrr',
            params: { entity_id: 'ent_1' },
        },
        { method: 'mrrByEntity', call: (r) => r.analytics.mrrByEntity(), verb: 'get', path: '/v1/analytics/mrr/by-entity' },
        {
            method: 'invoiceAging',
            call: (r) => r.analytics.invoiceAging({ entity_id: 'ent_1' }),
            verb: 'get',
            path: '/v1/analytics/invoice-aging',
            params: { entity_id: 'ent_1' },
        },
        { method: 'dunningTiming', call: (r) => r.analytics.dunningTiming(), verb: 'get', path: '/v1/analytics/dunning/timing' },
        {
            method: 'dunningHistory',
            call: (r) => r.analytics.dunningHistory({ limit: 20 }),
            verb: 'get',
            path: '/v1/analytics/dunning/history',
            params: { limit: 20 },
        },
        { method: 'dunningOverview', call: (r) => r.analytics.dunningOverview(), verb: 'get', path: '/v1/analytics/dunning/overview' },
        { method: 'dunningRecovered', call: (r) => r.analytics.dunningRecovered(), verb: 'get', path: '/v1/analytics/dunning/recovered' },
        { method: 'dunningWeights', call: (r) => r.analytics.dunningWeights(), verb: 'get', path: '/v1/analytics/dunning/weights' },
        {
            method: 'mrrWaterfall',
            call: (r) => r.analytics.mrrWaterfall({ start: '2026-07-01', end: '2026-08-01' }),
            verb: 'get',
            path: '/v1/analytics/mrr/waterfall',
            params: { start: '2026-07-01', end: '2026-08-01' },
        },
        {
            method: 'revenueByGeography',
            call: (r) => r.analytics.revenueByGeography(),
            verb: 'get',
            path: '/v1/analytics/revenue-by-geography',
        },
        { method: 'revenueByPlan', call: (r) => r.analytics.revenueByPlan(), verb: 'get', path: '/v1/analytics/revenue-by-plan' },
        { method: 'unitEconomics', call: (r) => r.analytics.unitEconomics(), verb: 'get', path: '/v1/analytics/unit-economics' },
        { method: 'usage', call: (r) => r.analytics.usage(), verb: 'get', path: '/v1/analytics/usage' },
        {
            method: 'ask',
            call: (r) => r.analytics.ask({ question: 'What was MRR growth last quarter?' }),
            verb: 'post',
            path: '/v1/analytics/ask',
            body: { question: 'What was MRR growth last quarter?' },
        },
    ],

    ledger: [
        { method: 'accounts', call: (r) => r.ledger.accounts(), verb: 'get', path: '/v1/ledger/accounts' },
        {
            method: 'entries',
            call: (r) => r.ledger.entries({ account_id: 'acct_1' }),
            verb: 'get',
            path: '/v1/ledger/entries',
            params: { account_id: 'acct_1' },
        },
        { method: 'transaction', call: (r) => r.ledger.transaction('lt_1'), verb: 'get', path: '/v1/ledger/transactions/lt_1' },
        {
            method: 'trialBalance',
            call: (r) => r.ledger.trialBalance({ consolidated: true }),
            verb: 'get',
            path: '/v1/ledger/trial-balance',
            params: { consolidated: true },
        },
        {
            method: 'deferredRollforward',
            call: (r) => r.ledger.deferredRollforward({ month: 7, year: 2026 }),
            verb: 'get',
            path: '/v1/ledger/deferred-rollforward',
            params: { month: 7, year: 2026 },
        },
        {
            method: 'export',
            call: (r) => r.ledger.export({ month: 7, year: 2026 }),
            verb: 'get',
            path: '/v1/ledger/export',
            params: { month: 7, year: 2026 },
            responseType: 'text',
        },
    ],

    organizations: [
        {
            method: 'create',
            call: (r) => r.organizations.create({ name: 'Acme Group', owner_email: 'owner@acme.com' }),
            verb: 'post',
            path: '/v1/organizations',
            body: { name: 'Acme Group', owner_email: 'owner@acme.com' },
        },
        { method: 'list', call: (r) => r.organizations.list(), verb: 'get', path: '/v1/organizations' },
        { method: 'get', call: (r) => r.organizations.get('org_1'), verb: 'get', path: '/v1/organizations/org_1' },
        {
            method: 'update',
            call: (r) => r.organizations.update('org_1', { name: 'Acme Holdings' }),
            verb: 'put',
            path: '/v1/organizations/org_1',
            body: { name: 'Acme Holdings' },
        },
        { method: 'delete', call: (r) => r.organizations.delete('org_1'), verb: 'delete', path: '/v1/organizations/org_1' },
        {
            method: 'addTenant',
            call: (r) => r.organizations.addTenant('org_1', 'ten_1'),
            verb: 'post',
            path: '/v1/organizations/org_1/tenants',
            body: { tenant_id: 'ten_1' },
        },
        { method: 'tenants', call: (r) => r.organizations.tenants('org_1'), verb: 'get', path: '/v1/organizations/org_1/tenants' },
        {
            method: 'removeTenant',
            call: (r) => r.organizations.removeTenant('org_1', 'ten_1'),
            verb: 'delete',
            path: '/v1/organizations/org_1/tenants/ten_1',
        },
        { method: 'mrr', call: (r) => r.organizations.mrr('org_1'), verb: 'get', path: '/v1/organizations/org_1/analytics/mrr' },
    ],

    accounting: [
        { method: 'connections', call: (r) => r.accounting.connections(), verb: 'get', path: '/v1/accounting/connections' },
        {
            method: 'connectToken',
            call: (r) => r.accounting.connectToken('netsuite', { account_id: 'acct-42', access_token: 'tok_1' }),
            verb: 'post',
            path: '/v1/accounting/connect-token/netsuite',
            body: { account_id: 'acct-42', access_token: 'tok_1' },
        },
        {
            method: 'connectToken (tally, no credentials)',
            call: (r) => r.accounting.connectToken('tally'),
            verb: 'post',
            path: '/v1/accounting/connect-token/tally',
        },
        {
            method: 'disconnect',
            call: (r) => r.accounting.disconnect('conn_1'),
            verb: 'delete',
            path: '/v1/accounting/connections/conn_1',
        },
        { method: 'sync', call: (r) => r.accounting.sync(), verb: 'post', path: '/v1/accounting/sync' },
        { method: 'syncStatus', call: (r) => r.accounting.syncStatus(), verb: 'get', path: '/v1/accounting/sync/status' },
        { method: 'connect', call: (r) => r.accounting.connect('quickbooks'), verb: 'post', path: '/v1/accounting/connect/quickbooks' },
        {
            method: 'oauthCallback',
            call: (r) => r.accounting.oauthCallback('quickbooks', { code: 'c', state: 's', realmId: '42' }),
            verb: 'get',
            path: '/v1/accounting/callback/quickbooks',
            params: { code: 'c', state: 's', realmId: '42' },
        },
    ],

    virtualAccounts: [
        {
            method: 'create',
            call: (r) => r.virtualAccounts.create({ customer_id: 'cus_1', invoice_id: 'inv_1', amount: 500000 }),
            verb: 'post',
            path: '/v1/virtual-accounts',
            body: { customer_id: 'cus_1', invoice_id: 'inv_1', amount: 500000 },
        },
        { method: 'list', call: (r) => r.virtualAccounts.list(), verb: 'get', path: '/v1/virtual-accounts' },
    ],

    offlinePayments: [
        {
            method: 'record',
            call: (r) =>
                r.offlinePayments.record({
                    customer_id: 'cus_1',
                    invoice_id: 'inv_1',
                    payment_type: 'bank_transfer',
                    amount: 500000,
                    reference_number: 'NEFT-123',
                }),
            verb: 'post',
            path: '/v1/payments/offline',
            body: {
                customer_id: 'cus_1',
                invoice_id: 'inv_1',
                payment_type: 'bank_transfer',
                amount: 500000,
                reference_number: 'NEFT-123',
            },
        },
        { method: 'list', call: (r) => r.offlinePayments.list(), verb: 'get', path: '/v1/payments/offline' },
    ],

    churn: [
        {
            method: 'highRisk',
            call: (r) => r.churn.highRisk({ threshold: 80 }),
            verb: 'get',
            path: '/v1/churn/high-risk',
            params: { threshold: 80 },
        },
        { method: 'alerts', call: (r) => r.churn.alerts(), verb: 'get', path: '/v1/churn/alerts' },
        {
            method: 'acknowledgeAlert',
            call: (r) => r.churn.acknowledgeAlert('ca_1'),
            verb: 'post',
            path: '/v1/churn/alerts/ca_1/ack',
        },
    ],

    cancelFlows: [
        {
            method: 'create',
            call: (r) => r.cancelFlows.create({ name: 'Default save flow', is_default: true, cooldown_days: 30 }),
            verb: 'post',
            path: '/v1/cancel-flows',
            body: { name: 'Default save flow', is_default: true, cooldown_days: 30 },
        },
        { method: 'list', call: (r) => r.cancelFlows.list(), verb: 'get', path: '/v1/cancel-flows' },
        { method: 'get', call: (r) => r.cancelFlows.get('cf_1'), verb: 'get', path: '/v1/cancel-flows/cf_1' },
        {
            method: 'update',
            call: (r) => r.cancelFlows.update('cf_1', { is_active: false }),
            verb: 'put',
            path: '/v1/cancel-flows/cf_1',
            body: { is_active: false },
        },
        {
            method: 'addStep',
            call: (r) => r.cancelFlows.addStep('cf_1', { step_order: 1, step_type: 'survey' }),
            verb: 'post',
            path: '/v1/cancel-flows/cf_1/steps',
            body: { step_order: 1, step_type: 'survey' },
        },
        {
            method: 'updateStep',
            call: (r) => r.cancelFlows.updateStep('cfs_1', { step_order: 2, step_type: 'offer' }),
            verb: 'put',
            path: '/v1/cancel-flows/steps/cfs_1',
            body: { step_order: 2, step_type: 'offer' },
        },
        { method: 'deleteStep', call: (r) => r.cancelFlows.deleteStep('cfs_1'), verb: 'delete', path: '/v1/cancel-flows/steps/cfs_1' },
        {
            method: 'startSession',
            call: (r) => r.cancelFlows.startSession({ customer_id: 'cus_1', subscription_id: 'sub_1' }),
            verb: 'post',
            path: '/v1/cancel-flows/sessions/start',
            body: { customer_id: 'cus_1', subscription_id: 'sub_1' },
        },
        {
            method: 'getSession',
            call: (r) => r.cancelFlows.getSession('cfsess_1'),
            verb: 'get',
            path: '/v1/cancel-flows/sessions/cfsess_1',
        },
        {
            method: 'submitStep',
            call: (r) => r.cancelFlows.submitStep('cfsess_1', { step_index: 0, response: { reason: 'too_expensive' } }),
            verb: 'post',
            path: '/v1/cancel-flows/sessions/cfsess_1/submit',
            body: { step_index: 0, response: { reason: 'too_expensive' } },
        },
        {
            method: 'stats',
            call: (r) => r.cancelFlows.stats('cf_1'),
            verb: 'get',
            path: '/v1/cancel-flows/stats',
            params: { flow_id: 'cf_1' },
        },
    ],

    dunningCampaigns: [
        {
            method: 'create',
            call: (r) => r.dunningCampaigns.create({ name: 'Payment recovery', trigger_event: 'payment_failed' }),
            verb: 'post',
            path: '/v1/dunning-campaigns',
            body: { name: 'Payment recovery', trigger_event: 'payment_failed' },
        },
        { method: 'list', call: (r) => r.dunningCampaigns.list(), verb: 'get', path: '/v1/dunning-campaigns' },
        { method: 'get', call: (r) => r.dunningCampaigns.get('dc_1'), verb: 'get', path: '/v1/dunning-campaigns/dc_1' },
        {
            method: 'update',
            call: (r) => r.dunningCampaigns.update('dc_1', { is_active: true }),
            verb: 'put',
            path: '/v1/dunning-campaigns/dc_1',
            body: { is_active: true },
        },
        {
            method: 'addStep',
            call: (r) =>
                r.dunningCampaigns.addStep('dc_1', { step_order: 1, channel: 'email', delay_hours: 24, is_payment_wall: false }),
            verb: 'post',
            path: '/v1/dunning-campaigns/dc_1/steps',
            body: { step_order: 1, channel: 'email', delay_hours: 24, is_payment_wall: false },
        },
        {
            method: 'updateStep',
            call: (r) => r.dunningCampaigns.updateStep('dcs_1', { delay_hours: 48 }),
            verb: 'put',
            path: '/v1/dunning-campaigns/steps/dcs_1',
            body: { delay_hours: 48 },
        },
        {
            method: 'deleteStep',
            call: (r) => r.dunningCampaigns.deleteStep('dcs_1'),
            verb: 'delete',
            path: '/v1/dunning-campaigns/steps/dcs_1',
        },
    ],
    collections: [
        {
            method: 'queue',
            call: (r) => r.collections.queue({ status: 'past_due', managed_by: 'worker', per_page: 25 }),
            verb: 'get',
            path: '/v1/collections/queue',
            params: { status: 'past_due', managed_by: 'worker', per_page: 25 },
        },
        { method: 'funnel', call: (r) => r.collections.funnel(), verb: 'get', path: '/v1/analytics/collections/funnel' },
        { method: 'failures', call: (r) => r.collections.failures(), verb: 'get', path: '/v1/analytics/collections/failures' },
        {
            method: 'retryNow',
            call: (r) => r.collections.retryNow('inv_1'),
            verb: 'post',
            path: '/v1/collections/invoices/inv_1/retry-now',
        },
        {
            method: 'pauseDunning',
            call: (r) => r.collections.pauseDunning('inv_1', true),
            verb: 'post',
            path: '/v1/collections/invoices/inv_1/pause',
            body: { paused: true },
        },
        {
            method: 'markUncollectible',
            call: (r) => r.collections.markUncollectible('inv_1'),
            verb: 'post',
            path: '/v1/collections/invoices/inv_1/mark-uncollectible',
        },
    ],
    entities: [
        { method: 'list', call: (r) => r.entities.list(), verb: 'get', path: '/v1/entities' },
        {
            method: 'create',
            call: (r) => r.entities.create({ name: 'Branch', invoice_prefix: 'BR' }),
            verb: 'post',
            path: '/v1/entities',
            body: { name: 'Branch', invoice_prefix: 'BR' },
        },
        { method: 'get', call: (r) => r.entities.get('ent_1'), verb: 'get', path: '/v1/entities/ent_1' },
        {
            method: 'update',
            call: (r) => r.entities.update('ent_1', { name: 'Branch 2' }),
            verb: 'put',
            path: '/v1/entities/ent_1',
            body: { name: 'Branch 2' },
        },
        { method: 'delete', call: (r) => r.entities.delete('ent_1'), verb: 'delete', path: '/v1/entities/ent_1' },
        { method: 'overview', call: (r) => r.entities.overview(), verb: 'get', path: '/v1/analytics/entities-overview' },
    ],

    paymentAttempts: [
        {
            method: 'list',
            call: (r) => r.paymentAttempts.list({ status: 'failed', page: 2, per_page: 25 }),
            verb: 'get',
            path: '/v1/payment-attempts',
            params: { status: 'failed', page: 2, per_page: 25 },
        },
        { method: 'get', call: (r) => r.paymentAttempts.get('pa_1'), verb: 'get', path: '/v1/payment-attempts/pa_1' },
    ],

    payments: [
        {
            method: 'createOrder',
            call: (r) => r.payments.createOrder({ invoice_id: 'inv_1' }),
            verb: 'post',
            path: '/payments/order',
            body: { invoice_id: 'inv_1' },
        },
    ],

    finance: [
        {
            method: 'closePack',
            call: (r) => r.finance.closePack({ month: 7, year: 2026 }),
            verb: 'get',
            path: '/v1/finance/close-pack',
            params: { month: 7, year: 2026 },
        },
        { method: 'reconciliation', call: (r) => r.finance.reconciliation(), verb: 'get', path: '/v1/finance/reconciliation' },
        {
            method: 'recordReconciliation',
            call: (r) => r.finance.recordReconciliation(),
            verb: 'post',
            path: '/v1/finance/reconciliation/runs',
        },
        {
            method: 'reconciliationRuns',
            call: (r) => r.finance.reconciliationRuns({ limit: 10 }),
            verb: 'get',
            path: '/v1/finance/reconciliation/runs',
            params: { limit: 10 },
        },
        {
            method: 'reconciliationRun',
            call: (r) => r.finance.reconciliationRun('run_1'),
            verb: 'get',
            path: '/v1/finance/reconciliation/runs/run_1',
        },
        {
            method: 'revRecReport',
            call: (r) => r.finance.revRecReport({ month: 7, year: 2026 }),
            verb: 'get',
            path: '/v1/finance/revrec/report',
            params: { month: 7, year: 2026 },
        },
        { method: 'revenueWaterfall', call: (r) => r.finance.revenueWaterfall(), verb: 'get', path: '/v1/finance/revrec/waterfall' },
    ],

    india: [
        {
            method: 'gstr1',
            call: (r) => r.india.gstr1({ month: 7, year: 2026 }),
            verb: 'get',
            path: '/v1/india/gstr1',
            params: { month: 7, year: 2026 },
        },
        {
            method: 'gstr3b',
            call: (r) => r.india.gstr3b({ month: 7, year: 2026, entity_id: 'ent_1' }),
            verb: 'get',
            path: '/v1/india/gstr3b',
            params: { month: 7, year: 2026, entity_id: 'ent_1' },
        },
    ],

    consents: [
        {
            method: 'record',
            call: (r) => r.consents.record({ customer_id: 'cus_1', consent_type: 'recurring_billing', granted: true }),
            verb: 'post',
            path: '/v1/consents',
            body: { customer_id: 'cus_1', consent_type: 'recurring_billing', granted: true },
        },
        {
            method: 'revoke',
            call: (r) => r.consents.revoke('cons_1'),
            verb: 'post',
            path: '/v1/consents/revoke',
            body: { consent_id: 'cons_1' },
        },
    ],

    settings: [
        { method: 'getEUEInvoice', call: (r) => r.settings.getEUEInvoice(), verb: 'get', path: '/v1/settings/eu-einvoice' },
        { method: 'updateEUEInvoice', call: (r) => r.settings.updateEUEInvoice(body), verb: 'put', path: '/v1/settings/eu-einvoice', body },
        { method: 'getGST', call: (r) => r.settings.getGST(), verb: 'get', path: '/v1/settings/gst' },
        { method: 'updateGST', call: (r) => r.settings.updateGST(body), verb: 'put', path: '/v1/settings/gst', body },
        {
            method: 'validateGSTIN',
            call: (r) => r.settings.validateGSTIN('27AAPFU0939F1ZV'),
            verb: 'post',
            path: '/v1/settings/gst/validate',
            body: { gstin: '27AAPFU0939F1ZV' },
        },
        { method: 'getInvoiceBranding', call: (r) => r.settings.getInvoiceBranding(), verb: 'get', path: '/v1/settings/invoice-branding' },
        {
            method: 'updateInvoiceBranding',
            call: (r) => r.settings.updateInvoiceBranding(body),
            verb: 'put',
            path: '/v1/settings/invoice-branding',
            body,
        },
        { method: 'getIRP', call: (r) => r.settings.getIRP(), verb: 'get', path: '/v1/settings/irp' },
        { method: 'updateIRP', call: (r) => r.settings.updateIRP(body), verb: 'put', path: '/v1/settings/irp', body },
        { method: 'testIRP', call: (r) => r.settings.testIRP(), verb: 'post', path: '/v1/settings/irp/test' },
        { method: 'getMCP', call: (r) => r.settings.getMCP(), verb: 'get', path: '/v1/settings/mcp' },
        {
            method: 'updateMCP',
            call: (r) => r.settings.updateMCP({ tier3_enabled: true }),
            verb: 'put',
            path: '/v1/settings/mcp',
            body: { tier3_enabled: true },
        },
        {
            method: 'taxLiability',
            call: (r) => r.settings.taxLiability({ year: 2026 }),
            verb: 'get',
            path: '/v1/settings/tax/liability',
            params: { year: 2026 },
        },
        {
            method: 'getTaxNexus',
            call: (r) => r.settings.getTaxNexus({ entity_id: 'ent_1' }),
            verb: 'get',
            path: '/v1/settings/tax/nexus',
            params: { entity_id: 'ent_1' },
        },
        {
            method: 'setTaxNexus',
            call: (r) => r.settings.setTaxNexus({ states: [{ state_code: 'CA', nexus_type: 'physical' }] }),
            verb: 'put',
            path: '/v1/settings/tax/nexus',
            body: { states: [{ state_code: 'CA', nexus_type: 'physical' }] },
        },
        {
            method: 'taxNexusStatus',
            call: (r) => r.settings.taxNexusStatus({ year: 2026 }),
            verb: 'get',
            path: '/v1/settings/tax/nexus/status',
            params: { year: 2026 },
        },
        { method: 'getTaxRegistrations', call: (r) => r.settings.getTaxRegistrations(), verb: 'get', path: '/v1/settings/tax/registrations' },
        {
            method: 'setTaxRegistrations',
            call: (r) => r.settings.setTaxRegistrations({ registrations: [{ state_code: 'CA', status: 'registered' }] }),
            verb: 'put',
            path: '/v1/settings/tax/registrations',
            body: { registrations: [{ state_code: 'CA', status: 'registered' }] },
        },
        { method: 'getUSTax', call: (r) => r.settings.getUSTax(), verb: 'get', path: '/v1/settings/tax/us' },
        { method: 'updateUSTax', call: (r) => r.settings.updateUSTax(body), verb: 'put', path: '/v1/settings/tax/us', body },
    ],

    users: [
        { method: 'list', call: (r) => r.users.list(), verb: 'get', path: '/v1/users' },
        {
            method: 'create',
            call: (r) => r.users.create({ email: 'a@b.co', name: 'A', role: 'member', password: 'hunter2hunter2' }),
            verb: 'post',
            path: '/v1/users',
            body: { email: 'a@b.co', name: 'A', role: 'member', password: 'hunter2hunter2' },
        },
        {
            method: 'invite',
            call: (r) => r.users.invite({ email: 'a@b.co', name: 'A', role: 'admin' }),
            verb: 'post',
            path: '/v1/users/invite',
            body: { email: 'a@b.co', name: 'A', role: 'admin' },
        },
        {
            method: 'updateRole',
            call: (r) => r.users.updateRole('usr_1', 'admin'),
            verb: 'patch',
            path: '/v1/users/usr_1',
            body: { role: 'admin' },
        },
        { method: 'delete', call: (r) => r.users.delete('usr_1'), verb: 'delete', path: '/v1/users/usr_1' },
    ],

    apiKeys: [
        { method: 'list', call: (r) => r.apiKeys.list(), verb: 'get', path: '/v1/developer/keys' },
        {
            method: 'create',
            call: (r) => r.apiKeys.create({ name: 'ci', mode: 'test' }),
            verb: 'post',
            path: '/v1/developer/keys',
            body: { name: 'ci', mode: 'test' },
        },
        { method: 'revoke', call: (r) => r.apiKeys.revoke('key_1'), verb: 'delete', path: '/v1/developer/keys/key_1' },
    ],

    auth: [
        { method: 'mfaSetup', call: (r) => r.auth.mfaSetup(), verb: 'post', path: '/v1/auth/mfa/setup' },
        { method: 'mfaVerify', call: (r) => r.auth.mfaVerify('123456'), verb: 'post', path: '/v1/auth/mfa/verify', body: { code: '123456' } },
        { method: 'mfaDisable', call: (r) => r.auth.mfaDisable('123456'), verb: 'post', path: '/v1/auth/mfa/disable', body: { code: '123456' } },
        { method: 'sessions', call: (r) => r.auth.sessions(), verb: 'get', path: '/v1/auth/sessions' },
        { method: 'revokeOtherSessions', call: (r) => r.auth.revokeOtherSessions(), verb: 'delete', path: '/v1/auth/sessions' },
        { method: 'revokeSession', call: (r) => r.auth.revokeSession('sess_1'), verb: 'delete', path: '/v1/auth/sessions/sess_1' },
    ],

    sso: [
        { method: 'get', call: (r) => r.sso.get(), verb: 'get', path: '/v1/sso/connection' },
        { method: 'upsert', call: (r) => r.sso.upsert(body), verb: 'put', path: '/v1/sso/connection', body },
        { method: 'delete', call: (r) => r.sso.delete(), verb: 'delete', path: '/v1/sso/connection' },
    ],

    gatewayConnections: [
        { method: 'list', call: (r) => r.gatewayConnections.list(), verb: 'get', path: '/v1/gateway-connections' },
        {
            method: 'create',
            call: (r) => r.gatewayConnections.create({ provider: 'stripe', mode: 'test', secret_key: 'sk_test_1' }),
            verb: 'post',
            path: '/v1/gateway-connections',
            body: { provider: 'stripe', mode: 'test', secret_key: 'sk_test_1' },
        },
        { method: 'delete', call: (r) => r.gatewayConnections.delete('stripe'), verb: 'delete', path: '/v1/gateway-connections/stripe' },
        {
            method: 'setWebhookSecret',
            call: (r) => r.gatewayConnections.setWebhookSecret('razorpay', 'whsec_1'),
            verb: 'put',
            path: '/v1/gateway-connections/razorpay/webhook-secret',
            body: { webhook_secret: 'whsec_1' },
        },
    ],

    integrationConnections: [
        { method: 'list', call: (r) => r.integrationConnections.list(), verb: 'get', path: '/v1/integration-connections' },
        {
            method: 'create',
            call: (r) => r.integrationConnections.create({ category: 'tax', provider: 'taxjar', config: { api_key: 'k' } }),
            verb: 'post',
            path: '/v1/integration-connections',
            body: { category: 'tax', provider: 'taxjar', config: { api_key: 'k' } },
        },
        {
            method: 'delete',
            call: (r) => r.integrationConnections.delete('crm', 'hubspot'),
            verb: 'delete',
            path: '/v1/integration-connections/crm/hubspot',
        },
    ],

    crm: [{ method: 'sync', call: (r) => r.crm.sync(), verb: 'post', path: '/v1/crm/sync' }],

    migration: [
        { method: 'previewStripe', call: (r) => r.migration.previewStripe(body), verb: 'post', path: '/v1/import/stripe/preview', body },
        { method: 'compareStripe', call: (r) => r.migration.compareStripe(body), verb: 'post', path: '/v1/import/stripe/compare', body },
        { method: 'commitStripe', call: (r) => r.migration.commitStripe(body), verb: 'post', path: '/v1/import/stripe/commit', body },
        {
            method: 'previewChargebee',
            call: (r) => r.migration.previewChargebee(body),
            verb: 'post',
            path: '/v1/import/chargebee/preview',
            body,
        },
        {
            method: 'compareChargebee',
            call: (r) => r.migration.compareChargebee(body),
            verb: 'post',
            path: '/v1/import/chargebee/compare',
            body,
        },
        { method: 'commitChargebee', call: (r) => r.migration.commitChargebee(body), verb: 'post', path: '/v1/import/chargebee/commit', body },
        {
            method: 'previewRevenueCat',
            call: (r) => r.migration.previewRevenueCat(body),
            verb: 'post',
            path: '/v1/import/revenuecat/preview',
            body,
        },
        {
            method: 'compareRevenueCat',
            call: (r) => r.migration.compareRevenueCat(body),
            verb: 'post',
            path: '/v1/import/revenuecat/compare',
            body,
        },
        {
            method: 'commitRevenueCat',
            call: (r) => r.migration.commitRevenueCat(body),
            verb: 'post',
            path: '/v1/import/revenuecat/commit',
            body,
        },
        {
            method: 'compareReports',
            call: (r) => r.migration.compareReports({ limit: 5 }),
            verb: 'get',
            path: '/v1/import/compare-reports',
            params: { limit: 5 },
        },
        { method: 'compareReport', call: (r) => r.migration.compareReport('cr_1'), verb: 'get', path: '/v1/import/compare-reports/cr_1' },
        {
            method: 'compareReportDocument',
            call: (r) => r.migration.compareReportDocument('cr_1'),
            verb: 'get',
            path: '/v1/import/compare-reports/cr_1/document',
            responseType: 'text',
        },
    ],

    billing: [
        { method: 'plans', call: (r) => r.billing.plans(), verb: 'get', path: '/v1/billing/plans' },
        { method: 'status', call: (r) => r.billing.status(), verb: 'get', path: '/v1/billing/status' },
    ],

    system: [
        { method: 'version', call: (r) => r.system.version(), verb: 'get', path: '/version' },
        { method: 'metrics', call: (r) => r.system.metrics(), verb: 'get', path: '/metrics', responseType: 'text' },
        { method: 'platformMetrics', call: (r) => r.system.platformMetrics(), verb: 'get', path: '/platform/metrics' },
        {
            method: 'joinWaitlist',
            call: (r) => r.system.joinWaitlist({ email: 'founder@example.com', company: 'Acme' }),
            verb: 'post',
            path: '/waitlist',
            body: { email: 'founder@example.com', company: 'Acme' },
        },
    ],
};

describe('Recurso constructor', () => {
    it('creates one axios client with Bearer auth and JSON content type', () => {
        expect(mocks.create).toHaveBeenCalledTimes(1);
        expect(mocks.create).toHaveBeenCalledWith({
            baseURL: BASE_URL,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
    });

    it('defaults baseURL to http://localhost:8080', () => {
        mocks.create.mockClear();
        new Recurso(API_KEY);
        expect(mocks.create).toHaveBeenCalledWith(
            expect.objectContaining({ baseURL: 'http://localhost:8080' }),
        );
    });
});

for (const [resource, methods] of Object.entries(cases)) {
    describe(resource, () => {
        for (const c of methods) {
            it(`${c.method} -> ${c.verb.toUpperCase()} ${c.path}`, async () => {
                const result = await c.call(recurso);

                // Response envelope is unwrapped to `.data`.
                expect(result).toBe(PAYLOAD);

                // Only the expected verb fired, exactly once.
                const fn = mocks.client[c.verb];
                expect(fn).toHaveBeenCalledTimes(1);
                for (const other of VERBS) {
                    if (other !== c.verb) expect(mocks.client[other]).not.toHaveBeenCalled();
                }

                // Verb-specific argument shape.
                if (c.verb === 'get') {
                    const config = c.responseType ? { params: c.params, responseType: c.responseType } : { params: c.params };
                    expect(fn).toHaveBeenCalledWith(c.path, config);
                } else if (c.verb === 'delete') {
                    expect(fn).toHaveBeenCalledWith(c.path);
                } else {
                    expect(fn).toHaveBeenCalledWith(c.path, c.body);
                }
            });
        }
    });
}

describe('list params passthrough', () => {
    it('forwards params untouched (no cloning, filtering, or renaming)', async () => {
        const params = { page: 1, limit: 10, q: 'acme', status: 'active', custom_filter: 'x' };
        await recurso.customers.list(params);
        // Same object reference: proves untouched passthrough.
        expect(mocks.client.get.mock.calls[0][1].params).toBe(params);
    });

    it('accepts the typed server-side filters (plan/date, currency/interval, type)', async () => {
        const subParams = { plan_id: 'plan_1', started_after: '2026-08-01T00:00:00Z' };
        await recurso.subscriptions.list(subParams);
        expect(mocks.client.get).toHaveBeenCalledWith('/v1/subscriptions', { params: subParams });

        const planParams = { currency: 'INR', interval_unit: 'month' };
        await recurso.plans.list(planParams);
        expect(mocks.client.get).toHaveBeenCalledWith('/v1/plans', { params: planParams });

        const eventParams = { type: 'invoice.paid', limit: 5 };
        await recurso.events.list(eventParams);
        expect(mocks.client.get).toHaveBeenCalledWith('/v1/events', { params: eventParams });
    });

    it('accepts the scoped filters (customer_id, subscription_id, object_id)', async () => {
        const subParams = { customer_id: 'cus_1', status: 'active' };
        await recurso.subscriptions.list(subParams);
        expect(mocks.client.get).toHaveBeenCalledWith('/v1/subscriptions', { params: subParams });

        const invoiceParams = { customer_id: 'cus_1', subscription_id: 'sub_1', limit: 100 };
        await recurso.invoices.list(invoiceParams);
        expect(mocks.client.get).toHaveBeenCalledWith('/v1/invoices', { params: invoiceParams });

        const timeline = { object_id: 'inv_1' };
        await recurso.events.list(timeline);
        expect(mocks.client.get).toHaveBeenCalledWith('/v1/events', { params: timeline });
    });

    it('sends undefined params when a list method is called without arguments', async () => {
        await recurso.plans.list();
        expect(mocks.client.get).toHaveBeenCalledWith('/v1/plans', { params: undefined });
    });
});

describe('customers.create country default', () => {
    it('defaults country to US when omitted', async () => {
        await recurso.customers.create({ email: 'a@b.co', name: 'A' });
        expect(mocks.client.post).toHaveBeenCalledWith('/v1/customers', {
            country: 'US',
            email: 'a@b.co',
            name: 'A',
        });
    });

    it('caller-supplied country wins over the default', async () => {
        await recurso.customers.create({ email: 'a@b.co', name: 'A', country: 'DE' });
        expect(mocks.client.post.mock.calls[0][1].country).toBe('DE');
    });
});

describe('plans.create interval_count default', () => {
    it('defaults interval_count to 1 when omitted', async () => {
        await recurso.plans.create({
            name: 'Pro',
            code: 'PRO',
            amount: 2900,
            currency: 'USD',
            interval_unit: 'month',
        });
        expect(mocks.client.post).toHaveBeenCalledWith('/v1/plans', {
            interval_count: 1,
            name: 'Pro',
            code: 'PRO',
            amount: 2900,
            currency: 'USD',
            interval_unit: 'month',
        });
    });

    it('caller-supplied interval_count wins over the default', async () => {
        await recurso.plans.create({
            name: 'Quarterly',
            code: 'Q',
            amount: 900,
            currency: 'USD',
            interval_unit: 'month',
            interval_count: 3,
        });
        expect(mocks.client.post.mock.calls[0][1].interval_count).toBe(3);
    });
});

describe('invoices.pdfUrl', () => {
    it('builds the public PDF URL from the client baseURL without an HTTP call', () => {
        const url = recurso.invoices.pdfUrl('inv_42');
        expect(url).toBe(`${BASE_URL}/v1/invoices/inv_42/pdf`);
        for (const verb of VERBS) {
            expect(mocks.client[verb]).not.toHaveBeenCalled();
        }
    });
});

describe('error propagation', () => {
    it('rejects with the underlying axios error', async () => {
        const boom = Object.assign(new Error('Request failed with status code 422'), {
            response: { status: 422, data: { error: 'validation failed' } },
        });
        mocks.client.post.mockRejectedValueOnce(boom);
        await expect(recurso.subscriptions.create({ customer_id: 'c', plan_id: 'p' })).rejects.toBe(boom);
    });
});

describe('API surface completeness', () => {
    it('the test table covers every public resource method on the SDK', () => {
        const sdkSurface: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(recurso as unknown as Record<string, unknown>)) {
            if (key === 'client') continue; // private axios instance
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const methodNames = Object.entries(value)
                    .filter(([, v]) => typeof v === 'function')
                    .map(([name]) => name)
                    .sort();
                if (methodNames.length > 0) sdkSurface[key] = methodNames;
            }
        }

        const tested: Record<string, string[]> = {};
        for (const [resource, methods] of Object.entries(cases)) {
            // A method may appear more than once with a " (variant)" suffix
            // (e.g. "record (with properties)"); count the base name once.
            tested[resource] = [...new Set(methods.map((m) => m.method.split(' (')[0]))].sort();
        }
        // pdfUrl is covered by its own dedicated (non-HTTP) test.
        tested.invoices = [...tested.invoices, 'pdfUrl'].sort();

        expect(tested).toEqual(sdkSurface);
    });
});

// Sanity: the real axios module is fully mocked in this suite.
describe('mocking', () => {
    it('axios.create is the mocked factory', () => {
        expect(axios.create).toBe(mocks.create);
    });
});
