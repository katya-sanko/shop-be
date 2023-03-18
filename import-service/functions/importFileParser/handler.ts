import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { parseLogs } from './../../../utils/parser';

const importFileParser = async (event) => {
	console.log(`importFileParser ${event?.Records}`);
	try {
		const s3client = new S3Client({ region: 'eu-west-1' });

		for (const record of event.Records) {
			const s3Data = await s3client.send(new GetObjectCommand({
				Bucket: process.env.CSV_BUCKET_NAME,
				Key: record.s3.object.key,
			}));

			await parseLogs(s3Data.Body as NodeJS.ReadableStream);

			console.log(`${JSON.stringify(record.s3.object.key)}: parse done`)
		}
	} catch (e) {
		console.log(e.message);
	}
};

export const main = importFileParser;
