import type { EIP1193Provider, HexString } from "./types";

const BALANCE_OF_SELECTOR = "70a08231";

export function isEvmAddress(value: string): value is HexString {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function normalizeAddress(value: string): HexString {
  if (!isEvmAddress(value)) {
    throw new Error("A valid 20-byte EVM address is required.");
  }
  return value.toLowerCase() as HexString;
}

export function encodeBalanceOf(owner: string): HexString {
  const address = normalizeAddress(owner).slice(2);
  return `0x${BALANCE_OF_SELECTOR}${address.padStart(64, "0")}`;
}

export async function getErc721Balance(
  provider: EIP1193Provider,
  collectionAddress: string,
  owner: string,
): Promise<bigint> {
  const to = normalizeAddress(collectionAddress);
  const data = encodeBalanceOf(owner);
  const result = await provider.request<unknown>({
    method: "eth_call",
    params: [{ to, data }, "latest"],
  });

  if (typeof result !== "string" || !/^0x[a-fA-F0-9]+$/.test(result)) {
    throw new Error("The collection contract returned an invalid balance.");
  }

  return BigInt(result);
}

