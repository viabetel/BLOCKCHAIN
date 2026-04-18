import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

/**
 * LitVM's LiteForge testnet.
 * Source: https://docs.litvm.com/other-resources/faq
 */
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

export const wagmiConfig = getDefaultConfig({
  appName: "Silvercast",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "silvercast-dev",
  chains: [liteforge],
  transports: {
    [liteforge.id]: http(),
  },
  ssr: true,
});
