import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { products } from '../../mocks/products';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	return formatJSONResponse({ products });
};

export const main = middyfy(getProductsList);
