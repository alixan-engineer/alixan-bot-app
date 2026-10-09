import type { User } from './user.interface';

export interface SignInPayload {
	phone: string;
	password: string;
}

export interface SignInResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}
