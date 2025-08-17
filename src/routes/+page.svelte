<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Accordion from '$lib/components/ui/accordion/accordion.svelte';
	import AccordionItem from '$lib/components/ui/accordion/accordion-item.svelte';
	import AccordionTrigger from '$lib/components/ui/accordion/accordion-trigger.svelte';
	import AccordionContent from '$lib/components/ui/accordion/accordion-content.svelte';

	// lucide svelte icons
	import { ListChecks, Gauge, ClipboardList, CheckCircle2 } from '@lucide/svelte';

	const year = new Date().getFullYear();

	const featureRows = [
		{
			title: 'Projects',
			desc: 'Keep initiatives scoped and focused with a clear overview.',
			label: 'Projects view screenshot'
		},
		{
			title: 'Tasks',
			desc: 'Create, assign, and prioritize tasks with rich details.',
			label: 'Task detail screenshot',
			reverse: true
		},
		{
			title: 'Progress',
			desc: 'Track momentum with lightweight metrics and completion rates.',
			label: 'Progress dashboard screenshot'
		},
		{
			title: 'Due dates',
			desc: 'Stay ahead of deadlines with calendar views and reminders.',
			label: 'Calendar view screenshot',
			reverse: true
		},
		{
			title: 'Recovery',
			desc: 'Restore deleted items anytime from the safety net.',
			label: 'Trash / recovery screenshot'
		}
	];
</script>

<!-- Page wrapper -->
<div
	class="relative min-h-screen bg-gradient-to-b from-white via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-black"
>
	<!-- gradient background (decorative) -->
	<div
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]"
	></div>

	<main>
		<!-- Hero -->
		<section id="demo" class="relative py-20 pt-24 md:py-28">
			<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="grid items-center gap-10 md:grid-cols-2">
					<div>
						<div
							class="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
						>
							<Badge variant="secondary" class="rounded-full">New</Badge>
							Zero‑friction AI via MCP • Works with Claude & ChatGPT
						</div>

						<h1
							in:fly={{ y: 10, duration: 500 }}
							class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
						>
							Organize work. <span
								class="bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent"
								>Finish what matters.</span
							>
						</h1>

						<p class="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-300">
							SteadyList is a slick project manager with Kanban boards, task tracking, and real‑time
							progress — free forever. Connect your favorite AI tools through MCP and keep your
							flow.
						</p>

						<div class="mt-6 flex flex-wrap items-center gap-3">
							<Button size="lg" class="shadow-lg">
								<a href="#get-started">Create your first project</a>
							</Button>
							<Button size="lg" variant="outline">
								<a href="#features">Explore features</a>
							</Button>
						</div>
					</div>

					<div in:fade={{ duration: 600 }}>
						<!-- App mock / screenshot placeholder -->
						<div class="relative overflow-hidden rounded-3xl">
							<div
								class="relative aspect-[16/10] w-full bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-800"
							>
								<div class="absolute inset-0 grid place-items-center">
									<div
										class="rounded-xl border border-dashed border-zinc-400/70 bg-white/70 px-4 py-2 text-xs text-zinc-700 backdrop-blur dark:bg-zinc-900/50 dark:text-zinc-300"
									>
										Drop your UI screenshot here (e.g., 1440×900 PNG)
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section id="features" class="relative py-20 md:py-28">
			<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="mx-auto mb-12 max-w-3xl text-center">
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Feature highlights</h2>
					<p class="mt-3 text-zinc-600 dark:text-zinc-300">
						A simple vertical tour. Replace the placeholders with your own screenshots and copy.
					</p>
				</div>

				<div class="space-y-16">
					{#each featureRows as row, i}
						<div class="grid items-center gap-8 md:grid-cols-2 md:gap-12">
							<div class={row.reverse ? 'md:order-2' : ''}>
								<h3 class="text-xl font-semibold">{row.title}</h3>
								<p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{row.desc}</p>
								<ul class="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
									<li class="flex items-center gap-2">
										<CheckCircle2 class="h-4 w-4 text-indigo-500" /> Placeholder bullet — benefit 1
									</li>
									<li class="flex items-center gap-2">
										<CheckCircle2 class="h-4 w-4 text-indigo-500" /> Placeholder bullet — benefit 2
									</li>
									<li class="flex items-center gap-2">
										<CheckCircle2 class="h-4 w-4 text-indigo-500" /> Placeholder bullet — benefit 3
									</li>
								</ul>
							</div>

							<div class={row.reverse ? 'md:order-1' : ''}>
								<div
									class="overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white/60 dark:bg-zinc-900/40"
								>
									<div
										class="relative aspect-[16/10] w-full bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-800"
									>
										<div class="absolute inset-0 grid place-items-center">
											<div
												class="rounded-md bg-white/70 px-3 py-1 text-[11px] text-zinc-700 shadow-sm backdrop-blur dark:bg-zinc-900/60 dark:text-zinc-300"
											>
												{row.label}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- How it works -->
		<section
			id="how"
			class="relative bg-gradient-to-b from-transparent via-zinc-50 to-transparent py-20 md:py-28 dark:via-zinc-900/20"
		>
			<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="mx-auto mb-12 max-w-2xl text-center">
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
					<p class="mt-3 text-zinc-600 dark:text-zinc-300">
						Three quick steps to a steady workflow.
					</p>
				</div>

				<div class="grid gap-6 md:grid-cols-3">
					{#each [{ n: 1, title: 'Create Projects', desc: 'Define goals for each initiative and keep scope crisp.', Icon: ListChecks }, { n: 2, title: 'Add Tasks', desc: 'Break work into manageable pieces with priorities and due dates.', Icon: ClipboardList }, { n: 3, title: 'Track Progress', desc: 'See velocity, spot bottlenecks, and ship on time.', Icon: Gauge }] as item (item.title)}
						<Card class="border-0 bg-white/60 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/40">
							<CardHeader class="flex-row items-center gap-3">
								<div
									class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
								>
									{item.n}
								</div>
								<CardTitle class="text-base">{item.title}</CardTitle>
							</CardHeader>

							<CardContent
								class="-mt-3 flex items-start gap-3 pb-6 text-sm text-zinc-600 dark:text-zinc-300"
							>
								<svelte:component this={item.Icon} class="mt-0.5 h-4 w-4 text-indigo-500" />
								<span>{item.desc}</span>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		</section>

		<!-- Integrations / Feature tour -->
		<section id="integrations" class="relative py-20 md:py-28">
			<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="mx-auto mb-12 max-w-2xl text-center">
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Feature tour</h2>
					<p class="mt-3 text-zinc-600 dark:text-zinc-300">
						A few key screens to give the feel. Swap each placeholder with real screenshots.
					</p>
				</div>

				<div class="space-y-8">
					{#each [{ badge: 'Projects', title: 'Organize initiatives', desc: 'Clean overview of all projects with quick filters.', label: 'Projects screen' }, { badge: 'Tasks', title: 'Focus on the next step', desc: 'Task details with checklists, comments, and due dates.', label: 'Task details' }, { badge: 'Progress', title: 'See momentum', desc: 'Lightweight charts to track throughput and completion.', label: 'Progress charts' }] as s, i}
						<div
							class="relative overflow-hidden rounded-3xl border-0 bg-white/60 p-6 shadow-sm ring-1 ring-black/5 md:p-8 dark:bg-zinc-900/40"
						>
							<div class="mb-4">
								<Badge variant="secondary" class="rounded-full">{s.badge}</Badge>
								<h3 class="mt-2 text-xl font-semibold">{s.title}</h3>
								<p class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{s.desc}</p>
							</div>

							<div
								class="overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white/60 dark:bg-zinc-900/40"
							>
								<div
									class="relative aspect-[16/10] w-full bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-800"
								>
									<div class="absolute inset-0 grid place-items-center">
										<div
											class="rounded-md bg-white/70 px-3 py-1 text-[11px] text-zinc-700 shadow-sm backdrop-blur dark:bg-zinc-900/60 dark:text-zinc-300"
										>
											{s.label} — drop image
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- FAQ -->
		<section
			id="faq"
			class="relative bg-gradient-to-b from-transparent via-zinc-50 to-transparent py-20 md:py-28 dark:via-zinc-900/20"
		>
			<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="mx-auto mb-10 max-w-2xl text-center">
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked</h2>
				</div>

				<Accordion type="single" class="mx-auto max-w-3xl">
					<AccordionItem value="free">
						<AccordionTrigger>Is SteadyList really free?</AccordionTrigger>
						<AccordionContent>
							Yep. The core app is free forever — create projects, add tasks, track progress, and
							connect via MCP without a credit card.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="mcp">
						<AccordionTrigger>What is MCP and how does it help?</AccordionTrigger>
						<AccordionContent>
							MCP (Model Context Protocol) connects SteadyList to AI tools like Claude or ChatGPT in
							a consistent, secure way so you can move information without glue code.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="import">
						<AccordionTrigger>Can I import from other tools?</AccordionTrigger>
						<AccordionContent>
							You can paste tasks from spreadsheets or markdown. CSV import is in progress.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="privacy">
						<AccordionTrigger>How about privacy?</AccordionTrigger>
						<AccordionContent>
							Your projects and tasks stay on SteadyList. When using MCP, only the context you
							choose is shared with your AI tool.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</section>

		<!-- CTA -->
		<section id="get-started" class="relative py-20 md:py-28">
			<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="relative overflow-hidden rounded-3xl border-0 p-10 text-center">
					<div
						class="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/30 via-fuchsia-500/20 to-cyan-500/30"
					></div>
					<div class="mx-auto max-w-2xl">
						<h3 class="text-2xl font-bold tracking-tight sm:text-3xl">Ready to get started?</h3>
						<p class="mt-2 text-zinc-700 dark:text-zinc-300">
							Spin up your first project in seconds. It’s free — and it’s fast.
						</p>

						<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Button size="lg" class="shadow-lg">Create your first project</Button>
							<Button size="lg" variant="outline">Open the demo board</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>

	<footer
		class="border-t bg-white/70 py-10 text-sm backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:bg-zinc-950/50"
	>
		<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col items-center justify-between gap-6 md:flex-row">
				<div class="flex items-center gap-3">
					<div
						class="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
					>
						<ListChecks class="h-4 w-4" />
					</div>
					<span class="font-semibold">SteadyList</span>
					<Badge variant="secondary" class="rounded-full">Free forever</Badge>
				</div>
				<div class="text-zinc-600 dark:text-zinc-400">
					© {year} SteadyList. All rights reserved.
				</div>
			</div>
		</div>
	</footer>
</div>
