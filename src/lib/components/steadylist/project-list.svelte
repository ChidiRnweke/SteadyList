<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Edit, MoreHorizontal, Sparkles, Trash2, ArrowRight } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
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
	import type { Project, Task } from '$lib/types';
	import { formatDate } from 'date-fns';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { deleteProjectSchema, type DeleteProjectSchema } from '$lib/schemas/delete-schema';

	interface Props {
		projects: Project[];
		tasks: Task[];
		deleteForm: SuperValidated<Infer<DeleteProjectSchema>>;
	}

	let { projects, tasks, deleteForm }: Props = $props();

	// Initialize superForm for delete action
	const form = superForm(deleteForm, {
		validators: zodClient(deleteProjectSchema)
	});

	const { form: formData, enhance: formEnhance, submitting } = form;

	// State for delete confirmation dialog
	let deleteProjectId = $state<string | null>(null);
	let showDeleteDialog = $state(false);

	// Optimistic UI using derived override pattern
	let optimisticProjects = $derived(projects);

	const activeProjects = $derived(optimisticProjects.filter((p) => !p.deleted));

	const projectsWithProgress = $derived(
		activeProjects.map((project) => {
			const activeTasks = tasks.filter((t) => !t.deleted && t.projectId === project.id);
			const completedTasks = activeTasks.filter((t) => t.status === 'done');

			const progress =
				activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0;

			return {
				...project,
				progress,
				taskCount: activeTasks.length,
				completedTaskCount: completedTasks.length,
				blockedTaskCount: activeTasks.filter((t) => t.status === 'blocked').length
			};
		})
	);

	// Get project details for delete confirmation
	const projectToDelete = $derived(
		deleteProjectId ? activeProjects.find((p) => p.id === deleteProjectId) : null
	);

	// Handle delete confirmation
	const handleDeleteConfirm = (projectId: string) => {
		deleteProjectId = projectId;
		$formData.projectId = projectId;
		showDeleteDialog = true;
	};

	// Optimistic delete handler
	const handleOptimisticDelete = async () => {
		if (!deleteProjectId) return;

		const projectToDeleteFromList = projects.find((p) => p.id === deleteProjectId);
		if (!projectToDeleteFromList) return;

		// Optimistically remove the project immediately
		optimisticProjects = optimisticProjects.filter((p) => p.id !== deleteProjectId);

		// Close dialog and show optimistic toast
		showDeleteDialog = false;
		const optimisticToastId = toast.success('Project deleted successfully');

		try {
			// Submit the form programmatically
			const formElement = document.querySelector(
				'form[action="?/deleteProject"]'
			) as HTMLFormElement;
			if (formElement) {
				const formData = new FormData(formElement);
				const response = await fetch('?/deleteProject', {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (!response.ok || result.type === 'failure') {
					throw new Error(result.data?.message || 'Failed to delete project');
				}

				// Success! Reload to get fresh data
				goto('/projects', { replaceState: true });
			}
		} catch (error) {
			// Failed! Roll back the optimistic change
			toast.dismiss(optimisticToastId);
			toast.error(error instanceof Error ? error.message : 'Failed to delete project');

			// Restore the project back to the list
			optimisticProjects = [...optimisticProjects, projectToDeleteFromList];
		} finally {
			deleteProjectId = null;
		}
	};
</script>

{#if projects.length === 0}
	<div class="py-12 text-center">
		<h3 class="mb-2 text-lg font-medium">No projects yet</h3>
		<p class="text-muted-foreground mb-4">Create your first project to get started</p>
		<a href="/projects/new">
			<Button class="bg-primary hover:bg-primary/90">Create Project</Button>
		</a>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each projectsWithProgress as project (project.id)}
			<Card class="overflow-hidden border-slate-200 transition-all hover:shadow-md">
				<CardHeader class="pb-2">
					<div class="flex items-start justify-between">
						<CardTitle class="text-primary text-xl">{project.name}</CardTitle>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
							>
								<MoreHorizontal class="h-4 w-4" />
								<span class="sr-only">Menu</span>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item>
									<a href="/projects/{project.id}/edit" class="flex items-center">
										<Edit class="mr-2 h-4 w-4" />
										Edit
									</a>
								</DropdownMenu.Item>
								<DropdownMenu.Item>
									<a href="/projects/{project.id}/ai-tasks" class="flex items-center">
										<Sparkles class="mr-2 h-4 w-4" />
										AI Generate Tasks
									</a>
								</DropdownMenu.Item>
								<DropdownMenu.Item class="text-destructive">
									<button
										type="button"
										onclick={() => handleDeleteConfirm(project.id)}
										class="flex w-full items-center"
									>
										<Trash2 class="mr-2 h-4 w-4" />
										Delete
									</button>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
					<CardDescription>{project.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="mb-2 flex flex-wrap gap-2">
							<Badge variant="outline" class="bg-primary/10 text-primary border-primary/30">
								{project.taskCount} tasks
							</Badge>
							<Badge variant="outline" class="border-green-500/30 bg-green-500/10 text-green-500">
								{project.completedTaskCount} completed
							</Badge>
							{#if project.blockedTaskCount > 0}
								<Badge
									variant="outline"
									class="bg-destructive/10 text-destructive border-destructive/30"
								>
									{project.blockedTaskCount} blocked
								</Badge>
							{/if}
						</div>

						<div class="space-y-1">
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Progress</span>
								<span class="font-medium">{project.progress}%</span>
							</div>
							<Progress value={project.progress} class="h-2" />
						</div>

						<p class="text-muted-foreground text-sm">
							Created on {formatDate(project.createdAt, 'PPP')}
						</p>
					</div>
				</CardContent>
				<CardFooter class="border-t border-slate-100 bg-slate-50">
					<a href="/projects/{project.id}" class="w-full">
						<Button
							variant="ghost"
							class="hover:text-primary w-full justify-between hover:bg-white"
						>
							View Project
							<ArrowRight class="ml-2 h-4 w-4" />
						</Button>
					</a>
				</CardFooter>
			</Card>
		{/each}
	</div>
{/if}

<!-- Delete Confirmation Dialog -->
<AlertDialog bind:open={showDeleteDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete Project</AlertDialogTitle>
			<AlertDialogDescription>
				Are you sure you want to delete "{projectToDelete?.name}"? This action will move the project
				and all its tasks to the trash. This action can be undone from the trash.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel disabled={$submitting}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				type="button"
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				disabled={$submitting}
				onclick={handleOptimisticDelete}
			>
				{$submitting ? 'Deleting...' : 'Delete Project'}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<!-- Hidden form for progressive enhancement -->
<form method="POST" action="?/deleteProject" style="display: none;">
	<input type="hidden" name="projectId" bind:value={$formData.projectId} />
</form>
