<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
</script>

<footer class="border-t border-[var(--border-subtle)]" style="background: var(--bg-page); color: var(--text-dim); transition: background 0.4s, color 0.4s;">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
		<div class="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8">
			<!-- Column 1: Brand -->
			<div class="col-span-2 md:col-span-1">
				<a href="/" class="font-display font-extrabold text-[1.2rem] tracking-[-0.03em] transition-colors hover:opacity-80">
					<span style="color: var(--text-white-or-dark);">Brief</span><span style="color: var(--c-electric);">Agent</span>
				</a>
				<p class="text-[0.82rem] mt-3 leading-relaxed max-w-[240px]" style="color: var(--text-dim);">
					{m.footer_tagline()}
				</p>
			</div>

			<!-- Column 2: Product -->
			<div>
				<h4 class="text-[0.65rem] font-bold mb-4 uppercase tracking-wider" style="color: var(--text-dim);">
					{m.footer_product()}
				</h4>
				<ul class="space-y-[0.7rem]">
					<li><a href="#features" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_features()}</a></li>
					<li><a href="#pricing" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_pricing()}</a></li>
					<li><a href="#how-it-works" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_how_it_works()}</a></li>
				</ul>
			</div>

			<!-- Column 3: Company -->
			<div>
				<h4 class="text-[0.65rem] font-bold mb-4 uppercase tracking-wider" style="color: var(--text-dim);">
					{m.footer_company()}
				</h4>
				<ul class="space-y-[0.7rem]">
					<li><a href="/about" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_about()}</a></li>
					<li><a href="/blog" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_blog()}</a></li>
					<li><a href="/contact" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_contact()}</a></li>
				</ul>
			</div>

			<!-- Column 4: Legal -->
			<div>
				<h4 class="text-[0.65rem] font-bold mb-4 uppercase tracking-wider" style="color: var(--text-dim);">
					{m.footer_legal()}
				</h4>
				<ul class="space-y-[0.7rem]">
					<li><a href="/privacy" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_privacy()}</a></li>
					<li><a href="/terms" class="text-[0.82rem] transition-colors hover:text-primary-500" style="color: var(--text-dim);">{m.footer_terms()}</a></li>
				</ul>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="mt-12 pt-6 border-t border-[var(--border-subtle)]">
			<p class="font-mono text-[0.65rem] opacity-60 text-center" style="color: var(--text-dim);">
				&copy; {new Date().getFullYear()} {m.nav_brand_name()}. {m.footer_copyright()}
			</p>
		</div>
	</div>
</footer>
