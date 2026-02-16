/**
 * Shared animation configuration for scroll-triggered reveals using svelte-inview.
 */

/** Default svelte-inview options for scroll-triggered reveals */
export const scrollRevealConfig = {
	rootMargin: '-100px',
	unobserveOnEnter: true
};

/**
 * Calculate staggered delay for sequential animations.
 * @param index - Element index in the sequence
 * @param base - Base delay in milliseconds (default 150ms)
 * @returns Delay in milliseconds
 */
export function staggerDelay(index: number, base = 150): number {
	return index * base;
}

/**
 * Get CSS classes for scroll-reveal visibility state.
 * @param visible - Whether the element is in view
 * @returns CSS class string for opacity and transform
 */
export function revealClasses(visible: boolean): string {
	return visible
		? 'opacity-100 translate-y-0'
		: 'opacity-0 translate-y-8';
}
