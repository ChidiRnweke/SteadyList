<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Edit, Plus, Trash2, RefreshCcw } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
		DropdownMenuSeparator,
		DropdownMenuLabel
	} from '$lib/components/ui/dropdown-menu';
	import { toast } from 'svelte-sonner';
	import type { Project, Task } from '$lib/types';
	import { formatDate } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface Props {
		project: Project;
	}

	type ProjectDeletedTask = Task & {
		projectName: string;
		projectDeleted: boolean;
	};

	let { project }: Props = $props();

	let deletedTasks = $state<ProjectDeletedTask[]>([]);
	let restoredIds = $state<string[]>([]);
	let isHovering = $state(false);

	const onDelete = async (id: string) => {
		console.log('Deleting project', id);
	};

	// Fetch deleted tasks for this project
	const fetchDeletedTasks = async () => {
		try {
			const response = await fetch('/trash');
			const data = await response.json();
			if (data.deletedTasks) {
				deletedTasks = data.deletedTasks.filter(
					(task: ProjectDeletedTask) => task.projectId === project.id
				);
			}
		} catch (error) {
			console.error('Error fetching deleted tasks:', error);
		}
	};

	const handleDelete = async () => {
		await onDelete(project.id);
		goto('/projects');
	};

	const handleRestore = async (taskId: string) => {
		restoredIds = [...restoredIds, taskId];
		try {
			const response = await fetch('/trash', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: taskId, type: 'task' })
			});
			const data = await response.json();
			if (data.success) {
				toast.success(data.message);
				await fetchDeletedTasks(); // Refresh the list
			}
		} catch (error) {
			console.error('Error restoring task:', error);
			toast.error('Failed to restore task');
		}
	};

	onMount(() => {
		fetchDeletedTasks();
	});
</script>

<div class="space-y-4">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-primary text-3xl font-bold">{project.name}</h1>
			<p class="text-muted-foreground mt-1">
				Created on {formatDate(project.createdAt)}
			</p>
		</div>

		<div class="flex flex-wrap gap-2">
			{#if deletedTasks.length > 0}
				<DropdownMenu>
					<DropdownMenuTrigger
						class="border-secondary/20 bg-background text-secondary ring-offset-background hover:bg-secondary/10 hover:text-secondary focus-visible:ring-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						onmouseenter={() => (isHovering = true)}
						onmouseleave={() => (isHovering = false)}
					>
						<div
							class="h-4 w-4"
							style="transform: rotate({isHovering ? '8deg' : '0deg'}); scale: {isHovering
								? 1.1
								: 1}; transition: all 0.5s ease-in-out;"
						>
							<Trash2 class="h-4 w-4" />
						</div>
						<span>Trash</span>
						<Badge class="bg-secondary ml-1 h-5 px-1.5 text-white">
							{deletedTasks.length}
						</Badge>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" class="w-72">
						<DropdownMenuLabel class="flex items-center gap-2 py-3">
							<Trash2 class="text-secondary h-4 w-4" />
							<span>Deleted Tasks</span>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						{#each deletedTasks as task (task.id)}
							<DropdownMenuItem
								disabled={restoredIds.includes(task.id)}
								class="focus:bg-secondary/5 py-2"
							>
								<div class="flex w-full flex-col gap-1">
									<div class="flex items-start justify-between">
										<span class="max-w-[180px] truncate font-medium">
											{task.title}
										</span>
										<Badge
											variant="outline"
											class="
                        {task.status === 'todo'
												? 'bg-secondary/10 text-secondary border-secondary/30'
												: ''}
                        {task.status === 'in-progress'
												? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
												: ''}
                        {task.status === 'blocked'
												? 'bg-destructive/10 text-destructive border-destructive/30'
												: ''}
                        {task.status === 'done'
												? 'border-green-500/30 bg-green-500/10 text-green-500'
												: ''}
                        h-5 py-0 text-[10px]
                      "
										>
											{task.status
												.split('-')
												.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
												.join(' ')}
										</Badge>
									</div>
									<div class="mt-1 flex justify-end">
										<Button
											variant="ghost"
											size="sm"
											class="hover:bg-secondary/10 hover:text-secondary h-7 p-0 px-2 text-xs"
											disabled={restoredIds.includes(task.id)}
											onclick={(e: MouseEvent) => {
												e.preventDefault();
												e.stopPropagation();
												handleRestore(task.id);
											}}
										>
											<div
												class="mr-1"
												style="transform: rotate({restoredIds.includes(task.id)
													? '360deg'
													: '0deg'}); transition: transform 0.5s;"
											>
												<RefreshCcw class="h-3 w-3" />
											</div>
											{restoredIds.includes(task.id) ? 'Restoring...' : 'Restore'}
										</Button>
									</div>
								</div>
							</DropdownMenuItem>
						{/each}
					</DropdownMenuContent>
				</DropdownMenu>
			{/if}

			<Button class="bg-primary hover:bg-primary/90" href="/projects/{project.id}/tasks/new">
				<Plus class="mr-2 h-4 w-4" />
				Add Task
			</Button>

			<Button variant="outline" href="/projects/{project.id}/edit">
				<Edit class="mr-2 h-4 w-4" />
				Edit
			</Button>

			<AlertDialog>
				<AlertDialogTrigger
					class="border-destructive/20 bg-background text-destructive ring-offset-background hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				>
					<Trash2 class="mr-2 h-4 w-4" />
					Delete
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the project and all its tasks. This action can be undone from the
							trash.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onclick={handleDelete}
							class="bg-destructive hover:bg-destructive/90 text-white"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	</div>

	{#if project.description}
		<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
			<p class="text-slate-700">{project.description}</p>
		</div>
	{/if}
</div>
