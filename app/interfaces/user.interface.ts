export interface User {
	_id: string;
	phone: string;
	name: string;
	role: 'admin' | 'worker';
	orderBotEnabled: boolean;
}
