# Deploy — bazi.sincely.io.vn

Joins the existing BuilderCMS stack rather than standing up its own. That stack
already runs nginx on 80/443 and a certbot renewal loop for `sincely.io.vn`, and
`bazi.sincely.io.vn` is a subdomain of it — a second nginx would collide on both
ports and a second certbot would fight over the same webroot.

Assumes this repo sits next to `_1/` on the server, i.e. `BuilderCMS/` and
`Web-Bazi-Global/` share a parent. The compose `build.context` is written as
`../Web-Bazi-Global`; adjust it if your layout differs.

---

## 1. DNS

Point an A record at the same host BuilderCMS runs on:

```
bazi.sincely.io.vn.   A   <server ip>
```

Wait for it to resolve before step 4 — certbot validates over HTTP and will fail
against a name that does not yet point anywhere.

## 2. Secrets

Append to `BuilderCMS/.env` (the file compose already reads):

```dotenv
BAZI_DB_PASSWORD=<openssl rand -base64 32>
BAZI_AUTH_SECRET=<openssl rand -hex 48>
BAZI_CRON_SECRET=<openssl rand -hex 24>

# Optional — without it, readings come from the deterministic renderer.
BAZI_ANTHROPIC_API_KEY=

# Optional — without these the daily email is simply not sent.
BAZI_RESEND_API_KEY=
BAZI_EMAIL_FROM=Bát Tự <no-reply@sincely.io.vn>

# Optional — leave blank and the Google button is hidden entirely.
BAZI_GOOGLE_ID=
BAZI_GOOGLE_SECRET=
```

Every required one is declared `${VAR:?...}` in the compose file, so a missing
value stops the deploy with a named error instead of starting a container that
half-works.

## 3. Install the services

```bash
cd /root/BuilderCMS/Web-Bazi-Global
./deploy/install.sh /root/BuilderCMS/BuilderCMS/docker-compose.yml
```

The script puts the four services under `services:`, adds `bazi-pgdata:` to
`volumes:`, adds `bazi` to nginx's `depends_on:`, and appends the deploy notes.
It backs the file up first and runs `docker compose config` after — **if that
fails it restores the backup**, so the file is never left broken.

Re-running is safe: it strips the previous install and lays it down again, which
is also how you pick up a change to the service definitions. It cleans up a
hand-paste that landed in the wrong section too.

This replaces a hand-paste procedure that was genuinely easy to get wrong: the
snippet mixed real YAML with commented instructions, and pasting the services
under `volumes:` produces `volumes.bazi additional properties not allowed` —
an error that names neither the cause nor the fix.

`deploy/services.yml` holds the service definitions on their own if you would
rather place them by hand. They belong under `services:`, alongside
`lovecounter` and `project-manager`, which are also separate repos with their
block in the shared file.

`build.context: ../Web-Bazi-Global` is relative to the compose file, so with a
`BuilderCMS/BuilderCMS/docker-compose.yml` layout the repo goes at
`BuilderCMS/Web-Bazi-Global`. The script fails loudly if it cannot find the
compose file you pointed it at.

## 4. Certificate, then nginx config

The config references a certificate that does not exist yet, so nginx will not
start if you add it first. Issue the certificate, then drop the file in:

```bash
cd BuilderCMS

# Bring the app up first — the ACME challenge is served by the running nginx,
# which needs the bazi service resolvable for its own depends_on.
docker compose up -d --build bazi-db bazi-migrate bazi bazi-cron

docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d bazi.sincely.io.vn

cp ../Web-Bazi-Global/deploy/nginx/bazi.conf nginx/conf.d/bazi.conf
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

The existing certbot container renews it on the same 12-hour loop as every other
certificate — nothing further to schedule.

## 5. Verify

```bash
curl -I https://bazi.sincely.io.vn/                      # 200
curl -I https://bazi.sincely.io.vn/api/cron/daily-digest # 404 — blocked at nginx
docker compose logs bazi-migrate                         # "migrations applied"
docker compose logs --tail=20 bazi                       # "Ready"
```

Then open the site, register, save a chart, and check `/today` renders.

---

## Updating

```bash
cd BuilderCMS
docker compose up -d --build bazi-migrate bazi
```

`bazi-migrate` runs to completion and exits; `bazi` waits on it via
`service_completed_successfully`, so the server can never come up against a
schema it does not match. `migrate deploy` only plays forward through committed
migration files — it never generates, resets, or drops anything, which is why
re-running it on every deploy is safe.

Migrations are a separate stage rather than an app entrypoint on purpose: the
Prisma CLI carries its own dependency graph, and hand-picking those modules into
a Next.js standalone image fails one missing transitive dependency at a time.
The migrator keeps the full build tree; the app image stays lean (439 MB) and
ships no CLI at all.

## Notes

- **The database is not published.** `bazi-db` has no `ports:`; it is reachable
  only from the compose network. To inspect it:
  `docker compose exec bazi-db psql -U bazi -d bazi`
- **Back it up.** The BuilderCMS `backup` service only covers SQL Server. Add
  Postgres to your backup routine:
  `docker compose exec -T bazi-db pg_dump -U bazi bazi | gzip > bazi-$(date +%F).sql.gz`
- **The digest endpoint is blocked at nginx** and driven internally by
  `bazi-cron`. If you would rather run it from the host's crontab, remove that
  `location` block and put the secret in the cron line instead.
- **Google OAuth**, if enabled, needs
  `https://bazi.sincely.io.vn/api/auth/callback/google` registered as an
  authorised redirect URI.
