-- Phase 6: Database Provisioning — syllabus skeleton

-- Ensure UUID generator exists.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'syllabus_hierarchy_level') THEN
    CREATE TYPE public.syllabus_hierarchy_level AS ENUM (
      'subject',
      'unit',
      'chapter',
      'topic',
      'subtopic'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.syllabus_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  board TEXT NOT NULL DEFAULT 'NCERT',
  exam TEXT NOT NULL DEFAULT 'CUET',
  level public.syllabus_hierarchy_level NOT NULL,
  parent_id UUID NULL REFERENCES public.syllabus_hierarchy(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  ncert_chapter_number INT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_syllabus_hierarchy_parent_id
  ON public.syllabus_hierarchy(parent_id);

CREATE INDEX IF NOT EXISTS idx_syllabus_hierarchy_subject_level
  ON public.syllabus_hierarchy(subject, level);

