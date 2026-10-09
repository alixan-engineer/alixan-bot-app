<script setup lang="ts">
import { MonitorDown, Share, Smartphone } from '@lucide/vue';

usePageMeta({
	title: 'seo.pages.installPwa.title',
	description: 'seo.pages.installPwa.description',
});

const platforms = [
	{
		key: 'iphone',
		icon: Share,
		steps: ['open', 'share', 'homeScreen', 'confirm'],
	},
	{
		key: 'android',
		icon: Smartphone,
		steps: ['open', 'menu', 'install', 'confirm'],
	},
] as const;
</script>

<template>
	<div class="max-w-3xl space-y-2">
		<div class="flex items-center gap-3">
			<MonitorDown class="size-7 text-primary sm:size-8" />
			<h1
				class="text-2xl font-bold tracking-tight sm:text-3xl sm:tracking-normal"
			>
				{{ $t('learning.pwa.title') }}
			</h1>
		</div>
		<p class="text-base leading-7 text-muted-foreground">
			{{ $t('learning.pwa.description') }}
		</p>
	</div>

	<div class="grid max-w-5xl gap-4 lg:grid-cols-2">
		<Island
			v-for="platform in platforms"
			:key="platform.key"
			content-class="flex flex-col gap-5 p-4 sm:p-6"
		>
			<div class="flex items-center gap-3">
				<div
					class="flex size-11 items-center justify-center rounded-xl bg-secondary"
				>
					<component :is="platform.icon" class="size-5" />
				</div>
				<h2 class="text-xl font-semibold">
					{{ $t(`learning.pwa.${platform.key}.title`) }}
				</h2>
			</div>

			<ol class="space-y-4">
				<li
					v-for="(step, index) in platform.steps"
					:key="step"
					class="flex gap-3"
				>
					<span
						class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
					>
						{{ index + 1 }}
					</span>
					<p class="pt-0.5 text-base leading-6">
						{{ $t(`learning.pwa.${platform.key}.steps.${step}`) }}
					</p>
				</li>
			</ol>
		</Island>
	</div>
</template>
