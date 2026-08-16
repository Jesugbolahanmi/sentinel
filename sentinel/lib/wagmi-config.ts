import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Sentinel" }),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(),
  },
});