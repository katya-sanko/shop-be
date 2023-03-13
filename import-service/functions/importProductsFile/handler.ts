import * as AWS from 'aws-sdk';

import type { ValidatedEventAPIGatewayProxyEvent } from './../../../libs/api-gateway';
import { formatJSONResponse } from './../../../libs/api-gateway';
import { middyfy } from './../../../libs/lambda';


const importProductsFile: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	try {
		const fileName = event.pathParameters?.name;
		const params = {
			Bucket: process.env.CSV_BUCKET_NAME,
			Prefix: 'uploaded/'
		}
		const s3 = new AWS.S3({ region: 'eu-west-1' });


		const s3Response = await s3.listObjectsV2(params).promise();
		const smth = s3Response.Contents;

		console.log(`parameter: ${fileName} smth: ${JSON.stringify(smth)}`);

		const test = JSON.stringify(smth.filter(item => item.Size).map(item => `https://${process.env.CSV_BUCKET_NAME}.s3.amazonaws.com/${item.Key}`));
		console.log('-----------------------');
		console.log(test);

		return formatJSONResponse({ test, statusCode: 200 });
	} catch (error) {
		console.log(error);
		return formatJSONResponse({ message: error?.message, statusCode: 400 });
	}
};

export const main = middyfy(importProductsFile);
