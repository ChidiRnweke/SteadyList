<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		CheckSquare,
		BarChart3,
		Sparkles,
		ArrowRight,
		Trash2,
		Calendar,
		Target
	} from '@lucide/svelte';

	function FolderKanban(props: any) {
		return `<svg
            ${Object.entries(props || {})
							.map(([key, value]) => `${key}="${value}"`)
							.join(' ')}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            <path d="M8 10v4" />
            <path d="M12 10v2" />
            <path d="M16 10v6" />
        </svg>`;
	}

	const features = $state([
		{
			icon: FolderKanban,
			title: 'Project Management',
			description:
				'Organize your work into projects with intuitive Kanban boards and task tracking.',
			href: '/projects',
			color: 'bg-blue-500/10 text-blue-600 border-blue-200'
		},
		{
			icon: CheckSquare,
			title: 'Task Management',
			description:
				'Create, assign, and track tasks with priorities, due dates, and status updates.',
			href: '/projects',
			color: 'bg-green-500/10 text-green-600 border-green-200'
		},
		{
			icon: Sparkles,
			title: 'AI Task Generation',
			description: 'Let AI suggest relevant tasks based on your project description and goals.',
			href: '/projects',
			color: 'bg-purple-500/10 text-purple-600 border-purple-200'
		},
		{
			icon: BarChart3,
			title: 'Progress Tracking',
			description: 'Monitor project progress with real-time metrics and completion statistics.',
			href: '/projects',
			color: 'bg-orange-500/10 text-orange-600 border-orange-200'
		},
		{
			icon: Calendar,
			title: 'Due Date Management',
			description: 'Stay on top of deadlines with due date tracking and reminder notifications.',
			href: '/projects',
			color: 'bg-red-500/10 text-red-600 border-red-200'
		},
		{
			icon: Trash2,
			title: 'Smart Recovery',
			description: 'Accidentally deleted something? Restore projects and tasks from the trash.',
			href: '/trash',
			color: 'bg-gray-500/10 text-gray-600 border-gray-200'
		}
	]);

	const quickActions = $state([
		{
			title: 'Create New Project',
			description: 'Start organizing your work',
			href: '/projects/new',
			icon: FolderKanban,
			primary: true
		},
		{
			title: 'View All Projects',
			description: 'Browse existing projects',
			href: '/projects',
			icon: Target,
			primary: false
		}
	]);

	function navigateTo(href: string) {
		goto(href);
	}
</script>

<div class="space-y-12">
	<!-- Hero Section -->
	<div class="space-y-6 py-12 text-center">
		<div class="space-y-4">
			<h1 class="text-primary text-4xl font-bold tracking-tight md:text-6xl">SteadyList</h1>
			<p class="text-muted-foreground mx-auto max-w-3xl text-xl md:text-2xl">
				A powerful project management and productivity tool designed to keep you organized and
				focused
			</p>
		</div>

		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			{#each quickActions as action}
				<Button
					size="lg"
					class={action.primary ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
					variant={action.primary ? 'default' : 'outline'}
					onclick={() => navigateTo(action.href)}
				>
					<action.icon class="mr-2 h-5 w-5" />
					{action.title}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Features Grid -->
	<div class="space-y-8">
		<div class="space-y-4 text-center">
			<h2 class="text-primary text-3xl font-bold">Core Features</h2>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg">
				Everything you need to manage projects, track tasks, and boost productivity
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<button type="button" onclick={() => navigateTo(feature.href)} class="w-full text-left">
					<Card
						class="h-full border-slate-200 transition-shadow duration-200 hover:border-slate-300 hover:shadow-lg"
					>
						<CardHeader class="pb-4">
							<div class="flex items-center space-x-3">
								<div class="rounded-lg border p-2 {feature.color}">
									<feature.icon class="h-6 w-6" />
								</div>
								<CardTitle class="text-lg">
									{feature.title}
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription class="text-base leading-relaxed">
								{feature.description}
							</CardDescription>
						</CardContent>
					</Card>
				</button>
			{/each}
		</div>
	</div>

	<!-- Workflow Section -->
	<div class="space-y-8">
		<div class="space-y-4 text-center">
			<h2 class="text-primary text-3xl font-bold">How It Works</h2>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg">
				Simple workflow to get you started and keep you productive
			</p>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="space-y-4 text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
					<span class="text-xl font-bold text-blue-600">1</span>
				</div>
				<h3 class="text-xl font-semibold">Create Projects</h3>
				<p class="text-muted-foreground">
					Set up projects to organize your work and define clear objectives for each initiative.
				</p>
			</div>

			<div class="space-y-4 text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
					<span class="text-xl font-bold text-green-600">2</span>
				</div>
				<h3 class="text-xl font-semibold">Add Tasks</h3>
				<p class="text-muted-foreground">
					Break down projects into manageable tasks with priorities, due dates, and detailed
					descriptions.
				</p>
			</div>

			<div class="space-y-4 text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
					<span class="text-xl font-bold text-purple-600">3</span>
				</div>
				<h3 class="text-xl font-semibold">Track Progress</h3>
				<p class="text-muted-foreground">
					Monitor completion rates, manage deadlines, and stay on top of your productivity goals.
				</p>
			</div>
		</div>
	</div>

	<!-- Stats Section -->
	<div class="rounded-lg bg-slate-50 p-8">
		<div class="space-y-6 text-center">
			<h2 class="text-primary text-2xl font-bold">Ready to Get Started?</h2>
			<p class="text-muted-foreground mx-auto max-w-xl">
				Join others who have transformed their productivity with SteadyList's intuitive project
				management tools.
			</p>

			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<Button
					size="lg"
					class="bg-primary hover:bg-primary/90"
					onclick={() => navigateTo('/projects/new')}
				>
					{@html FolderKanban({ class: 'mr-2 h-5 w-5' })}
					Create Your First Project
					<ArrowRight class="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</div>
