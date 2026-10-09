export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
	type: ToastType;
	title: string;
	description?: string;
}

export interface ToastItem extends ToastOptions {
	id: string;
	duration: number;
}
