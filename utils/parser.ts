import csv from 'csv-parser';

export const parseLogs = async (stream: NodeJS.ReadableStream) => {
	const logs = [];
	return new Promise((resolve, reject) => {
		stream
			.pipe(csv())
			.on('data', (data) => {
				console.log(`on data ${data}`);
				logs.push(data);
			})
			.on('end', () => {
				console.log(`on end ${JSON.stringify(logs)}`);
				resolve(logs);
			})
			.on('error', (error) => {
				console.log(`on error ${error}`);;
				reject(error);
			});
	});
}
