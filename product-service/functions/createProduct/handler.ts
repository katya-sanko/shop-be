import type { ValidatedEventAPIGatewayProxyEvent } from './../../../libs/api-gateway';
import { formatJSONResponse } from './../../../libs/api-gateway';
import { middyfy } from './../../../libs/lambda';

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';


const DEFAULT_COUNT_PRICE = 0;
const DEFAULT_DESCRIPTION = 'Unknown item';
const DEFAULT_Title = 'Sad item';

const createProduct: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	try {
		const id = event.body.id || new Date().getUTCMilliseconds();

		const newProduct = {
			id: id,
			price: event.body.price || DEFAULT_COUNT_PRICE,
			title: event.body.title || DEFAULT_Title,
			description: event.body.description || DEFAULT_DESCRIPTION
		};
		const newStock = {
			product_id: id,
			count: event.body.count || DEFAULT_COUNT_PRICE
		};

		const dbClient = new DynamoDBClient({ region: 'eu-west-1' });
		const [productsData, stocksData] = await Promise.all([
			dbClient.send(new PutItemCommand({ TableName: process.env.PRODUCTS_TABLE_NAME, Item: marshall(newProduct) })),
			dbClient.send(new PutItemCommand({ TableName: process.env.STOCKS_TABLE_NAME, Item: marshall(newStock) })),
		]);

		console.log(productsData);
		console.log(stocksData);

		return formatJSONResponse({
			message: `${newProduct.title} added to db`,
			event,
			statusCode: 200
		});

	} catch (error) {
		return formatJSONResponse({
			message: `Error:${error?.message} occured. Please review the record fields you are trying to create`,
			event,
			statusCode: 400
		});

	}

};

export const main = middyfy(createProduct);
