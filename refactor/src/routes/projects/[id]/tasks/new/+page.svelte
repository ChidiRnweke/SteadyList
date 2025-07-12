<script lang="ts">
	import TaskForm from '$lib/components/steadylist/task-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { project, status } = data;
</script>

<div class="space-y-8">
	<div>
		<p class="text-muted-foreground mb-6">
			Add a new task to {project.name}
			{#if status}
				<span class="ml-1">
					with status: <span class="font-medium capitalize">{status.replace('-', ' ')}</span>
				</span>
			{/if}
		</p>
		<TaskForm projectId={project.id} initialStatus={status || undefined} />
	</div>
</div>
