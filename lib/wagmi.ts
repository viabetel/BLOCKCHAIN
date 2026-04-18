import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const liteforge = defineChain({
  id: 4441,
  name: "LiteForge",
  nativeCurrency: { name: "zkLTC", symbol: "zkLTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://liteforge.rpc.caldera.xyz/http"] },
  },
  blockExplorers: {
    default: {
      name: "LiteForge Explorer",
      url: "https://liteforge.explorer.caldera.xyz",
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [liteforge],
  connectors: [injected()],
  transports: { [liteforge.id]: http() },
  ssr: true,
});
