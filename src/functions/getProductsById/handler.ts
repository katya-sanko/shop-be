import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { products } from '../../mocks/products';

const DEFAULT_STATUS = 418;

const getProductsById: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	try {
		const pathParameters = event.pathParameters;
		const product = products.find((item) => item.id === pathParameters?.productId);
		const statusCode = product ? 200 : 404;

		return formatJSONResponse({ product, statusCode });
	} catch (e) {
		return formatJSONResponse({ statusCode: DEFAULT_STATUS });
	}
};

export const main = middyfy(getProductsById);
