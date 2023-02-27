import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { products } from '../../mocks/products';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	const pathParameters = event.pathParameters;
	const product = products.find((item) => item.id === pathParameters?.productId);

	return formatJSONResponse({ product });
};

export const main = middyfy(getProductsById);
