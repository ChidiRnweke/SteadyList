<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { formatDistanceToNow } from 'date-fns';
	import { toast } from 'svelte-sonner';
	import {
		Trash2,
		RefreshCcw,
		ArrowLeft,
		CheckSquare,
		Square,
		Calendar,
		User,
		FolderOpen,
		ListTodo
	} from '@lucide/svelte';

	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Reactive state
	let searchQuery = $state('');
	let selectedItems = $state<{ type: 'task' | 'project'; id: string }[]>([]);
	let activeTab = $state('tasks');
	let isRestoring = $state(false);
	let showBulkRestoreDialog = $state(false);

	// Optimistic UI state - override derived values temporarily
	let optimisticDeletedTasks = $derived(data.deletedTasks);
	let optimisticDeletedProjects = $derived(data.deletedProjects);
	let restoringItems = $state<Set<string>>(new Set());

	// Filtered data - use optimistic state
	const filteredTasks = $derived(
		optimisticDeletedTasks.filter(
			(task) =>
				task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				task.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	const filteredProjects = $derived(
		optimisticDeletedProjects.filter(
			(project) =>
				project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.description?.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Selection helpers
	const isItemSelected = (type: 'task' | 'project', id: string) => {
		return selectedItems.some((item) => item.type === type && item.id === id);
	};

	const toggleItemSelection = (type: 'task' | 'project', id: string) => {
		if (isItemSelected(type, id)) {
			selectedItems = selectedItems.filter((item) => !(item.type === type && item.id === id));
		} else {
			selectedItems = [...selectedItems, { type, id }];
		}
	};

	const selectAllTasks = () => {
		const allTaskIds = filteredTasks.map((task) => ({ type: 'task' as const, id: task.id }));
		const alreadySelected = allTaskIds.filter((item) => isItemSelected(item.type, item.id));

		if (alreadySelected.length === allTaskIds.length) {
			// Deselect all tasks
			selectedItems = selectedItems.filter((item) => item.type !== 'task');
		} else {
			// Select all tasks
			selectedItems = [...selectedItems.filter((item) => item.type !== 'task'), ...allTaskIds];
		}
	};

	const selectAllProjects = () => {
		const allProjectIds = filteredProjects.map((project) => ({
			type: 'project' as const,
			id: project.id
		}));
		const alreadySelected = allProjectIds.filter((item) => isItemSelected(item.type, item.id));

		if (alreadySelected.length === allProjectIds.length) {
			// Deselect all projects
			selectedItems = selectedItems.filter((item) => item.type !== 'project');
		} else {
			// Select all projects
			selectedItems = [
				...selectedItems.filter((item) => item.type !== 'project'),
				...allProjectIds
			];
		}
	};

	// Utility functions
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'medium':
				return 'bg-amber-100 text-amber-800 border-amber-200';
			case 'low':
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-slate-100 text-slate-800 border-slate-200';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'todo':
				return 'bg-secondary/10 text-secondary border-secondary/30';
			case 'in-progress':
				return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
			case 'blocked':
				return 'bg-destructive/10 text-destructive border-destructive/30';
			case 'done':
				return 'bg-green-500/10 text-green-500 border-green-500/30';
			default:
				return 'bg-slate-100 text-slate-800 border-slate-200';
		}
	};

	// Form enhancement with optimistic updates
	const handleRestore = (type: 'task' | 'project', id: string) => {
		return ({ formElement, cancel }: any) => {
			// Optimistically remove the item immediately
			if (type === 'task') {
				optimisticDeletedTasks = optimisticDeletedTasks.filter((task) => task.id !== id);
			} else {
				optimisticDeletedProjects = optimisticDeletedProjects.filter(
					(project) => project.id !== id
				);
			}

			// Add to restoring set for loading state
			restoringItems.add(id);

			// Show optimistic toast
			const optimisticToastId = toast.success(
				`${type === 'task' ? 'Task' : 'Project'} restored successfully`
			);

			return async ({ result }: any) => {
				// Remove from restoring set
				restoringItems.delete(id);

				if (result.type === 'success') {
					// Success - the optimistic update was correct, just refresh data
					goto('/trash', { replaceState: true });
				} else {
					// Failed! Roll back the optimistic change
					toast.dismiss(optimisticToastId);
					toast.error(result.data?.message || 'Failed to restore item');

					// Restore the item back to the list
					if (type === 'task') {
						const originalTask = data.deletedTasks.find((task) => task.id === id);
						if (originalTask) {
							optimisticDeletedTasks = [...optimisticDeletedTasks, originalTask];
						}
					} else {
						const originalProject = data.deletedProjects.find((project) => project.id === id);
						if (originalProject) {
							optimisticDeletedProjects = [...optimisticDeletedProjects, originalProject];
						}
					}
				}
			};
		};
	};

	const handleBulkRestore = () => {
		return ({ formElement, cancel }: any) => {
			// Store original items for rollback
			const originalTasks = [...optimisticDeletedTasks];
			const originalProjects = [...optimisticDeletedProjects];

			// Optimistically remove all selected items
			const selectedTaskIds = selectedItems
				.filter((item) => item.type === 'task')
				.map((item) => item.id);
			const selectedProjectIds = selectedItems
				.filter((item) => item.type === 'project')
				.map((item) => item.id);

			optimisticDeletedTasks = optimisticDeletedTasks.filter(
				(task) => !selectedTaskIds.includes(task.id)
			);
			optimisticDeletedProjects = optimisticDeletedProjects.filter(
				(project) => !selectedProjectIds.includes(project.id)
			);

			// Show optimistic toast
			const optimisticToastId = toast.success(
				`${selectedItems.length} items restored successfully`
			);

			return async ({ result }: any) => {
				isRestoring = false;
				showBulkRestoreDialog = false;

				if (result.type === 'success') {
					selectedItems = [];
					// Refresh the page to get updated data
					goto('/trash', { replaceState: true });
				} else {
					// Failed! Roll back all changes
					toast.dismiss(optimisticToastId);
					toast.error(result.data?.message || 'Failed to restore items');

					// Restore original state
					optimisticDeletedTasks = originalTasks;
					optimisticDeletedProjects = originalProjects;
				}
			};
		};
	};
</script>

<svelte:head>
	<title>Trash - SteadyList</title>
</svelte:head>

<div class="container mx-auto max-w-6xl space-y-6 p-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="sm" onclick={() => goto('/')}>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back to Dashboard
			</Button>
			<div class="flex items-center gap-3">
				<div class="bg-destructive/10 rounded-lg p-2">
					<Trash2 class="text-destructive h-5 w-5" />
				</div>
				<div>
					<h1 class="text-2xl font-bold">Trash</h1>
					<p class="text-muted-foreground text-sm">
						{optimisticDeletedTasks.length + optimisticDeletedProjects.length} deleted items
					</p>
				</div>
			</div>
		</div>

		{#if selectedItems.length > 0}
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground text-sm">
					{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
				</span>
				<Button
					variant="outline"
					size="sm"
					onclick={() => (showBulkRestoreDialog = true)}
					disabled={isRestoring}
				>
					<RefreshCcw class="mr-2 h-4 w-4" />
					Restore Selected
				</Button>
			</div>
		{/if}
	</div>

	<!-- Search -->
	<div class="max-w-md">
		<Input bind:value={searchQuery} placeholder="Search trash items..." class="w-full" />
	</div>

	<!-- Tabs -->
	<Tabs bind:value={activeTab} class="w-full">
		<TabsList class="grid w-full grid-cols-2">
			<TabsTrigger value="tasks" class="flex items-center gap-2">
				<ListTodo class="h-4 w-4" />
				Tasks ({filteredTasks.length})
			</TabsTrigger>
			<TabsTrigger value="projects" class="flex items-center gap-2">
				<FolderOpen class="h-4 w-4" />
				Projects ({filteredProjects.length})
			</TabsTrigger>
		</TabsList>

		<!-- Tasks Tab -->
		<TabsContent value="tasks" class="space-y-4">
			{#if filteredTasks.length === 0}
				<Card>
					<CardContent class="flex flex-col items-center justify-center py-12">
						<Trash2 class="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
						<h3 class="mb-2 text-lg font-medium">No deleted tasks</h3>
						<p class="text-muted-foreground text-center">
							{searchQuery ? 'No tasks match your search.' : 'All tasks are safe and sound!'}
						</p>
					</CardContent>
				</Card>
			{:else}
				<div class="space-y-4">
					<!-- Select All Button -->
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" onclick={selectAllTasks}>
							{selectedItems.filter((item) => item.type === 'task').length === filteredTasks.length
								? 'Deselect All'
								: 'Select All'}
						</Button>
					</div>

					<!-- Task Cards -->
					<div class="grid gap-4">
						{#each filteredTasks as task (task.id)}
							<Card class="transition-all hover:shadow-md">
								<CardContent class="p-4">
									<div class="flex items-start gap-4">
										<!-- Checkbox -->
										<div class="pt-1">
											<Checkbox
												checked={isItemSelected('task', task.id)}
												onCheckedChange={() => toggleItemSelection('task', task.id)}
											/>
										</div>

										<!-- Content -->
										<div class="min-w-0 flex-1">
											<div class="mb-2 flex items-start justify-between">
												<h3 class="truncate pr-4 text-lg font-medium">{task.title}</h3>
												<div class="flex flex-shrink-0 gap-2">
													<Badge variant="outline" class={getStatusColor(task.status)}>
														{task.status
															.split('-')
															.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
															.join(' ')}
													</Badge>
													<Badge variant="outline" class={getPriorityColor(task.priority)}>
														{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
													</Badge>
												</div>
											</div>

											{#if task.description}
												<p class="text-muted-foreground mb-3 line-clamp-2 text-sm">
													{task.description}
												</p>
											{/if}

											<div class="flex items-center justify-between">
												<div class="text-muted-foreground flex items-center gap-4 text-sm">
													{#if task.projectName}
														<div class="flex items-center gap-1">
															<FolderOpen class="h-3 w-3" />
															<span>Project: {task.projectName}</span>
															{#if task.projectDeleted}
																<Badge
																	variant="outline"
																	class="bg-destructive/10 text-destructive border-destructive/30 ml-2 h-4 py-0 text-[9px]"
																>
																	deleted
																</Badge>
															{/if}
														</div>
													{/if}
													{#if task.dueDate}
														<div class="flex items-center gap-1">
															<Calendar class="h-3 w-3" />
															<span
																>Due {formatDistanceToNow(new Date(task.dueDate), {
																	addSuffix: true
																})}</span
															>
														</div>
													{/if}
												</div>

												<form
													method="POST"
													action="/trash?/restore"
													use:enhance={handleRestore('task', task.id)}
												>
													<input type="hidden" name="type" value="task" />
													<input type="hidden" name="id" value={task.id} />
													<Button
														type="submit"
														variant="outline"
														size="sm"
														disabled={task.projectDeleted || restoringItems.has(task.id)}
														class="hover:border-green-300 hover:bg-green-50 hover:text-green-700"
													>
														<RefreshCcw
															class="mr-2 h-3 w-3 {restoringItems.has(task.id)
																? 'animate-spin'
																: ''}"
														/>
														{restoringItems.has(task.id) ? 'Restoring...' : 'Restore'}
													</Button>
												</form>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						{/each}
					</div>
				</div>
			{/if}
		</TabsContent>

		<!-- Projects Tab -->
		<TabsContent value="projects" class="space-y-4">
			{#if filteredProjects.length === 0}
				<Card>
					<CardContent class="flex flex-col items-center justify-center py-12">
						<Trash2 class="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
						<h3 class="mb-2 text-lg font-medium">No deleted projects</h3>
						<p class="text-muted-foreground text-center">
							{searchQuery ? 'No projects match your search.' : 'All projects are safe and sound!'}
						</p>
					</CardContent>
				</Card>
			{:else}
				<div class="space-y-4">
					<!-- Select All Button -->
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" onclick={selectAllProjects}>
							{selectedItems.filter((item) => item.type === 'project').length ===
							filteredProjects.length
								? 'Deselect All'
								: 'Select All'}
						</Button>
					</div>

					<!-- Project Cards -->
					<div class="grid gap-4">
						{#each filteredProjects as project (project.id)}
							<Card class="transition-all hover:shadow-md">
								<CardContent class="p-4">
									<div class="flex items-start gap-4">
										<!-- Checkbox -->
										<div class="pt-1">
											<Checkbox
												checked={isItemSelected('project', project.id)}
												onCheckedChange={() => toggleItemSelection('project', project.id)}
											/>
										</div>

										<!-- Content -->
										<div class="min-w-0 flex-1">
											<div class="mb-2 flex items-start justify-between">
												<h3 class="truncate pr-4 text-lg font-medium">{project.name}</h3>
												<Badge
													variant="outline"
													class="flex-shrink-0 border-blue-200 bg-blue-50 text-blue-700"
												>
													{project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
												</Badge>
											</div>

											{#if project.description}
												<p class="text-muted-foreground mb-3 line-clamp-2 text-sm">
													{project.description}
												</p>
											{/if}

											<div class="flex items-center justify-between">
												<div class="text-muted-foreground flex items-center gap-1 text-sm">
													<Calendar class="h-3 w-3" />
													<span>
														Deleted {formatDistanceToNow(new Date(project.updatedAt), {
															addSuffix: true
														})}
													</span>
												</div>

												<form
													method="POST"
													action="?/restore"
													use:enhance={handleRestore('project', project.id)}
												>
													<input type="hidden" name="type" value="project" />
													<input type="hidden" name="id" value={project.id} />
													<Button
														type="submit"
														variant="outline"
														size="sm"
														disabled={restoringItems.has(project.id)}
														class="hover:border-green-300 hover:bg-green-50 hover:text-green-700"
													>
														<RefreshCcw
															class="mr-2 h-3 w-3 {restoringItems.has(project.id)
																? 'animate-spin'
																: ''}"
														/>
														{restoringItems.has(project.id) ? 'Restoring...' : 'Restore'}
													</Button>
												</form>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						{/each}
					</div>
				</div>
			{/if}
		</TabsContent>
	</Tabs>
</div>

<!-- Bulk Restore Dialog -->
<AlertDialog bind:open={showBulkRestoreDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Restore Selected Items</AlertDialogTitle>
			<AlertDialogDescription>
				Are you sure you want to restore {selectedItems.length} selected item{selectedItems.length !==
				1
					? 's'
					: ''}? This action will move them back to their original locations.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
			<form method="POST" action="?/bulkRestore" use:enhance={handleBulkRestore()} class="contents">
				<input type="hidden" name="items" value={JSON.stringify(selectedItems)} />
				<AlertDialogAction
					type="submit"
					disabled={isRestoring}
					onclick={() => (isRestoring = true)}
				>
					{isRestoring ? 'Restoring...' : 'Restore Items'}
				</AlertDialogAction>
			</form>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
