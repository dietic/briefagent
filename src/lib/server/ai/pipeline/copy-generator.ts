import { generateText, Output } from 'ai';
import { copyModel } from '../providers';
import { copyOutputSchema, type CopyOutput } from '../schemas/copy';
import { buildCopySystemPrompt, buildCopyUserPrompt } from '../prompts/copy-system';
import type { AssembledBrief } from './brief-assembler';

export async function generatePostCopy(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	brief: AssembledBrief
): Promise<CopyOutput> {
	const { experimental_output: output } = await generateText({
		model: copyModel,
		experimental_output: Output.object({ schema: copyOutputSchema }),
		system: buildCopySystemPrompt(brief),
		prompt: buildCopyUserPrompt(postSlot)
	});

	if (!output) {
		throw new Error('Copy generation returned no output');
	}

	return output;
}
