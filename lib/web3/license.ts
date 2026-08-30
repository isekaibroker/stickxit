import type {
  EIP1193Provider,
  HexString,
  LicenseActivation,
} from "./types";
import { normalizeAddress } from "./erc721";

const STORAGE_PREFIX = "stickxit:broker-license:v2";

export function getLicenseStorageKey(address: string, chainId: number): string {
  return `${STORAGE_PREFIX}:${chainId}:${normalizeAddress(address)}`;
}

export function createLicenseMessage(address: string, chainId: number, collectionAddress: string): string {
  const now = new Date().toISOString();
  const origin = typeof window === "undefined" ? "unknown" : window.location.origin;
  const nonce = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return [
    "Stickxit Broker Access",
    "",
    "Authorize this wallet for Stickxit Broker features.",
    `Origin: ${origin}`,
    `Wallet: ${normalizeAddress(address)}`,
    `Chain ID: ${chainId}`,
    `Collection: ${normalizeAddress(collectionAddress)}`,
    `Issued at: ${now}`,
    `Nonce: ${nonce}`,
    "",
    "This signature does not submit a transaction, transfer funds, or stake an NFT.",
    "Production actions will recheck ownership independently.",
  ].join("\n");
}

export function utf8ToHex(value: string): HexString {
  const bytes = new TextEncoder().encode(value);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function signLicenseActivation(
  provider: EIP1193Provider,
  address: string,
  chainId: number,
  options: {
    ownershipVerified: true;
    collectionAddress: string;
  },
): Promise<LicenseActivation> {
  const normalizedAddress = normalizeAddress(address);
  const normalizedCollection = normalizeAddress(options.collectionAddress);
  const message = createLicenseMessage(normalizedAddress, chainId, normalizedCollection);
  const signature = await provider.request<unknown>({
    method: "personal_sign",
    params: [utf8ToHex(message), normalizedAddress],
  });

  if (typeof signature !== "string" || !/^0x[a-fA-F0-9]+$/.test(signature)) {
    throw new Error("The wallet returned an invalid signature.");
  }

  const activation: LicenseActivation = {
    version: 2,
    address: normalizedAddress,
    chainId,
    signature: signature as HexString,
    message,
    signedAt: new Date().toISOString(),
    ownershipVerified: options.ownershipVerified,
    collectionAddress: normalizedCollection,
  };

  window.localStorage.setItem(
    getLicenseStorageKey(normalizedAddress, chainId),
    JSON.stringify(activation),
  );

  return activation;
}

export function readLicenseActivation(
  address: string,
  chainId: number,
  collectionAddress: string,
): LicenseActivation | null {
  try {
    const raw = window.localStorage.getItem(
      getLicenseStorageKey(address, chainId),
    );
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<LicenseActivation>;
    if (
      parsed.version !== 2
      || parsed.chainId !== chainId
      || parsed.address !== normalizeAddress(address)
      || parsed.ownershipVerified !== true
      || parsed.collectionAddress !== normalizeAddress(collectionAddress)
      || typeof parsed.signature !== "string"
      || typeof parsed.message !== "string"
      || typeof parsed.signedAt !== "string"
    ) {
      return null;
    }
    return parsed as LicenseActivation;
  } catch {
    return null;
  }
}

export function clearLicenseActivation(address: string, chainId: number): void {
  window.localStorage.removeItem(getLicenseStorageKey(address, chainId));
}
