import type { ValidatedEventAPIGatewayProxyEvent } from './../../../libs/api-gateway';
import { formatJSONResponse } from './../../../libs/api-gateway';
import { middyfy } from './../../../libs/lambda';

// import schema from './schema';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';


const DEFAULT_COUNT = 0;
const DEFAULT_DESCRIPTION = 'Unknown item';

const createProduct: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	try {
		const newProduct = {
			id: event.body.id,
			price: event.body.price,
			title: event.body.title,
			description: event.body.description || DEFAULT_DESCRIPTION
		};
		const newStock = {
			product_id: event.body.id,
			count: event.body.count || DEFAULT_COUNT
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
