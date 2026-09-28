# TODO

## Todo

<!-- Add one task per line as a markdown checkbox: a dash, a space, empty
     brackets, then the task text. Tasks run top to bottom. Assigning work from
     the office appends it here automatically. -->

## Blocked on the database (VPN blocks Neon)

Proton VPN routes all Neon traffic through ProTUN, where connections are
accepted and then dropped before the Postgres greeting. Confirmed on port 443
as well as 5432, so it is not a Postgres-specific block. DATABASE_URL itself is
correct: host, database, user and password all present. Nothing is lost and no
data is at risk; the compute reports 100% cache hit rate, so it is healthy.

Do these in one pass when the VPN is off. Each names the exact command and the
result that counts as done, so no context has to be rebuilt.

- [ ] Verify the market-insights v2 quota fix: `docker compose exec -T backend python selfcheck_market_quota.py` must print PASS with the counter moving 0 -> 1 -> 2, and must confirm a failed call does NOT consume the allowance. The fix is already written in `backend/app/routers/ai_pages.py` and is uncommitted. It passed once before the outage; the test had a bug of its own (a nested `patch()` overrode the failure case so a "failed" call passed as a success), which is now fixed but not re-run. See "Deliberate simplifications" below before trusting a green result.
- [ ] Run `docker compose exec -T backend python verify_data.py` and confirm it prints PASS. Expect 12 users, 110,652 jobs, 4 saved jobs, 5 applications, 12 skills, 6 experience rows, 3 education rows, 12 preference rows. Any deviation means a probe account leaked; `apply_probe@jobfor.dev` and any `reset_probe_*@jobfor.dev` are the usual culprits and must be removed with bulk deletes, not `db.delete()` (the ORM tries to NULL `password_reset_tokens.user_id`, which is NOT NULL).
- [ ] Re-run `docker compose exec -T backend python selfcheck_dashboard_contract.py` once a real `GROQ_API_KEY` is available. It currently passes only because it stubs `call_groq_json`; the live Groq response shape has never been observed.
- [ ] Exercise the real Groq paths that no key has ever reached: `GET /api/v1/ai-pages/market-insights-v2`, the dashboard AI path, `/match/{job_id}`, and `/skill-gap`. Every earlier pass on these was against stubs.
- [ ] Confirm the AI daily limit now trips. Set a user's `call_count` in `user_ai_call_tracking` to the max, then call each AI endpoint and expect a 429 with `Retry-After: 86400`. The limit has never been observed firing, only its guard being present in code.

## Not blocked by the database

- [ ] Delete `frontend/src/components/Navbar.jsx`. It has zero imports anywhere in `frontend/src` and has been dead since the initial commit `65b527d`. The mounted public nav is `PublicNavbar.jsx` via `PublicLayout.jsx`. Confirm the zero-import count again before deleting, then check lint and build.
- [ ] Fix the `href="#"` links that do nothing when clicked: `LandingPage.jsx` (3), `OpportunitiesPage.jsx` (1), `RegisterPage.jsx` (1), `LoginPage.jsx` footer (1, already tracked), `PublicFooter.jsx` (1), `PublicNavbar.jsx` logo. Decide per link: route somewhere real, or drop the control. Do not leave a link that silently does nothing.
- [ ] Reduce the bundle. `dist/assets/index-*.js` is 681 kB (164 kB gzipped) and Vite warns on it. Lazy-load the routes that are not the first screen, starting with the AI pages (`/insights`, `/skillgap`, `/analyzer`, `/coach`) and `/join`. Measure before and after rather than assuming.
- [ ] Check modal keyboard handling and focus trapping, and honour `prefers-reduced-motion` where motion is decorative. Neither has been examined.
- [ ] Look at the duplicate `getProfile` fetches on the profile and coach pages, and the remaining unused backend imports.

## Requires your decision, not just code

- [ ] Password reset has no mailer, so the token has no route to a user. The flow itself is finished and verified end to end: request a link, a real token row is stored, the new password logs in and the old one is rejected 401, and the token stays out of logs while `DEBUG` is off. What is missing is an email provider. The page already says so rather than implying a mail was sent. Pick a provider before this is called production-ready.
- [ ] Hash reset tokens at rest and revoke them on use. The backend stores the token in plaintext and relies on the column being private. Lower priority than the mailer, and it needs a migration.
- [ ] Rotate the Neon credential and review who holds it. The live `DATABASE_URL` is in this repo's compose file and the current credential cannot be rotated from inside the worktree.

## Deliberate simplifications

Each is a known ceiling, not an oversight. Revisit when the ceiling bites.

- `market-insights-v2` records an AI call only when the paid call returns data. A failure falls back to v1 without consuming the user's daily allowance, which is intended: a Groq outage should not burn the allowance. It does mean a fallback that itself spends an AI call is not counted by v2's guard. Worth revisiting if v1 ever gets expensive.
- `job_applications.job_id` is nullable, because a real application row referenced a job absent from the dataset. Guarded in the service, but the constraint is looser than the domain implies.
- The reset-flow browser proof reads the token out of Postgres directly, because `DEBUG` is off and the backend deliberately refuses to log it. That is a test-only path and must never become a user-facing fallback.
