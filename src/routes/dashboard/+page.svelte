<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Select, SelectTrigger, SelectContent, SelectItem } from '$lib/components/ui/select';
	import {
		ChartColumn,
		CheckCircle2,
		AlertTriangle,
		StickyNote,
		Bell,
		ListChecks,
		Layers,
		Calendar
	} from '@lucide/svelte';
	import * as Chart from '$lib/components/ui/chart/index.js';
	//@ts-expect-error
	import { scaleBand, scaleUtc } from 'd3-scale';
	import { BarChart, LineChart, PieChart, Text } from 'layerchart';
	//@ts-expect-error
	import { curveMonotoneX } from 'd3-shape';

	import type { Project, Task, Note, Notification, PromiseMade } from '$lib/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function safeParse(dateIso?: string): Date | null {
		if (!dateIso || typeof dateIso !== 'string') return null;
		const t = Date.parse(dateIso);
		if (!Number.isFinite(t)) return null;
		const dte = new Date(t);
		return Number.isFinite(dte.getTime()) ? dte : null;
	}

	function dayKey(dateIso?: string): string | null {
		const dte = safeParse(dateIso);
		return dte ? dte.toISOString().slice(0, 10) : null;
	}

	const projects: Project[] = data.projects;
	const tasks: Task[] = data.tasks;
	const notes: Note[] = data.notes;
	const notifications: Notification[] = data.notifications;
	const promisesData: PromiseMade[] = data.promises;

	const ranges = [
		{ id: '7', label: 'Last 7 days', days: 7 },
		{ id: '30', label: 'Last 30 days', days: 30 },
		{ id: '90', label: 'Last 90 days', days: 90 },
		{ id: 'all', label: 'All time', days: Infinity }
	] as const;

	const COLORS = {
		indigo: '#6366f1',
		fuchsia: '#d946ef',
		cyan: '#06b6d4',
		emerald: '#10b981',
		rose: '#ef4444',
		amber: '#f59e0b',
		zinc: '#71717a'
	};

	const throughputConfig = {
		created: { label: 'Created', color: COLORS.indigo },
		done: { label: 'Done', color: COLORS.emerald }
	} satisfies Chart.ChartConfig;
	const priorityConfig = {
		low: { label: 'Low', color: COLORS.zinc },
		medium: { label: 'Medium', color: COLORS.amber },
		high: { label: 'High', color: COLORS.rose }
	} satisfies Chart.ChartConfig;
	const statusConfig = {
		todo: { label: 'Todo', color: COLORS.zinc },
		inprogress: { label: 'In progress', color: COLORS.amber },
		blocked: { label: 'Blocked', color: COLORS.rose },
		done: { label: 'Done', color: COLORS.emerald }
	} satisfies Chart.ChartConfig;

	function inRange(dateIso?: string, start?: Date, end?: Date) {
		const dte = safeParse(dateIso);
		if (!dte) return false;
		const t = dte.getTime();
		return (!start || t >= start.getTime()) && (!end || t <= end.getTime());
	}

	function aggregate(
		data: {
			tasks: Task[];
			projects: Project[];
			notes: Note[];
			notifications: Notification[];
			promises: PromiseMade[];
		},
		opts: { projectId?: string; rangeDays: number }
	) {
		const end = new Date();
		const start =
			opts.rangeDays === Infinity
				? undefined
				: new Date(end.getTime() - opts.rangeDays * 24 * 3600000);

		const tasksFiltered = data.tasks.filter(
			(t) =>
				!t.deleted &&
				(!opts.projectId || t.projectId === opts.projectId) &&
				(!start || inRange(t.createdAt, start, end))
		);

		const kpis = {
			totalProjects: data.projects.filter((p) => !p.deleted).length,
			activeTasks: tasksFiltered.filter((t) => t.status !== 'done').length,
			overdue: tasksFiltered.filter((t) => {
				if (t.status === 'done') return false;
				const due = safeParse(t.dueDate);
				return !!(due && due < end);
			}).length,
			completion: percent(
				tasksFiltered.filter((t) => t.status === 'done').length,
				tasksFiltered.length
			),
			notes: data.notes.length,
			unread: data.notifications.filter((n) => !n.read).length,
			promisesOpen: data.promises.filter((p) => !p.completed && !p.deleted).length
		};

		const days = opts.rangeDays === Infinity ? 30 : opts.rangeDays;
		const seriesStart = start ? start.getTime() : end.getTime() - days * 86400000;
		const series = Array.from({ length: days }, (_, i) => {
			const day = new Date(seriesStart + i * 86400000);
			const key = day.toISOString().slice(0, 10);
			const createdCount = tasksFiltered.filter((t) => dayKey(t.createdAt) === key).length;
			const doneCount = tasksFiltered.filter(
				(t) => t.status === 'done' && dayKey(t.updatedAt) === key
			).length;
			return { day: key, created: createdCount, done: doneCount };
		});

		const statusPerProject = data.projects
			.filter((p) => !p.deleted)
			.map((p) => {
				const list = tasksFiltered.filter((t) => t.projectId === p.id);
				return {
					project: p.name,
					todo: list.filter((t) => t.status === 'todo').length,
					inprogress: list.filter((t) => t.status === 'in-progress').length,
					blocked: list.filter((t) => t.status === 'blocked').length,
					done: list.filter((t) => t.status === 'done').length
				};
			});

		const priority = ['low', 'medium', 'high'].map((p) => ({
			name: p,
			value: tasksFiltered.filter((t) => t.priority === p).length,
			color: p === 'low' ? COLORS.zinc : p === 'medium' ? COLORS.amber : COLORS.rose
		}));

		const completionPerProject = data.projects
			.filter((p) => !p.deleted)
			.map((p, i) => {
				const list = tasksFiltered.filter((t) => t.projectId === p.id);
				const comp = percent(list.filter((t) => t.status === 'done').length, list.length);
				return {
					name: p.name,
					value: comp,
					color: [COLORS.indigo, COLORS.fuchsia, COLORS.cyan, COLORS.emerald][i % 4]
				};
			});

		return { kpis, series, statusPerProject, priority, completionPerProject };
	}

	function percent(n: number, d: number) {
		return d === 0 ? 0 : Math.round((n / d) * 100);
	}

	let range = $state<(typeof ranges)[number]['id']>('30');
	let projectId = $state<string | 'all'>('all');

	const dashboard = $derived(
		aggregate(
			{ tasks, projects, notes, notifications, promises: promisesData },
			{
				rangeDays: range === 'all' ? Infinity : Number(range),
				projectId: projectId === 'all' ? undefined : projectId
			}
		)
	);

	const glassCard =
		'border border-white/25 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 shadow-[0_0_1px_rgba(255,255,255,0.6)_inset,0_10px_30px_-12px_rgba(0,0,0,0.25)]';
	const glassBar =
		'border border-white/20 bg-white/40 dark:bg-zinc-900/30 backdrop-blur supports-[backdrop-filter]:bg-white/20';
</script>

<div>
	<main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Filters -->
		<div class="mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-3 {glassBar}">
			<Select type="single" bind:value={range}>
				<SelectTrigger class="w-[160px]">
					<Calendar class="mr-2 h-4 w-4" />
					<span class="text-sm">{ranges.find((r) => r.id === range)?.label}</span>
				</SelectTrigger>
				<SelectContent>
					{#each ranges as r}
						<SelectItem value={r.id}>{r.label}</SelectItem>
					{/each}
				</SelectContent>
			</Select>

			<Select type="single" bind:value={projectId}>
				<SelectTrigger class="w-[180px]">
					<Layers class="mr-2 h-4 w-4" />
					<span class="text-sm"
						>{projectId === 'all'
							? 'All projects'
							: projects.find((p) => p.id === projectId)?.name}</span
					>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All projects</SelectItem>
					{#each projects as p}
						<SelectItem value={p.id}>{p.name}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>

		<!-- KPI cards -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{@render KpiCard({
				icon: ChartColumn,
				label: 'Active tasks',
				value: dashboard.kpis.activeTasks,
				accent: COLORS.indigo,
				className: glassCard
			})}
			{@render KpiCard({
				icon: AlertTriangle,
				label: 'Overdue',
				value: dashboard.kpis.overdue,
				accent: COLORS.rose,
				className: glassCard
			})}
			{@render KpiCard({
				icon: CheckCircle2,
				label: 'Completion',
				value: `${dashboard.kpis.completion}%`,
				accent: COLORS.emerald,
				className: glassCard
			})}
			{@render KpiCard({
				icon: Bell,
				label: 'Unread notifications',
				value: dashboard.kpis.unread,
				accent: COLORS.amber,
				className: glassCard
			})}
		</div>

		<!-- Charts -->
		<div class="mt-8 grid gap-6 lg:grid-cols-3">
			<Card class="lg:col-span-2 {glassCard}">
				<CardHeader>
					<CardTitle>Throughput (created vs done)</CardTitle>
				</CardHeader>
				<CardContent class="h-72 overflow-visible">
					<Chart.Container config={throughputConfig} class="aspect-auto h-full w-full">
						<LineChart
							data={dashboard.series.map((s) => ({ ...s, day: new Date(s.day) }))}
							x="day"
							xScale={scaleUtc()}
							y={['created', 'done']}
							padding={{ left: 16, right: 16, top: 18, bottom: 20 }}
							series={[
								{
									key: 'created',
									label: throughputConfig.created.label,
									color: throughputConfig.created.color
								},
								{
									key: 'done',
									label: throughputConfig.done.label,
									color: throughputConfig.done.color
								}
							]}
							props={{
								spline: { curve: curveMonotoneX, motion: 'tween', strokeWidth: 2 },
								xAxis: {
									format: (v: Date) =>
										v.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
								},
								highlight: { points: { r: 4 } }
							}}
						>
							{#snippet tooltip()}
								<Chart.Tooltip />
							{/snippet}
						</LineChart>
					</Chart.Container>
				</CardContent>
			</Card>

			<Card class={glassCard}>
				<CardHeader>
					<CardTitle>Priority mix</CardTitle>
				</CardHeader>
				<CardContent class="h-72">
					<Chart.Container config={priorityConfig} class="mx-auto aspect-square max-h-[240px]">
						<PieChart
							data={dashboard.priority.map((p) => ({
								platform: p.name,
								visitors: p.value,
								color: p.color
							}))}
							key="platform"
							value="visitors"
							c="color"
							innerRadius={36}
							padding={10}
							props={{ pie: { sort: null } }}
							cornerRadius={4}
						>
							{#snippet aboveMarks()}
								<Text
									value={String(dashboard.priority.reduce((s, p) => s + p.value, 0))}
									textAnchor="middle"
									verticalAnchor="middle"
									class="fill-foreground text-xl! font-bold"
									dy={-10}
								/>
								<Text
									value="Tasks"
									textAnchor="middle"
									verticalAnchor="middle"
									class="fill-muted-foreground! text-muted-foreground"
									dy={8}
								/>
							{/snippet}
							{#snippet tooltip()}
								<Chart.Tooltip hideLabel />
							{/snippet}
						</PieChart>
					</Chart.Container>
				</CardContent>
			</Card>

			<Card class="lg:col-span-3 {glassCard}">
				<CardHeader>
					<CardTitle>Status by project</CardTitle>
				</CardHeader>
				<CardContent class="h-80 overflow-hidden">
					<Chart.Container config={statusConfig} class="aspect-auto h-full w-full">
						<BarChart
							data={dashboard.statusPerProject}
							xScale={scaleBand().padding(0.25)}
							x="project"
							axis="x"
							seriesLayout="stack"
							series={[
								{
									key: 'todo',
									label: statusConfig.todo.label,
									color: statusConfig.todo.color
								},
								{
									key: 'inprogress',
									label: statusConfig.inprogress.label,
									color: statusConfig.inprogress.color
								},
								{
									key: 'blocked',
									label: statusConfig.blocked.label,
									color: statusConfig.blocked.color
								},
								{
									key: 'done',
									label: statusConfig.done.label,
									color: statusConfig.done.color
								}
							]}
						>
							{#snippet tooltip()}
								<Chart.Tooltip />
							{/snippet}
						</BarChart>
					</Chart.Container>
				</CardContent>
			</Card>

			<Card class={glassCard}>
				<CardHeader>
					<CardTitle>Completion by project</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-3 items-stretch gap-3">
						{#each dashboard.completionPerProject as c}
							<div class="flex flex-col items-center gap-1">
								<Chart.Container config={statusConfig} class="mx-auto aspect-square w-28">
									<PieChart
										data={[{ project: c.name, value: c.value, color: c.color }]}
										key="project"
										value="value"
										c="color"
										innerRadius={26}
										padding={6}
										range={[-90, 90]}
										props={{ pie: { sort: null } }}
										cornerRadius={3}
									>
										{#snippet aboveMarks()}
											<Text
												value={String(c.value)}
												textAnchor="middle"
												verticalAnchor="middle"
												class="fill-foreground text-sm! font-semibold"
												dy={-6}
											/>
											<Text
												value={c.name}
												textAnchor="middle"
												verticalAnchor="middle"
												class="fill-muted-foreground! text-muted-foreground text-xs"
												dy={8}
											/>
										{/snippet}
										{#snippet tooltip()}
											<Chart.Tooltip hideLabel />
										{/snippet}
									</PieChart>
								</Chart.Container>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<Card class={glassCard}>
				<CardHeader>
					<CardTitle>Notes & Promises</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-3 sm:grid-cols-2">
						{@render MiniStat({
							className: glassBar,
							icon: StickyNote,
							label: 'Notes',
							value: notes.length
						})}
						{@render MiniStat({
							className: glassBar,
							icon: ListChecks,
							label: 'Promises open',
							value: promisesData.filter((p) => !p.completed).length
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	</main>
</div>

{#snippet KpiCard({
	icon: Icon,
	label,
	value,
	accent,
	className = ''
}: {
	icon: any;
	label: string;
	value: number | string;
	accent?: string;
	className?: string;
})}
	<Card class="overflow-hidden {className}">
		<CardHeader class="pb-2">
			<div class="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
				<span
					class="grid h-8 w-8 place-items-center rounded-xl"
					style="background-color: {accent}22; color: {accent}"
				>
					<Icon class="h-4 w-4" />
				</span>
				{label}
			</div>
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold tracking-tight">{value}</div>
		</CardContent>
	</Card>
{/snippet}

{#snippet MiniStat({
	icon: Icon,
	label,
	value,
	className = ''
}: {
	icon: any;
	label: string;
	value: number | string;
	className?: string;
})}
	<div class="flex items-center justify-between rounded-xl border px-3 py-2 {className}">
		<div class="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
			<span class="grid h-8 w-8 place-items-center rounded-xl bg-zinc-100/60 dark:bg-zinc-800/60">
				<Icon class="h-4 w-4" />
			</span>
			{label}
		</div>
		<div class="text-lg font-semibold">{value}</div>
	</div>
{/snippet}
