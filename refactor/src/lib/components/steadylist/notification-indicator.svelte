<script lang="ts">
	import { onMount } from 'svelte';
	import { Bell } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import type { Notification } from '$lib/types';
	import { formatDistanceToNow } from 'date-fns';

	const getNotifications = async () => {
		return [];
	};

	const markNotificationAsRead = async (id: string) => {
		console.log('Marking notification as read', id);
	};

	let notifications = $state<Notification[]>([]);
	let open = $state(false);

	const loadNotifications = async () => {
		const data = await getNotifications();
		notifications = data;
	};

	const handleMarkAsRead = async (id: string) => {
		await markNotificationAsRead(id);
		notifications = notifications.filter((notification) => notification.id !== id);
	};

	const unreadCount = $derived(notifications.length);

	onMount(() => {
		loadNotifications();

		// Check for new notifications every minute
		const interval = setInterval(loadNotifications, 60000);
		return () => clearInterval(interval);
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
	>
		<Bell class="h-5 w-5" />
		{#if unreadCount > 0}
			<span
				class="bg-destructive absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white"
			>
				{unreadCount}
			</span>
		{/if}
		<span class="sr-only">Notifications</span>
	</Popover.Trigger>
	<Popover.Content class="w-80 p-0" align="end">
		<div class="border-b p-4">
			<h4 class="font-medium">Notifications</h4>
		</div>
		{#if notifications.length === 0}
			<div class="text-muted-foreground p-4 text-center text-sm">No notifications</div>
		{:else}
			<div class="max-h-96 overflow-y-auto">
				{#each notifications as notification (notification.id)}
					<div class="border-b p-4 last:border-0 hover:bg-slate-50">
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="text-sm font-medium">{notification.title}</p>
								<p class="text-muted-foreground text-xs">
									{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
								</p>
							</div>
							<Button variant="ghost" size="sm" onclick={() => handleMarkAsRead(notification.id)}>
								Dismiss
							</Button>
						</div>
						<p class="mt-1 text-sm">{notification.message}</p>
					</div>
				{/each}
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
