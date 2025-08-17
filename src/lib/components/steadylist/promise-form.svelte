<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Form from '$lib/components/ui/form';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { promiseMadeSchema, type PromiseMadeSchema } from '$lib/schemas/promise-schema';

	interface Props {
		form: SuperValidated<Infer<PromiseMadeSchema>>;
		action: string;
		onSuccess?: () => void;
	}

	let { form: formData, action, onSuccess }: Props = $props();

	const form = superForm(formData, {
		validators: zodClient(promiseMadeSchema),
		onUpdated: ({ form }) => {
			if (form.valid) {
				toast.success('Promise saved successfully');
				onSuccess?.();
			}
		},
		onError: () => {
			toast.error('Failed to save promise');
		}
	});

	const { form: data, enhance: formEnhance, submitting } = form;
</script>

<form method="POST" {action} use:formEnhance class="space-y-6">
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Label for="title">Promise Title *</Label>
				<Input
					{...props}
					id="title"
					type="text"
					placeholder="What did you promise to do?"
					bind:value={$data.title}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<Form.Field {form} name="promiseTo">
			<Form.Control>
				{#snippet children({ props })}
					<Label for="promiseTo">Promised To (optional)</Label>
					<Input
						{...props}
						id="promiseTo"
						type="text"
						placeholder="Who did you promise this to?"
						bind:value={$data.promiseTo}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="dueDate">
			<Form.Control>
				{#snippet children({ props })}
					<Label for="dueDate">Due Date (optional)</Label>
					<Input {...props} id="dueDate" type="datetime-local" bind:value={$data.dueDate} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<div class="flex gap-2">
		<Button type="submit" disabled={$submitting} class="bg-primary hover:bg-primary/90">
			{$submitting ? 'Saving...' : 'Save Promise'}
		</Button>
	</div>
</form>
