import { generateText, Output } from 'ai';
import { copyModel } from '../providers';
import {
	copyOutputSchema,
	carouselCopySchema,
	threadCopySchema,
	pollCopySchema,
	type CopyOutput,
	type CarouselCopyOutput,
	type ThreadCopyOutput,
	type PollCopyOutput
} from '../schemas/copy';
import {
	buildCopySystemPrompt,
	buildCopyUserPrompt,
	buildCarouselCopyPrompt,
	buildThreadCopyPrompt,
	buildPollCopyPrompt
} from '../prompts/copy-system';
import type { AssembledBrief } from './brief-assembler';

export async function generatePostCopy(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	brief: AssembledBrief,
	platform: string | null = null
): Promise<CopyOutput> {
	const { experimental_output: output } = await generateText({
		model: copyModel,
		experimental_output: Output.object({ schema: copyOutputSchema }),
		system: buildCopySystemPrompt(brief, platform),
		prompt: buildCopyUserPrompt(postSlot, platform)
	});

	if (!output) {
		throw new Error('Copy generation returned no output');
	}

	return output;
}

export async function generateCarouselCopy(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	slideCount: number,
	brief: AssembledBrief,
	platform: string | null = null
): Promise<CarouselCopyOutput> {
	const { experimental_output: output } = await generateText({
		model: copyModel,
		experimental_output: Output.object({ schema: carouselCopySchema }),
		system: buildCopySystemPrompt(brief, platform),
		prompt: buildCarouselCopyPrompt(postSlot, slideCount, platform)
	});

	if (!output) {
		throw new Error('Carousel copy generation returned no output');
	}

	return output;
}

export async function generateThreadCopy(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	tweetCount: number,
	brief: AssembledBrief,
	platform: string | null = null
): Promise<ThreadCopyOutput> {
	const { experimental_output: output } = await generateText({
		model: copyModel,
		experimental_output: Output.object({ schema: threadCopySchema }),
		system: buildCopySystemPrompt(brief, platform),
		prompt: buildThreadCopyPrompt(postSlot, tweetCount, platform)
	});

	if (!output) {
		throw new Error('Thread copy generation returned no output');
	}

	return output;
}

export async function generatePollCopy(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	pollOptions: string[] | undefined,
	brief: AssembledBrief,
	platform: string | null = null
): Promise<PollCopyOutput> {
	const { experimental_output: output } = await generateText({
		model: copyModel,
		experimental_output: Output.object({ schema: pollCopySchema }),
		system: buildCopySystemPrompt(brief, platform),
		prompt: buildPollCopyPrompt(postSlot, pollOptions, platform)
	});

	if (!output) {
		throw new Error('Poll copy generation returned no output');
	}

	return output;
}
