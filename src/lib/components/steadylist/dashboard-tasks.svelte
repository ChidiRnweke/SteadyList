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
	import { ArrowRight, Calendar } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		tasks: Task[];
		projects: Project[];
	}

	let { tasks, projects }: Props = $props();

	// Display up to 5 tasks
	const displayLimit = 5;

	const getProjectName = (projectId: string, projects: Project[]) => {
		const project = projects.find((p) => p.id === projectId);
		return project ? project.name : 'Unknown Project';
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'blocked':
				return 'bg-destructive/10 text-destructive border-destructive/30';
			case 'todo':
				return 'bg-secondary/10 text-secondary border-secondary/30';
			case 'in-progress':
				return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
			case 'done':
				return 'bg-green-500/10 text-green-500 border-green-500/30';
			default:
				return 'bg-slate-100 text-slate-800';
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'medium':
				return 'bg-amber-100 text-amber-800 border-amber-200';
			case 'low':
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-slate-100 text-slate-800';
		}
	};

	const visibleTasks = $derived(tasks.slice(0, displayLimit));
</script>

<Card class="col-span-1">
	<CardHeader class="flex flex-row items-center justify-between pb-2">
		<div>
			<CardTitle class="text-primary text-xl font-bold">Important Tasks</CardTitle>
			<CardDescription>Tasks that need your attention</CardDescription>
		</div>
		<a href="/projects">
			<Button variant="ghost" size="sm" class="text-primary">
				View All
				<ArrowRight class="ml-1 h-4 w-4" />
			</Button>
		</a>
	</CardHeader>
	<CardContent class="pb-2">
		{#if tasks.length === 0}
			<div class="py-8 text-center">
				<p class="text-muted-foreground">No important tasks</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each visibleTasks as task, index (task.id)}
					<div in:fly={{ y: 10, delay: index * 50 }} out:fade={{ duration: 150 }}>
						<a href="/projects/{task.projectId}">
							<div
								class="hover:border-primary/50 hover:bg-primary/5 cursor-pointer rounded-lg border p-3 transition-colors"
							>
								<div class="mb-1 flex items-start justify-between">
									<h3 class="font-medium">{task.title}</h3>
									<Badge variant="outline" class={getStatusColor(task.status)}>
										{task.status === 'in-progress'
											? 'In Progress'
											: task.status.charAt(0).toUpperCase() + task.status.slice(1)}
									</Badge>
								</div>

								<p class="text-muted-foreground mb-2 text-sm">
									{getProjectName(task.projectId, projects)}
								</p>

								<div class="flex flex-wrap gap-2">
									<Badge variant="outline" class={getPriorityColor(task.priority)}>
										{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
									</Badge>

									{#if task.dueDate}
										<Badge variant="outline" class="flex items-center gap-1">
											<Calendar class="h-3 w-3" />
											{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
										</Badge>
									{/if}
								</div>
							</div>
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
