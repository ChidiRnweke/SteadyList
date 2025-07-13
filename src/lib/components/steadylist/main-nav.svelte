<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
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

<nav class="flex items-center gap-6">
	{#each routes as route (route.href)}
		<a
			href={route.href}
			class={cn(
				'hover:text-primary flex items-center text-sm font-medium transition-colors',
				route.active ? 'text-primary' : 'text-muted-foreground'
			)}
		>
			<route.icon class="mr-2 h-4 w-4" />
			{route.label}
		</a>
	{/each}
</nav>
