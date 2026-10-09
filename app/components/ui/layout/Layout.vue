<template>
	<div class="size-full flex relative overflow-hidden">
		<slot name="sidebar" />
		<div class="flex-1">
			<slot name="scaffold" />
		</div>
	</div>
</template>
