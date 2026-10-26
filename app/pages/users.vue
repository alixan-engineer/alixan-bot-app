<script setup lang="ts">
import { ShieldCheck, ShieldMinus, Trash2, UserPlus } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import AddUserDialog from '~/features/user/AddUserDialog.vue';
import type { User } from '~/interfaces/user.interface';
import { phonePipe } from '~/utils/phone-pipe';

definePageMeta({ middleware: 'admin' });

usePageMeta({
	title: 'seo.pages.users.title',
	description: 'seo.pages.users.description',
});

const currentUser = useUser();
const dialog = useDialog();
const users = ref<User[]>([]);
const loading = ref(false);
const visibleUsers = computed(() =>
	[...users.value].sort(
		(left, right) =>
			Number(right._id === currentUser.user?._id) -
			Number(left._id === currentUser.user?._id),
	),
);

const load = async () => {
	loading.value = true;
	try {
		users.value = await useApiFetch<User[]>('users');
	} finally {
		loading.value = false;
	}
};

const openCreateDialog = () => {
	dialog.open(AddUserDialog, {
		width: '500px',
		height: '500px',
		title: 'Добавить пользователя',
		data: { onCreated: load },
	});
};

const changeRole = async (user: User) => {
	const role = user.role === 'admin' ? 'worker' : 'admin';
	await useApiFetch(`users/${user._id}/role`, {
		method: 'PATCH',
		body: { role },
	});
	await load();
	if (user._id === currentUser.user?._id) await currentUser.getUserByToken();
};

const removeUser = async (user: User) => {
	await useApiFetch(`users/${user._id}`, { method: 'DELETE' });
	await load();
};

const confirmRoleChange = (user: User) => {
	dialog.open(ConfirmDialog, {
		width: '380px',
		height: '260px',
		data: {
			title:
				user.role === 'admin'
					? 'users.makeWorkerConfirm.title'
					: 'users.makeAdminConfirm.title',
			description:
				user.role === 'admin'
					? 'users.makeWorkerConfirm.description'
					: 'users.makeAdminConfirm.description',
			cancelLabel: 'common.cancel',
			submitLabel: 'common.ok',
			onSubmit: () => changeRole(user),
		},
	});
};

const confirmRemove = (user: User) => {
	dialog.open(ConfirmDialog, {
		width: '380px',
		height: '260px',
		data: {
			title: 'users.removeConfirm.title',
			description: 'users.removeConfirm.description',
			cancelLabel: 'common.cancel',
			submitLabel: 'actions.remove',
			submitColor: 'destructive',
			onSubmit: () => removeUser(user),
		},
	});
};

onMounted(load);
</script>

<template>
	<div class="flex gap-3">
		<Button color="primary" @click="openCreateDialog">
			<template #leading>
				<UserPlus />
			</template>
			Пользователь
		</Button>
	</div>

	<Spinner v-if="loading && !visibleUsers.length" />

	<List v-else-if="visibleUsers.length" divider="block">
		<ListTile v-for="user in visibleUsers" :key="user._id">
			<template #leading>
				<Avatar :name="user.name" />
			</template>
			<template #title>
				<span class="flex flex-wrap items-center gap-2">
					<span>{{ user.name }}</span>
					<span
						v-if="user._id === currentUser.user?._id"
						class="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
					>
						{{ $t('users.currentAccount') }}
					</span>
				</span>
			</template>
			<template #description>
				<p>{{ phonePipe(user.phone) }}</p>
				<p>
					{{ user.role === 'admin' ? 'Администратор' : 'Работник' }}
				</p>
			</template>
			<template v-if="user._id !== currentUser.user?._id" #trailing>
				<IconButton
					variant="outlined"
					:tooltip="
						user.role === 'admin'
							? 'Сделать работником'
							: 'Сделать администратором'
					"
					@click="confirmRoleChange(user)"
				>
					<component :is="user.role === 'admin' ? ShieldMinus : ShieldCheck" />
				</IconButton>
				<IconButton
					variant="outlined"
					color="destructive"
					tooltip="Удалить пользователя"
					@click="confirmRemove(user)"
				>
					<Trash2 />
				</IconButton>
			</template>
		</ListTile>
	</List>

	<Empty
		v-else
		title="users.empty.title"
		description="users.empty.description"
	/>
</template>
