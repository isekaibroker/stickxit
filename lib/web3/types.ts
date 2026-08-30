export type HexString = `0x${string}`;

export interface EIP1193RequestArguments {
  method: string;
  params?: readonly unknown[] | Record<string, unknown>;
}

export interface EIP1193Provider {
  request<T = unknown>(args: EIP1193RequestArguments): Promise<T>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  providers?: EIP1193Provider[];
}

export interface EIP1193Error extends Error {
  code?: number;
  data?: unknown;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

export interface DiscoveredWallet extends EIP6963ProviderDetail {
  source: "eip6963" | "legacy";
}

export interface AddEthereumChainParameter {
  chainId: HexString;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export interface ChainConfig extends AddEthereumChainParameter {
  id: number;
}

export type WalletConnectionStatus =
  | "discovering"
  | "idle"
  | "restoring"
  | "connecting"
  | "connected"
  | "switching-chain"
  | "signing"
  | "error";

export type OwnershipStatus =
  | "not-configured"
  | "idle"
  | "checking"
  | "owned"
  | "not-owned"
  | "error";

export interface OwnershipState {
  status: OwnershipStatus;
  balance: bigint | null;
  error: string | null;
}

export interface LicenseActivation {
  version: 2;
  address: HexString;
  chainId: number;
  signature: HexString;
  message: string;
  signedAt: string;
  ownershipVerified: true;
  collectionAddress: HexString;
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }

  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent<EIP6963ProviderDetail>;
    "eip6963:requestProvider": Event;
  }
}

