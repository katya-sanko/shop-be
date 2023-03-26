import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

import importProductsFile from './functions/importProductsFile';
import importFileParser from './functions/importFileParser';

dotenv.config()

const serverlessConfiguration: AWS = {
	service: 'import-service',
	frameworkVersion: '3',
	plugins: ['serverless-esbuild'],
	provider: {
		name: 'aws',
		region: 'eu-west-1',
		runtime: 'nodejs14.x',
		stage: 'dev',
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
			CSV_BUCKET_NAME: process.env.CSV_BUCKET_NAME,
			SQS_URL: process.env.SQS_URL,
			SQS_ARN: process.env.SQS_ARN,
			BASIC_AUTHORIZER_ARN: process.env.BASIC_AUTHORIZER_ARN,
			REST_API_ID: process.env.REST_API_ID,
		},
		iamRoleStatements: [
			{
				Effect: 'Allow',
				Action: 's3:ListBucket',
				Resource: 'arn:aws:s3:::${self:provider.environment.CSV_BUCKET_NAME}',
			},
			{
				Effect: 'Allow',
				Action: 's3:*',
				Resource: 'arn:aws:s3:::${self:provider.environment.CSV_BUCKET_NAME}/*',
			},
			{
				Effect: 'Allow',
				Action: 'sqs:*',
				Resource: process.env.SQS_ARN,
			},
		],
	},
	// import the function via paths
	functions: { importProductsFile, importFileParser },
	resources: {
		Resources: {
			AccessDeniedGwResponse: {
				Type: 'AWS::ApiGateway::GatewayResponse',
				Properties: {
					ResponseParameters: {
						'gatewayresponse.header.Access-Control-Allow-Origin': '\'*\'',
						'gatewayresponse.header.Access-Control-Allow-Headers': '\'*\'',
					},
					ResponseType: 'ACCESS_DENIED',
					RestApiId: process.env.REST_API_ID,
				},
			},
			UnauthorizedGwResponse: {
				Type: 'AWS::ApiGateway::GatewayResponse',
				Properties: {
					ResponseParameters: {
						'gatewayresponse.header.Access-Control-Allow-Origin': '\'*\'',
						'gatewayresponse.header.Access-Control-Allow-Headers': '\'*\'',
					},
					ResponseType: 'UNAUTHORIZED',
					RestApiId: process.env.REST_API_ID,
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
