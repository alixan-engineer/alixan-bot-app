type DateValue = string | number | Date | null | undefined;

const dateTimeFormatter = new Intl.DateTimeFormat('ru-KZ', {
	day: '2-digit',
	month: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Asia/Almaty',
});

const timeFormatter = new Intl.DateTimeFormat('ru-KZ', {
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
	timeZone: 'Asia/Almaty',
});

export const formatDate = (value: DateValue): string =>
	value ? dateTimeFormatter.format(new Date(value)) : '-';

export const formatTime = (value: DateValue): string =>
	value ? timeFormatter.format(new Date(value)) : '-';
