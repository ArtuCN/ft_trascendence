import { startServer } from "./server";
import { startSocket } from "./socket";

async function main() {
	try {
		await startServer();
		startSocket();
	} catch (err) {
		console.log(err)
	}
}

main();
