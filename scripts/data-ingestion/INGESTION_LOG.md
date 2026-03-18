# Ingestion Log — “Surgical Injection” into InsForge

This log tracks **exactly what data was injected**, **when**, **by whom/what script**, and **where it lives** in InsForge.

## Conventions

- **One injection = one log entry** (even if it includes multiple rows/files).
- **Idempotent by design**: every injection should be re-runnable without duplicating data (use natural keys / unique constraints / upserts).
- **Traceability**: every entry must reference the exact input artifact(s) and the exact destination table(s).

## Entry Template (copy/paste)

### YYYY-MM-DD — <dataset-name> — <status>

- **Status**: PLANNED | INJECTED | VERIFIED | ROLLED BACK
- **Owner**: <name>
- **Environment / Project**: <InsForge project name or id>
- **Destination tables**:
  - `<table_1>`
  - `<table_2>`
- **Source artifacts**:
  - `scripts/data-ingestion/<subfolder>/<file-or-folder>`
- **Injection method**:
  - Script: `scripts/data-ingestion/<script>.ts` (or CLI command)
  - Mode: INSERT | UPSERT | MERGE
- **Natural keys / dedupe rule**:
  - `<e.g., (board, grade, subject, chapter_code, topic_code)>`
- **Row counts**:
  - Inserted: <n>
  - Updated: <n>
  - Skipped (already present): <n>
- **Verification**:
  - Query / check performed: <notes>
  - Result: PASS | FAIL
- **Rollback plan**:
  - <how to revert safely>
- **Notes**:
  - <anything important>

---

## Log

### 2026-03-18 — Database Provisioning kickoff — PLANNED

- **Status**: PLANNED
- **Owner**: DSP
- **Environment / Project**: <fill>
- **Destination tables**:
  - `syllabus_hierarchy`
- **Source artifacts**:
  - `scripts/data-ingestion/syllabus/`
- **Injection method**:
  - Script: (TBD)
  - Mode: UPSERT
- **Natural keys / dedupe rule**:
  - (TBD — depends on final schema)
- **Row counts**:
  - Inserted: (TBD)
  - Updated: (TBD)
  - Skipped (already present): (TBD)
- **Verification**:
  - Query / check performed: (TBD)
  - Result: (TBD)
- **Rollback plan**:
  - (TBD)
- **Notes**:
  - `syllabus_hierarchy` is the skeleton for benchmarks + question bank linkage.

### 2026-03-18 — NCERT syllabus skeleton (BST + ECO) — SUCCESS

- **Status**: INJECTED + VERIFIED
- **Owner**: DSP
- **Environment / Project**: InsForge `99Plus` (ap-southeast)
- **Destination tables**:
  - `public.syllabus_hierarchy`
- **Source artifacts**:
  - `scripts/data-ingestion/syllabus/ncert_tree.json`
- **Injection method**:
  - Script: `scripts/data-ingestion/syllabus/ingest_syllabus.ts`
  - Mode: UPSERT (`ON CONFLICT (code) DO UPDATE`)
- **Natural keys / dedupe rule**:
  - `code` (UNIQUE)
- **Verification**:
  - `SELECT level, count(*) FROM public.syllabus_hierarchy WHERE is_active = true AND level IN ('subject','unit','chapter') GROUP BY level;`
  - Result: PASS
- **Live counts (is_active=true)**:
  - Subjects: 2
  - Units: 8
  - Chapters: 44

---

## Session Summary (2026-03-18)

- Created the `scripts/data-ingestion/` workspace and tracking log for surgical injections.
- Added and applied the `syllabus_hierarchy` schema migration in InsForge.
- Injected the NCERT 2025/26 syllabus skeleton for **Business Studies** + **Economics** (subject → unit → chapter) via idempotent UPSERTs, and verified live counts (Subjects=2, Units=8, Chapters=44).

