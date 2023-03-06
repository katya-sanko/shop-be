import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const prettify = (data:any) => unmarshall(data?.Item);

const getProductsById: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	try {
		const productId = event.pathParameters?.productId;
		
		const dbClient = new DynamoDBClient({ region: 'eu-west-1' });
		const [productsData, stocksData] = await Promise.all([
			dbClient.send(new GetItemCommand({ TableName: process.env.PRODUCTS_TABLE_NAME, Key: {
				id: { N: productId },
			  }, })),
			dbClient.send(new GetItemCommand({ TableName: process.env.STOCKS_TABLE_NAME, Key: {
				product_id: { N: productId },
			  }})),
		]);

		const prettifiedProduct = prettify(productsData);
		const prettifiedStock = prettify(stocksData);

		if (prettifiedProduct && prettifiedStock) {
			const product =  {...prettifiedProduct, count: prettifiedStock.count };
			return formatJSONResponse({ product, statusCode: 200 });
		} else {
			return formatJSONResponse({ message: 'Not found', statusCode: 404 });
		}

	} catch (error) {
		console.log(error);
		return formatJSONResponse({ message: error?.message, statusCode: 500 });
	}
};

export const main = middyfy(getProductsById);
