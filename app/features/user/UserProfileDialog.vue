<script setup lang="ts">
import { phonePipe } from '~/utils/phone-pipe';

const { user } = useUser();
</script>

<template>
	<div class="size-full p-6 flex flex-col items-center gap-8">
		<Avatar :name="user?.name" size="xl" />

		<Island class="w-full" content-class="flex flex-col gap-4 p-6">
			<div class="flex items-center">
				<p class="flex-1 text-base font-normal text-muted-foreground">Имя</p>
				<p class="flex-1 text-base font-medium">{{ user?.name }}</p>
			</div>
			<div class="flex items-center">
				<p class="flex-1 text-base font-normal text-muted-foreground">Роль</p>
				<p class="flex-1 text-base font-medium">
					{{ user?.role === 'admin' ? 'Администратор' : 'Работник' }}
				</p>
			</div>
			<div class="flex items-center">
				<p class="flex-1 text-base font-normal text-muted-foreground">Номер</p>
				<p class="flex-1 text-base font-medium">{{ phonePipe(user?.phone) }}</p>
			</div>
		</Island>
	</div>
</template>
