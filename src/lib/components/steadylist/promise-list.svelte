<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatDistanceToNow, format, isPast } from 'date-fns';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Calendar, User, Edit, Trash2, Check, X } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { PromiseMade } from '$lib/types';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import {
		updatePromiseMadeSchema,
		type UpdatePromiseMadeSchema
	} from '$lib/schemas/promise-schema';

	interface Props {
		promises: PromiseMade[];
		updateForm: SuperValidated<Infer<UpdatePromiseMadeSchema>>;
	}

	let { promises, updateForm }: Props = $props();

	// State for editing
	let editingId = $state<string | null>(null);
	let editData = $state<{ id: string; title: string; promiseTo: string; dueDate: string }>({
		id: '',
		title: '',
		promiseTo: '',
		dueDate: ''
	});

	// Optimistic UI state
	let optimisticPromises = $derived(promises);

	// Separate completed and pending promises
	const pendingPromises = $derived(optimisticPromises.filter((p) => !p.completed));
	const completedPromises = $derived(optimisticPromises.filter((p) => p.completed));

	// Handle completion toggle with optimistic UI
	const toggleCompletion = async (promise: PromiseMade) => {
		const newCompleted = !promise.completed;

		// Optimistically update
		optimisticPromises = optimisticPromises.map((p) =>
			p.id === promise.id ? { ...p, completed: newCompleted } : p
		);

		try {
			const formData = new FormData();
			formData.append('id', promise.id);
			formData.append('completed', newCompleted.toString());

			const response = await fetch('?/update', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to update');
			}

			toast.success(newCompleted ? 'Promise completed!' : 'Promise reopened');
		} catch (error) {
			// Rollback on error
			optimisticPromises = optimisticPromises.map((p) =>
				p.id === promise.id ? { ...p, completed: !newCompleted } : p
			);
			toast.error('Failed to update promise');
		}
	};

	// Handle editing
	const startEdit = (promise: PromiseMade) => {
		editingId = promise.id;
		editData = {
			id: promise.id,
			title: promise.title,
			promiseTo: promise.promiseTo || '',
			dueDate: promise.dueDate ? promise.dueDate.slice(0, 16) : ''
		};
	};

	const cancelEdit = () => {
		editingId = null;
		editData = { id: '', title: '', promiseTo: '', dueDate: '' };
	};

	const saveEdit = async () => {
		if (!editingId) return;

		try {
			const formData = new FormData();
			formData.append('id', editingId);
			formData.append('title', editData.title);
			formData.append('promiseTo', editData.promiseTo);
			formData.append('dueDate', editData.dueDate);

			const response = await fetch('?/update', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('Promise updated');
				editingId = null;
				// Reload to get fresh data
				location.reload();
			} else {
				toast.error('Failed to update promise');
			}
		} catch (error) {
			toast.error('Failed to update promise');
		}
	};

	// Handle deletion with optimistic UI
	const deletePromise = async (promise: PromiseMade) => {
		// Optimistically remove
		optimisticPromises = optimisticPromises.filter((p) => p.id !== promise.id);
		const optimisticToastId = toast.success('Promise deleted');

		try {
			const formData = new FormData();
			formData.append('id', promise.id);

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to delete');
			}
		} catch (error) {
			// Rollback on error
			toast.dismiss(optimisticToastId);
			optimisticPromises = [...optimisticPromises, promise];
			toast.error('Failed to delete promise');
		}
	};

	const formatDueDate = (dueDate: string) => {
		const date = new Date(dueDate);
		const isOverdue = isPast(date) && !promises.find((p) => p.dueDate === dueDate)?.completed;
		return {
			formatted: format(date, 'MMM d, yyyy'),
			relative: formatDistanceToNow(date, { addSuffix: true }),
			isOverdue
		};
	};
</script>

{#if pendingPromises.length === 0 && completedPromises.length === 0}
	<div class="py-12 text-center">
		<h3 class="mb-2 text-lg font-medium">No promises yet</h3>
		<p class="text-muted-foreground mb-4">Add your first promise above to get started</p>
	</div>
{:else}
	<div class="space-y-8">
		<!-- Pending Promises -->
		{#if pendingPromises.length > 0}
			<div>
				<h2 class="mb-4 text-xl font-semibold">Pending Promises ({pendingPromises.length})</h2>
				<div class="space-y-3">
					{#each pendingPromises as promise (promise.id)}
						<Card class="transition-all hover:shadow-md">
							<CardContent class="p-4">
								<div class="flex items-start gap-3">
									<Checkbox
										checked={promise.completed}
										onCheckedChange={() => toggleCompletion(promise)}
										class="mt-1"
									/>

									<div class="min-w-0 flex-1">
										{#if editingId === promise.id}
											<!-- Edit Mode -->
											<div class="space-y-3">
												<Input
													bind:value={editData.title}
													placeholder="Promise title"
													class="font-medium"
												/>
												<div class="flex gap-2">
													<Input
														bind:value={editData.promiseTo}
														placeholder="Promised to (optional)"
														class="flex-1"
													/>
													<Input
														bind:value={editData.dueDate}
														type="datetime-local"
														class="flex-1"
													/>
												</div>
												<div class="flex gap-2">
													<Button
														size="sm"
														onclick={saveEdit}
														class="bg-primary hover:bg-primary/90"
													>
														<Check class="mr-1 h-4 w-4" />
														Save
													</Button>
													<Button size="sm" variant="outline" onclick={cancelEdit}>
														<X class="mr-1 h-4 w-4" />
														Cancel
													</Button>
												</div>
											</div>
										{:else}
											<!-- View Mode -->
											<div>
												<h3 class="text-foreground font-medium">{promise.title}</h3>

												<div class="mt-2 flex flex-wrap gap-2">
													{#if promise.promiseTo}
														<Badge variant="secondary" class="text-xs">
															<User class="mr-1 h-3 w-3" />
															{promise.promiseTo}
														</Badge>
													{/if}

													{#if promise.dueDate}
														{@const dueDateInfo = formatDueDate(promise.dueDate)}
														<Badge
															variant={dueDateInfo.isOverdue ? 'destructive' : 'outline'}
															class="text-xs"
														>
															<Calendar class="mr-1 h-3 w-3" />
															{dueDateInfo.formatted} ({dueDateInfo.relative})
														</Badge>
													{/if}
												</div>

												<p class="text-muted-foreground mt-1 text-sm">
													Created {formatDistanceToNow(new Date(promise.createdAt), {
														addSuffix: true
													})}
												</p>
											</div>
										{/if}
									</div>

									{#if editingId !== promise.id}
										<DropdownMenu.Root>
											<DropdownMenu.Trigger class="hover:bg-accent rounded p-1">
												<Edit class="h-4 w-4" />
											</DropdownMenu.Trigger>
											<DropdownMenu.Content>
												<DropdownMenu.Item onclick={() => startEdit(promise)}>
													<Edit class="mr-2 h-4 w-4" />
													Edit
												</DropdownMenu.Item>
												<DropdownMenu.Item
													onclick={() => deletePromise(promise)}
													class="text-destructive"
												>
													<Trash2 class="mr-2 h-4 w-4" />
													Delete
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Completed Promises -->
		{#if completedPromises.length > 0}
			<div>
				<h2 class="mb-4 text-xl font-semibold">Completed Promises ({completedPromises.length})</h2>
				<div class="space-y-3">
					{#each completedPromises as promise (promise.id)}
						<Card class="bg-muted/50 transition-all hover:shadow-md">
							<CardContent class="p-4">
								<div class="flex items-start gap-3">
									<Checkbox
										checked={promise.completed}
										onCheckedChange={() => toggleCompletion(promise)}
										class="mt-1"
									/>

									<div class="min-w-0 flex-1">
										<h3 class="text-muted-foreground font-medium line-through">{promise.title}</h3>

										<div class="mt-2 flex flex-wrap gap-2">
											{#if promise.promiseTo}
												<Badge variant="secondary" class="text-xs opacity-70">
													<User class="mr-1 h-3 w-3" />
													{promise.promiseTo}
												</Badge>
											{/if}

											{#if promise.dueDate}
												<Badge variant="outline" class="text-xs opacity-70">
													<Calendar class="mr-1 h-3 w-3" />
													{formatDueDate(promise.dueDate).formatted}
												</Badge>
											{/if}
										</div>

										<p class="text-muted-foreground mt-1 text-sm">
											Completed {formatDistanceToNow(new Date(promise.updatedAt), {
												addSuffix: true
											})}
										</p>
									</div>

									<DropdownMenu.Root>
										<DropdownMenu.Trigger class="hover:bg-accent rounded p-1">
											<Edit class="h-4 w-4" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content>
											<DropdownMenu.Item
												onclick={() => deletePromise(promise)}
												class="text-destructive"
											>
												<Trash2 class="mr-2 h-4 w-4" />
												Delete
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
