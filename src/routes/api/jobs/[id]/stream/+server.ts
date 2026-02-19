import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationJobs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals, params }) => {
	const user = await locals.getUser();
	if (!user) return error(401, 'Unauthorized');

	const jobId = params.id;

	// Verify job belongs to user
	const job = await db.query.generationJobs.findFirst({
		where: and(eq(generationJobs.id, jobId), eq(generationJobs.userId, user.id))
	});

	if (!job) {
		return error(404, 'Job not found');
	}

	let closed = false;

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			const sendEvent = (data: Record<string, unknown>) => {
				if (closed) return;
				try {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
				} catch {
					closed = true;
				}
			};

			const poll = async () => {
				while (!closed) {
					try {
						const current = await db.query.generationJobs.findFirst({
							where: eq(generationJobs.id, jobId)
						});

						if (!current) {
							sendEvent({ status: 'failed', error: 'Job not found' });
							break;
						}

						sendEvent({
							status: current.status,
							progress: current.progress,
							currentStep: current.currentStep,
							totalSteps: current.totalSteps,
							error: current.error,
							resultId: current.resultId
						});

						if (current.status === 'completed' || current.status === 'failed') {
							break;
						}

						await new Promise((resolve) => setTimeout(resolve, 1000));
					} catch {
						break;
					}
				}

				if (!closed) {
					try {
						controller.close();
					} catch {
						// Already closed
					}
				}
			};

			poll();
		},
		cancel() {
			closed = true;
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
