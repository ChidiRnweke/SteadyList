<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Plus } from '@lucide/svelte';
	import PromiseList from '$lib/components/steadylist/promise-list.svelte';
	import PromiseForm from '$lib/components/steadylist/promise-form.svelte';
	import type { PageData } from './$types';
	import { isPast } from 'date-fns';

	let { data }: { data: PageData } = $props();
	let open = $state(false);

	const { promises, createForm, updateForm } = data;

	// Derived counts and segments
	const completedCount = $derived(promises.filter((p) => p.completed).length);
	const pendingCount = $derived(promises.length - completedCount);
	const pendingPromises = $derived(promises.filter((p) => !p.completed));
	const completedPromises = $derived(promises.filter((p) => p.completed));

	// After successful create, close dialog
	const onCreateSuccess = () => {
		open = false;
		toast.success('Promise added!');
		location.reload();
	};
</script>

<svelte:head>
	<title>Promises - SteadyList</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header with single add action -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Promises</h1>
			<p class="text-muted-foreground mt-1">Stay accountable.</p>
		</div>

		<Dialog.Dialog bind:open>
			<Dialog.DialogTrigger>
				<Button class="bg-primary hover:bg-primary/90">
					<Plus class="mr-2 h-4 w-4" />
					Add Promise
				</Button>
			</Dialog.DialogTrigger>
			<Dialog.DialogContent class="sm:max-w-lg">
				<Dialog.DialogHeader>
					<Dialog.DialogTitle>Add a promise</Dialog.DialogTitle>
					<Dialog.DialogDescription>
						Give it a clear title, who you promised to, and a due date if it helps.
					</Dialog.DialogDescription>
				</Dialog.DialogHeader>
				<PromiseForm form={createForm} action="?/create" onSuccess={onCreateSuccess} />
			</Dialog.DialogContent>
		</Dialog.Dialog>
	</div>

	<!-- Tabs: Pending / Completed -->
	<Tabs.Tabs value="pending" class="w-full">
		<Tabs.TabsList class="bg-card inline-flex w-full max-w-md rounded-lg border p-1">
			<Tabs.TabsTrigger value="pending" class="flex-1">
				Pending ({pendingCount})
			</Tabs.TabsTrigger>
			<Tabs.TabsTrigger value="completed" class="flex-1">
				Completed ({completedCount})
			</Tabs.TabsTrigger>
		</Tabs.TabsList>

		<Tabs.TabsContent value="pending" class="mt-4">
			<PromiseList promises={pendingPromises} {updateForm} hideSections />
		</Tabs.TabsContent>
		<Tabs.TabsContent value="completed" class="mt-4">
			<PromiseList promises={completedPromises} {updateForm} hideSections />
		</Tabs.TabsContent>
	</Tabs.Tabs>
</div>
