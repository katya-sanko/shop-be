import { middyfy } from '../../../libs/lambda';
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

const basicAuthorizer = async (event: APIGatewayRequestAuthorizerEvent) => {
	console.log(`basicAuthorizer ${event}`);

	try {
		const header = event.headers?.Authorization;
		if (!header) {
			throw 'Authorizer won\'t be invoked. Please provide Authorization header';
		}

		const token = header.split(' ')?.[1];
		if (!token) {
			throw 'Invalid token';
		}

		const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
		const [login, password] = decodedToken.split(':');
		if (!login || !password) {
			throw 'Empty parsed login-password pair';
		}

		const isAuthorized = process.env[login] === password;

		console.log(`isAuthorized: ${isAuthorized}`);

		if (!isAuthorized) {
			throw 'Unauthorized login-password pair';
		}

		return generatePolicy(true);
	} catch (error) {
		console.log(JSON.stringify({ error: error }));
		return generatePolicy(false);
	}
};

const generatePolicy = (isAllowed = false) => ({
	principalId: 'basic authorizer',
	policyDocument: {
		Version: '2012-10-17',
		Statement: {
			Action: 'execute-api:Invoke',
			Effect: isAllowed ? 'Allow' : 'Deny',
			Resource: '*',
		},
	},
});

export const main = middyfy(basicAuthorizer);
