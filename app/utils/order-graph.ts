export const toAlmatyDay = (timestamp: number) => {
	const parts = new Intl.DateTimeFormat('en-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: 'Asia/Almaty',
	}).formatToParts(new Date(timestamp));
	const part = (type: string) =>
		parts.find((item) => item.type === type)?.value;
	return `${part('year')}-${part('month')}-${part('day')}`;
};

export const buildOrderGraph = (
	orders: Array<{ createdAt: number }>,
	from: string,
	to: string,
) => {
	const counts = new Map<string, number>();
	const weekdayCounts = Array.from({ length: 7 }, () => 0);
	const hourCounts = Array.from({ length: 24 }, () => 0);
	for (
		let time = Date.parse(`${from}T00:00:00+05:00`);
		time <= Date.parse(`${to}T23:59:59+05:00`);
		time += 86_400_000
	) {
		counts.set(toAlmatyDay(time), 0);
	}
	let total = 0;
	for (const order of orders) {
		const day = toAlmatyDay(order.createdAt);
		if (!counts.has(day)) continue;
		counts.set(day, counts.get(day)! + 1);
		weekdayCounts[(new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7]! += 1;
		hourCounts[new Date(order.createdAt + 5 * 3_600_000).getUTCHours()]! += 1;
		total += 1;
	}
	return {
		graph: [...counts].map(([date, count]) => ({ date, count })),
		weekdayPoints: weekdayCounts.map((count, weekday) => ({ weekday, count })),
		hourPoints: hourCounts.map((count, hour) => ({ hour, count })),
		total,
	};
};
