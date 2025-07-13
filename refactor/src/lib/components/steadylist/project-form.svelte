<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { projectSchema, type ProjectSchema } from '$lib/schemas/project-schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import type { Project } from '$lib/types';

	interface Props {
		data: { form: SuperValidated<Infer<ProjectSchema>>; project?: Project };
		isEdit?: boolean;
	}

	let { data, isEdit = false }: Props = $props();

	const form = superForm(data.form, {
		validators: zodClient(projectSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success(isEdit ? 'Project updated!' : 'Project created!');
				goto('/projects');
			} else {
				toast.error('Please fix the errors in the form');
			}
		}
	});

	const { form: formData, enhance } = form;

	const handleCancel = () => {
		goto('/projects');
	};
</script>

<Card class="mx-auto max-w-2xl border-slate-200 p-6 shadow-sm">
	<form method="post" use:enhance class="space-y-6" action="/projects">
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Project Name</Form.Label>
					<Input {...props} placeholder="Enter project name" bind:value={$formData.name} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Description</Form.Label>
					<Textarea
						{...props}
						placeholder="Enter project description (optional)"
						class="min-h-[100px] resize-none"
						bind:value={$formData.description}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>Briefly describe the purpose of this project</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<div class="flex justify-end gap-4">
			<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
			<Form.Button class="bg-primary hover:bg-primary/90">
				{isEdit ? 'Update Project' : 'Create Project'}
			</Form.Button>
		</div>
	</form>
</Card>
