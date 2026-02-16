<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
</script>

<footer class="bg-neutral-950 text-neutral-400 border-t border-white/[0.04]">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
			<!-- Column 1: Brand -->
			<div class="col-span-2 md:col-span-1">
				<a href="/" class="font-display font-bold text-lg tracking-tight transition-colors hover:opacity-80">
					<span class="text-white">Brief</span><span class="text-primary-400">Agent</span>
				</a>
				<p class="text-sm mt-3 leading-relaxed text-neutral-500 max-w-xs">
					{m.footer_tagline()}
				</p>
			</div>

			<!-- Column 2: Product -->
			<div>
				<h4 class="font-medium text-xs text-neutral-500 mb-4 uppercase tracking-wider">
					{m.footer_product()}
				</h4>
				<ul class="space-y-3">
					<li>
						<a href="#features" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_features()}</a>
					</li>
					<li>
						<a href="#pricing" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_pricing()}</a>
					</li>
					<li>
						<a href="#how-it-works" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_how_it_works()}</a>
					</li>
				</ul>
			</div>

			<!-- Column 3: Company -->
			<div>
				<h4 class="font-medium text-xs text-neutral-500 mb-4 uppercase tracking-wider">
					{m.footer_company()}
				</h4>
				<ul class="space-y-3">
					<li>
						<a href="/about" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_about()}</a>
					</li>
					<li>
						<a href="/blog" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_blog()}</a>
					</li>
					<li>
						<a href="/contact" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_contact()}</a>
					</li>
				</ul>
			</div>

			<!-- Column 4: Legal -->
			<div>
				<h4 class="font-medium text-xs text-neutral-500 mb-4 uppercase tracking-wider">
					{m.footer_legal()}
				</h4>
				<ul class="space-y-3">
					<li>
						<a href="/privacy" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_privacy()}</a>
					</li>
					<li>
						<a href="/terms" class="text-sm text-neutral-400 hover:text-cyan-400 transition-colors">{m.footer_terms()}</a>
					</li>
				</ul>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="mt-14 pt-6 border-t border-white/[0.04]">
			<p class="text-xs text-neutral-600 text-center">
				&copy; {new Date().getFullYear()} {m.nav_brand_name()}. {m.footer_copyright()}
			</p>
		</div>
	</div>
</footer>
