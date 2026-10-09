import type { Component } from 'vue';
import { markRaw } from 'vue';
import { shallowRef } from 'vue';

export type DrawerPosition = 'top' | 'right' | 'bottom' | 'left';

export interface DrawerOpenOptions {
	width?: string | number;
	height?: string | number;
	title?: string;
	position?: DrawerPosition;
	data?: unknown;
}

interface DrawerState {
	component: Component;
	options: DrawerOpenOptions;
}

const drawerState = shallowRef<DrawerState | null>(null);

export const useDrawer = () => {
	const open = (component: Component, options: DrawerOpenOptions = {}) => {
		drawerState.value = {
			component: markRaw(component),
			options,
		};
	};

	const close = () => {
		drawerState.value = null;
	};

	return {
		close,
		open,
		state: drawerState,
	};
};
