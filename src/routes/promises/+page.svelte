<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import PromiseList from '$lib/components/steadylist/promise-list.svelte';
	import PromiseForm from '$lib/components/steadylist/promise-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let showForm = $state(false);

	const { promises, createForm, updateForm } = data;

	// Quick add state for minimal barrier to entry
	let quickTitle = $state('');

	const handleQuickAdd = async () => {
		if (!quickTitle.trim()) return;

		try {
			const formData = new FormData();
			formData.append('title', quickTitle.trim());

			const response = await fetch('?/create', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('Promise added!');
				quickTitle = '';
				// Reload the page to get fresh data
				location.reload();
			} else {
				toast.error('Failed to add promise');
			}
		} catch (error) {
			toast.error('Failed to add promise');
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleQuickAdd();
		}
	};
</script>

<svelte:head>
	<title>Promises - SteadyList</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-primary text-3xl font-bold">Promises</h1>
			<p class="text-muted-foreground text-lg">Keep track of your commitments</p>
		</div>
		<Button class="bg-primary hover:bg-primary/90" onclick={() => (showForm = !showForm)}>
			<Plus class="mr-2 h-4 w-4" />
			{showForm ? 'Cancel' : 'Add Promise'}
		</Button>
	</div>

	<!-- Quick Add - Minimal barrier to entry -->
	<div class="bg-card rounded-lg border p-6">
		<div class="flex gap-3">
			<input
				type="text"
				placeholder="What did you promise? (Press Enter to add)"
				bind:value={quickTitle}
				onkeydown={handleKeyDown}
				class="input focus:ring-primary flex-1 rounded-md border px-4 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
			/>
			<Button
				onclick={handleQuickAdd}
				disabled={!quickTitle.trim()}
				class="bg-primary hover:bg-primary/90"
			>
				Add
			</Button>
		</div>
		<p class="text-muted-foreground mt-2 text-sm">
			Quick add for fast entry. Use the form below for more details.
		</p>
	</div>

	<!-- Detailed Form -->
	{#if showForm}
		<div class="bg-card rounded-lg border p-6">
			<h2 class="mb-4 text-xl font-semibold">Add Detailed Promise</h2>
			<PromiseForm form={createForm} action="?/create" />
		</div>
	{/if}

	<!-- Promises List -->
	<PromiseList {promises} {updateForm} />
</div>
