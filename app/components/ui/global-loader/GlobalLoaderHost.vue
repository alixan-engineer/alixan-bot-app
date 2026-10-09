<script setup lang="ts">
const loader = useGlobalLoader();
</script>

<template>
	<ClientOnly>
		<Teleport to="body">
			<Transition name="global-loader">
				<div
					v-if="loader.state.value.open"
					class="backdrop z-20000 flex items-center justify-center p-4"
				>
					<GlobalLoader :label="loader.state.value.label" />
				</div>
			</Transition>
		</Teleport>
	</ClientOnly>
</template>

<style scoped>
.global-loader-enter-active,
.global-loader-leave-active {
	transition:
		opacity 160ms ease,
		transform 160ms ease;
}

.global-loader-enter-from,
.global-loader-leave-to {
	opacity: 0;
	transform: scale(0.98);
}
</style>
