# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.0] - 2026-09-03

### Added

- Full coverage of the API surface: 47 resources / 282 methods (up from
  31 / 162). Every in-scope path in `cmd/api/openapi.yaml` now has a typed
  method (`scripts/sdk_drift.py` reports 215/220; the remaining five are the
  unversioned `/version`, `/metrics`, `/platform/metrics`, `/waitlist` and
  `/payments/order`, which the SDK covers but the drift scanner's `/v1`-only
  regex cannot see).
- New resources: `paymentAttempts`, `payments`, `finance` (close pack,
  reconciliation + recorded runs, rev-rec report/waterfall), `india`
  (GSTR-1/GSTR-3B), `consents`, `settings` (GST, IRP, EU e-invoicing,
  invoice branding, MCP opt-in, US tax identity/nexus/registrations/
  liability), `users`, `apiKeys`, `auth` (TOTP MFA + sessions), `sso`,
  `gatewayConnections`, `integrationConnections`, `crm`, `migration`
  (Stripe/Chargebee/RevenueCat preview → compare → commit, compare
  reports), `billing`, `system`.
- New methods on existing resources:
  - `customers.financialSummary`
  - `plans.simulateCharges`
  - `subscriptions.addAddon/addons/removeAddon/billUsageNow/cancelPreview/
    consent/financialSummary/history/cancellationReasons`
  - `invoices.pdf/previewHtml/send/euEInvoiceStatus/retryEUEInvoice/
    journalEntries/paymentAttempts/paymentWall/statusHistory`
  - `billableMetrics.charges`
  - `creditNotes.approve/reject/void/journalEntries/pdf`
  - `disputes.get`
  - `analytics.dunningHistory/dunningOverview/dunningRecovered/
    dunningWeights/mrrWaterfall/revenueByGeography/revenueByPlan/
    unitEconomics/usage/ask`
  - `ledger.transaction/trialBalance/deferredRollforward/export`
  - `accounting.connect/oauthCallback`
- Typed list/query parameter interfaces: `PaymentAttemptListParams`,
  `PeriodParams`, `TrialBalanceParams`, `LedgerExportParams`,
  `MRRWaterfallParams`, `TaxLiabilityParams`, `AccountingCallbackParams`.
- Non-JSON document endpoints (invoice/credit-note HTML, ledger CSV export,
  Prometheus metrics, compare-report receipts) resolve to a `string` via
  `responseType: 'text'`.
- `.github/workflows/ci.yml`: typecheck, build and vitest on push and pull
  request across Node 20 and 22. `publish.yml` is unchanged.
- The vitest table now asserts path + verb for every one of the 282 methods
  (298 tests), and the API-surface completeness gate fails when a method is
  added without a test.

### Changed

- `src/schema.d.ts` regenerated from the current `cmd/api/openapi.yaml`
  (openapi-typescript 7.13.0) — picks up every operation added since 1.8.0.
- `npm run generate` now points at `../recurso/cmd/api/openapi.yaml` (it
  referenced a non-existent `../recur-so/` checkout).
- `package-lock.json` re-synced with `package.json` so `npm ci` works again
  (package name/version and two optional peer entries were stale).

### Fixed

- Resolved the merge-conflict markers left in `src/index.ts`
  (`SubscriptionListParams.customer_id`, the `InvoiceListParams` interface,
  `EventListParams.object_id`). `invoices.list` is typed with
  `InvoiceListParams` (`customer_id`, `subscription_id` filters).

## [1.8.0] and earlier

See the git history and GitHub releases for changes before the changelog
was introduced.

[Unreleased]: https://github.com/recurso-dev/recurso-node/compare/v1.9.0...HEAD
[1.9.0]: https://github.com/recurso-dev/recurso-node/compare/v1.8.0...v1.9.0
