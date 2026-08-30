"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  chainConfigured,
  configuredChain,
  configuredCollectionAddress,
  getErc721Balance,
  getProviderError,
  isEvmAddress,
  normalizeAddress,
  readLicenseActivation,
  signLicenseActivation,
  utf8ToHex,
  type DiscoveredWallet,
  type EIP1193Provider,
  type EIP6963ProviderDetail,
  type HexString,
  type LicenseActivation,
  type OwnershipState,
  type WalletConnectionStatus,
} from "@/lib/web3";

const AUTO_CONNECT_KEY = "stickxit:wallet:auto-connect";
const PREFERRED_WALLET_KEY = "stickxit:wallet:preferred-provider";

const INITIAL_OWNERSHIP: OwnershipState = {
  status: chainConfigured && configuredCollectionAddress ? "idle" : "not-configured",
  balance: null,
  error: null,
};

export interface WalletContextValue {
  wallets: DiscoveredWallet[];
  activeWallet: DiscoveredWallet | null;
  walletName: string | null;
  address: HexString | null;
  shortAddress: string | null;
  chainId: number | null;
  status: WalletConnectionStatus;
  error: string | null;
  isConnected: boolean;
  isCorrectChain: boolean;
  chainConfigured: boolean;
  /** Compatibility alias for isConnected. */
  connected: boolean;
  /** Compatibility alias for isCorrectChain. */
  correctChain: boolean;
  hasBroker: boolean;
  nftBalance: number;
  licenseActive: boolean;
  targetChain: typeof configuredChain;
  collectionAddress: string | null;
  ownership: OwnershipState;
  license: LicenseActivation | null;
  connect(providerId?: string): Promise<void>;
  disconnect(): void;
  refreshWallets(): void;
  switchToConfiguredChain(): Promise<void>;
  /** Compatibility alias for switchToConfiguredChain. */
  switchNetwork(): Promise<void>;
  refreshOwnership(): Promise<bigint | null>;
  activateLicense(): Promise<LicenseActivation | null>;
  signMessage(message: string): Promise<string>;
  clearError(): void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function inferLegacyWalletName(provider: EIP1193Provider, index: number): string {
  if (provider.isRabby) return "Rabby Wallet";
  if (provider.isCoinbaseWallet) return "Coinbase Wallet";
  if (provider.isMetaMask) return "MetaMask";
  return index ? `Browser Wallet ${index + 1}` : "Browser Wallet";
}

function parseChainId(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, value.startsWith("0x") ? 16 : 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function isProviderDetail(value: unknown): value is EIP6963ProviderDetail {
  const candidate = value as Partial<EIP6963ProviderDetail> | null;
  return Boolean(
    candidate?.provider
    && typeof candidate.provider.request === "function"
    && candidate.info?.uuid
    && candidate.info?.name
    && candidate.info?.rdns,
  );
}

function safeWalletIcon(icon: string): string | null {
  return /^data:image\/(?:png|jpeg|webp|svg\+xml);/i.test(icon) ? icon : null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [activeWallet, setActiveWallet] = useState<DiscoveredWallet | null>(null);
  const [address, setAddress] = useState<HexString | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [status, setStatus] = useState<WalletConnectionStatus>("discovering");
  const [error, setError] = useState<string | null>(null);
  const [ownership, setOwnership] = useState<OwnershipState>(INITIAL_OWNERSHIP);
  const [license, setLicense] = useState<LicenseActivation | null>(null);
  const attemptedRestoreIds = useRef(new Set<string>());
  const restoreInFlight = useRef(false);

  const addWallet = useCallback((wallet: DiscoveredWallet) => {
    setWallets((current) => {
      const matchingProvider = current.find(
        (candidate) => candidate.provider === wallet.provider,
      );
      if (matchingProvider) {
        if (
          matchingProvider.source === "legacy"
          && wallet.source === "eip6963"
        ) {
          return current.map((candidate) =>
            candidate.provider === wallet.provider ? wallet : candidate,
          );
        }
        return current;
      }

      if (current.some((candidate) => candidate.info.uuid === wallet.info.uuid)) {
        return current;
      }
      return [...current, wallet];
    });
  }, []);

  const refreshWallets = useCallback(() => {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }, []);

  useEffect(() => {
    const announce = (event: WindowEventMap["eip6963:announceProvider"]) => {
      if (!isProviderDetail(event.detail)) return;
      addWallet({
        ...event.detail,
        info: {
          ...event.detail.info,
          icon: safeWalletIcon(event.detail.info.icon) ?? "",
        },
        source: "eip6963",
      });
    };

    window.addEventListener("eip6963:announceProvider", announce);
    refreshWallets();

    const legacyTimer = window.setTimeout(() => {
      const injected = window.ethereum;
      if (!injected) return;
      const legacyProviders = injected.providers?.length
        ? injected.providers
        : [injected];

      setWallets((current) => {
        // window.ethereum is a compatibility fallback only when EIP-6963 found none.
        if (current.length) return current;
        return legacyProviders.map((provider, index) => {
          const name = inferLegacyWalletName(provider, index);
          return {
            provider,
            source: "legacy" as const,
            info: {
              uuid: `legacy-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
              name,
              icon: "",
              rdns: `legacy.${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}`,
            },
          };
        });
      });
    }, 200);

    const discoveryTimer = window.setTimeout(() => {
      setStatus((current) => current === "discovering" ? "idle" : current);
    }, 350);

    return () => {
      window.clearTimeout(discoveryTimer);
      window.clearTimeout(legacyTimer);
      window.removeEventListener("eip6963:announceProvider", announce);
    };
  }, [addWallet, refreshWallets]);

  const beginSession = useCallback(async (
    wallet: DiscoveredWallet,
    nextAddress: string,
  ) => {
    if (!isEvmAddress(nextAddress)) {
      throw new Error("The wallet returned an invalid account address.");
    }
    const nextChain = parseChainId(
      await wallet.provider.request<unknown>({ method: "eth_chainId" }),
    );
    if (!nextChain) {
      throw new Error("The wallet returned an invalid network identifier.");
    }

    const normalizedAddress = normalizeAddress(nextAddress);
    setActiveWallet(wallet);
    setAddress(normalizedAddress);
    setChainId(nextChain);
    setLicense(configuredCollectionAddress
      ? readLicenseActivation(normalizedAddress, nextChain, configuredCollectionAddress)
      : null);
    setOwnership(INITIAL_OWNERSHIP);
    setError(null);
    setStatus("connected");
    window.localStorage.setItem(AUTO_CONNECT_KEY, "enabled");
    // rdns is used only as a convenience hint, never as a security identity.
    window.localStorage.setItem(PREFERRED_WALLET_KEY, wallet.info.rdns);
  }, []);

  useEffect(() => {
    if (
      activeWallet
      || restoreInFlight.current
      || !wallets.length
      || window.localStorage.getItem(AUTO_CONNECT_KEY) !== "enabled"
    ) {
      return;
    }

    const preferredRdns = window.localStorage.getItem(PREFERRED_WALLET_KEY);
    const uniquePreferredRdns = preferredRdns
      && wallets.filter((wallet) => wallet.info.rdns === preferredRdns).length === 1
      ? preferredRdns
      : null;
    const candidates = [...wallets].sort((left, right) => {
      if (left.info.rdns === uniquePreferredRdns) return -1;
      if (right.info.rdns === uniquePreferredRdns) return 1;
      return 0;
    }).filter((wallet) => !attemptedRestoreIds.current.has(wallet.info.uuid));

    if (!candidates.length) return;
    restoreInFlight.current = true;
    setStatus("restoring");

    void (async () => {
      for (const wallet of candidates) {
        attemptedRestoreIds.current.add(wallet.info.uuid);
        try {
          const accounts = await wallet.provider.request<unknown>({
            method: "eth_accounts",
          });
          const firstAccount = Array.isArray(accounts) ? accounts[0] : null;
          if (typeof firstAccount === "string" && isEvmAddress(firstAccount)) {
            await beginSession(wallet, firstAccount);
            restoreInFlight.current = false;
            return;
          }
        } catch {
          // Silent by design: eth_accounts restoration must never interrupt the page.
        }
      }
      restoreInFlight.current = false;
      setStatus("idle");
    })();
  }, [activeWallet, beginSession, wallets]);

  useEffect(() => {
    if (!activeWallet) return;

    const provider = activeWallet.provider;
    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0];
      const firstAccount = Array.isArray(accounts) ? accounts[0] : null;
      if (typeof firstAccount === "string" && isEvmAddress(firstAccount)) {
        const normalizedAddress = normalizeAddress(firstAccount);
        setAddress(normalizedAddress);
        setLicense(chainId === null || !configuredCollectionAddress
          ? null
          : readLicenseActivation(normalizedAddress, chainId, configuredCollectionAddress));
        setOwnership(INITIAL_OWNERSHIP);
        setError(null);
        setStatus("connected");
      } else {
        setActiveWallet(null);
        setAddress(null);
        setChainId(null);
        setLicense(null);
        setOwnership(INITIAL_OWNERSHIP);
        setStatus("idle");
      }
    };
    const handleChainChanged = (...args: unknown[]) => {
      const nextChain = parseChainId(args[0]);
      if (nextChain) {
        setChainId(nextChain);
        setLicense(address && configuredCollectionAddress
          ? readLicenseActivation(address, nextChain, configuredCollectionAddress)
          : null);
        setOwnership(INITIAL_OWNERSHIP);
        setError(null);
        setStatus("connected");
      }
    };
    const handleDisconnect = () => {
      setActiveWallet(null);
      setAddress(null);
      setChainId(null);
      setLicense(null);
      setOwnership(INITIAL_OWNERSHIP);
      setStatus("idle");
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);
    provider.on?.("disconnect", handleDisconnect);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
      provider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [activeWallet, address, chainId]);

  const connect = useCallback(async (providerId?: string) => {
    const wallet = providerId
      ? wallets.find((candidate) => candidate.info.uuid === providerId)
      : wallets[0];

    if (!wallet) {
      refreshWallets();
      setStatus("error");
      setError("No compatible browser wallet was found. Install or unlock an EVM wallet and try again.");
      return;
    }

    setStatus("connecting");
    setError(null);
    try {
      const accounts = await wallet.provider.request<unknown>({
        method: "eth_requestAccounts",
      });
      const firstAccount = Array.isArray(accounts) ? accounts[0] : null;
      if (typeof firstAccount !== "string") {
        throw new Error("No wallet account was selected.");
      }
      await beginSession(wallet, firstAccount);
    } catch (requestError) {
      setStatus("error");
      setError(getProviderError(requestError, "The wallet could not be connected."));
    }
  }, [beginSession, refreshWallets, wallets]);

  const disconnect = useCallback(() => {
    window.localStorage.setItem(AUTO_CONNECT_KEY, "disabled");
    attemptedRestoreIds.current.clear();
    setActiveWallet(null);
    setAddress(null);
    setChainId(null);
    setLicense(null);
    setOwnership(INITIAL_OWNERSHIP);
    setError(null);
    setStatus("idle");
  }, []);

  const switchToConfiguredChain = useCallback(async () => {
    if (!chainConfigured) {
      setError("No target chain is configured. Set NEXT_PUBLIC_CHAIN_ID before enabling network switching.");
      setStatus(activeWallet && address ? "connected" : "error");
      return;
    }
    if (!activeWallet) {
      setError("Connect a wallet before switching networks.");
      setStatus("error");
      return;
    }

    setStatus("switching-chain");
    setError(null);
    try {
      await activeWallet.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: configuredChain.chainId }],
      });
    } catch (switchError) {
      const code = (switchError as { code?: number } | null)?.code;
      if (code !== 4902) {
        setStatus("error");
        setError(getProviderError(switchError, "The network could not be switched."));
        return;
      }

      if (!configuredChain.rpcUrls.length) {
        setStatus("error");
        setError(`Add ${configuredChain.chainName} to your wallet, or configure NEXT_PUBLIC_CHAIN_RPC_URL.`);
        return;
      }

      try {
        await activeWallet.provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: configuredChain.chainId,
            chainName: configuredChain.chainName,
            nativeCurrency: configuredChain.nativeCurrency,
            rpcUrls: configuredChain.rpcUrls,
            ...(configuredChain.blockExplorerUrls?.length
              ? { blockExplorerUrls: configuredChain.blockExplorerUrls }
              : {}),
          }],
        });
      } catch (addError) {
        setStatus("error");
        setError(getProviderError(addError, "The network could not be added to your wallet."));
        return;
      }
    }

    try {
      const currentChain = parseChainId(
        await activeWallet.provider.request<unknown>({ method: "eth_chainId" }),
      );
      setChainId(currentChain ?? configuredChain.id);
      setStatus("connected");
    } catch {
      setChainId(configuredChain.id);
      setStatus("connected");
    }
  }, [activeWallet, address]);

  const refreshOwnership = useCallback(async (): Promise<bigint | null> => {
    if (!chainConfigured || !configuredCollectionAddress) {
      setOwnership({ status: "not-configured", balance: null, error: null });
      return null;
    }
    if (!isEvmAddress(configuredCollectionAddress)) {
      const message = "The configured Isekai collection address is invalid.";
      setOwnership({ status: "error", balance: null, error: message });
      return null;
    }
    if (!activeWallet || !address) {
      setOwnership({ status: "idle", balance: null, error: null });
      return null;
    }
    if (chainId !== configuredChain.id) {
      setOwnership({ status: "idle", balance: null, error: null });
      return null;
    }

    setOwnership({ status: "checking", balance: null, error: null });
    try {
      const balance = await getErc721Balance(
        activeWallet.provider,
        configuredCollectionAddress,
        address,
      );
      setOwnership({
        status: balance > BigInt(0) ? "owned" : "not-owned",
        balance,
        error: null,
      });
      return balance;
    } catch (ownershipError) {
      const message = getProviderError(
        ownershipError,
        "Isekai Broker ownership could not be checked on this network.",
      );
      setOwnership({ status: "error", balance: null, error: message });
      return null;
    }
  }, [activeWallet, address, chainId]);

  useEffect(() => {
    if (
      !chainConfigured
      || !configuredCollectionAddress
      || !activeWallet
      || !address
      || chainId !== configuredChain.id
    ) return;
    const refreshTimer = window.setTimeout(() => void refreshOwnership(), 0);
    return () => window.clearTimeout(refreshTimer);
  }, [activeWallet, address, chainId, refreshOwnership]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!activeWallet || !address) {
      const messageText = "Connect a wallet before signing a message.";
      setError(messageText);
      setStatus("error");
      throw new Error(messageText);
    }
    if (!message.trim()) {
      const messageText = "A non-empty message is required for signing.";
      setError(messageText);
      setStatus("error");
      throw new Error(messageText);
    }

    setStatus("signing");
    setError(null);
    try {
      const signature = await activeWallet.provider.request<unknown>({
        method: "personal_sign",
        params: [utf8ToHex(message), address],
      });
      if (typeof signature !== "string" || !/^0x[a-fA-F0-9]+$/.test(signature)) {
        throw new Error("The wallet returned an invalid signature.");
      }
      setStatus("connected");
      return signature;
    } catch (signError) {
      const messageText = getProviderError(signError, "The message could not be signed.");
      setError(messageText);
      setStatus("error");
      throw new Error(messageText);
    }
  }, [activeWallet, address]);

  const activateLicense = useCallback(async (): Promise<LicenseActivation | null> => {
    if (!activeWallet || !address || chainId === null) {
      setError("Connect a wallet before activating a broker license.");
      setStatus("error");
      return null;
    }
    if (chainConfigured && chainId !== configuredChain.id) {
      setError(`Switch to ${configuredChain.chainName} before activating your license.`);
      setStatus("error");
      return null;
    }

    if (!chainConfigured || !configuredCollectionAddress) {
      setError("Broker access will activate after the official network and collection contract are published.");
      setStatus("error");
      return null;
    }

    const balance = ownership.status === "owned"
      ? ownership.balance
      : await refreshOwnership();
    if (balance === null) {
      setError("Ownership must be verified before this license can be activated.");
      setStatus("error");
      return null;
    }
    if (balance <= BigInt(0)) {
      setError("This wallet does not currently hold an Isekai Broker NFT.");
      setStatus("error");
      return null;
    }

    setStatus("signing");
    setError(null);
    try {
      const activation = await signLicenseActivation(
        activeWallet.provider,
        address,
        chainId,
        { ownershipVerified: true, collectionAddress: configuredCollectionAddress },
      );
      setLicense(activation);
      setStatus("connected");
      return activation;
    } catch (activationError) {
      setStatus("error");
      setError(getProviderError(
        activationError,
        "The broker license could not be activated.",
      ));
      return null;
    }
  }, [activeWallet, address, chainId, ownership.balance, ownership.status, refreshOwnership]);

  const clearError = useCallback(() => {
    setError(null);
    setStatus(activeWallet && address ? "connected" : "idle");
  }, [activeWallet, address]);

  const value = useMemo<WalletContextValue>(() => ({
    wallets,
    activeWallet,
    walletName: activeWallet?.info.name ?? null,
    address,
    shortAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
    chainId,
    status,
    error,
    isConnected: Boolean(activeWallet && address),
    isCorrectChain: !chainConfigured || chainId === configuredChain.id,
    chainConfigured,
    connected: Boolean(activeWallet && address),
    correctChain: !chainConfigured || chainId === configuredChain.id,
    hasBroker: ownership.status === "owned" && (ownership.balance ?? BigInt(0)) > BigInt(0),
    nftBalance: Number(ownership.balance ?? BigInt(0)),
    licenseActive: Boolean(license),
    targetChain: configuredChain,
    collectionAddress: configuredCollectionAddress,
    ownership,
    license,
    connect,
    disconnect,
    refreshWallets,
    switchToConfiguredChain,
    switchNetwork: switchToConfiguredChain,
    refreshOwnership,
    activateLicense,
    signMessage,
    clearError,
  }), [
    wallets,
    activeWallet,
    address,
    chainId,
    status,
    error,
    ownership,
    license,
    connect,
    disconnect,
    refreshWallets,
    switchToConfiguredChain,
    refreshOwnership,
    activateLicense,
    signMessage,
    clearError,
  ]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider.");
  }
  return context;
}
