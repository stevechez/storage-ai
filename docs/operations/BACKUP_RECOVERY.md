# Backup & Recovery

Phase 35. Documentation, not automation — the goal is that future Steve can recover the system from written instructions alone, without re-deriving anything from memory. Every claim below was checked directly against the real repo/environment; anything that couldn't be verified is marked as such rather than guessed.

## 1. Database backup

**Local dev** (`supabase_db_storage-ai`, Docker): not backed up, and doesn't need to be. `supabase/migrations/*.sql` is the real source of truth for schema — recreate the whole local database from scratch with `supabase db reset --local`. Local data (demo calls, test rows) is disposable by design.

**Production** (Supabase project `hscgmcfbresuqwiuzdfw`, confirmed in `docs/BUILD_LOG.md`'s Phase 24B entry — **not** reachable from this Claude account's Supabase MCP connection, which only lists unrelated projects; confirm backup settings directly in the Supabase dashboard, don't trust this doc's absence of detail as "no backups exist"):

- Check **Supabase Dashboard → Project Settings → Database → Backups** for the actual plan tier and retention window. This wasn't verifiable from this environment — confirm it directly rather than assume a paid-tier PITR backup is running.
- Manual fallback, runnable regardless of plan tier, from a machine with `psql`/`pg_dump` and the production connection string (Dashboard → Project Settings → Database → Connection string):
  ```bash
  pg_dump "postgresql://postgres:[password]@db.hscgmcfbresuqwiuzdfw.supabase.co:5432/postgres" \
    --schema=public -f storage-ai-backup-$(date +%Y%m%d).sql
  ```
  At real pilot scale (dozens of facilities, hundreds of calls) this completes in seconds and produces a plain SQL file — store it somewhere durable (not committed to git).
- **Recommendation, not yet in place:** run the `pg_dump` command above manually before onboarding milestones (e.g., every 5th facility) until an actual backup plan tier is confirmed.

## 2. Environment variable backup

**Current state, checked directly:** `apps/web/.env.production.local` — the file the onboarding script (`scripts/onboard-facility.mjs`) reads for production credentials — **does not exist on disk right now.** The script's own guard means it will refuse to run (`Missing .env.production.local`) until this file is recreated. This isn't hypothetical; it's the actual current state as of this phase.

Recreate it with:
```
NEXT_PUBLIC_SUPABASE_URL=https://hscgmcfbresuqwiuzdfw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard → Project Settings → API>
```
Never commit this file — `.gitignore`'s `.env*` pattern already covers it, confirmed in the Phase 30 review.

**Where the real values live:**
- Vercel project's **Settings → Environment Variables** (confirmed set there per `BUILD_LOG.md`'s Vercel deployment fix — `turbo.json` only declares variable *names* for passthrough, the actual values were configured directly in Vercel's dashboard)
- Supabase Dashboard → Project Settings → API (the service role key can be regenerated here if lost, which invalidates the old one — regenerating requires updating both Vercel and `.env.production.local`)

**Gap, documented not fixed:** there is currently no backup of these values outside Vercel's dashboard and Supabase's dashboard. If access to both accounts were lost simultaneously, the values would be unrecoverable (the project itself would still exist, just inaccessible). Recommendation: copy the production URL and service role key into a password manager. Not done as part of this phase — it's a Steve action, not a code change.

## 3. Repository recovery

Source of truth: `https://github.com/stevechez/storage-ai.git` (confirmed via `git remote -v`). Recovery is a plain clone:
```bash
git clone https://github.com/stevechez/storage-ai.git
cd storage-ai && pnpm install
```
No submodules, no external dependencies on local-only state — `pnpm-lock.yaml` and `supabase/migrations/` fully describe the buildable, schema-complete state of the project.

## 4. Deployment recovery

Vercel auto-deploys on every push to `main` — no manual redeploy needed for normal operation. If the Vercel project itself needs to be recreated from scratch (project deleted, account issue), re-importing from GitHub is **not** zero-config — this bit twice already (see `BUILD_LOG.md`'s Sprint 20-era entries) and is worth getting right the first time:

1. Import the GitHub repo into a new Vercel project.
2. **Set Root Directory to `apps/web`** in the project's Settings → General. This is the step that was missed originally — Vercel defaults to the monorepo root, which has no `next` dependency and no `public/` folder, and fails with either "No Output Directory named public" or "No Next.js version detected" depending on what else is misconfigured. With Root Directory correctly set to `apps/web`, Next.js zero-config detection handles the rest — no `vercel.json` needed.
3. Add the three environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in Settings → Environment Variables, from the Supabase dashboard.
4. Deploy, then verify per `LAUNCH_CHECKLIST.md`.

## 5. Disaster recovery checklist

If starting from nothing (new machine, or full recovery):

- [ ] Clone the repo (§3), `pnpm install`
- [ ] Confirm the Vercel deployment is live: `curl -o /dev/null -w "%{http_code}" https://storage-ai-sigma.vercel.app/` → `200`
- [ ] If Vercel deployment is gone, recreate it (§4) — Root Directory = `apps/web` is the step to not forget
- [ ] Confirm production Supabase project (`hscgmcfbresuqwiuzdfw`) is reachable via its dashboard
- [ ] If a local dev environment is needed: `supabase start`, then `supabase db reset --local` to rebuild schema from migrations
- [ ] Recreate `apps/web/.env.local` with **local-only** Supabase credentials (`http://127.0.0.1:54321` + local anon/service keys from `supabase status`) — never production credentials, per the incident documented in `BUILD_LOG.md`'s reliability audit
- [ ] Recreate `apps/web/.env.production.local` (§2) only if running the onboarding script
- [ ] Run `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint` — all should pass clean on a fresh clone with no code changes
