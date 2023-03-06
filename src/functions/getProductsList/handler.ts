import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const prettify = (data:any) => data.Items?.map((item) => unmarshall(item));

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {

	try {
		const dbClient = new DynamoDBClient({ region: 'eu-west-1' });
		const [productsData, stocksData] = await Promise.all([
			dbClient.send(new ScanCommand({ TableName: process.env.PRODUCTS_TABLE_NAME })),
			dbClient.send(new ScanCommand({ TableName: process.env.STOCKS_TABLE_NAME })),
		]);

		const products = prettify(productsData);
		const stocks = prettify(stocksData);

		const merged = products.map((product) => {
			const stock = stocks.find(({ product_id }) => product_id === product.id);
			
			return {
				id: product.id,
				count: stock.count || 0,
				price: 200,
				title: product.title,
				description: product.description
			}
		})

		return formatJSONResponse({ products: merged, statusCode: 200 });

	} catch (error) {
		console.log(error);
		return formatJSONResponse({ message: error?.message, statusCode: 200 });
	}
};

export const main = middyfy(getProductsList);
