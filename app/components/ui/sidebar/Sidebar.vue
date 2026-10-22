<script setup lang="ts">
import { cn } from '~/utils/cn';

interface SidebarPage {
	id: string;
	title: string;
	icon?: Component;
	disabled?: boolean;
	isNew?: boolean;
}

interface SidebarSection {
	label: string;
	pages: SidebarPage[];
}

interface SidebarProps {
	sections: SidebarSection[];
	selected?: string;
}

const props = defineProps<SidebarProps>();

const emit = defineEmits<{
	select: [id: string];
}>();

const sidebar = useSidebar();

const selectPage = (page: SidebarPage) => {
	if (page.disabled) return;
	emit('select', page.id);
	if (window.matchMedia('(max-width: 1279px)').matches) {
		sidebar.hide();
	}
};
</script>

<template>
	<div
		v-if="sidebar.open.value"
		class="backdrop z-40 xl:hidden"
		@click="sidebar.hide()"
	/>

	<aside
		:class="
			cn(
				'w-70 h-full flex flex-col',
				'bg-background border-r overflow-hidden divide-y',
				'transition-all',
				'max-xl:absolute z-50',
				sidebar.open.value ? '' : 'xl:w-0 max-xl:-translate-x-70',
			)
		"
	>
		<div class="h-14 flex items-center border-b px-5">
			<slot name="logo" />
		</div>

		<nav class="flex-1 relative overflow-hidden">
			<div class="px-2 py-4 absolute inset-0 overflow-y-auto space-y-8">
				<section
					v-for="section in sections"
					:key="section.label"
					class="space-y-1"
				>
					<p
						class="ml-1 px-3 text-xs font-semibold uppercase text-muted-foreground"
					>
						{{ $t(section.label) }}
					</p>

					<Button
						v-for="page in section.pages"
						:key="page.id"
						:variant="selected === page.id ? 'filled' : 'ghost'"
						:color="selected === page.id ? 'primary' : 'default'"
						:disabled="page.disabled"
						size="sm"
						:class="
							cn(
								'w-full justify-start px-3',
								page.isNew && '[&>span:last-child]:ml-auto',
							)
						"
						@click="selectPage(page)"
					>
						<template v-if="page.icon" #leading>
							<component :is="page.icon" />
						</template>
						{{ $t(page.title) }}
						<template v-if="page.isNew" #trailing>
							<span
								class="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-primary"
							>
								NEW
							</span>
						</template>
					</Button>
				</section>
			</div>
		</nav>

		<div
			v-if="$slots.sidebarFooter"
			class="h-14 flex items-center border-b px-5"
		>
			<slot name="sidebarFooter" />
		</div>
	</aside>
</template>
