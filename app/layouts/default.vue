<script setup lang="ts">
import { useSidebar } from '@/composables/useSidebar';
import {
	Archive,
	BarChart3,
	Box,
	Boxes,
	Download,
	House,
	Menu,
	RefreshCw,
	Send,
	Settings,
	Store,
	TrendingUp,
	Users,
} from '@lucide/vue';

const userStore = useUser();

userStore.getUserByToken();

const sidebar = useSidebar();

const sections = computed(() => [
	{
		label: 'nav.homeSection',
		pages: [
			{ id: '/', title: 'nav.home', icon: House },
			{ id: '/stores', title: 'nav.stores', icon: Store },
			...(userStore.user?.role === 'admin'
				? [{ id: '/users', title: 'nav.users', icon: Users }]
				: []),
		],
	},
	{
		label: 'nav.ordersSection',
		pages: [
			{ id: '/orders', title: 'nav.telegramOrders', icon: Send },
			{ id: '/archive', title: 'nav.kaspiOrders', icon: Archive },
			{ id: '/schedule-orders', title: 'nav.ordersGraph', icon: BarChart3 },
			...(userStore.user?.orderBotEnabled
				? [{ id: '/order-bot-settings', title: 'nav.settings', icon: Settings }]
				: []),
		],
	},
	{
		label: 'nav.productsSection',
		pages: [
			{ id: '/products', title: 'nav.products', icon: Box },
			{
				id: '/stock-settings',
				title: 'nav.stockManagement',
				icon: Boxes,
			},
			{ id: '/product-sync', title: 'nav.productSync', icon: RefreshCw },
			{
				id: '/popular-products',
				title: 'nav.popularProducts',
				icon: TrendingUp,
			},
			{
				id: '/price-bot-settings',
				title: 'nav.settings',
				icon: Settings,
			},
		],
	},
	{
		label: 'nav.useful',
		pages: [{ id: '/install-pwa', title: 'nav.installPwa', icon: Download }],
	},
]);

const route = useRoute();
const selected = computed(() =>
	sections.value
		.flatMap(section => section.pages)
		.find(page => page.id === route.path),
);

const selectPage = (id: string) => {
	navigateTo(id);
};
</script>

<template>
	<Layout>
		<template #sidebar>
			<Sidebar
				:sections="sections"
				:selected="selected?.id"
				@select="selectPage"
			>
				<template #logo>
					<Logo />
				</template>
			</Sidebar>
		</template>

		<template #scaffold>
			<Scaffold>
				<template #app-bar>
					<AppBar :title="selected?.title ?? 'app.name'">
						<template #leading>
							<IconButton
								variant="ghost"
								color="default"
								@click="sidebar.toggle()"
							>
								<Menu />
							</IconButton>
						</template>

						<template #trailing>
							<UserMenu />
						</template>
					</AppBar>
				</template>

				<template #body>
					<GettingStartedWidget />
					<NuxtPage />
				</template>
			</Scaffold>
		</template>
	</Layout>
</template>
