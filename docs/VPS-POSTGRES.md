# Diagnostic PostgreSQL VPS — SenegalScenario2026

## Problème Vercel

Si `DATABASE_URL` pointe vers `127.0.0.1` ou `localhost`, Vercel ne peut pas joindre PostgreSQL. L'application bascule automatiquement sur les fichiers `data/*.json`.

Vérifier en production : `GET /api/health/database`

## Configuration attendue

```env
DATABASE_URL=postgresql://user:password@123.45.67.89:5432/senegalscenario2026
NEXT_PUBLIC_SITE_URL=https://votre-domaine.vercel.app
```

## Checklist VPS

### 1. postgresql.conf

```conf
listen_addresses = '*'
```

### 2. pg_hba.conf

```conf
host    all    all    0.0.0.0/0    scram-sha-256
```

### 3. Firewall

```bash
sudo ufw status
sudo ufw allow 5432/tcp
```

### 4. Écoute réseau

```bash
sudo ss -tulpn | grep 5432
```

Résultat attendu : `0.0.0.0:5432`

### 5. Test externe

```bash
nc -vz VPS_IP 5432
```

## Architecture données

```
Pages → lib/api → lib/services → Prisma | data/*.json
API   → lib/services → Prisma | data/*.json
```
