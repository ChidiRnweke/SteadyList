<script lang="ts">
	import { RefreshCcw, Trash2, Calendar, Clock } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
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
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

	import type { Task, Project } from '$lib/types';

	interface Props {
		deletedTasks: (Task & { projectName: string; projectDeleted: boolean })[];
		deletedProjects: Project[];
	}

	let { deletedTasks, deletedProjects }: Props = $props();

	let activeTab = $state('projects');
	let busy = $state(false);
	let restoredIds = $state<string[]>([]);

	const handleRestore = async (type: 'task' | 'project', id: string) => {
		if (busy || restoredIds.includes(id)) return;

		restoredIds = [...restoredIds, id];
		busy = true;

		try {
			const response = await fetch('/trash', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, type })
			});

			const result = await response.json();

			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.message || 'Failed to restore item');
				restoredIds = restoredIds.filter((restoredId) => restoredId !== id);
			}
		} catch (error) {
			toast.error('Failed to restore item');
			restoredIds = restoredIds.filter((restoredId) => restoredId !== id);
		} finally {
			busy = false;
		}
	};
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between border-b pb-4">
		<div>
			<h1 class="text-primary text-3xl font-bold tracking-tight">Trash</h1>
			<p class="text-muted-foreground mt-1">View and restore deleted projects and tasks</p>
		</div>
		<div class="bg-muted/50 rounded-full p-2">
			<Trash2 class="text-muted-foreground h-6 w-6" />
		</div>
	</div>

	<Tabs bind:value={activeTab} class="space-y-6">
		<TabsList class="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
			<TabsTrigger value="projects" class="text-sm sm:text-base">
				Projects ({deletedProjects.length})
			</TabsTrigger>
			<TabsTrigger value="tasks" class="text-sm sm:text-base">
				Tasks ({deletedTasks.length})
			</TabsTrigger>
		</TabsList>

		<TabsContent value="projects" class="space-y-6">
			{#if deletedProjects.length === 0}
				<div
					class="bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-16"
				>
					<Trash2 class="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
					<p class="text-muted-foreground text-center text-lg">No deleted projects found</p>
					<p class="text-muted-foreground mt-1 text-center text-sm">
						Projects you delete will appear here
					</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each deletedProjects as project (project.id)}
						<motion
							initial={{ opacity: 0, y: 20 }}
							animate={{
								opacity: restoredIds.includes(project.id) ? 0 : 1,
								y: restoredIds.includes(project.id) ? -20 : 0,
								scale: restoredIds.includes(project.id) ? 0.9 : 1
							}}
							transition={{ duration: 0.3 }}
						>
							<Card class="border-muted/60 h-full overflow-hidden transition-all hover:shadow-md">
								<CardHeader class="bg-muted/20 pb-3">
									<CardTitle class="text-primary/90 text-xl">{project.name}</CardTitle>
									<CardDescription class="flex items-center text-sm">
										<Clock class="mr-1 inline h-3 w-3" />
										Deleted {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
									</CardDescription>
								</CardHeader>
								<CardContent class="pt-4">
									{#if project.description}
										<p class="text-foreground/80 mb-3 line-clamp-2 text-sm">
											{project.description}
										</p>
									{/if}
									<div class="flex items-center">
										<Badge
											variant="outline"
											class="bg-secondary/10 text-secondary border-secondary/30"
										>
											{project.taskCount}
											{project.taskCount === 1 ? 'task' : 'tasks'}
										</Badge>
									</div>
								</CardContent>
								<CardFooter class="bg-muted/10 flex justify-between border-t pt-2">
									<Button
										variant="secondary"
										size="sm"
										disabled={busy || restoredIds.includes(project.id)}
										onclick={() => handleRestore('project', project.id)}
										class="w-full transition-all"
									>
										<RefreshCcw class="mr-2 h-3.5 w-3.5" />
										{restoredIds.includes(project.id) ? 'Restoring...' : 'Restore Project'}
									</Button>
								</CardFooter>
							</Card>
						</motion>
					{/each}
				</div>
			{/if}
		</TabsContent>

		<TabsContent value="tasks" class="space-y-6">
			{#if deletedTasks.length === 0}
				<div
					class="bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-16"
				>
					<Trash2 class="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
					<p class="text-muted-foreground text-center text-lg">No deleted tasks found</p>
					<p class="text-muted-foreground mt-1 text-center text-sm">
						Tasks you delete will appear here
					</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each deletedTasks as task (task.id)}
						<motion
							initial={{ opacity: 0, y: 20 }}
							animate={{
								opacity: restoredIds.includes(task.id) ? 0 : 1,
								y: restoredIds.includes(task.id) ? -20 : 0,
								scale: restoredIds.includes(task.id) ? 0.9 : 1
							}}
							transition={{ duration: 0.3 }}
						>
							<Card class="border-muted/60 h-full overflow-hidden transition-all hover:shadow-md">
								<CardHeader class="bg-muted/20 pb-3">
									<CardTitle class="text-primary/90 text-lg">{task.title}</CardTitle>
									<CardDescription class="flex items-center text-sm">
										<Clock class="mr-1 inline h-3 w-3" />
										Deleted {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
									</CardDescription>
								</CardHeader>
								<CardContent class="pt-4">
									{#if task.description}
										<p class="text-foreground/80 mb-3 line-clamp-2 text-sm">{task.description}</p>
									{/if}
									<div class="mb-3 flex flex-wrap gap-2">
										<Badge
											variant="outline"
											class={`
                                                ${task.status === 'todo' ? 'bg-secondary/10 text-secondary border-secondary/30' : ''}
                                                ${task.status === 'in-progress' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' : ''}
                                                ${task.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                                                ${task.status === 'done' ? 'border-green-500/30 bg-green-500/10 text-green-500' : ''}
                                            `}
										>
											{task.status
												.split('-')
												.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
												.join(' ')}
										</Badge>
										<Badge
											variant="outline"
											class={`
                                                ${task.priority === 'low' ? 'border-green-200 bg-green-100 text-green-800' : ''}
                                                ${task.priority === 'medium' ? 'border-amber-200 bg-amber-100 text-amber-800' : ''}
                                                ${task.priority === 'high' ? 'border-red-200 bg-red-100 text-red-800' : ''}
                                            `}
										>
											{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
										</Badge>
									</div>

									{#if task.dueDate}
										<div class="text-muted-foreground mb-3 flex items-center text-sm">
											<Calendar class="mr-1.5 h-3.5 w-3.5" />
											Due: {new Date(task.dueDate).toLocaleDateString()}
										</div>
									{/if}

									<div class="flex items-center text-sm">
										<span class="text-muted-foreground">Project: </span>
										{#if task.projectDeleted}
											<span class="text-destructive ml-1 flex items-center">
												{task.projectName}
												<Badge
													variant="outline"
													class="bg-destructive/10 text-destructive border-destructive/30 ml-2 h-4 py-0 text-[10px]"
												>
													deleted
												</Badge>
											</span>
										{:else}
											<span class="text-foreground ml-1">{task.projectName}</span>
										{/if}
									</div>
								</CardContent>
								<CardFooter class="bg-muted/10 flex justify-between border-t pt-2">
									<Button
										variant="secondary"
										size="sm"
										disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
										onclick={() => handleRestore('task', task.id)}
										class="w-full transition-all"
										title={task.projectDeleted ? 'Project must be restored first' : ''}
									>
										<RefreshCcw class="mr-2 h-3.5 w-3.5" />
										{task.projectDeleted
											? 'Restore Project First'
											: restoredIds.includes(task.id)
												? 'Restoring...'
												: 'Restore Task'}
									</Button>
								</CardFooter>
							</Card>
						</motion>
					{/each}
				</div>
			{/if}
		</TabsContent>
	</Tabs>
</div>
