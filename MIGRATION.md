# Cloudflare Server Monitor in-place migration

This fork tracks `huilang-me/CF-Server-Monitor` and targets the existing `cf-server-monitor` Worker, not a new Worker.

- **Cloudflare account:** `andywangzzm` (store account ID in GitHub Actions secret `CLOUDFLARE_ACCOUNT_ID`)
- **D1:** existing `server-monitor-db` (store database UUID in `D1_DATABASE_ID`)
- **Bindings:** `DB`, `METRICS_BROADCASTER` and the existing remote `API_SECRET` must not be recreated or rotated.
- **Original upstream** `.github/workflows/deploy.yml` is purposely left unchanged and its `CF_ACCOUNT_ID` secret **must remain unset** to prevent it from creating `server-monitor-pro`.
- The custom workflow `.github/workflows/deploy-existing-worker.yml` deploys only when the separate `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `D1_DATABASE_ID` repository secrets are populated.
- `keep_vars = true` is required; the deployment script refuses to run if upstream removes it. Never put `API_SECRET` into GitHub or wrangler.toml.
- The workflow handles both normal pushes and successful `Upstream Sync` runs, because pushes made with `GITHUB_TOKEN` do not trigger other `push` workflows.

## Finish CI authorization

Create a scoped Cloudflare API token in the **andywangzzm** account with Workers Scripts edit permission (and D1 permissions as needed). Save its value only as repository Actions secret `CLOUDFLARE_API_TOKEN`. Other two secrets contain non-sensitive account/database identifiers. Once all three are set, manually run **Deploy Existing Cloudflare Monitor** once, validate the existing dashboard and the probe's next reports, then let upstream sync run daily.

## Rollback

Use Cloudflare Workers deployment history to redeploy the previous Worker version. If a D1 migration modified data, use the D1 Time Travel bookmark captured before initial deployment; avoid data rollback unless explicitly necessary, because it can discard subsequent metrics. Do not delete the existing Worker or database, and do not change the probe URL or API_SECRET during this migration.
