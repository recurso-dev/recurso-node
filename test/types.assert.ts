/**
 * Compile-time regression guard for SDK response typing.
 *
 * This file emits no runtime code and is never imported — it exists only so
 * `npm run typecheck` fails if a method's response ever collapses back to the
 * opaque `ApiResponse` (`{ [k: string]: JsonValue }`). Each assignment below
 * would stop type-checking if the field types were widened to `JsonValue`.
 */
import type { Recurso, Subscription, Customer, Invoice, Organization, ChurnAlert } from '../src/index';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _assertResponsesAreTyped(client: Recurso): Promise<void> {
    // Single-resource create returns the concrete resource, not an opaque object.
    const sub = await client.subscriptions.create({ customer_id: 'c', plan_id: 'p' });
    const subId: string | undefined = sub.id;
    const subStatus = sub.status; // SubscriptionStatus enum, not JsonValue
    void subId;
    void subStatus;

    // List endpoints unwrap to a typed `data` array of the resource.
    const subs = await client.subscriptions.list();
    const firstSub: Subscription | undefined = subs.data?.[0];
    void firstSub;

    const customers = await client.customers.list();
    const firstCustomer: Customer | undefined = customers.data?.[0];
    const email: string | undefined = firstCustomer?.email;
    void email;

    const invoices = await client.invoices.list();
    const firstInvoice: Invoice | undefined = invoices.data?.[0];
    const total: number | undefined = firstInvoice?.total;
    void total;

    const orgs = await client.organizations.list();
    const firstOrg: Organization | undefined = orgs.data?.[0];
    const orgName: string | undefined = firstOrg?.name;
    void orgName;

    const alerts = await client.churn.alerts();
    const firstAlert: ChurnAlert | undefined = alerts.data?.[0];
    void firstAlert;

    // 1.9.0 surface: inline (non-$ref) response schemas are typed too.
    const attempts = await client.paymentAttempts.list({ status: 'failed' });
    const attemptStatus: 'initiated' | 'processing' | 'succeeded' | 'failed' | 'returned' | undefined =
        attempts.data?.[0]?.status;
    void attemptStatus;

    const runs = await client.finance.reconciliationRuns({ limit: 10 });
    const discrepancies: number | undefined = runs.data?.[0]?.total_discrepancies;
    void discrepancies;

    const history = await client.subscriptions.history('sub_1');
    const changeType: 'status' | 'plan' | undefined = history.data?.history?.[0]?.change_type;
    void changeType;

    // Document endpoints resolve to the raw text, not a JSON envelope.
    const html: string = await client.invoices.pdf('inv_1');
    const csv: string = await client.ledger.export({ month: 1, year: 2026 });
    void html;
    void csv;
}

void _assertResponsesAreTyped;
