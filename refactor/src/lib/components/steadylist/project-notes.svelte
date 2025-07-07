<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { formatDate } from 'date-fns';
	import { Plus } from '@lucide/svelte';
	import type { Note } from '$lib/types';

	interface Props {
		projectId: string;
		notes: Note[];
	}

	let { projectId, notes }: Props = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-primary text-xl font-semibold">Project Notes</h2>
		<a href="/notes/new?projectId={projectId}">
			<Button class="bg-primary hover:bg-primary/90">
				<Plus class="mr-2 h-4 w-4" />
				New Note
			</Button>
		</a>
	</div>

	{#if notes.length === 0}
		<div class="rounded-lg border bg-slate-50 py-12 text-center">
			<p class="text-muted-foreground mb-4">No notes for this project yet</p>
			<a href="/notes/new?projectId={projectId}">
				<Button class="bg-primary hover:bg-primary/90">
					<Plus class="mr-2 h-4 w-4" />
					Create First Note
				</Button>
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each notes as note (note.id)}
				<a href="/notes/{note.id}/edit">
					<Card
						class="hover:border-primary/50 h-full cursor-pointer transition-all hover:shadow-sm"
					>
						<CardHeader class="pb-2">
							<CardTitle class="text-primary text-lg font-medium">{note.title}</CardTitle>
							<CardDescription>Created on {formatDate(note.createdAt, 'PPP')}</CardDescription>
						</CardHeader>
						<CardContent>
							<p class="text-muted-foreground line-clamp-4 text-sm">{note.content}</p>
						</CardContent>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>
