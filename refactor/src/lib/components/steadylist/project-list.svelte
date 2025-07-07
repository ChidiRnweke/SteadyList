<script lang="ts">
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
	import type { Project, Task } from '$lib/types';
	import { formatDate } from 'date-fns';

	interface Props {
		projects: Project[];
		tasks: Task[];
	}

	let { projects, tasks }: Props = $props();

	const activeProjects = $derived(projects.filter((p) => !p.deleted));

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

	const handleDelete = async (projectId: string) => {
		// Add your delete logic here
		console.log('Deleting project:', projectId);
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
							<DropdownMenu.Trigger>
								<Button variant="ghost" size="icon" class="h-8 w-8">
									<MoreHorizontal class="h-4 w-4" />
									<span class="sr-only">Menu</span>
								</Button>
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
										onclick={() => handleDelete(project.id)}
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
