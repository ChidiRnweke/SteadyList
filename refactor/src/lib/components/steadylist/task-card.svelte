<script lang="ts">
	import { Card, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar, Edit, MoreHorizontal, Trash2, Bell } from '@lucide/svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import type { Task } from '$lib/types';
	import { formatDate } from 'date-fns';

	interface Props {
		task: Task;
		projectId: string;
	}

	let { task, projectId }: Props = $props();

	let busy = $state(false);

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

	const isOverdue = $derived(
		task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
	);

	const handleDelete = async () => {
		busy = true;
		try {
			const response = await fetch(`/projects/${projectId}/tasks/${task.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Handle successful deletion (e.g., reload page or update parent state)
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to delete task:', error);
		} finally {
			busy = false;
		}
	};
</script>

<Card class="border-slate-200 shadow-sm transition-shadow hover:shadow">
	<CardContent class="p-4">
		<div class="mb-2 flex items-start justify-between">
			<h3 class="line-clamp-2 font-medium">{task.title}</h3>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button variant="ghost" size="icon" class="h-8 w-8">
						<MoreHorizontal class="h-4 w-4" />
						<span class="sr-only">Menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem>
						<a href="/projects/{projectId}/tasks/{task.id}/edit" class="flex items-center">
							<Edit class="mr-2 h-4 w-4" />
							Edit
						</a>
					</DropdownMenuItem>

					<DropdownMenuItem class="text-destructive">
						<Button
							type="button"
							variant="ghost"
							class="text-destructive m-0 p-0 has-[>svg]:px-0"
							onclick={handleDelete}
							disabled={busy}
						>
							<Trash2 class="mr-2 h-4 w-4" />
							{busy ? 'Deleting...' : 'Delete'}
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>

		{#if task.description}
			<p class="mb-3 line-clamp-2 text-sm text-slate-600">{task.description}</p>
		{/if}

		<div class="mt-2 flex flex-wrap gap-2">
			<Badge variant="secondary" class={getPriorityColor(task.priority)}>
				{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
			</Badge>

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
