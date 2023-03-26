import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: any) => {
	return {
		headers: { ...defaultHeaders },
		statusCode: response.statusCode,
		body: JSON.stringify(response)
	}
}

const defaultHeaders = {
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Allow-Origin': '*',
}
