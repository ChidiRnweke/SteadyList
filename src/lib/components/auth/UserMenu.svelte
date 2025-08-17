<script lang="ts">
	import { user } from '$lib/stores/auth';
	import authClient from '$lib/authClient';
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Avatar } from '$lib/components/ui/avatar';
	import { LogOut, User, Settings } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let isSigningOut = $state(false);

	const handleSignOut = async () => {
		if (isSigningOut) return;

		isSigningOut = true;
		try {
			await authClient.signOut();
			toast.success('Successfully signed out');
			goto('/login');
		} catch (error: any) {
			console.error('Sign out error:', error);
			toast.error('Failed to sign out');
		} finally {
			isSigningOut = false;
		}
	};

	const displayName = $derived($user?.displayName || 'User');
	const email = $derived($user?.email || '');
	const photoURL = $derived($user?.photoURL || '');
</script>

{#if $user}
	<DropdownMenu>
		<DropdownMenuTrigger>
			<Button variant="ghost" class="relative h-8 w-8 rounded-full">
				<Avatar class="h-8 w-8">
					{#if photoURL}
						<img src={photoURL} alt={displayName} class="h-8 w-8 rounded-full" />
					{:else}
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-600"
						>
							<User class="h-4 w-4" />
						</div>
					{/if}
				</Avatar>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent class="w-56" align="end">
			<DropdownMenuLabel class="font-normal">
				<div class="flex flex-col space-y-1">
					<p class="text-sm leading-none font-medium">{displayName}</p>
					<p class="text-muted-foreground text-xs leading-none">{email}</p>
				</div>
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem>
				<User class="mr-2 h-4 w-4" />
				<span>Profile</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<Settings class="mr-2 h-4 w-4" />
				<span>Settings</span>
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem onclick={handleSignOut} disabled={isSigningOut}>
				<LogOut class="mr-2 h-4 w-4" />
				<span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
{/if}
