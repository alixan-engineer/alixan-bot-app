import type { Component } from 'vue';

export interface DialogOpenOptions {
	width?: number;
	height?: number;
	data?: object;
}

export interface DialogItem extends DialogOpenOptions {
	id: string;
	component: Component;
}
