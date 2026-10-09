export const useSidebar = () => {
	const open = useState<boolean>('sidebar', () => false);

	const toggle = () => {
		open.value = !open.value;
	};

	const show = () => {
		open.value = true;
	};

	const hide = () => {
		open.value = false;
	};

	return {
		open: readonly(open),
		toggle,
		show,
		hide,
	};
};
