<template>
	<Empty
		title="Page not found"
		description="The page you are looking for does not exist or has been moved."
		button="Go home"
		button-color="primary"
		@action="navigateTo($localePath('/'))"
	>
		<div
			class="flex size-24 items-center justify-center rounded-4xl bg-secondary text-primary"
		>
			<Lottie name="error" :loop="false" width="80px" height="80px" />
		</div>
	</Empty>
</template>
