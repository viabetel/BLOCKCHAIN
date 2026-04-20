import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const liteforge = defineChain({
  id: 4441,
  name: "LitVM LiteForge",
  nativeCurrency: { name: "zkLTC", symbol: "zkLTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://liteforge.rpc.caldera.xyz/http"],
      webSocket: ["wss://liteforge.rpc.caldera.xyz/ws"],
    },
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

// Admin wallet — only this address sees the Admin panel.
export const ADMIN_WALLET = "0x375c84c7fa74d41f75ba892753ba70a716d6f256";
