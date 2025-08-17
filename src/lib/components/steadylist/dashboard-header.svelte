<script lang="ts">
	import { goto } from '$app/navigation';
	import { ListChecks, LogOut, Menu } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import TrashIndicator from '$lib/components/steadylist/trash-indicator.svelte';
	import MainNav from '$lib/components/steadylist/main-nav.svelte';
	import MobileNav from '$lib/components/steadylist/mobile-nav.svelte';
	import { onMount } from 'svelte';
	import authClient from '$lib/authClient';
	import { user } from '$lib/stores/auth';
	import { toast } from 'svelte-sonner';

	onMount(async () => {
		const response = await fetch('/trash', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		deletedItems.deletedTasks = data.deletedTasks || [];
		deletedItems.deletedProjects = data.deletedProjects || [];
	});

	// Reactive state
	let deletedItems = $state({
		deletedProjects: [],
		deletedTasks: []
	});

	let isSigningOut = $state(false);

	const handleSignOut = async () => {
		if (isSigningOut) return;

		isSigningOut = true;
		try {
			await authClient.signOut();
			toast.success('Successfully signed out');
			goto('/login');
		} catch (error) {
			console.error('Sign out failed:', error);
			toast.error('Failed to sign out');
		} finally {
			isSigningOut = false;
		}
	};

	// Derived values from the auth store
	const displayName = $derived($user?.displayName || 'User');
	const email = $derived($user?.email || '');
	const photoURL = $derived($user?.photoURL || '');
</script>

<header class="sticky flex items-center justify-between py-4">
	<div class=" flex h-16 items-center justify-between">
		<div class="mr-20 flex items-center gap-3">
			<div
				class="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow"
			>
				<ListChecks class="h-4 w-4" />
			</div>
			<div class="flex items-center gap-2">
				<a href="/">
					<span class="text-lg font-bold tracking-tight">SteadyList</span>
				</a>
			</div>
		</div>

		<div class="hidden md:flex">
			<MainNav />
		</div>
	</div>

	<div class="flex items-center gap-4">
		<TrashIndicator
			bind:deletedTasks={deletedItems.deletedTasks}
			bind:deletedProjects={deletedItems.deletedProjects}
		/>

		<Sheet>
			<SheetTrigger
				class="ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 md:hidden"
			>
				<Menu class="h-5 w-5" />
				<span class="sr-only">Toggle menu</span>
			</SheetTrigger>
			<SheetContent side="left" class="w-[240px] sm:w-[300px]">
				<div class="px-2 py-6">
					<MobileNav />
				</div>
			</SheetContent>
		</Sheet>

		<DropdownMenu>
			<DropdownMenuTrigger
				class="ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			>
				<Avatar>
					<AvatarImage src={photoURL || '/placeholder.svg?height=40&width=40'} alt={displayName} />
					<AvatarFallback class="bg-primary/10 text-primary">
						{displayName.charAt(0)}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem class="font-medium">
					{displayName}
				</DropdownMenuItem>
				<DropdownMenuItem class="text-muted-foreground text-sm">
					{email}
				</DropdownMenuItem>
				<DropdownMenuItem onclick={handleSignOut} disabled={isSigningOut}>
					<LogOut class="mr-2 h-4 w-4" />
					{isSigningOut ? 'Signing out...' : 'Sign out'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
</header>
