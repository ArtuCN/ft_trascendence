import { type Chain } from "viem";

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
} as const satisfies Chain;

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
} as const satisfies Chain;

export const chains: Chain[] = [myLocalChain, fujiC];
