#!/bin/bash
# Génère CLAUDE.md depuis l'état RÉEL du projet
# Usage: bash scripts/generate-claude-md.sh
# Lancer avant chaque session Claude Code importante

ROOT="/Users/maravai/Downloads/Claude-Projects/projects/bookeasy"
cd "$ROOT"

cat > CLAUDE.md << 'HEREDOC'
# Claude Code Config — BookEasy (AUTO-GÉNÉRÉ)
> Généré automatiquement depuis l'état réel du projet. Ne pas éditer manuellement.
> Extends parent `/CLAUDE.md`

HEREDOC

# Date de génération
echo "**Généré le**: $(date '+%Y-%m-%d %H:%M')" >> CLAUDE.md
echo "" >> CLAUDE.md

# Stack réelle depuis package.json
echo "## Stack (depuis package.json)" >> CLAUDE.md
echo '```' >> CLAUDE.md
node -e "
const pkg = require('./package.json');
const deps = {...pkg.dependencies, ...pkg.devDependencies};
const keys = ['next','react','typescript','@prisma/client','prisma','next-auth','resend','web-push','stripe','zod','tailwindcss','framer-motion'];
keys.forEach(k => { if(deps[k]) console.log(k + ': ' + deps[k]) });
" 2>/dev/null >> CLAUDE.md
echo '```' >> CLAUDE.md
echo "" >> CLAUDE.md

# Structure réelle des fichiers src/
echo "## Structure réelle (src/)" >> CLAUDE.md
echo '```' >> CLAUDE.md
find src -type f -name "*.ts" -o -name "*.tsx" | grep -v node_modules | sort | \
  sed 's|src/||' | head -80 >> CLAUDE.md
echo '```' >> CLAUDE.md
echo "" >> CLAUDE.md

# API Routes existantes
echo "## API Routes (src/app/api/)" >> CLAUDE.md
find src/app/api -name "route.ts" | sort | sed 's|src/app/api/||; s|/route.ts||' | \
  while read route; do echo "- /api/$route"; done >> CLAUDE.md
echo "" >> CLAUDE.md

# Models Prisma réels
echo "## Modèles Prisma (schema réel)" >> CLAUDE.md
grep "^model " prisma/schema.prisma | awk '{print "- " $2}' >> CLAUDE.md
echo "" >> CLAUDE.md

# Migrations en attente
echo "## État migrations" >> CLAUDE.md
npx prisma migrate status 2>&1 | grep -E "applied|pending|found|drift" | head -5 >> CLAUDE.md
echo "" >> CLAUDE.md

# Variables d'env requises (depuis .env.example)
echo "## Variables d'env requises" >> CLAUDE.md
if [ -f .env.example ]; then
  echo '```' >> CLAUDE.md
  grep -v "^#" .env.example | grep "=" | cut -d'=' -f1 >> CLAUDE.md
  echo '```' >> CLAUDE.md
else
  echo '```' >> CLAUDE.md
  grep -v "^#" .env | grep "=" | cut -d'=' -f1 | sed 's/=.*//' >> CLAUDE.md
  echo '```' >> CLAUDE.md
fi
echo "" >> CLAUDE.md

# Règles métier critiques BookEasy (statiques — vérités invariantes)
cat >> CLAUDE.md << 'HEREDOC'
## Règles métier critiques (invariantes)

### Paiements
- **PayZen** (OSB) = paiements clients (réservations) — devise XPF
- **Stripe** = abonnements Pro marchands uniquement
- IPN PayZen → toujours retourner 200 même si erreur interne
- Signature HMAC-SHA256 vérifiée AVANT tout traitement

### Auth
- NextAuth v4 (rester sur v4, v5 = beta)
- Strategy JWT (pas database)
- Middleware: allow list uniquement, jamais deny list
- Jamais importer Prisma dans middleware.ts (Edge Runtime)

### DB
- Prisma 7 — `$use` SUPPRIMÉ, utiliser `$extends`
- `prisma generate` n'est plus automatique → postinstall script
- Transactions + SELECT FOR UPDATE pour double-booking
- Soft delete pour données importantes

### Sécurité
- Ownership check avant chaque retour de données
- Rate limiting sur endpoints publics (Upstash)
- Jamais exposer passwordHash, refresh_token, tokens
- Validation Zod côté serveur TOUJOURS (même si client valide)

### Logging (RGPD)
- Logger: bookingId, orderId, transactionId, status, duration
- JAMAIS logger: email, nom, téléphone, cardNumber, hash PayZen, tokens

### MCP disponibles dans cette session
- `postgres` → requêtes SQL directes sur Neon DB
- `prisma` → migrate-status, migrate-dev, Prisma Studio
- `github` → PRs, issues, commits (repo: bookeasypf-cpu/bookeasy)
- `vercel` → deployments, logs (projet: bookeasy)
HEREDOC

echo ""
echo "✅ CLAUDE.md généré avec succès"
echo "   $(wc -l < CLAUDE.md) lignes | $(date '+%H:%M')"
