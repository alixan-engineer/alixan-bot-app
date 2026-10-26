<template>
	<NuxtLink :to="$localePath('/')" class="flex items-center gap-2 select-none">
		<div
			class="size-8 flex items-center justify-center overflow-hidden rounded-md"
		>
			<img
				src="/icons/icon-512.png"
				alt="Kaspi bot"
				class="size-12 object-cover"
				loading="lazy"
			/>
		</div>
		<h1 class="text-xl font-semibold line-clamp-1">{{ $t('app.name') }}</h1>
	</NuxtLink>
</template>
