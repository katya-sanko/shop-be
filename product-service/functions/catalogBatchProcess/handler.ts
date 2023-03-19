// import { v4 } from 'uuid';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import * as AWS from 'aws-sdk';

import { formatJSONResponse } from '../../../libs/api-gateway';
// import { middyfy } from '../../../libs/lambda';


const catalogBatchProcess = async (event) => {
	console.log(`catalogBatchProcess event ${event}`);

	const sns = new AWS.SNS({ region: 'eu-west-1' });
	const promises = [];
  
	try {
		////
		console.log(event.Records);
		////
	  const parsedProducts = event.Records.map(({ body }) => {

		const parsedBody = JSON.parse(body);

		return parsedBody;

	  });

	  console.log(`parsedProducts ${parsedProducts}`);

	  const dbClient = new DynamoDBClient({ region: 'eu-west-1' });
  
	  parsedProducts.forEach(async (product) => {

		const id =  new Date().getUTCMilliseconds(); //v4();

		const newProduct = {
			id: id,
			price: product.price,
			title: product.title,
			description: product.description || 'nothing special'
		};
		const newStock = {
			product_id: id,
			count: product.count || 0
		};

		const productPromise = dbClient.send(new PutItemCommand({
			TableName: process.env.PRODUCTS_TABLE_NAME,
			Item: marshall(newProduct)
		}));
  
		const stockPromise = dbClient.send(new PutItemCommand({
			TableName: process.env.STOCKS_TABLE_NAME,
			Item: marshall(newStock)
		}));
  
		promises.push(productPromise);
		promises.push(stockPromise);
	  });
  
	  await Promise.all(promises);
  
	  const processedMessages = parsedProducts
		.map((product) => JSON.stringify(product))
		.join(' ');
  
	  await sns
		.publish(
		  {
			Subject: 'Added csv products',
			Message: processedMessages,
			TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
		  },
		  () => {
			console.log('Email has been sent');
		  }
		)
		.promise();
	} catch (error) {
		console.log(error);
		return formatJSONResponse({ message: error?.message, statusCode: 500 });
	}
};

export const main = catalogBatchProcess;
