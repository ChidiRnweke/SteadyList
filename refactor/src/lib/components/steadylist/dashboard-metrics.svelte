<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { AlertCircle, Clock, ListTodo, FolderKanban } from '@lucide/svelte';
	import type { Task, Project } from '$lib/types';

	interface Props {
		tasks: Task[];
		projects: Project[];
	}

	let { tasks, projects }: Props = $props();

	const activeTasks = $derived(tasks.filter((task) => !task.deleted));
	const activeProjects = $derived(projects.filter((project) => !project.deleted));

	// Calculate due soon tasks (due in the next 48 hours)
	const dueSoonTasks = $derived(() => {
		const now = new Date();
		const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
		return activeTasks.filter((task) => {
			if (!task.dueDate) return false;
			const dueDate = new Date(task.dueDate);
			return dueDate > now && dueDate <= in48Hours && task.status !== 'done';
		});
	});

	const metrics = $derived({
		totalProjects: activeProjects.length,
		totalTasks: activeTasks.length,
		todoTasks: activeTasks.filter((task) => task.status === 'todo').length,
		inProgressTasks: activeTasks.filter((task) => task.status === 'in-progress').length,
		doneTasks: activeTasks.filter((task) => task.status === 'done').length,
		blockedTasks: activeTasks.filter((task) => task.status === 'blocked').length,
		dueSoonTasks: dueSoonTasks.length
	});
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card class="from-primary/5 to-primary/10 border-primary/20 bg-gradient-to-br">
		<CardHeader class="flex flex-row items-center justify-between pb-2">
			<CardTitle class="text-muted-foreground text-sm font-medium">Total Projects</CardTitle>
			<FolderKanban class="text-primary h-4 w-4" />
		</CardHeader>
		<CardContent>
			<div class="text-primary text-2xl font-bold">{metrics.totalProjects}</div>
		</CardContent>
	</Card>

	<Card class="from-secondary/5 to-secondary/10 border-secondary/20 bg-gradient-to-br">
		<CardHeader class="flex flex-row items-center justify-between pb-2">
			<CardTitle class="text-muted-foreground text-sm font-medium">To Do Tasks</CardTitle>
			<ListTodo class="text-secondary h-4 w-4" />
		</CardHeader>
		<CardContent>
			<div class="text-secondary text-2xl font-bold">{metrics.todoTasks}</div>
		</CardContent>
	</Card>

	<Card class="from-destructive/5 to-destructive/10 border-destructive/20 bg-gradient-to-br">
		<CardHeader class="flex flex-row items-center justify-between pb-2">
			<CardTitle class="text-muted-foreground text-sm font-medium">Blocked Tasks</CardTitle>
			<AlertCircle class="text-destructive h-4 w-4" />
		</CardHeader>
		<CardContent>
			<div class="text-destructive text-2xl font-bold">{metrics.blockedTasks}</div>
		</CardContent>
	</Card>

	<Card class="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
		<CardHeader class="flex flex-row items-center justify-between pb-2">
			<CardTitle class="text-muted-foreground text-sm font-medium">Due Soon</CardTitle>
			<Clock class="h-4 w-4 text-amber-500" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-amber-500">{metrics.dueSoonTasks}</div>
		</CardContent>
	</Card>
</div>
