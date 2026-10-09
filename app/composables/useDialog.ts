import type { Component } from 'vue';
import { markRaw } from 'vue';
import { shallowRef } from 'vue';

export interface DialogOpenOptions {
	width?: string;
	height?: string;
	title?: string;
	data?: Record<string, unknown>;
}

interface DialogState {
	id: number;
	component: Component;
	options: DialogOpenOptions;
}

const dialogState = shallowRef<DialogState[]>([]);
let dialogId = 0;
let openDialogStack: symbol[] = [];

export const registerOpenDialog = (token: symbol): void => {
	openDialogStack = [...openDialogStack, token];
	document.body.style.overflow = 'hidden';
};

export const unregisterOpenDialog = (token: symbol): void => {
	openDialogStack = openDialogStack.filter(item => item !== token);

	if (!openDialogStack.length) {
		document.body.style.overflow = '';
	}
};

export const isTopDialog = (token: symbol): boolean =>
	openDialogStack[openDialogStack.length - 1] === token;

export const useDialog = () => {
	const open = (component: Component, options: DialogOpenOptions = {}): void => {
		dialogId += 1;
		dialogState.value = [
			...dialogState.value,
			{
				id: dialogId,
				component: markRaw(component),
				options,
			},
		];
	};

	const close = (id?: number): void => {
		if (id === undefined) {
			dialogState.value = dialogState.value.slice(0, -1);
			return;
		}

		dialogState.value = dialogState.value.filter(dialog => dialog.id !== id);
	};

	return {
		close,
		open,
		state: readonly(dialogState),
	};
};
