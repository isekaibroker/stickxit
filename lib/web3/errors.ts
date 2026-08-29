import type { EIP1193Error } from "./types";

export function getProviderError(error: unknown, fallback: string): string {
  const providerError = error as Partial<EIP1193Error> | null;

  switch (providerError?.code) {
    case 4001:
      return "The request was cancelled in your wallet.";
    case 4100:
      return "This site is not authorized to use that wallet account.";
    case -32002:
      return "A wallet request is already open. Check your wallet to continue.";
    case 4900:
    case 4901:
      return "Your wallet is disconnected from the requested network.";
    case 4902:
      return "The requested network is not available in this wallet.";
    default:
      return providerError?.message?.trim() || fallback;
  }
}

