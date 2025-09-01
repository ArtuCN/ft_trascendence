import { type Chain } from "viem";
import { http, createConfig } from "wagmi";


export const myLocalChain = {
	id: 9999,
	name: "myblockchain",
	nativeCurrency: { name: "TOK token", symbol: "TOK", decimals: 18 },
	rpcUrls: {
		default: { http: ["http://127.0.0.1:9650/ext/bc/RqqzuZQfYZwdwZKCxyUFEd59GMavof325DfkUtckXDCEebz1q/rpc"] },
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
} as const satisfies Chain

export const wagmiConfig = createConfig({
	chains: [myLocalChain],
	transports: {
		[myLocalChain.id]: http()
	},
});




