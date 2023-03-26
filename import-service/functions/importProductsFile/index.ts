import { handlerPath } from './../../../libs/handler-resolver';

export default {
	handler: `${handlerPath(__dirname)}/handler.main`,
	events: [
		{
			http: {
				method: 'get',
				path: '/import',
				cors: true,
				request: {
					parameters: {
						querystrings: {
							name: true,
						},
					},
				},
				authorizer: {
					arn: '${self:provider.environment.BASIC_AUTHORIZER_ARN}',
					type: 'request',
					identitySource: 'method.request.header.Authorization',
					resultTtlInSeconds: 0
				},
			},
		},
	],
};
