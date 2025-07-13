<script lang="ts">
	import { Calendar, Bell } from '@lucide/svelte';
	import { format } from 'date-fns';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { CalendarDate, type DateValue } from '@internationalized/date';

	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Calendar as CalendarComponent } from '$lib/components/ui/calendar';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Switch } from '$lib/components/ui/switch';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';

	interface Props {
		projectId: string;
		initialStatus?: 'todo' | 'in-progress' | 'blocked' | 'done';
	}

	let { projectId, initialStatus }: Props = $props();

	const formSchema = z.object({
		title: z.string().min(1, 'Task title is required').max(100),
		description: z.string().max(500).optional(),
		dueDate: z.date().optional(),
		priority: z.enum(['low', 'medium', 'high']),
		status: z.enum(['todo', 'in-progress', 'blocked', 'done']),
		reminder: z.boolean()
	});

	type FormData = z.infer<typeof formSchema>;

	let busy = $state(false);
	let errors = $state<Record<string, string>>({});
	let calendarOpen = $state(false);
	let formData = $state<FormData>({
		title: '',
		description: '',
		dueDate: undefined,
		priority: 'medium',
		status: initialStatus || 'todo',
		reminder: false
	});

	let calendarValue = $state<DateValue | undefined>(undefined);

	// Sync calendar value with form data
	$effect(() => {
		if (calendarValue) {
			formData.dueDate = new Date(calendarValue.year, calendarValue.month - 1, calendarValue.day);
		} else {
			formData.dueDate = undefined;
		}
	});

	// Initialize calendar value if form data has a date
	$effect(() => {
		if (formData.dueDate && !calendarValue) {
			const date = formData.dueDate;
			calendarValue = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
		}
	});

	const handleCancel = () => {
		goto(`/projects/${projectId}`);
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

	const getButtonText = () => {
		if (busy) return 'Saving...';
		if (initialStatus) {
			return `Add to ${getStatusLabel(initialStatus)}`;
		}
		return 'Create Task';
	};
</script>

<Card class="mx-auto max-w-2xl border-slate-200 p-6 shadow-sm">
	<form class="space-y-6" action="/projects/{projectId}/tasks" method="post">
		<!-- Task Title -->
		<div class="space-y-2">
			<Label for="title">Task Title</Label>
			<Input
				id="title"
				placeholder="Enter task title"
				name="title"
				class={errors.title ? 'border-destructive' : ''}
			/>
			{#if errors.title}
				<p class="text-destructive text-sm">{errors.title}</p>
			{/if}
		</div>

		<!-- Description -->
		<div class="space-y-2">
			<Label for="description">Description</Label>
			<Textarea
				id="description"
				placeholder="Enter task description (optional)"
				class="min-h-[100px] resize-none"
				name="description"
			/>
			<p class="text-muted-foreground text-sm">Provide details about what needs to be done</p>
			{#if errors.description}
				<p class="text-destructive text-sm">{errors.description}</p>
				<PopoverContent class="w-auto p-0" align="start">
					<CalendarComponent bind:value={calendarValue} class="rounded-md border" />
				</PopoverContent>
				<Label>Due Date</Label>
				<Popover bind:open={calendarOpen}>
					<PopoverTrigger
						class={cn(
							'border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 w-full items-center justify-start rounded-md border px-3 py-2 text-sm font-normal transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
							!formData.dueDate && 'text-muted-foreground'
						)}
					>
						{formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
						<Calendar class="ml-auto h-4 w-4 opacity-50" />
					</PopoverTrigger>
					<PopoverContent class="w-auto p-0" align="start">
						<CalendarComponent name="dueDate" class="rounded-md border" />
					</PopoverContent>
				</Popover>
				<p class="text-muted-foreground text-sm">When should this task be completed?</p>
				{#if errors.dueDate}
					<p class="text-destructive text-sm">{errors.dueDate}</p>
				{/if}
			{/if}
		</div>

		<!-- Priority -->
		<div class="space-y-2">
			<Label>Priority</Label>
			<Select type="single" name="priority" required value="medium">
				<SelectTrigger></SelectTrigger>
				<SelectContent>
					<SelectItem value="low">Low</SelectItem>
					<SelectItem value="medium">Medium</SelectItem>
					<SelectItem value="high">High</SelectItem>
				</SelectContent>
			</Select>
			<p class="text-muted-foreground text-sm">How important is this task?</p>
			{#if errors.priority}
				<p class="text-destructive text-sm">{errors.priority}</p>
			{/if}
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Status -->
			<div class="space-y-2">
				<Label>Status</Label>
				<Select type="single" name="status" required value={initialStatus || 'todo'}>
					<SelectTrigger></SelectTrigger>
					<SelectContent>
						<SelectItem
							value="todo"
							class={initialStatus === 'todo' ? 'bg-secondary/10 font-medium' : ''}
						>
							To Do {initialStatus === 'todo' ? '(Selected from board)' : ''}
						</SelectItem>
						<SelectItem
							value="in-progress"
							class={initialStatus === 'in-progress' ? 'bg-amber-500/10 font-medium' : ''}
						>
							In Progress {initialStatus === 'in-progress' ? '(Selected from board)' : ''}
						</SelectItem>
						<SelectItem
							value="blocked"
							class={initialStatus === 'blocked' ? 'bg-destructive/10 font-medium' : ''}
						>
							Blocked {initialStatus === 'blocked' ? '(Selected from board)' : ''}
						</SelectItem>
						<SelectItem
							value="done"
							class={initialStatus === 'done' ? 'bg-green-500/10 font-medium' : ''}
						>
							Done {initialStatus === 'done' ? '(Selected from board)' : ''}
						</SelectItem>
					</SelectContent>
				</Select>
				<p class="text-muted-foreground text-sm">Current progress of the task</p>
				{#if errors.status}
					<p class="text-destructive text-sm">{errors.status}</p>
				{/if}
			</div>

			<!-- Reminder -->
			<div class="flex flex-col space-y-2">
				<Label>Set Reminder</Label>
				<div class="flex items-center gap-2 pt-2">
					<Switch name="reminder" />
					<div class="text-muted-foreground flex items-center gap-1 text-sm">
						<Bell class="h-4 w-4" />
						Remind me about this task
					</div>
				</div>
				<p class="text-muted-foreground text-sm">
					You'll receive a notification before the due date
				</p>
				{#if errors.reminder}
					<p class="text-destructive text-sm">{errors.reminder}</p>
				{/if}
			</div>
		</div>

		<div class="flex justify-end gap-4">
			<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button type="submit" disabled={busy} class="bg-primary hover:bg-primary/90">
				{getButtonText()}
			</Button>
		</div>
	</form>
</Card>
