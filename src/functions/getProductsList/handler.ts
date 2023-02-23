import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as productsJson from './products.json';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  return formatJSONResponse({
	products: productsJson,
  });
};

export const main = middyfy(getProductsList);
