import type { ChainConfig, HexString } from "./types";

const KNOWN_CHAINS: Record<number, Omit<ChainConfig, "id" | "chainId">> = {
  1: {
    chainName: "Ethereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://ethereum-rpc.publicnode.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  137: {
    chainName: "Polygon",
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  8453: {
    chainName: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  11155111: {
    chainName: "Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  84532: {
    chainName: "Base Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
};

function parseConfiguredChainId(value: string | undefined): number | null {
  const normalized = value?.trim();
  if (!normalized) return null;

  const parsed = normalized.toLowerCase().startsWith("0x")
    ? Number.parseInt(normalized.slice(2), 16)
    : Number.parseInt(normalized, 10);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export const chainConfigured =
  parseConfiguredChainId(process.env.NEXT_PUBLIC_CHAIN_ID) !== null;

export function toChainHex(chainId: number): HexString {
  return `0x${chainId.toString(16)}`;
}

function optionalUrlList(value: string | undefined): string[] | undefined {
  const urls = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return urls?.length ? urls : undefined;
}

function readDecimals(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "18", 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 18;
}

export function getConfiguredChain(): ChainConfig {
  const explicitId = parseConfiguredChainId(process.env.NEXT_PUBLIC_CHAIN_ID);
  // ChainConfig retains a structurally valid fallback ID, but consumers must use
  // chainConfigured before presenting or enforcing a target network.
  const id = explicitId ?? 1;
  const known = explicitId ? KNOWN_CHAINS[id] : undefined;
  const rpcUrls = optionalUrlList(process.env.NEXT_PUBLIC_CHAIN_RPC_URLS)
    ?? optionalUrlList(process.env.NEXT_PUBLIC_CHAIN_RPC_URL)
    ?? known?.rpcUrls
    ?? [];
  const blockExplorerUrls = optionalUrlList(
    process.env.NEXT_PUBLIC_CHAIN_EXPLORER_URLS,
  )
    ?? optionalUrlList(process.env.NEXT_PUBLIC_CHAIN_EXPLORER_URL)
    ?? known?.blockExplorerUrls;

  return {
    id,
    chainId: toChainHex(id),
    chainName: explicitId
      ? process.env.NEXT_PUBLIC_CHAIN_NAME || known?.chainName || `Chain ${id}`
      : "Any EVM network",
    nativeCurrency: {
      name:
        process.env.NEXT_PUBLIC_NATIVE_CURRENCY_NAME
        || known?.nativeCurrency.name
        || "Native token",
      symbol:
        process.env.NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL
        || known?.nativeCurrency.symbol
        || "ETH",
      decimals: readDecimals(
        process.env.NEXT_PUBLIC_NATIVE_CURRENCY_DECIMALS,
      ),
    },
    rpcUrls,
    blockExplorerUrls,
  };
}

export const configuredChain = getConfiguredChain();

export const configuredCollectionAddress =
  process.env.NEXT_PUBLIC_ISEKAI_COLLECTION_ADDRESS?.trim() || null;
