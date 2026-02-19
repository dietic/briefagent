import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),
	name: text('name').notNull(),
	websiteUrl: text('website_url'),
	description: text('description'),
	logoUrl: text('logo_url'),
	scrapedData: jsonb('scraped_data'),
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
