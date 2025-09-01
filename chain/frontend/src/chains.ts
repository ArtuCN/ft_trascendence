import { type Chain } from "viem";

// interface MyChain extends Chain {
// 	icm_registry?: string;
// 	faucet?: {
// 		recalibrate: number;
// 		assets: Array<{
// 			address: string;
// 			decimals: number;
// 			drip_amount: number;
// 			rate_limit: {
// 				max_limit: number;
// 				window_size: number;
// 			};
// 		}>;
// 	};
// }


export const myLocalChain = {
	id: 9999,
	name: "myblockchain",
	nativeCurrency: { name: "TOK token", symbol: "TOK", decimals: 18 },
	rpcUrls: {
		default: { http: ["http://localhost:5173/rpc"] },
	},
	blockExplorers: {
		default: { name: "Local", url: "" },
	},
	contracts: {
		multicall3: {
			address: "0x0000000000000000000000000000000000000000",
			blockCreated: 0,
		},
	},
	testnet: true,
} as const satisfies Chain

export const fujiC = {
	id: 43113,
	name: "Fuji C-Chain",
	nativeCurrency: { name: "Avalanche Fuji", symbol: "AVAX", decimals: 18 },
	rpcUrls: {
		default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
	},
	blockExplorers: {
		default: { name: "SnowTrace", url: "https://testnet.snowtrace.io", apiUrl: "https://api-testnet.snowtrace.io" },
	},
	contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 7096959,
        },
        teleporterMessenger: {
            address: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        },
	},
	testnet: true,
	// icm_registry: "0xF86Cb19Ad8405AEFa7d09C778215D2Cb6eBfB228",
    // faucet: {
        // recalibrate: 30,
        // assets: [
            // {
                // address: "native",
                // decimals: 18,
                // drip_amount: 0.05, // max .05 token per request
                // rate_limit: { // max 1 request in 24hrs
                    // max_limit: 1,
                    // window_size: 24 * 60 * 60 * 1000
                // }
            // },
            // {
                // address: "0x8D6f0E153B1D4Efb46c510278Db3678Bb1Cc823d",
                // decimals: 18,
                // drip_amount: 2, // max 2 token per request
                // rate_limit: { // max 1 request in 24hrs
                    // max_limit: 1,
                    // window_size: 24 * 60 * 60 * 1000
                // }
            // }
        // ]
    // }
} as const satisfies Chain

export const chains: Chain[] = [myLocalChain, fujiC]
