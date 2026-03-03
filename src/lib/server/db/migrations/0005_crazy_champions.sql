CREATE TABLE "pillar_platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pillar_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pillar_platforms" ADD CONSTRAINT "pillar_platforms_pillar_id_content_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."content_pillars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "pillar_platforms" ("pillar_id", "platform") SELECT "id", "platform" FROM "content_pillars" WHERE "platform" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "content_pillars" DROP COLUMN "platform";