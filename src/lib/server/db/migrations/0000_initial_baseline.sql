-- Phase 3+4 schema additions
-- Tables from Phase 2 (products, product_briefs, assets) already exist via previous push

-- Enums
DO $$ BEGIN
  CREATE TYPE "public"."job_status" AS ENUM('pending', 'running', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."job_type" AS ENUM('content_plan', 'post_generation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."content_category" AS ENUM('educational', 'promotional', 'social_proof', 'behind_the_scenes', 'engagement', 'tips', 'announcement', 'storytelling');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."post_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Phase 3: Generation pipeline tables
CREATE TABLE IF NOT EXISTS "generation_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
  "type" "job_type" NOT NULL,
  "status" "job_status" DEFAULT 'pending' NOT NULL,
  "progress" text,
  "current_step" integer DEFAULT 0,
  "total_steps" integer DEFAULT 1,
  "error" text,
  "result_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "content_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
  "strategy_overview" text NOT NULL,
  "content_themes" text[] NOT NULL,
  "summary" text,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "content_plan_id" uuid REFERENCES "content_plans"("id") ON DELETE CASCADE,
  "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
  "platform" text NOT NULL DEFAULT 'linkedin',
  "post_type" text NOT NULL,
  "scheduled_at" timestamp with time zone,
  "topic" text NOT NULL,
  "content_category" "content_category" NOT NULL,
  "key_message" text NOT NULL,
  "asset_references" text[],
  "copy_text" text,
  "hashtags" text[],
  "image_url" text,
  "image_prompt" text,
  "rejection_reason" text,
  "published_at" timestamp with time zone,
  "status" "post_status" DEFAULT 'draft' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Phase 3: brandAnalysis column on products (for caching brand analysis)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_analysis" jsonb;

-- Phase 4: Add 'published' to post_status enum if not present
-- (already included in CREATE TYPE above, but if enum existed without it)
DO $$ BEGIN
  ALTER TYPE "public"."post_status" ADD VALUE IF NOT EXISTS 'published';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Phase 4: rejection_reason and published_at columns on posts (IF NOT EXISTS handles re-runs)
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "rejection_reason" text;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;
