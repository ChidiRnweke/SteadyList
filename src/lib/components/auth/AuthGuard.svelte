<script lang="ts">
	import { user, loading, initialized } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LoginButton from './LoginButton.svelte';

	interface Props {
		children: any;
		redirectTo?: string;
		fallback?: any;
	}

	let { children, redirectTo = '/login', fallback }: Props = $props();

	// Redirect to login if not authenticated (only in browser)
	$effect(() => {
		if (browser && $initialized && !$loading && !$user) {
			// Store the current path to redirect back after login
			const currentPath = $page.url.pathname + $page.url.search;
			if (currentPath !== redirectTo) {
				goto(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
			}
		}
	});

	// Show loading state while checking auth
	const showLoading = $derived(!$initialized || $loading);
	const showContent = $derived($initialized && !$loading && $user);
	const showFallback = $derived($initialized && !$loading && !$user);
</script>

{#if showLoading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
			<p class="text-gray-600">Loading...</p>
		</div>
	</div>
{:else if showContent}
	{@render children()}
{:else if showFallback}
	{@render fallback?.()}
{:else}
	<!-- Default fallback with login -->
	<div class="flex min-h-screen items-center justify-center bg-gray-50">
		<div class="w-full max-w-md space-y-8 p-8">
			<div class="text-center">
				<h2 class="mt-6 text-3xl font-extrabold text-gray-900">Sign in to continue</h2>
				<p class="mt-2 text-sm text-gray-600">You need to be signed in to access this page</p>
			</div>
			<div class="mt-8 space-y-6">
				<LoginButton />
			</div>
		</div>
	</div>
{/if}
