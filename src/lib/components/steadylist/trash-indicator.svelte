<script lang="ts">
	import { Trash2, RefreshCcw, ExternalLink, ChevronLeft } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { AnimatePresence } from 'svelte-motion';
	import { toast } from 'svelte-sonner';

	// Import your UI components (adjust paths as needed)
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';

	interface Task {
		id: string;
		title: string;
		description?: string;
		status: 'todo' | 'in-progress' | 'blocked' | 'done';
		priority: 'low' | 'medium' | 'high';
		updatedAt: string;
	}

	interface Project {
		id: string;
		name: string;
		description?: string;
		taskCount: number;
		updatedAt: string;
	}

	interface Props {
		deletedTasks: (Task & { projectName: string; projectDeleted: boolean })[];
		deletedProjects: Project[];
	}

	let { deletedTasks, deletedProjects }: Props = $props();

	let isDialogOpen = $state(false);
	let activeTab = $state('tasks');
	let restoredIds = $state<string[]>([]);
	let isHovering = $state(false);
	let busy = $state(false);

	const totalItems = $derived(deletedTasks.length + deletedProjects.length);
	const recentTasks = $derived(deletedTasks.slice(0, 3));
	const recentProjects = $derived(deletedProjects.slice(0, 3));

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
				// Remove from restored IDs if failed
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

{#if totalItems > 0}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative inline-flex"
				onmouseenter={() => (isHovering = true)}
				onmouseleave={() => (isHovering = false)}
			>
				<Button
					variant="ghost"
					size="icon"
					class="hover:bg-secondary/5 relative transition-all duration-300"
				>
					<motion
						animate={{
							rotate: isHovering ? [0, -10, 0, 10, 0] : 0,
							scale: isHovering ? 1.1 : 1
						}}
						transition={{
							duration: 0.5,
							ease: 'easeInOut'
						}}
					>
						<Trash2 class="h-4 w-4 {isHovering ? 'text-secondary' : ''}" />
					</motion>

					<AnimatePresence>
						{#if totalItems > 0}
							<motion
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{ type: 'spring', stiffness: 500, damping: 25 }}
								class="absolute -top-1 -right-1"
							>
								<Badge
									variant="outline"
									class="bg-secondary border-secondary flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0
                                            text-[9px] font-medium text-white shadow-sm"
								>
									{totalItems < 100 ? totalItems : '99+'}
								</Badge>
							</motion>
						{/if}
					</AnimatePresence>
				</Button>
			</div>
		</DropdownMenu.Trigger>

		<DropdownMenu.Content align="end" class="w-80">
			<DropdownMenu.Label class="flex items-center justify-between py-3">
				<span class="flex items-center gap-2 text-base font-semibold">
					<Trash2 class="text-secondary h-3.5 w-3.5" />
					Trash
				</span>
				<Badge
					variant="outline"
					class="bg-secondary/10 text-secondary border-secondary/30 text-xs font-normal"
				>
					{totalItems} item{totalItems !== 1 ? 's' : ''}
				</Badge>
			</DropdownMenu.Label>

			<DropdownMenu.Separator />

			{#if recentTasks.length > 0}
				<DropdownMenu.Group>
					<DropdownMenu.Label class="text-muted-foreground text-xs font-normal">
						Recent Tasks
					</DropdownMenu.Label>

					<AnimatePresence>
						{#each recentTasks as task, index (task.id)}
							<motion
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ delay: index * 0.05 }}
							>
								<DropdownMenu.Item
									disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
									class="focus:bg-secondary/5 py-2"
								>
									<div class="flex w-full flex-col gap-1">
										<div class="flex w-full items-start justify-between">
											<span class="max-w-[180px] truncate text-sm font-medium">{task.title}</span>
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
                                                    h-4 py-0 text-[9px]
                                                "
											>
												{task.status
													.split('-')
													.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
													.join(' ')}
											</Badge>
										</div>
										<div class="flex items-center justify-between">
											<span class="text-muted-foreground text-xs">Project: {task.projectName}</span>
											<Button
												variant="ghost"
												size="sm"
												class="hover:bg-secondary/10 hover:text-secondary h-6 p-0 px-2 text-xs"
												disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
												onclick={(e: MouseEvent) => {
													e.preventDefault();
													e.stopPropagation();
													handleRestore('task', task.id);
												}}
											>
												<RefreshCcw class="mr-1 h-2.5 w-2.5" />
												Restore
											</Button>
										</div>
									</div>
								</DropdownMenu.Item>
								{#if index < recentTasks.length - 1}
									<div class="bg-border/40 mx-2 my-0.5 h-[1px]"></div>
								{/if}
							</motion>
						{/each}
					</AnimatePresence>
				</DropdownMenu.Group>
			{/if}

			{#if recentProjects.length > 0}
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Label class="text-muted-foreground text-xs font-normal">
						Recent Projects
					</DropdownMenu.Label>

					<AnimatePresence>
						{#each recentProjects as project, index (project.id)}
							<motion
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ delay: index * 0.05 }}
							>
								<DropdownMenu.Item
									disabled={busy || restoredIds.includes(project.id)}
									class="focus:bg-secondary/5 py-2"
								>
									<div class="flex w-full flex-col gap-1">
										<div class="flex w-full items-start justify-between">
											<span class="text-sm font-medium">{project.name}</span>
											<Badge
												variant="outline"
												class="bg-secondary/10 text-secondary border-secondary/30 h-4 py-0 text-[9px]"
											>
												{project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
											</Badge>
										</div>
										<div class="flex items-center justify-between">
											<span class="text-muted-foreground text-xs">
												Deleted {formatDistanceToNow(new Date(project.updatedAt), {
													addSuffix: true
												})}
											</span>
											<Button
												variant="ghost"
												size="sm"
												class="hover:bg-secondary/10 hover:text-secondary h-6 p-0 px-2 text-xs"
												disabled={busy || restoredIds.includes(project.id)}
												onclick={(e: MouseEvent) => {
													e.preventDefault();
													e.stopPropagation();
													handleRestore('project', project.id);
												}}
											>
												<RefreshCcw class="mr-1 h-2.5 w-2.5" />
												Restore
											</Button>
										</div>
									</div>
								</DropdownMenu.Item>
								{#if index < recentProjects.length - 1}
									<div class="bg-border/40 mx-2 my-0.5 h-[1px]"></div>
								{/if}
							</motion>
						{/each}
					</AnimatePresence>
				</DropdownMenu.Group>
			{/if}

			<DropdownMenu.Separator />
			<DropdownMenu.Item
				class="hover:bg-secondary/10 hover:text-secondary justify-center text-xs"
				onselect={() => (isDialogOpen = true)}
			>
				<ExternalLink class="mr-1.5 h-3 w-3" />
				View all trash items ({totalItems})
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Content class="max-h-[80vh] max-w-3xl overflow-y-auto">
			<Dialog.Header>
				<Button
					variant="ghost"
					size="sm"
					class="hover:bg-secondary/10 hover:text-secondary absolute top-4 left-4 h-7 w-7 p-0"
					onclick={() => (isDialogOpen = false)}
				>
					<ChevronLeft class="h-4 w-4" />
				</Button>
				<Dialog.Title class="flex items-center justify-center gap-2 pt-2 text-center text-base">
					<Trash2 class="text-secondary h-4 w-4" />
					Trash ({totalItems})
				</Dialog.Title>
				<Dialog.Description class="text-center text-xs">
					Deleted items will be permanently removed after 30 days
				</Dialog.Description>
			</Dialog.Header>

			<Tabs.Root bind:value={activeTab} class="mt-4">
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger
						value="tasks"
						class="data-[state=active]:bg-secondary text-xs data-[state=active]:text-white"
					>
						Tasks ({deletedTasks.length})
					</Tabs.Trigger>
					<Tabs.Trigger
						value="projects"
						class="data-[state=active]:bg-secondary text-xs data-[state=active]:text-white"
					>
						Projects ({deletedProjects.length})
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="tasks" class="mt-4">
					{#if deletedTasks.length === 0}
						<div
							class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12"
						>
							<Trash2 class="text-muted-foreground mb-3 h-8 w-8 opacity-50" />
							<p class="text-muted-foreground text-sm">No deleted tasks</p>
						</div>
					{:else}
						<div class="space-y-3">
							<AnimatePresence>
								{#each deletedTasks as task, index (task.id)}
									<motion
										initial={{ opacity: 0, y: 20 }}
										animate={{
											opacity: restoredIds.includes(task.id) ? 0.5 : 1,
											y: 0,
											height: restoredIds.includes(task.id) ? 0 : 'auto'
										}}
										exit={{ opacity: 0, height: 0 }}
										transition={{
											duration: 0.3,
											delay: index * 0.05,
											height: { delay: restoredIds.includes(task.id) ? 0.3 : 0 }
										}}
									>
										<div
											class="rounded-lg border p-3 transition-all duration-300 {restoredIds.includes(
												task.id
											)
												? 'border-secondary/20'
												: 'hover:border-secondary/50'}"
										>
											<div class="mb-2 flex items-start justify-between">
												<h3 class="text-sm font-medium">{task.title}</h3>
												<div class="flex gap-2">
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
                                                            text-[9px]
                                                        "
													>
														{task.status
															.split('-')
															.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
															.join(' ')}
													</Badge>
													<Badge
														variant="outline"
														class="
                                                            {task.priority === 'low'
															? 'border-green-200 bg-green-100 text-green-800'
															: ''}
                                                            {task.priority === 'medium'
															? 'border-amber-200 bg-amber-100 text-amber-800'
															: ''}
                                                            {task.priority === 'high'
															? 'border-red-200 bg-red-100 text-red-800'
															: ''}
                                                            text-[9px]
                                                        "
													>
														{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
													</Badge>
												</div>
											</div>

											{#if task.description}
												<p class="text-muted-foreground mb-3 text-xs">{task.description}</p>
											{/if}

											<div class="flex items-center justify-between">
												<div class="flex items-center">
													<span class="text-muted-foreground text-xs">Project: </span>
													{#if task.projectDeleted}
														<span class="text-destructive ml-1 flex items-center text-xs">
															{task.projectName}
															<Badge
																variant="outline"
																class="bg-destructive/10 text-destructive border-destructive/30 ml-2 h-3.5 py-0 text-[8px]"
															>
																deleted
															</Badge>
														</span>
													{:else}
														<span class="ml-1 text-xs">{task.projectName}</span>
													{/if}
												</div>
												<Button
													variant="outline"
													size="sm"
													class="
                                                        h-7 text-xs
                                                        transition-all duration-300
                                                        {!task.projectDeleted &&
													!restoredIds.includes(task.id)
														? 'hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30'
														: ''}
                                                    "
													disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
													onclick={() => handleRestore('task', task.id)}
												>
													<motion
														animate={{ rotate: restoredIds.includes(task.id) ? 360 : 0 }}
														transition={{ duration: 0.5 }}
														class="mr-1.5"
													>
														<RefreshCcw class="h-3 w-3" />
													</motion>
													{restoredIds.includes(task.id) ? 'Restoring...' : 'Restore'}
												</Button>
											</div>
										</div>
									</motion>
								{/each}
							</AnimatePresence>
						</div>
					{/if}
				</Tabs.Content>

				<Tabs.Content value="projects" class="mt-4">
					{#if deletedProjects.length === 0}
						<div
							class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12"
						>
							<Trash2 class="text-muted-foreground mb-3 h-8 w-8 opacity-50" />
							<p class="text-muted-foreground text-sm">No deleted projects</p>
						</div>
					{:else}
						<div class="space-y-3">
							<AnimatePresence>
								{#each deletedProjects as project, index (project.id)}
									<motion
										initial={{ opacity: 0, y: 20 }}
										animate={{
											opacity: restoredIds.includes(project.id) ? 0.5 : 1,
											y: 0,
											height: restoredIds.includes(project.id) ? 0 : 'auto'
										}}
										exit={{ opacity: 0, height: 0 }}
										transition={{
											duration: 0.3,
											delay: index * 0.05,
											height: { delay: restoredIds.includes(project.id) ? 0.3 : 0 }
										}}
									>
										<div
											class="rounded-lg border p-3 transition-all duration-300 {restoredIds.includes(
												project.id
											)
												? 'border-secondary/20'
												: 'hover:border-secondary/50'}"
										>
											<div class="mb-2 flex items-start justify-between">
												<h3 class="text-sm font-medium">{project.name}</h3>
												<Badge
													variant="outline"
													class="bg-secondary/10 text-secondary border-secondary/30 text-[9px]"
												>
													{project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
												</Badge>
											</div>

											{#if project.description}
												<p class="text-muted-foreground mb-3 text-xs">{project.description}</p>
											{/if}

											<div class="flex items-center justify-between">
												<span class="text-muted-foreground text-xs">
													Deleted {formatDistanceToNow(new Date(project.updatedAt), {
														addSuffix: true
													})}
												</span>
												<Button
													variant="outline"
													size="sm"
													class="
                                                        h-7 text-xs
                                                        transition-all duration-300
                                                        {!restoredIds.includes(project.id)
														? 'hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30'
														: ''}
                                                    "
													disabled={busy || restoredIds.includes(project.id)}
													onclick={() => handleRestore('project', project.id)}
												>
													<motion
														animate={{ rotate: restoredIds.includes(project.id) ? 360 : 0 }}
														transition={{ duration: 0.5 }}
														class="mr-1.5"
													>
														<RefreshCcw class="h-3 w-3" />
													</motion>
													{restoredIds.includes(project.id) ? 'Restoring...' : 'Restore'}
												</Button>
											</div>
										</div>
									</motion>
								{/each}
							</AnimatePresence>
						</div>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</Dialog.Content>
	</Dialog.Root>
{/if}
