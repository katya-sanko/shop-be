export default {
	type: "object",
	properties: {
		id: { type: 'number' },
		count: { type: 'number' },
		price: { type: 'number' },
		title: { type: 'string' },
		description: { type: 'string' }
	},
	required: ['id', 'title', 'price']
} as const;
