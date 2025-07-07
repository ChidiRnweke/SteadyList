<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { LayoutDashboard, FolderKanban } from '@lucide/svelte';

	const pathname = $derived($page.url.pathname);

	const routes = $derived([
		{
			href: '/',
			label: 'Dashboard',
			icon: LayoutDashboard,
			active: pathname === '/'
		},
		{
			href: '/projects',
			label: 'Projects',
			icon: FolderKanban,
			active: pathname === '/projects' || pathname.startsWith('/projects/')
		}
	]);
</script>

<div class="flex flex-col gap-2">
	{#each routes as route (route.href)}
		<a href={route.href} class="w-full">
			<Button
				variant={route.active ? 'default' : 'ghost'}
				class={cn(
					'w-full justify-start',
					route.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
				)}
			>
				<route.icon class="mr-2 h-4 w-4" />
				{route.label}
			</Button>
		</a>
	{/each}
</div>
