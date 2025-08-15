<script lang="ts">
	import { user } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LoginButton from '$lib/components/auth/LoginButton.svelte';

	// Redirect if already authenticated
	$effect(() => {
		if ($user) {
			const redirectTo = $page.url.searchParams.get('redirect') || '/';
			goto(redirectTo);
		}
	});
</script>

<svelte:head>
	<title>Sign In - SteadyList</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
				<svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to SteadyList</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Manage your projects and tasks efficiently
			</p>
		</div>
		<div class="mt-8 space-y-6">
			<div>
				<LoginButton />
			</div>
			<div class="text-center">
				<p class="text-xs text-gray-500">
					By signing in, you agree to our Terms of Service and Privacy Policy
				</p>
			</div>
		</div>
	</div>
</div>
