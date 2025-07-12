<script lang="ts">
	import type { PageProps } from './$types';
	import ProjectForm from '$lib/components/steadylist/project-form.svelte';

	let { data }: PageProps = $props();
	const { project } = data;
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-primary mb-6 text-3xl font-bold">Edit Project</h1>
		<ProjectForm project={project!} />
	</div>
</div>
