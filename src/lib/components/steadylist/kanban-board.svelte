<script lang="ts">
	import { dndzone, SOURCES } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { Card, CardContent, CardHeader, CardTitle } from '../ui/card/index.js';
	import { Badge } from '../ui/badge/index.js';
	import TaskCard from './task-card.svelte';
	import type { Task } from '../../types.js';
	import { toast } from 'svelte-sonner';
	import { Search, Filter, Plus, ArrowUpDown, X } from '@lucide/svelte';
	import { Input } from '../ui/input/index.js';
	import { Button } from '../ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuCheckboxItem
	} from '../ui/dropdown-menu/index.js';
	import { browser } from '$app/environment';

	// Detect if we're on a mobile device
	let isMobile = $state(false);

	if (browser) {
		isMobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			window.innerWidth < 768;
	}

	interface Props {
		tasks: Task[];
		projectId: string;
	}

	type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
	type SortOption = 'newest' | 'oldest' | 'priority' | 'alphabetical';

	let { tasks: initialTasks, projectId }: Props = $props();

	let updatingTaskId = $state<string | null>(null);

	let searchQuery = $state('');
	let priorityFilter = $state<PriorityFilter>('all');
	let sortOption = $state<SortOption>('newest');

	let tasks = $state<Task[]>([]);

	// State for tracking drag operations
	let dragState = $state<{ [columnId: string]: Task[] } | null>(null);

	// Sync with initial tasks
	$effect(() => {
		tasks = [...initialTasks];
	});

	// Compute the final task list
	const currentTasks = $derived(() => {
		return tasks.filter((task) => !task.deleted);
	});

	const columnDefinitions = [
		{ id: 'todo', title: 'To Do', color: 'border-secondary bg-secondary/5' },
		{
			id: 'in-progress',
			title: 'In Progress',
			color: 'border-amber-500 bg-amber-500/5'
		},
		{
			id: 'blocked',
			title: 'Blocked',
			color: 'border-destructive bg-destructive/5'
		},
		{ id: 'done', title: 'Done', color: 'border-green-500 bg-green-500/5' }
	];

	// Derived state using $derived
	const filteredAndSortedTasks = $derived.by(() => {
		let result = currentTasks().filter((task) => !task.deleted);

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(task) =>
					task.title.toLowerCase().includes(query) ||
					(task.description && task.description.toLowerCase().includes(query))
			);
		}

		if (priorityFilter !== 'all') {
			result = result.filter((task) => task.priority === priorityFilter);
		}

		// Apply sorting
		return result.sort((a, b) => {
			switch (sortOption) {
				case 'newest':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case 'oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case 'priority': {
					const priorityOrder = { high: 0, medium: 1, low: 2 };
					return priorityOrder[a.priority] - priorityOrder[b.priority];
				}
				case 'alphabetical':
					return a.title.localeCompare(b.title);
				default:
					return 0;
			}
		});
	});

	// Derived value for populated columns
	const populatedColumns = $derived(() => {
		// Use drag state if available, otherwise use normal filtered tasks
		const tasksToUse = dragState || {};

		return columnDefinitions.map((column) => ({
			...column,
			tasks: dragState
				? tasksToUse[column.id] || []
				: filteredAndSortedTasks.filter((task) => task.status === column.id)
		}));
	});

	// Derived value for total filtered tasks
	const totalFilteredTasks = $derived(filteredAndSortedTasks.length);

	function handleDragAndDrop(columnIndex: number) {
		const column = populatedColumns()[columnIndex];
		return {
			items: column?.tasks || [],
			flipDurationMs: isMobile ? 100 : 200,
			dropTargetStyle: {
				outline: '2px dashed #3b82f6',
				outlineOffset: '2px',
				backgroundColor: 'rgba(59, 130, 246, 0.05)'
			},
			type: 'task',
			dropFromOthersDisabled: false
		};
	}

	function handleConsider(columnIndex: number, e: CustomEvent) {
		const { items } = e.detail;
		const column = columnDefinitions[columnIndex];

		// Create or update drag state
		if (!dragState) {
			// Initialize drag state with current column distribution
			dragState = {};
			columnDefinitions.forEach((col) => {
				dragState![col.id] = filteredAndSortedTasks.filter((task) => task.status === col.id);
			});
		}

		// Update the specific column in drag state
		dragState[column.id] = [...items];
	}

	function handleFinalize(columnIndex: number, e: CustomEvent) {
		const { items, info } = e.detail;
		const column = columnDefinitions[columnIndex];

		// Clear drag state
		dragState = null;

		if (info.source === SOURCES.POINTER) {
			const draggedTask = items.find((item: any) => info.id === item.id);
			if (draggedTask && draggedTask.status !== column.id) {
				// Store previous state for rollback
				const previousTasks = [...tasks];

				// Update task status optimistically
				tasks = tasks.map((task) =>
					task.id === draggedTask.id ? { ...task, status: column.id as any } : task
				);

				// Update on server with rollback on failure
				updateTaskStatus(draggedTask.id, column.id, previousTasks);
			}
		}
	}

	// Clear all filters
	function clearFilters() {
		searchQuery = '';
		priorityFilter = 'all';
		sortOption = 'newest';
	}

	// Handle search input
	function handleSearchChange(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
	}

	// Function to update task status on the server with optimistic UI
	async function updateTaskStatus(taskId: string, newStatus: string, previousTasks: Task[]) {
		updatingTaskId = taskId;

		// Show loading toast
		const loadingToastId = toast.loading(`Moving task to ${newStatus.replace('-', ' ')}...`);

		try {
			const response = await fetch(`/projects/${projectId}/tasks/${taskId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			const data = await response.json();

			// Dismiss loading toast
			toast.dismiss(loadingToastId);

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to update task status');
			}

			// Show success toast
			toast.success(data.message || 'Task status updated');
		} catch (error) {
			console.error('Error updating task status:', error);

			// Rollback the optimistic update
			tasks = previousTasks;

			// Clear any drag state
			dragState = null;

			// Dismiss loading toast and show error
			toast.dismiss(loadingToastId);
			toast.error('Failed to update task status');
		} finally {
			updatingTaskId = null;
		}
	}
</script>

<!-- If we have no tasks yet, show a loading state or empty state -->
{#if currentTasks().length === 0}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#each columnDefinitions as column (column.id)}
			<div class="flex h-full flex-col">
				<Card class="flex h-full flex-col border-t-4 {column.color}">
					<CardHeader class="pb-2">
						<div class="flex items-center justify-between">
							<CardTitle class="text-lg font-medium">
								{column.title}
							</CardTitle>
							<Badge variant="outline">0</Badge>
						</div>
					</CardHeader>
					<CardContent class="flex-grow overflow-hidden pt-0">
						<div
							class="text-muted-foreground flex min-h-[200px] items-center justify-center text-sm"
						>
							{initialTasks.length === 0 ? 'No tasks yet' : 'Loading...'}
						</div>
					</CardContent>
				</Card>
			</div>
		{/each}
	</div>
{:else}
	<!-- Main kanban board -->
	<div class="space-y-4">
		<!-- Toolbar -->
		<div class="flex flex-col items-start justify-between gap-3 pb-2 sm:flex-row sm:items-center">
			<div class="relative w-full max-w-md">
				<Search class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
				<Input
					type="text"
					placeholder="Search tasks..."
					class="w-full pl-9"
					bind:value={searchQuery}
					oninput={handleSearchChange}
				/>
				{#if searchQuery}
					<Button
						variant="ghost"
						size="sm"
						class="absolute top-0.5 right-0.5 h-7 w-7 rounded-full p-0"
						onclick={() => (searchQuery = '')}
					>
						<X class="h-4 w-4" />
						<span class="sr-only">Clear search</span>
					</Button>
				{/if}
			</div>

			<div class="flex w-full items-center gap-2 sm:w-auto">
				<DropdownMenu>
					<DropdownMenuTrigger
						class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					>
						<Filter class="h-3.5 w-3.5" />
						<span>Priority</span>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="w-40">
						<DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuCheckboxItem
							checked={priorityFilter === 'all'}
							onCheckedChange={() => (priorityFilter = 'all')}
						>
							All Priorities
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={priorityFilter === 'high'}
							onCheckedChange={() => (priorityFilter = 'high')}
						>
							High
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={priorityFilter === 'medium'}
							onCheckedChange={() => (priorityFilter = 'medium')}
						>
							Medium
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={priorityFilter === 'low'}
							onCheckedChange={() => (priorityFilter = 'low')}
						>
							Low
						</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger
						class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					>
						<ArrowUpDown class="h-3.5 w-3.5" />
						<span>Sort</span>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="w-40">
						<DropdownMenuLabel>Sort by</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuCheckboxItem
							checked={sortOption === 'newest'}
							onCheckedChange={() => (sortOption = 'newest')}
						>
							Newest First
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={sortOption === 'oldest'}
							onCheckedChange={() => (sortOption = 'oldest')}
						>
							Oldest First
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={sortOption === 'priority'}
							onCheckedChange={() => (sortOption = 'priority')}
						>
							Priority
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={sortOption === 'alphabetical'}
							onCheckedChange={() => (sortOption = 'alphabetical')}
						>
							Alphabetical
						</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{#if searchQuery || priorityFilter !== 'all' || sortOption !== 'newest'}
					<Button variant="ghost" size="sm" onclick={clearFilters} class="text-xs">Clear</Button>
				{/if}

				<a href="/projects/{projectId}/tasks/new">
					<Button size="sm" class="ml-2 flex items-center gap-1">
						<Plus class="h-3.5 w-3.5" />
						<span>Add Task</span>
					</Button>
				</a>
			</div>
		</div>

		{#if searchQuery || priorityFilter !== 'all'}
			<div class="text-muted-foreground mb-2 text-sm">
				Showing {totalFilteredTasks} of {currentTasks().filter((t) => !t.deleted).length} tasks
				{#if searchQuery}
					<span>
						matching "<strong>{searchQuery}</strong>"
					</span>
				{/if}
				{#if priorityFilter !== 'all'}
					<span>
						with
						<Badge variant="outline" class="ml-1 text-xs font-normal">
							{priorityFilter} priority
						</Badge>
					</span>
				{/if}
			</div>
		{/if}

		<!-- Kanban board -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each populatedColumns() as column, columnIndex (column.id)}
				<div class="flex h-full flex-col">
					<Card class="flex h-full flex-col border-t-4 {column.color}">
						<CardHeader class="pb-2">
							<div class="flex items-center justify-between">
								<CardTitle class="text-lg font-medium">
									{column.title}
								</CardTitle>
								<Badge variant="outline">{column.tasks.length}</Badge>
							</div>
						</CardHeader>
						<CardContent class="flex-grow overflow-hidden pt-0">
							<div
								class="min-h-[500px] space-y-3 overflow-y-auto border-2 border-transparent p-4 transition-colors hover:border-blue-200"
								use:dndzone={handleDragAndDrop(columnIndex)}
								onconsider={(e) => handleConsider(columnIndex, e)}
								onfinalize={(e) => handleFinalize(columnIndex, e)}
							>
								{#if column.tasks.length > 0}
									{#each column.tasks as task (task.id)}
										<div
											class="transition-all duration-200 {updatingTaskId === task.id
												? 'opacity-60'
												: ''}"
											data-task-id={task.id}
											data-status={task.status}
											animate:flip={{ duration: isMobile ? 100 : 200 }}
										>
											<TaskCard {task} {projectId} />
										</div>
									{/each}
								{:else}
									<div
										class="text-muted-foreground flex h-60 flex-col items-center justify-center rounded-md border-2 border-dashed text-center text-sm"
									>
										{#if searchQuery || priorityFilter !== 'all'}
											<p>No matching tasks</p>
										{:else}
											<p class="mb-2">No tasks in this column</p>
											<a href="/projects/{projectId}/tasks/new?status={column.id}">
												<Button variant="ghost" size="sm" class="text-xs">
													<Plus class="mr-1 h-3.5 w-3.5" />
													Add task
												</Button>
											</a>
										{/if}
									</div>
								{/if}
							</div>
						</CardContent>
					</Card>
				</div>
			{/each}
		</div>
	</div>
{/if}
