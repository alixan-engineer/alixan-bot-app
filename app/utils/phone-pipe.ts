export const phonePipe = (value?: string | null): string => {
	if (!value) return '';

	let digits = value.replace(/\D/g, '');
	if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
		digits = digits.slice(1);
	}

	if (digits.length !== 10) return value;

	return `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
};
