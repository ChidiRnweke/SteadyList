<script lang="ts">
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		Form,
		FormField,
		FormItem,
		FormLabel,
		FormMessage,
		FormDescription
	} from '$lib/components/ui/form';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { createTask } from '$lib/tasks';
	import { Sparkles } from '@lucide/svelte';

	interface AITaskGeneratorProps {
		projectId: string;
		projectName: string;
	}

	let { projectId, projectName }: AITaskGeneratorProps = $props();

	const formSchema = z.object({
		prompt: z.string().min(10, 'Please provide a more detailed description'),
		includeDueDates: z.boolean().default(true),
		includePriorities: z.boolean().default(true)
	});

	let isGenerating = $state(false);
	let isCreating = $state(false);
	let generatedTasks = $state<any[]>([]);
	let selectedTasks = $state<string[]>([]);

	const { form, enhance, errors } = superForm(
		{
			prompt: '',
			includeDueDates: true,
			includePriorities: true
		},
		{
			validators: zodClient(formSchema),
			onSubmit: async ({ formData }) => {
				const values = Object.fromEntries(formData);
				await handleSubmit(values);
			}
		}
	);

	// Mock AI-generated tasks based on prompt
	const mockGenerateTasks = (
		prompt: string,
		includeDueDates: boolean,
		includePriorities: boolean
	) => {
		const basePrompt = prompt.toLowerCase();
		const taskCount = Math.floor(Math.random() * 3) + 3;
		const tasks: any[] = [];

		const taskPrefixes = [
			'Research',
			'Create',
			'Design',
			'Develop',
			'Implement',
			'Test',
			'Review',
			'Analyze',
			'Plan',
			'Prepare',
			'Update',
			'Optimize',
			'Document'
		];

		const webDevSubjects = [
			'landing page',
			'user authentication',
			'database schema',
			'API endpoints',
			'responsive design',
			'navigation menu',
			'user dashboard',
			'payment integration'
		];
		const marketingSubjects = [
			'social media campaign',
			'email newsletter',
			'content calendar',
			'analytics report',
			'customer survey',
			'brand guidelines',
			'promotional materials'
		];
		const productSubjects = [
			'user stories',
			'feature specifications',
			'prototype',
			'user testing',
			'feedback collection',
			'roadmap',
			'release plan'
		];

		let subjectList = webDevSubjects;
		if (
			basePrompt.includes('market') ||
			basePrompt.includes('campaign') ||
			basePrompt.includes('promotion')
		) {
			subjectList = marketingSubjects;
		} else if (
			basePrompt.includes('product') ||
			basePrompt.includes('feature') ||
			basePrompt.includes('roadmap')
		) {
			subjectList = productSubjects;
		}

		for (let i = 0; i < taskCount; i++) {
			const prefix = taskPrefixes[Math.floor(Math.random() * taskPrefixes.length)];
			const subject = subjectList[Math.floor(Math.random() * subjectList.length)];

			const task: any = {
				title: `${prefix} ${subject}`,
				description: `${prefix} the ${subject} based on project requirements and best practices.`,
				status: 'todo'
			};

			if (includePriorities) {
				const priorities = ['low', 'medium', 'high'];
				task['priority'] = priorities[Math.floor(Math.random() * priorities.length)];
			} else {
				task['priority'] = 'medium';
			}

			if (includeDueDates) {
				const daysToAdd = Math.floor(Math.random() * 14) + 1;
				const dueDate = new Date();
				dueDate.setDate(dueDate.getDate() + daysToAdd);
				task['dueDate'] = dueDate;
			}

			tasks.push(task);
		}

		return tasks;
	};

	const handleSubmit = async (values: any) => {
		isGenerating = true;
		generatedTasks = [];
		selectedTasks = [];

		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			const tasks = mockGenerateTasks(
				values.prompt,
				values.includeDueDates,
				values.includePriorities
			);
			generatedTasks = tasks;
		} catch (error) {
			console.error('Failed to generate tasks:', error);
		} finally {
			isGenerating = false;
		}
	};

	const handleTaskSelection = (taskIndex: number) => {
		const taskId = taskIndex.toString();
		if (selectedTasks.includes(taskId)) {
			selectedTasks = selectedTasks.filter((id) => id !== taskId);
		} else {
			selectedTasks = [...selectedTasks, taskId];
		}
	};

	const handleCreateTasks = async () => {
		isCreating = true;

		try {
			for (const taskId of selectedTasks) {
				const taskIndex = Number.parseInt(taskId);
				const task = generatedTasks[taskIndex];

				await createTask({
					title: task.title,
					description: task.description,
					priority: task.priority,
					status: 'todo',
					dueDate: task.dueDate,
					projectId: projectId
				});
			}

			goto(`/projects/${projectId}`);
		} catch (error) {
			console.error('Failed to create tasks:', error);
		} finally {
			isCreating = false;
		}
	};
</script>

<div class="space-y-6">
	<Card class="border-slate-200 shadow-sm">
		<CardHeader>
			<CardTitle class="text-primary text-xl">Generate Tasks with AI</CardTitle>
			<CardDescription
				>Describe what you're working on, and our AI will suggest relevant tasks</CardDescription
			>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<FormField {form} name="prompt">
					<FormItem>
						<FormLabel>What are you working on?</FormLabel>
						<Textarea
							bind:value={$form.prompt}
							placeholder="e.g., I'm building a marketing website for a new product launch"
							class="min-h-[100px] resize-none"
						/>
						<FormDescription>
							Provide details about your project to get more relevant task suggestions
						</FormDescription>
						<FormMessage />
					</FormItem>
				</FormField>

				<div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
					<FormField {form} name="includeDueDates">
						<FormItem class="flex items-center space-x-2">
							<Checkbox bind:checked={$form.includeDueDates} />
							<FormLabel class="text-sm font-normal">Include due dates</FormLabel>
						</FormItem>
					</FormField>

					<FormField {form} name="includePriorities">
						<FormItem class="flex items-center space-x-2">
							<Checkbox bind:checked={$form.includePriorities} />
							<FormLabel class="text-sm font-normal">Include priorities</FormLabel>
						</FormItem>
					</FormField>
				</div>

				<Button type="submit" disabled={isGenerating} class="bg-secondary hover:bg-secondary/90">
					{#if isGenerating}
						<div
							class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						Generating...
					{:else}
						<Sparkles class="mr-2 h-4 w-4" />
						Generate Tasks
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>

	{#if generatedTasks.length > 0}
		<Card class="border-slate-200 shadow-sm">
			<CardHeader>
				<CardTitle class="text-primary text-xl">Generated Tasks</CardTitle>
				<CardDescription>Select the tasks you want to add to your project</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					{#each generatedTasks as task, index}
						<div
							class="rounded-lg border p-4 {selectedTasks.includes(index.toString())
								? 'border-primary bg-primary/5'
								: 'border-slate-200'}"
						>
							<div class="flex items-start gap-3">
								<Checkbox
									id="task-{index}"
									checked={selectedTasks.includes(index.toString())}
									onCheckedChange={() => handleTaskSelection(index)}
								/>
								<div class="space-y-1">
									<label for="task-{index}" class="cursor-pointer font-medium">
										{task.title}
									</label>
									<p class="text-muted-foreground text-sm">{task.description}</p>
									<div class="mt-2 flex flex-wrap gap-2">
										{#if task.priority}
											<div class="rounded-full bg-slate-100 px-2 py-1 text-xs">
												{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
											</div>
										{/if}
										{#if task.dueDate}
											<div class="rounded-full bg-slate-100 px-2 py-1 text-xs">
												Due: {task.dueDate.toLocaleDateString()}
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
			<CardFooter>
				<Button
					onclick={handleCreateTasks}
					disabled={selectedTasks.length === 0 || isCreating}
					class="bg-primary hover:bg-primary/90"
				>
					{#if isCreating}
						<div
							class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						Creating Tasks...
					{:else}
						Add {selectedTasks.length}
						{selectedTasks.length === 1 ? 'Task' : 'Tasks'} to Project
					{/if}
				</Button>
			</CardFooter>
		</Card>
	{/if}
</div>
