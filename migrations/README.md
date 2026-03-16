# Migrations

Run migrations via InsForge CLI:

```bash
# 1. Ensure InsForge is linked: insforge current

# 2. Run migration 002 (Surgical Swap tables)
insforge db query "$(cat migrations/002_surgical_swap_tables.sql)"

# 3. Run migration 003 (Production tables)
insforge db query "$(cat migrations/003_production_tables.sql)"

# 4. If PostgREST schema cache errors (PGRST204), reload schema in InsForge SQL console:
#    NOTIFY pgrst, 'reload schema';

# 5. Seed cutoff benchmarks (after migrations + universities/colleges/programs exist)
npm run seed:cutoffs

# Or trigger via API (requires auth): POST /api/admin/seed-cutoffs
```

Verify in InsForge dashboard: full 24-table schema in `public`.
