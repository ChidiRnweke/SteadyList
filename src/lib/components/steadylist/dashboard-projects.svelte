<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { Project, Task } from '$lib/types';
	import { ArrowRight, Plus } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		projects: Project[];
		tasks: Task[];
	}

	let { projects, tasks }: Props = $props();

	// Display up to 4 projects
	const displayLimit = 4;

	const projectsWithCounts = $derived(
		projects.map((project) => {
			const activeTasks = tasks.filter((task) => !task.deleted && task.projectId === project.id);
			return {
				...project,
				taskCount: activeTasks.length
			};
		})
	);

	// Get only the projects we want to display
	const visibleProjects = $derived(projectsWithCounts.slice(0, displayLimit));
</script>

<Card class="col-span-1">
	<CardHeader class="flex flex-row items-center justify-between pb-2">
		<div>
			<CardTitle class="text-primary text-xl font-bold">Recent Projects</CardTitle>
			<CardDescription>Your most recently updated projects</CardDescription>
		</div>
		<a href="/projects">
			<Button variant="ghost" size="sm" class="text-primary">
				View All
				<ArrowRight class="ml-1 h-4 w-4" />
			</Button>
		</a>
	</CardHeader>
	<CardContent class="pb-2">
		{#if projects.length === 0}
			<div class="py-8 text-center">
				<p class="text-muted-foreground mb-4">No projects yet</p>
				<a href="/projects/new">
					<Button class="bg-primary hover:bg-primary/90">
						<Plus class="mr-2 h-4 w-4" />
						Create Project
					</Button>
				</a>
			</div>
		{:else}
			<div class="space-y-4">
				{#each visibleProjects as project, index (project.id)}
					<div in:fly={{ y: 10, delay: index * 50 }} out:fade={{ duration: 150 }}>
						<a href="/projects/{project.id}">
							<div
								class="hover:border-primary/50 hover:bg-primary/5 cursor-pointer rounded-lg border p-4 transition-colors"
							>
								<div class="mb-2 flex items-start justify-between">
									<h3 class="text-primary font-medium">{project.name}</h3>
									<div class="flex gap-2">
										{#if project.taskCount > 0}
											<Badge
												variant="outline"
												class="bg-secondary/10 text-secondary border-secondary/30"
											>
												{project.taskCount} to do
											</Badge>
										{/if}
										{#if project.blockedTaskCount !== undefined && project.blockedTaskCount > 0}
											<Badge
												variant="outline"
												class="bg-destructive/10 text-destructive border-destructive/30"
											>
												{project.blockedTaskCount} blocked
											</Badge>
										{/if}
									</div>
								</div>
								{#if project.description}
									<p class="text-muted-foreground mb-2 line-clamp-2 text-sm">
										{project.description}
									</p>
								{/if}
								<div class="text-muted-foreground text-sm">
									{project.taskCount}
									{project.taskCount === 1 ? 'task' : 'tasks'}
								</div>
							</div>
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
