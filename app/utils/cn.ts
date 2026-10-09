type ClassValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Record<string, boolean | null | undefined>
	| ClassValue[];

export const cn = (...inputs: ClassValue[]): string => {
	return inputs
		.flatMap((input): ClassValue[] => (Array.isArray(input) ? input : [input]))
		.flatMap(input => {
			if (!input) return [];

			if (typeof input === 'string' || typeof input === 'number')
				return String(input);

			if (typeof input === 'object' && !Array.isArray(input))
				return Object.keys(input).filter(className => input[className]);

			return [];
		})
		.join(' ');
};
