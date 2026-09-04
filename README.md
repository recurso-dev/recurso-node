# recurso-node

Official Node.js SDK for the [Recurso](https://github.com/recurso-dev/recurso) billing API — 47 resources, 282 methods covering every in-scope path of the API's OpenAPI spec: plans, customers, the full subscription lifecycle (add-ons, progressive usage billing, cancel previews, history), invoices (documents, e-invoicing, journal entries, payment attempts), usage-based billing (billable metrics, plan charges and charge simulation, prepaid wallets, minimum commitments, usage alerts, batch ingestion, audit trail), quotes, credit notes, entitlements, webhooks (including pause/resume, delivery tracking and redelivery), organizations and legal entities, the general ledger (trial balance, journal entries, deferred-revenue rollforward, CSV export), month-end finance (close pack, reconciliation runs, revenue recognition), accounting, payment-gateway and tax/CRM/storage integrations, offline payments and virtual accounts, collections, dunning campaigns and analytics, cancel flows, churn insights, consents, Indian GST returns, tenant settings, team/API-key/SSO/MFA management, and migration from Stripe, Chargebee and RevenueCat. Every method is covered by the vitest suite in `test/` (`npm test`).

Published on npm as [`recurso`](https://www.npmjs.com/package/recurso):

```bash
npm install recurso
```

## Usage

```typescript
import { Recurso } from 'recurso';

const recurso = new Recurso('sk_live_your_api_key', 'https://billing.example.com');

const plan = await recurso.plans.create({
  name: 'Pro Plan',
  code: 'PRO-USD',
  amount: 2900,          // minor units
  currency: 'USD',
  interval_unit: 'month',
});

const customer = await recurso.customers.create({
  name: 'Jane User',
  email: 'jane@example.com',
  country: 'US',
});

await recurso.subscriptions.create({
  customer_id: customer.id,
  plan_id: plan.id,
});
```

## Resources

| Resource | Methods | Covers |
|---|---|---|
| `account` | 2 | Tenant account |
| `customers` | 10 | CRUD, archive, payment method, churn, consents, credit statement, financial summary |
| `plans` | 8 | CRUD, archive, usage charges, charge simulation |
| `subscriptions` | 24 | Lifecycle, plan-change and cancel previews, add-ons, usage, commitments, history |
| `invoices` | 15 | List/get, HTML document, send, e-invoicing (IN + EU), journal entries, payment attempts |
| `paymentAttempts` | 2 | Tenant-wide payments log |
| `payments` | 1 | Gateway payment orders |
| `coupons` | 5 | Create, list, activate/deactivate |
| `usage` | 4 | Event ingestion (single + batch), queries, dimensions |
| `wallets` | 7 | Prepaid wallets, top-ups, auto-recharge |
| `usageAlerts` | 4 | Threshold alerts |
| `collections` | 6 | Recovery worklist, funnel, manual controls |
| `entities` | 6 | Legal entities (Multi-Entity Books) |
| `auditLogs` | 1 | Config audit trail |
| `billableMetrics` | 6 | Meters and reverse charge lookup |
| `creditNotes` | 8 | Create, approve/reject/void, journal entries, document |
| `quotes` | 9 | Quote lifecycle |
| `webhooks` | 6 | Endpoints, pause/resume, deliveries |
| `events` | 4 | Event feed, types, deliveries, redelivery |
| `disputes` | 3 | List, get, resolve |
| `mandates` | 4 | Recurring-payment mandates |
| `gifts` | 4 | Gift purchase/redeem/cancel |
| `referrals` | 4 | Referral programme |
| `entitlements` | 4 | Plan entitlements and customer checks |
| `analytics` | 14 | MRR (+ waterfall), aging, dunning, revenue breakdowns, unit economics, NL ask |
| `ledger` | 6 | Accounts, entries, journal entry, trial balance, rollforward, CSV export |
| `finance` | 7 | Close pack, reconciliation (+ recorded runs), rev-rec report/waterfall |
| `india` | 2 | GSTR-1 / GSTR-3B returns |
| `organizations` | 9 | Multi-tenant organizations |
| `accounting` | 7 | QuickBooks/Xero/NetSuite/Tally connections and sync |
| `virtualAccounts` | 2 | Virtual bank accounts |
| `offlinePayments` | 2 | Bank transfer / cash / cheque |
| `churn` | 3 | Risk scores and alerts |
| `cancelFlows` | 11 | Cancel-flow builder and sessions |
| `dunningCampaigns` | 7 | Campaign and step management |
| `consents` | 2 | Record / revoke consent |
| `settings` | 20 | GST, IRP, EU e-invoicing, branding, MCP, US tax identity/nexus/registrations/liability |
| `users` | 5 | Team members and roles |
| `apiKeys` | 3 | API key management |
| `auth` | 6 | TOTP MFA and sessions (session cookie only) |
| `sso` | 3 | SAML SSO connection |
| `gatewayConnections` | 4 | BYO Stripe/Razorpay credentials |
| `integrationConnections` | 3 | BYO tax/CRM/storage credentials |
| `crm` | 1 | On-demand CRM sync |
| `migration` | 12 | Stripe/Chargebee/RevenueCat preview → compare → commit, compare reports |
| `billing` | 2 | Managed-cloud plan catalog and status |
| `system` | 4 | Version, metrics, platform metrics, waitlist |

Document endpoints (`invoices.pdf`, `invoices.previewHtml`, `creditNotes.pdf`,
`ledger.export`, `migration.compareReportDocument`, `system.metrics`) resolve to
the raw document as a `string`; everything else resolves to the typed JSON body.

Full method reference and guides: [docs.recurso.dev](https://docs.recurso.dev).

## Typed responses

Requests and responses are fully typed from the API's OpenAPI spec, so results
carry concrete field types (not an opaque object) and editors autocomplete them:

```typescript
const { data } = await recurso.subscriptions.list();
data?.forEach((s) => console.log(s.id, s.status)); // s is Subscription

const sub = await recurso.subscriptions.create({
  customer_id: customer.id!,
  plan_id: plan.id!,
});
sub.current_period_end; // string | undefined — typed, autocompleted
```

Resource types are exported for annotating your own code:

```typescript
import type { Subscription, Customer, Invoice } from 'recurso';
```

### Keeping types in sync (maintainers)

`src/schema.d.ts` is generated from the server's OpenAPI spec — the same source
of truth the Python SDK is generated from — so the SDK types can never drift
from the API. After changing the API, regenerate and verify:

```bash
npm run generate    # regenerate src/schema.d.ts from ../recurso/cmd/api/openapi.yaml (sibling checkout)
npm run typecheck   # tsc over the SDK + response-typing assertions in test/
npm test            # vitest suite
```

## License

MIT
