import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const products = pgTable('products', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),
	name: text('name').notNull(),
	websiteUrl: text('website_url'),
	description: text('description'),
	logoUrl: text('logo_url'),
	scrapedData: jsonb('scraped_data'),
	brandAnalysis: jsonb('brand_analysis'),
	onboardingStep: text('onboarding_step').default('quick_start'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const productBriefs = pgTable('product_briefs', {
	id: uuid('id').primaryKey().defaultRandom(),
	productId: uuid('product_id')
		.references(() => products.id, { onDelete: 'cascade' })
		.unique(),
	problemSolved: text('problem_solved'),
	keyFeatures: text('key_features').array(),
	differentiator: text('differentiator'),
	pricingInfo: text('pricing_info'),
	productStage: text('product_stage'),
	idealCustomer: text('ideal_customer'),
	industry: text('industry'),
	ageRange: text('age_range'),
	painPoints: text('pain_points').array(),
	audienceHangouts: text('audience_hangouts').array(),
	personalityTraits: text('personality_traits').array(),
	exampleContent: text('example_content'),
	wordsToUse: text('words_to_use').array(),
	wordsToAvoid: text('words_to_avoid').array(),
	mainGoal: text('main_goal'),
	postingFrequency: text('posting_frequency'),
	preferredTimes: jsonb('preferred_times'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const assets = pgTable('assets', {
	id: uuid('id').primaryKey().defaultRandom(),
	productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
	fileUrl: text('file_url').notNull(),
	fileName: text('file_name').notNull(),
	fileType: text('file_type').notNull(),
	fileSize: integer('file_size'),
	tag: text('tag'), // screenshot | photo | logo | lifestyle | testimonial | graphic
	description: text('description'),
	isPrimary: boolean('is_primary').default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// ── Generation Pipeline Enums ───────────────────────────────────────

export const jobStatusEnum = pgEnum('job_status', ['pending', 'running', 'completed', 'failed']);
export const jobTypeEnum = pgEnum('job_type', ['content_plan', 'post_generation']);
export const contentCategoryEnum = pgEnum('content_category', [
	'educational',
	'promotional',
	'social_proof',
	'behind_the_scenes',
	'engagement',
	'tips',
	'announcement',
	'storytelling'
]);
export const postStatusEnum = pgEnum('post_status', [
	'draft',
	'pending_review',
	'approved',
	'rejected',
	'scheduled'
]);

// ── Generation Pipeline Tables ──────────────────────────────────────

export const generationJobs = pgTable('generation_jobs', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),
	productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
	type: jobTypeEnum('type').notNull(),
	status: jobStatusEnum('status').default('pending').notNull(),
	progress: text('progress'),
	currentStep: integer('current_step').default(0),
	totalSteps: integer('total_steps').default(1),
	error: text('error'),
	resultId: uuid('result_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const contentPlans = pgTable('content_plans', {
	id: uuid('id').primaryKey().defaultRandom(),
	productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
	strategyOverview: text('strategy_overview').notNull(),
	contentThemes: text('content_themes').array().notNull(),
	summary: text('summary'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const posts = pgTable('posts', {
	id: uuid('id').primaryKey().defaultRandom(),
	contentPlanId: uuid('content_plan_id').references(() => contentPlans.id, { onDelete: 'cascade' }),
	productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
	platform: text('platform').notNull().default('linkedin'),
	postType: text('post_type').notNull(),
	scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
	topic: text('topic').notNull(),
	contentCategory: contentCategoryEnum('content_category').notNull(),
	keyMessage: text('key_message').notNull(),
	assetReferences: text('asset_references').array(),
	copyText: text('copy_text'),
	hashtags: text('hashtags').array(),
	imageUrl: text('image_url'),
	imagePrompt: text('image_prompt'),
	status: postStatusEnum('status').default('draft').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// ── Relations ───────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ many }) => ({
	briefs: many(productBriefs),
	assets: many(assets),
	contentPlans: many(contentPlans),
	posts: many(posts),
	generationJobs: many(generationJobs)
}));

export const productBriefsRelations = relations(productBriefs, ({ one }) => ({
	product: one(products, {
		fields: [productBriefs.productId],
		references: [products.id]
	})
}));

export const assetsRelations = relations(assets, ({ one }) => ({
	product: one(products, {
		fields: [assets.productId],
		references: [products.id]
	})
}));

export const generationJobsRelations = relations(generationJobs, ({ one }) => ({
	product: one(products, {
		fields: [generationJobs.productId],
		references: [products.id]
	})
}));

export const contentPlansRelations = relations(contentPlans, ({ one, many }) => ({
	product: one(products, {
		fields: [contentPlans.productId],
		references: [products.id]
	}),
	posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one }) => ({
	contentPlan: one(contentPlans, {
		fields: [posts.contentPlanId],
		references: [contentPlans.id]
	}),
	product: one(products, {
		fields: [posts.productId],
		references: [products.id]
	})
}));
