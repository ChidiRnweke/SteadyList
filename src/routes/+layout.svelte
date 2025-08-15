<script lang="ts">
	import DashboardHeader from '$lib/components/steadylist/dashboard-header.svelte';
	import { AuthGuard } from '$lib/components/auth';
	import { page } from '$app/stores';
	import '../app.css';

	let { children } = $props();

	const publicRoutes = ['/', '/login'];
	const isPublicRoute = $derived(publicRoutes.includes($page.route.id || ''));
</script>

<div class="flex min-h-screen flex-col">
	<div class="border-b px-4 md:px-8 lg:px-16">
		<div class="mx-auto w-full max-w-[1400px]">
			<DashboardHeader />
		</div>
	</div>
	<main class="flex-1 px-4 py-8 md:px-8 lg:px-16">
		<div class="mx-auto w-full max-w-[1400px]">
			{#if isPublicRoute}
				{@render children()}
			{:else}
				<AuthGuard>
					{@render children()}
				</AuthGuard>
			{/if}
		</div>
	</main>
</div>
