<script lang="ts">
	import TaskForm from '$lib/components/steadylist/task-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="space-y-8">
	<div>
		<p class="text-muted-foreground mb-6">
			Add a new task to {data.project.name}
			{#if data.status}
				<span class="ml-1">
					with status: <span class="font-medium capitalize">{data.status.replace('-', ' ')}</span>
				</span>
			{/if}
		</p>

		<TaskForm data={{ ...data, status: data.status ?? '' }} />
	</div>
</div>
