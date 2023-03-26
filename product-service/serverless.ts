import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

import getProductsList from './functions/getProductsList';
import getProductsById from './functions/getProductsById';
import createProduct from './functions/createProduct';
import { catalogBatchProcess } from './functions/catalogBatchProcess';

dotenv.config()

const serverlessConfiguration: AWS = {
	service: 'shop-be',
	frameworkVersion: '3',
	plugins: ['serverless-esbuild'],
	provider: {
		name: 'aws',
		region: 'eu-west-1',
		runtime: 'nodejs14.x',
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
			PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME,
			STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME,
			CREATE_PRODUCT_TOPIC_ARN: { Ref: 'CreateProductTopic' },
			PRODUCTS_ARN: process.env.PRODUCTS_ARN,
			STOCKS_ARN: process.env.STOCKS_ARN,
		},
		iamRoleStatements: [
			{
				Effect: 'Allow',
				Action: 'dynamodb:*',
				Resource: process.env.PRODUCTS_ARN,
			},
			{
				Effect: 'Allow',
				Action: 'dynamodb:*',
				Resource: process.env.STOCKS_ARN,
			},
			{
				Effect: 'Allow',
				Action: 'sqs:*',
				Resource: { 'Fn::GetAtt': ['CatalogItemsQueue', 'Arn'] },
			},
			{
				Effect: 'Allow',
				Action: 'sns:*',
				Resource: { Ref: 'CreateProductTopic' },
			},
		],

	},
	// import the function via paths
	functions: { catalogBatchProcess, getProductsList, getProductsById, createProduct },
	resources: {
		Resources: {
			CatalogItemsQueue: {
				Type: 'AWS::SQS::Queue',
				Properties: {
					QueueName: 'CatalogItemsQueue',
				},
			},
			CreateProductTopic: {
				Type: 'AWS::SNS::Topic',
				Properties: {
					TopicName: 'CreateProductTopic',
				},
			},
			CreateProductSubscription: {
				Type: 'AWS::SNS::Subscription',
				Properties: {
					Endpoint: process.env.EMAIL_TEST,
					Protocol: 'email',
					TopicArn: { Ref: 'CreateProductTopic' },
				},
			},
		},
	},
	package: { individually: true },
	custom: {
		esbuild: {
			bundle: true,
			minify: false,
			sourcemap: true,
			exclude: ['aws-sdk'],
			target: 'node14',
			define: { 'require.resolve': undefined },
			platform: 'node',
			concurrency: 10,
		},
	},
};

module.exports = serverlessConfiguration;
