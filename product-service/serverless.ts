import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

import hello from './functions//hello';
import getProductsList from './functions/getProductsList';
import getProductsById from './functions/getProductsById';
import createProduct from './functions/createProduct';

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
			STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME
		},
	},
	// import the function via paths
	functions: { hello, getProductsList, getProductsById, createProduct },
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
