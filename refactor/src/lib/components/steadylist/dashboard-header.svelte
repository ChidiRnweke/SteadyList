<script lang="ts">
	import { goto } from '$app/navigation';
	import { LogOut, Menu } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import NotificationIndicator from '$lib/components/steadylist/notification-indicator.svelte';
	import TrashIndicator from '$lib/components/steadylist/trash-indicator.svelte';
	import MainNav from '$lib/components/steadylist/main-nav.svelte';
	import MobileNav from '$lib/components/steadylist/mobile-nav.svelte';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebaseClient';
	import { signOut } from 'firebase/auth';

	type User = {
		name: string;
		email: string;
		image: string | null;
	};

	// Reactive state
	let user = $state<User | null>(null);
	let deletedItems = $state({
		deletedProjects: [],
		deletedTasks: []
	});

	// Mock user data - replace with your actual auth store
	$effect(() => {
		// This would typically come from your auth store
		user = {
			name: 'User Name',
			email: 'user@example.com',
			image: null
		};
	});

	onMount(async () => {
		// Load trash data
		// try {
		// 	const response = await fetch('/trash');
		// 	const data = await response.json();
		// 	deletedItems = {
		// 		deletedProjects: data.deletedProjects || [],
		// 		deletedTasks: data.deletedTasks || []
		// 	};
		// } catch (error) {
		// 	console.error('Failed to load trash data:', error);
		// }
	});

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			goto('/login');
		} catch (error) {
			console.error('Sign out failed:', error);
		}
	};
</script>

<header class="flex items-center justify-between py-4">
	<div class="flex items-center gap-6">
		<a href="/" class="flex items-center gap-2">
			<div class="bg-primary relative flex h-8 w-8 items-center justify-center rounded-lg">
				<span class="text-sm font-bold text-white">T</span>
			</div>
			<span class="text-primary hidden text-xl font-bold md:inline-block"> SteadyList </span>
		</a>

		<div class="hidden md:flex">
			<MainNav />
		</div>
	</div>

	<div class="flex items-center gap-4">
		<NotificationIndicator />

		<TrashIndicator
			deletedTasks={deletedItems.deletedTasks}
			deletedProjects={deletedItems.deletedProjects}
		/>

		<Sheet>
			<SheetTrigger>
				<Button variant="ghost" size="icon" class="md:hidden">
					<Menu class="h-5 w-5" />
					<span class="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" class="w-[240px] sm:w-[300px]">
				<div class="px-2 py-6">
					<MobileNav />
				</div>
			</SheetContent>
		</Sheet>

		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="ghost" class="relative h-10 w-10 rounded-full">
					<Avatar>
						<AvatarImage
							src={user?.image || '/placeholder.svg?height=40&width=40'}
							alt={user?.name || 'User'}
						/>
						<AvatarFallback class="bg-primary/10 text-primary">
							{user?.name?.charAt(0) || 'U'}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem class="font-medium">
					{user?.name || 'User'}
				</DropdownMenuItem>
				<DropdownMenuItem class="text-muted-foreground text-sm">
					{user?.email || 'user@example.com'}
				</DropdownMenuItem>
				<DropdownMenuItem onclick={handleSignOut}>
					<LogOut class="mr-2 h-4 w-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
</header>
