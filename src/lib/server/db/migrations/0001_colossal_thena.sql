-- Phase 6: Onboarding Enhancement

-- Add product type column to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "product_type" text;

-- Create social accounts table
CREATE TABLE IF NOT EXISTS "social_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "platform" text NOT NULL,
  "handle" text,
  "url" text,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Add foreign key (idempotent via DO block)
DO $$ BEGIN
  ALTER TABLE "social_accounts"
    ADD CONSTRAINT "social_accounts_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
