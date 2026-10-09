<script setup lang="ts">
const userStore = useUser();
const open = ref(false);
</script>

<template>
	<DropdownMenu
		v-if="userStore.user"
		v-model:open="open"
		class="h-full"
		width="300px"
		height="560px"
		position="bottomRight"
	>
		<template #trigger>
			<Avatar :name="userStore.user.name" size="sm" class="cursor-pointer" />
		</template>

		<template #default>
			<div class="border-b p-3">
				<div class="flex items-center gap-3">
					<Avatar :name="userStore.user.name" />
					<div class="min-w-0">
						<p class="truncate font-semibold">{{ userStore.user?.name }}</p>
						<p class="text-sm text-muted-foreground">
							{{
								userStore.user?.role === 'admin' ? 'Администратор' : 'Работник'
							}}
						</p>
					</div>
				</div>
			</div>
			<div class="space-y-1 p-1">
				<UserProfileAction @select="open = false" />
				<UserPreferencesAction @select="open = false" />
			</div>
			<div class="border-t p-1">
				<UserSignOutAction @select="open = false" />
			</div>
		</template>
	</DropdownMenu>
</template>
