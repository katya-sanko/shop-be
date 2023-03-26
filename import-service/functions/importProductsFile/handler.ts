import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { ValidatedEventAPIGatewayProxyEvent } from './../../../libs/api-gateway';
import { formatJSONResponse } from './../../../libs/api-gateway';
import { middyfy } from './../../../libs/lambda';


const importProductsFile: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
	console.log(`queryStringParameters: ${event.queryStringParameters}`);

	try {
		const { name } = event.queryStringParameters;
		console.log(`name: ${name}`);
		const s3client = new S3Client({ region: 'eu-west-1' });

		const params = {
			Bucket: process.env.CSV_BUCKET_NAME,
			Key: `uploaded/${name}`
		}
		const signedUrl = await getSignedUrl(s3client, new PutObjectCommand(params), { expiresIn: 3600 });

		console.log(`signedUrl: ${signedUrl}`);

		return formatJSONResponse(signedUrl);
	} catch (error) {
		console.log(error);
		return formatJSONResponse({ message: error?.message, statusCode: 500 });
	}
};

export const main = middyfy(importProductsFile);
