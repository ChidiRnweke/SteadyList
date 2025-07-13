<script lang="ts">
	import { Calendar, Bell } from '@lucide/svelte';
	import { format } from 'date-fns';
	import { CalendarDate, type DateValue } from '@internationalized/date';

	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Calendar as CalendarComponent } from '$lib/components/ui/calendar';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Switch } from '$lib/components/ui/switch';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	import { taskSchema, type TaskSchema } from '$lib/schemas/task-schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		data: {
			form: SuperValidated<Infer<TaskSchema>>;
			project: { id: string; name: string };
			status: string;
		};
	}

	let { data }: Props = $props();

	const form = superForm(data.form, {
		validators: zodClient(taskSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success('Task created successfully!');
			} else {
				toast.error('Please fix the errors in the form');
			}
		}
	});

	const { form: formData, enhance } = form;

	let calendarOpen = $state(false);
	let calendarValue = $state<DateValue | undefined>(undefined);

	// Sync calendar value with form data
	$effect(() => {
		if (calendarValue) {
			$formData.dueDate = new Date(calendarValue.year, calendarValue.month - 1, calendarValue.day);
		} else {
			$formData.dueDate = undefined;
		}
	});

	// Initialize calendar value if form data has a date
	$effect(() => {
		if ($formData.dueDate && !calendarValue) {
			const date = $formData.dueDate;
			calendarValue = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
		}
	});

	const handleCancel = () => {
		goto(`/projects/${data.project.id}`);
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'in-progress':
				return 'In Progress';
			case 'todo':
				return 'To Do';
			default:
				return status.charAt(0).toUpperCase() + status.slice(1);
		}
	};
</script>

<Card class="mx-auto max-w-2xl border-slate-200 p-6 shadow-sm">
	<form method="post" use:enhance class="space-y-6">
		<!-- Task Title -->
		<Form.Field {form} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Task Title</Form.Label>
					<Input {...props} placeholder="Enter task title" bind:value={$formData.title} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Description -->
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Description</Form.Label>
					<Textarea
						{...props}
						placeholder="Enter task description (optional)"
						class="min-h-[100px] resize-none"
						bind:value={$formData.description}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>Provide details about what needs to be done</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Due Date -->
		<Form.Field {form} name="dueDate">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Due Date</Form.Label>
					<Popover bind:open={calendarOpen}>
						<PopoverTrigger
							{...props}
							class={cn(
								'border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 w-full items-center justify-start rounded-md border px-3 py-2 text-sm font-normal transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
								!$formData.dueDate && 'text-muted-foreground'
							)}
						>
							{$formData.dueDate ? format($formData.dueDate, 'PPP') : 'Pick a date'}
							<Calendar class="ml-auto h-4 w-4 opacity-50" />
						</PopoverTrigger>
						<PopoverContent class="w-auto p-0" align="start">
							<CalendarComponent bind:value={calendarValue} class="rounded-md border" />
						</PopoverContent>
					</Popover>
				{/snippet}
			</Form.Control>
			<Form.Description>When should this task be completed?</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Priority -->
		<Form.Field {form} name="priority">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Priority</Form.Label>
					<Select type="single" bind:value={$formData.priority}>
						<SelectTrigger {...props} class="w-full">
							{$formData.priority
								? $formData.priority.charAt(0).toUpperCase() + $formData.priority.slice(1)
								: 'Select priority'}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
						</SelectContent>
					</Select>
				{/snippet}
			</Form.Control>
			<Form.Description>How important is this task?</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Status -->
			<Form.Field {form} name="status">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Status</Form.Label>
						<Select type="single" bind:value={$formData.status}>
							<SelectTrigger {...props} class="w-full">
								{$formData.status ? getStatusLabel($formData.status) : 'Select status'}
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									value="todo"
									class={data.status === 'todo' ? 'bg-secondary/10 font-medium' : ''}
								>
									To Do {data.status === 'todo' ? '(Selected from board)' : ''}
								</SelectItem>
								<SelectItem
									value="in-progress"
									class={data.status === 'in-progress' ? 'bg-amber-500/10 font-medium' : ''}
								>
									In Progress {data.status === 'in-progress' ? '(Selected from board)' : ''}
								</SelectItem>
								<SelectItem
									value="blocked"
									class={data.status === 'blocked' ? 'bg-destructive/10 font-medium' : ''}
								>
									Blocked {data.status === 'blocked' ? '(Selected from board)' : ''}
								</SelectItem>
								<SelectItem
									value="done"
									class={data.status === 'done' ? 'bg-green-500/10 font-medium' : ''}
								>
									Done {data.status === 'done' ? '(Selected from board)' : ''}
								</SelectItem>
							</SelectContent>
						</Select>
					{/snippet}
				</Form.Control>
				<Form.Description>Current progress of the task</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Reminder -->
			<Form.Field {form} name="reminder">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Set Reminder</Form.Label>
						<div class="flex items-center gap-2 pt-2">
							<Switch {...props} bind:checked={$formData.reminder} />
							<div class="text-muted-foreground flex items-center gap-1 text-sm">
								<Bell class="h-4 w-4" />
								Remind me about this task
							</div>
						</div>
					{/snippet}
				</Form.Control>
				<Form.Description>You'll receive a notification before the due date</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<div class="flex justify-end gap-4">
			<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
			<Form.Button class="bg-primary hover:bg-primary/90">
				{data.status ? `Add to ${getStatusLabel(data.status)}` : 'Create Task'}
			</Form.Button>
		</div>
	</form>
</Card>
