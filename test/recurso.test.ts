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
    for (const verb of ['get', 'post', 'put', 'delete'] as const) {
        mocks.client[verb].mockReset().mockResolvedValue(RESPONSE);
    }
    recurso = new Recurso(API_KEY, BASE_URL);
});

type Verb = 'get' | 'post' | 'put' | 'delete';

interface MethodCase {
    /** Method name, for the subtest title. */
    method: string;
    /** Invokes the SDK method under test. */
    call: (r: Recurso) => Promise<unknown>;
    verb: Verb;
    path: string;
    /** Expected query params object (GET) — omit for "no params passed". */
    params?: object;
    /** Expected request body (POST/PUT) — omit for "no body passed". */
    body?: unknown;
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
    ],

    creditNotes: [
        { method: 'create', call: (r) => r.creditNotes.create(body), verb: 'post', path: '/v1/credit-notes', body },
        { method: 'list', call: (r) => r.creditNotes.list(listParams), verb: 'get', path: '/v1/credit-notes', params: listParams },
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
                for (const other of ['get', 'post', 'put', 'delete'] as const) {
                    if (other !== c.verb) expect(mocks.client[other]).not.toHaveBeenCalled();
                }

                // Verb-specific argument shape.
                if (c.verb === 'get') {
                    expect(fn).toHaveBeenCalledWith(c.path, { params: c.params });
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
        for (const verb of ['get', 'post', 'put', 'delete'] as const) {
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
