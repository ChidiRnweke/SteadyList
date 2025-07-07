<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import type { Project } from '$lib/types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		project?: Project;
	}

	let { project }: Props = $props();

	let formData = $state({
		name: project?.name || '',
		description: project?.description || ''
	});

	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Project name is required';
		} else if (formData.name.length > 100) {
			newErrors.name = 'Project name must be 100 characters or less';
		}

		if (formData.description && formData.description.length > 500) {
			newErrors.description = 'Description must be 500 characters or less';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	};

	const handleCancel = () => {
		history.back();
	};

	const handleSubmit = () => {
		if (!validateForm()) return;
		isSubmitting = true;
	};
</script>

<Card class="mx-auto max-w-2xl border-slate-200 p-6 shadow-sm">
	<form
		method="post"
		action="/projects"
		use:enhance={({ formData: fd }) => {
			fd.append('name', formData.name);
			fd.append('description', formData.description);
			if (project) {
				fd.append('id', project.id);
			}

			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'success') {
					toast.success(project ? 'Project updated!' : 'Project created!');
					goto('/projects');
				} else if (result.type === 'failure') {
					toast.error('Something went wrong');
				}
			};
		}}
		onsubmit={handleSubmit}
		class="space-y-6"
	>
		<div class="space-y-2">
			<Label for="name">Project Name</Label>
			<Input
				id="name"
				name="name"
				placeholder="Enter project name"
				bind:value={formData.name}
				class={errors.name ? 'border-red-500' : ''}
			/>
			{#if errors.name}
				<p class="text-sm text-red-500">{errors.name}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="description">Description</Label>
			<Textarea
				id="description"
				name="description"
				placeholder="Enter project description (optional)"
				class="min-h-[100px] resize-none {errors.description ? 'border-red-500' : ''}"
				bind:value={formData.description}
			/>
			<p class="text-muted-foreground text-sm">Briefly describe the purpose of this project</p>
			{#if errors.description}
				<p class="text-sm text-red-500">{errors.description}</p>
			{/if}
		</div>

		<div class="flex justify-end gap-4">
			<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button type="submit" disabled={isSubmitting} class="bg-primary hover:bg-primary/90">
				{isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
			</Button>
		</div>
	</form>
</Card>
