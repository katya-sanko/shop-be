import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

import importProductsFile from './functions/importProductsFile';
dotenv.config()

const serverlessConfiguration: AWS = {
	service: 'import-service',
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
			CSV_BUCKET_NAME: process.env.CSV_BUCKET_NAME
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
		],
		httpApi: {
			cors: true,
		},
	},
	// import the function via paths
	functions: { importProductsFile },
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
