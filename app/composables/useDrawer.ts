import type { Component } from 'vue';
import { computed, markRaw, shallowReadonly, shallowRef } from 'vue';

export type DrawerPosition = 'top' | 'right' | 'bottom' | 'left';

export interface DrawerOpenOptions {
	width?: string | number;
	height?: string | number;
	title?: string;
	position?: DrawerPosition;
	data?: unknown;
	stack?: boolean;
}

interface DrawerState {
	id: number;
	component: Component;
	options: DrawerOpenOptions;
}

const drawerStack = shallowRef<DrawerState[]>([]);
let drawerId = 0;

export const useDrawer = () => {
	const open = (component: Component, options: DrawerOpenOptions = {}) => {
		const item = { id: ++drawerId, component: markRaw(component), options };
		drawerStack.value = options.stack ? [...drawerStack.value, item] : [item];
	};

	const close = (id?: number) => {
		const top = drawerStack.value.at(-1);
		if (id !== undefined && top?.id !== id) return;
		drawerStack.value = drawerStack.value.slice(0, -1);
	};

	return {
		close,
		open,
		state: computed(() => drawerStack.value.at(-1) ?? null),
		stack: shallowReadonly(drawerStack),
	};
};
