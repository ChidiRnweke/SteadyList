<script lang="ts">
	import TaskForm from '$lib/components/steadylist/task-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { task } = data;
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-primary mb-2 text-3xl font-bold">Edit Task</h1>
		<p class="text-muted-foreground mb-6">Update task details</p>
		<TaskForm projectId={task.projectId} />
	</div>
</div>
