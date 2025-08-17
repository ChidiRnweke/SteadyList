<script lang="ts">
	import { user } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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
			const redirectTo = $page.url.searchParams.get('redirect') || '/';
			goto(redirectTo);
		}
	});

	const glassCard =
		'border border-white/25 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 shadow-[0_0_1px_rgba(255,255,255,0.6)_inset,0_10px_30px_-12px_rgba(0,0,0,0.25)]';
</script>

<svelte:head>
	<title>Sign In - SteadyList</title>
</svelte:head>

<div>
	<!-- Main -->
	<div
		class="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8"
	>
		<!-- Left: minimal headline -->
		<section class="order-2 md:order-1">
			<h1
				class="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl dark:from-zinc-100 dark:to-zinc-400"
			>
				Get started instantly
			</h1>
			<p class="mt-3 max-w-lg text-sm text-zinc-600 dark:text-zinc-300">
				Jump straight into your workspace.
			</p>
		</section>

		<!-- Right: card -->
		<section class="order-1 md:order-2">
			<Card class={glassCard}>
				<CardHeader>
					<CardTitle>Get started instantly</CardTitle>
					<CardDescription>Sign in to continue.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<LoginButton />

					<p class="text-xs text-zinc-600 dark:text-zinc-400">
						By continuing you agree to our <a class="underline" href="/#">Terms</a> and
						<a class="underline" href="/#">Privacy Policy</a>.
					</p>
				</CardContent>
				<CardFooter class="justify-between text-xs text-zinc-600 dark:text-zinc-400">
					<span>Problems signing in? <a class="underline" href="#help">Get help</a></span>
					<span>v1.0</span>
				</CardFooter>
			</Card>
		</section>
	</div>
</div>
