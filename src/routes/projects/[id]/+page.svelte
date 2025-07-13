<script lang="ts">
	import type { PageProps } from './$types';
	import ProjectHeader from '$lib/components/steadylist/project-header.svelte';
	import KanbanBoard from '$lib/components/steadylist/kanban-board.svelte';

	let { data }: PageProps = $props();
	const { project, tasks } = data;
</script>

<div class="space-y-8">
	<ProjectHeader {project} />

	<KanbanBoard {tasks} projectId={project.id} />
</div>
