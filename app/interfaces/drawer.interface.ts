import type { Component } from 'vue';

export interface DrawerOpenOptions {
	width: number;
	height: number;
	data?: object;
}

export interface DrawerItem extends DrawerOpenOptions {
	id: string;
	component: Component;
}
