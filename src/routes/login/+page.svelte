<script lang="ts">
	import { user } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import LoginButton from '$lib/components/auth/LoginButton.svelte';

	$effect(() => {
		if ($user) {
			const redirectTo = page.url.searchParams.get('redirect') || '/';
			goto(redirectTo);
		}
	});

	const glassCard =
		'border border-white/25 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 shadow-[0_0_1px_rgba(255,255,255,0.6)_inset,0_10px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:ring-white/5';
</script>

<svelte:head>
	<title>Sign In - SteadyList</title>
</svelte:head>

<div class="relative">
	<!-- Ambient background accents -->
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div
			class="absolute -top-16 -right-12 h-48 w-48 rounded-full bg-gradient-to-tr from-violet-300/40 to-cyan-300/40 blur-3xl sm:-top-24 sm:-right-18 sm:h-64 sm:w-64 md:-top-32 md:-right-24 md:h-72 md:w-72 dark:from-fuchsia-500/20 dark:to-emerald-500/20"
		></div>
		<div
			class="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-rose-300/40 to-amber-300/40 blur-3xl sm:-bottom-20 sm:-left-18 sm:h-64 sm:w-64 md:-bottom-28 md:-left-24 md:h-72 md:w-72 dark:from-sky-500/15 dark:to-indigo-500/15"
		></div>
		<div
			class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200/60 to-transparent dark:via-zinc-700/60"
		></div>
	</div>

	<!-- Main -->
	<div
		class="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8 lg:pt-32"
	>
		<!-- Left: headline & features -->
		<section class="order-2 md:order-1">
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200/60 px-3 py-1 text-xs text-zinc-600 backdrop-blur-sm dark:border-zinc-800 dark:text-zinc-300"
			>
				<span class="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
				New to SteadyList? You're a minute away.
			</div>
			<h1
				class="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl dark:from-zinc-100 dark:to-zinc-400"
			>
				Get started instantly
			</h1>
			<p class="mt-3 max-w-lg text-sm text-zinc-600 dark:text-zinc-300">
				Plan smarter, track progress, and keep promises on schedule—all in one calm workspace.
			</p>

			<ul class="mt-6 grid max-w-lg gap-4 text-sm">
				<li class="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
					<svg
						class="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						><path
							fill-rule="evenodd"
							d="M16.704 5.29a1 1 0 0 1 .006 1.414l-6.75 6.8a1 1 0 0 1-1.432.02L3.29 9.27a1 1 0 1 1 1.42-1.408l4.04 4.079 6.041-6.09a1 1 0 0 1 1.414-.006Z"
							clip-rule="evenodd"
						/></svg
					>
					Kanban, notes, and notifications that stay out of your way.
				</li>
				<li class="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
					<svg
						class="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						><path
							fill-rule="evenodd"
							d="M16.704 5.29a1 1 0 0 1 .006 1.414l-6.75 6.8a1 1 0 0 1-1.432.02L3.29 9.27a1 1 0 1 1 1.42-1.408l4.04 4.079 6.041-6.09a1 1 0 0 1 1.414-.006Z"
							clip-rule="evenodd"
						/></svg
					>
					Fast SSO sign-in—no passwords to remember.
				</li>
				<li class="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
					<svg
						class="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						><path
							fill-rule="evenodd"
							d="M16.704 5.29a1 1 0 0 1 .006 1.414l-6.75 6.8a1 1 0 0 1-1.432.02L3.29 9.27a1 1 0 1 1 1.42-1.408l4.04 4.079 6.041-6.09a1 1 0 0 1 1.414-.006Z"
							clip-rule="evenodd"
						/></svg
					>
					Designed for focus—dark mode looks great too.
				</li>
			</ul>
		</section>

		<!-- Right: card -->
		<section class="order-1 md:order-2">
			<Card class={cn('relative', glassCard, 'transition-all duration-200 hover:shadow-xl')}>
				<div
					class="pointer-events-none absolute -inset-px rounded-xl [mask-image:linear-gradient(white,transparent)] opacity-70"
				></div>
				<CardHeader class="pb-4">
					<div class="flex items-center gap-3">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-sm"
						>
							<span class="text-sm font-bold">SL</span>
						</div>
						<div>
							<CardTitle class="leading-tight">Welcome back</CardTitle>
							<CardDescription>Sign in to continue to SteadyList</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-5">
					<LoginButton />

					<p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
						By continuing you agree to our
						<a
							class="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200"
							href="/#">Terms</a
						>
						and
						<a
							class="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200"
							href="/#">Privacy Policy</a
						>.
					</p>
				</CardContent>
				<CardFooter class="justify-between text-xs text-zinc-600 dark:text-zinc-400">
					<span
						>Problems signing in? <a class="underline underline-offset-2" href="#help">Get help</a
						></span
					>
					<span>v1.0</span>
				</CardFooter>
			</Card>
		</section>
	</div>
</div>
