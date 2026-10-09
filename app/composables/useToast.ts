export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
	id: number;
	message: string;
	type: ToastType;
	duration: number;
}

const toastMessages = ref<ToastMessage[]>([]);
let toastId = 0;

export const useToast = () => {
	const remove = (id: number): void => {
		toastMessages.value = toastMessages.value.filter((toast) => toast.id !== id);
	};

	const open = (
		message: string,
		type: ToastType = 'info',
		duration = 4000,
	): void => {
		const toast: ToastMessage = {
			id: toastId++,
			message,
			type,
			duration,
		};

		toastMessages.value = [...toastMessages.value, toast];

		globalThis.setTimeout(() => {
			remove(toast.id);
		}, duration);
	};

	return {
		messages: readonly(toastMessages),
		open,
		remove,
	};
};
