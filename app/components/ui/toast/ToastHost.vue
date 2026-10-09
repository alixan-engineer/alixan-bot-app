<script setup lang="ts">
const toast = useToast();
</script>

<template>
	<ClientOnly>
		<Teleport to="body">
			<TransitionGroup
				name="toast-list"
				tag="div"
				class="fixed left-1/2 top-5 z-9999 px-4 flex w-full max-w-110 -translate-x-1/2 flex-col gap-3"
			>
				<Toast
					v-for="message in toast.messages.value"
					:key="message.id"
					:toast="message"
					@close="toast.remove(message.id)"
				/>
			</TransitionGroup>
		</Teleport>
	</ClientOnly>
</template>

<style scoped lang="scss">
.toast-list-enter-active,
.toast-list-leave-active,
.toast-list-move {
	transition:
		opacity 180ms ease,
		transform 180ms ease;
}

.toast-list-enter-from,
.toast-list-leave-to {
	opacity: 0;
	transform: translateY(-12px) scale(0.98);
}

.toast-list-leave-active {
	position: absolute;
	width: 100%;
}
</style>
