<script lang="ts">
	import ProjectList from '$lib/components/steadylist/project-list.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { projects, tasks } = data;
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<h1 class="text-primary text-3xl font-bold">Projects</h1>
		<Button class="bg-primary hover:bg-primary/90" href="/projects/new">
			<Plus class="mr-2 h-4 w-4" />
			New Project
		</Button>
	</div>

	<ProjectList {projects} {tasks} />
</div>
