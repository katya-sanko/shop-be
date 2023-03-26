import csv from 'csv-parser';
import * as AWS from 'aws-sdk'

const sqs = new AWS.SQS()
const s3 = new AWS.S3({ region: 'eu-west-1' })


const importFileParser = async (event) => {
	console.log(`importFileParser ${event?.Records}`);
	try {
		const csvKey = event.Records[0].s3.object.key;
		const [prefix, name] = csvKey.split('/');

		const params = {
			Bucket: process.env.CSV_BUCKET_NAME,
			Key: `${prefix}/${name}`,
		};

		const readStream = s3.getObject(params).createReadStream();

		await new Promise<void>((resolve, reject) => {
			readStream
				.pipe(csv())
				.on('data', async (data) => {
					console.log('DATA ********', data);
					const message = JSON.stringify(data);
					console.log('process.env.SQS_URL', process.env.SQS_URL);
					console.log('process.env.SQS_ARN', process.env.SQS_ARN);
					await sqs.sendMessage(
						{ QueueUrl: process.env.SQS_URL, MessageBody: message },
						(err, output) => {
							if (err) {
								console.log('Error', err);
							} else {
								console.log('Success', output.MessageId);
							}
						}
					);
				})
				.on('error', (err) => {
					console.log('ERROR',err )
					reject(err)
				})
				.on('end', () => {
					resolve()
				})
		})
	} catch (error) {
		console.log(error.message);
	}
};

export const main = importFileParser;
