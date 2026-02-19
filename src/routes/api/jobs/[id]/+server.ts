import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationJobs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals, params }) => {
	const user = await locals.getUser();
	if (!user) return error(401, 'Unauthorized');

	const job = await db.query.generationJobs.findFirst({
		where: and(eq(generationJobs.id, params.id), eq(generationJobs.userId, user.id))
	});

	if (!job) {
		return error(404, 'Job not found');
	}

	return json({
		status: job.status,
		progress: job.progress,
		currentStep: job.currentStep,
		totalSteps: job.totalSteps,
		error: job.error,
		resultId: job.resultId
	});
};
