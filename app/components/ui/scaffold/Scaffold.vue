<template>
	<div class="size-full flex flex-col">
		<slot name="app-bar" />

		<div class="flex-1 relative">
			<main
				class="absolute inset-0 z-0 overflow-y-auto max-md:px-4 md:px-6 py-6 flex flex-col gap-6"
			>
				<slot name="body" />
			</main>
		</div>

		<slot name="bottom-navigation-bar" />
	</div>
</template>
