import {
	computed,
	inject,
	onScopeDispose,
	provide,
	shallowRef,
	toValue,
	watchEffect,
	type Component,
	type InjectionKey,
	type MaybeRefOrGetter,
} from 'vue';

export type AppBarAction = {
	icon: Component;
	label: string;
	onClick: () => void;
};

type ActionRegistration = {
	owner: symbol;
	action: AppBarAction | AppBarAction[] | null;
};
type AppBarActionsContext = {
	register: (registration: ActionRegistration) => void;
	clear: (owner: symbol) => void;
};
const appBarActionsKey: InjectionKey<AppBarActionsContext> =
	Symbol('app-bar-actions');

export const provideAppBarActions = () => {
	const registration = shallowRef<ActionRegistration | null>(null);
	provide(appBarActionsKey, {
		register: (value) => {
			registration.value = value;
		},
		clear: (owner) => {
			// A departing page must not clear an action registered by the next page.
			if (registration.value?.owner === owner) registration.value = null;
		},
	});
	return {
		trailing: computed(() => {
			const action = registration.value?.action;
			return action ? (Array.isArray(action) ? action : [action]) : [];
		}),
	};
};

export const useAppBarActions = (
	action: MaybeRefOrGetter<AppBarAction | AppBarAction[] | null>,
) => {
	const context = inject(appBarActionsKey);
	if (!context)
		throw new Error(
			'AppBar actions require a layout with provideAppBarActions.',
		);
	const owner = Symbol('page-app-bar-action');
	watchEffect(() => context.register({ owner, action: toValue(action) }));
	onScopeDispose(() => context.clear(owner));
};
