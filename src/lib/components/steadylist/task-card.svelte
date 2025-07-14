<script lang="ts">
	import { Card, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Form from '$lib/components/ui/form';
	import { Calendar, Edit, MoreHorizontal, Trash2, Bell, Check, X } from '@lucide/svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import type { Task } from '$lib/types';
	import { formatDate } from 'date-fns';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { deleteTaskSchema, type DeleteTaskSchema } from '$lib/schemas/delete-schema';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		task: Task;
		projectId: string;
		deleteForm: SuperValidated<Infer<DeleteTaskSchema>>;
	}

	let { task, projectId, deleteForm }: Props = $props();

	const form = superForm(deleteForm, {
		validators: zodClient(deleteTaskSchema)
	});

	const { form: formData, enhance } = form;

	// Set the taskId for this specific task
	$effect(() => {
		$formData.taskId = task.id;
	});

	let busy = $state(false);

	// Inline editing states
	let editingTitle = $state(false);
	let editingDescription = $state(false);
	let editingPriority = $state(false);

	// Temporary values for editing
	let tempTitle = $state(task.title);
	let tempDescription = $state(task.description || '');
	let tempPriority = $state(task.priority);

	// Update temp values when task changes
	$effect(() => {
		tempTitle = task.title;
		tempDescription = task.description || '';
		tempPriority = task.priority;
	});

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
			case 'medium':
				return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
			case 'low':
				return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
			default:
				return 'bg-slate-1ss00 text-slate-800 hover:bg-slate-200 border-slate-200';
		}
	};

	const isOverdue = $derived(
		task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
	);

	// Generic function to update any task field
	const updateTaskField = async (field: string, value: any) => {
		busy = true;
		const loadingToastId = toast.loading(`Updating ${field}...`);

		try {
			const response = await fetch(`/projects/${projectId}/tasks/${task.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ [field]: value })
			});

			const data = await response.json();

			toast.dismiss(loadingToastId);

			if (!response.ok || !data.success) {
				throw new Error(data.message || `Failed to update ${field}`);
			}

			toast.success(data.message || `${field} updated successfully`);

			// Update the task object (this will be handled by parent component reactivity)
			Object.assign(task, { [field]: value });
		} catch (error) {
			console.error(`Failed to update ${field}:`, error);
			toast.dismiss(loadingToastId);
			toast.error(`Failed to update ${field}`);
		} finally {
			busy = false;
		}
	};

	// Handle title save
	const saveTitle = async () => {
		if (tempTitle.trim() !== task.title) {
			await updateTaskField('title', tempTitle.trim());
		}
		editingTitle = false;
	};

	// Handle description save
	const saveDescription = async () => {
		if (tempDescription.trim() !== (task.description || '')) {
			await updateTaskField('description', tempDescription.trim() || null);
		}
		editingDescription = false;
	};

	// Handle priority save
	const savePriority = async () => {
		if (tempPriority !== task.priority) {
			await updateTaskField('priority', tempPriority);
		}
		editingPriority = false;
	};

	// Cancel editing functions
	const cancelTitleEdit = () => {
		tempTitle = task.title;
		editingTitle = false;
	};

	const cancelDescriptionEdit = () => {
		tempDescription = task.description || '';
		editingDescription = false;
	};

	const cancelPriorityEdit = () => {
		tempPriority = task.priority;
		editingPriority = false;
	};

	// Handle keyboard events
	const handleTitleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			saveTitle();
		} else if (e.key === 'Escape') {
			cancelTitleEdit();
		}
	};

	const handleDescriptionKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && e.ctrlKey) {
			e.preventDefault();
			saveDescription();
		} else if (e.key === 'Escape') {
			cancelDescriptionEdit();
		}
	};

	// Handle keyboard events for accessibility
	const handleElementKeydown = (e: KeyboardEvent, action: () => void) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			action();
		}
	};
</script>

<Card class="overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow">
	<CardContent class="min-w-0 p-4">
		<div class="mb-2 flex items-start justify-between">
			{#if editingTitle}
				<div class="mr-2 flex w-full flex-1 items-center gap-2">
					<Input
						bind:value={tempTitle}
						class="min-w-0 flex-1 text-base font-medium"
						onkeydown={handleTitleKeydown}
						onfocusout={saveTitle}
						autofocus
					/>
					<Button
						size="sm"
						variant="ghost"
						onclick={saveTitle}
						disabled={busy}
						class="flex-shrink-0"
					>
						<Check class="h-4 w-4" />
					</Button>
					<Button size="sm" variant="ghost" onclick={cancelTitleEdit} class="flex-shrink-0">
						<X class="h-4 w-4" />
					</Button>
				</div>
			{:else}
				<button
					class="hover:text-primary mr-2 line-clamp-2 flex-1 cursor-pointer border-none bg-transparent p-0 text-left font-medium transition-colors"
					onclick={() => (editingTitle = true)}
					onkeydown={(e) => handleElementKeydown(e, () => (editingTitle = true))}
				>
					{task.title}
				</button>
			{/if}
			<DropdownMenu>
				<DropdownMenuTrigger
					class="ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				>
					<MoreHorizontal class="h-4 w-4" />
					<span class="sr-only">Menu</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem>
						<a href="/projects/{projectId}/tasks/{task.id}/edit" class="flex items-center">
							<Edit class="mr-2 h-4 w-4" />
							Edit
						</a>
					</DropdownMenuItem>

					<DropdownMenuItem class="text-destructive p-0">
						<form method="POST" action="/projects/{projectId}?/delete" use:enhance class="w-full">
							<Form.Field {form} name="taskId">
								<Form.Control>
									{#snippet children({ props })}
										<input {...props} type="hidden" bind:value={$formData.taskId} />
									{/snippet}
								</Form.Control>
							</Form.Field>
							<Form.Button
								type="submit"
								variant="ghost"
								class="text-destructive hover:text-destructive flex w-full items-center justify-start px-2 py-1.5 text-left"
								disabled={busy}
							>
								<Trash2 class="mr-2 h-4 w-4" />
								{busy ? 'Deleting...' : 'Delete'}
							</Form.Button>
						</form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>

		{#if editingDescription}
			<div class="mb-3 flex w-full items-start gap-2">
				<Textarea
					bind:value={tempDescription}
					placeholder="Add a description..."
					class="min-w-0 flex-1 resize-none text-sm"
					rows="2"
					onkeydown={handleDescriptionKeydown}
					onfocusout={saveDescription}
					autofocus
				/>
				<div class="flex flex-shrink-0 flex-col gap-1">
					<Button size="sm" variant="ghost" onclick={saveDescription} disabled={busy}>
						<Check class="h-4 w-4" />
					</Button>
					<Button size="sm" variant="ghost" onclick={cancelDescriptionEdit}>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{:else if task.description || editingDescription}
			<button
				class="mb-3 line-clamp-2 w-full cursor-pointer border-none bg-transparent p-0 text-left text-sm text-slate-600 transition-colors hover:text-slate-800"
				onclick={() => (editingDescription = true)}
				onkeydown={(e) => handleElementKeydown(e, () => (editingDescription = true))}
			>
				{task.description}
			</button>
		{:else}
			<button
				class="mb-3 w-full cursor-pointer border-none bg-transparent p-0 text-left text-sm text-slate-400 italic transition-colors hover:text-slate-600"
				onclick={() => (editingDescription = true)}
				onkeydown={(e) => handleElementKeydown(e, () => (editingDescription = true))}
			>
				Click to add description...
			</button>
		{/if}

		<div class="mt-2 flex flex-wrap gap-2">
			{#if editingPriority}
				<div class="flex w-full max-w-full items-center gap-1">
					<select
						bind:value={tempPriority}
						class="border-input bg-background h-8 max-w-[120px] min-w-0 flex-1 rounded-md border px-2 py-1 text-sm"
					>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
					<Button
						size="sm"
						variant="ghost"
						onclick={savePriority}
						disabled={busy}
						class="h-8 w-8 flex-shrink-0 p-0"
					>
						<Check class="h-3 w-3" />
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onclick={cancelPriorityEdit}
						class="h-8 w-8 flex-shrink-0 p-0"
					>
						<X class="h-3 w-3" />
					</Button>
				</div>
			{:else}
				<button
					class="{getPriorityColor(
						task.priority
					)} inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80"
					onclick={() => (editingPriority = true)}
					onkeydown={(e) => handleElementKeydown(e, () => (editingPriority = true))}
				>
					{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
				</button>
			{/if}

			{#if task.dueDate}
				<Badge variant="outline" class={isOverdue ? 'text-destructive border-destructive/30' : ''}>
					<Calendar class="mr-1 h-3 w-3" />
					{formatDate(task.dueDate, 'MMM dd, yyyy')}
					{#if isOverdue}(Overdue){/if}
				</Badge>
			{/if}

			{#if task.reminder}
				<Badge variant="outline" class="text-primary border-primary/30">
					<Bell class="mr-1 h-3 w-3" />
					Reminder set
				</Badge>
			{/if}
		</div>
	</CardContent>

	<CardFooter class="p-4 pt-0">
		<a href="/projects/{projectId}/tasks/{task.id}/edit" class="w-full">
			<Button variant="ghost" size="sm" class="hover:text-primary w-full justify-start">
				View Details
			</Button>
		</a>
	</CardFooter>
</Card>
