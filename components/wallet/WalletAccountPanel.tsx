"use client";

import {
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  Fingerprint,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { WalletConnectModal } from "./WalletConnectModal";
import { useWallet } from "./WalletProvider";
import styles from "./wallet.module.css";

export interface WalletAccountPanelProps {
  compact?: boolean;
  className?: string;
}

function ownershipLabel(
  status: ReturnType<typeof useWallet>["ownership"]["status"],
  balance: bigint | null,
): string {
  switch (status) {
    case "not-configured": return "Not configured";
    case "checking": return "Checking...";
    case "owned": return `${balance?.toString() ?? "1"} collection NFT${balance === BigInt(1) ? "" : "s"}`;
    case "not-owned": return "No collection NFT found";
    case "error": return "Check failed";
    default: return "Ready to check";
  }
}

export function WalletAccountPanel({ compact = false, className = "" }: WalletAccountPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wallet = useWallet();
  const {
    address,
    shortAddress,
    walletName,
    chainId,
    targetChain,
    chainConfigured,
    collectionAddress,
    isConnected,
    isCorrectChain,
    status,
    error,
    ownership,
    license,
    disconnect,
    switchToConfiguredChain,
    refreshOwnership,
    activateLicense,
    isLocalSession,
    startLocalSession,
  } = wallet;

  const explorerUrl = useMemo(() => {
    const base = chainConfigured ? targetChain.blockExplorerUrls?.[0] : null;
    return base && address ? `${base.replace(/\/$/, "")}/address/${address}` : null;
  }, [address, chainConfigured, targetChain.blockExplorerUrls]);

  if (!isConnected) {
    return (
      <>
        <section className={`${styles.panel} ${styles.connectState} ${className}`}>
          <span className={styles.eyebrow}><Fingerprint size={13} /> Wallet access</span>
          <h2 className={styles.panelTitle}>Open your complete workspace</h2>
          <p>Use the browser-only demo immediately, or connect a wallet when you want to test an extension.</p>
          <div className={styles.actionRow}>
            <button className={styles.connectButton} type="button" onClick={() => void startLocalSession()}>
              <Fingerprint size={15} /> Enter local demo
            </button>
            <button className={styles.secondaryButton} type="button" onClick={() => setModalOpen(true)}>
              <Wallet size={15} /> Use wallet
            </button>
          </div>
        </section>
        <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  const busy = ["switching-chain", "signing", "connecting"].includes(status);
  const licenseCopy = license ? isLocalSession ? "Local tools active" : "Local access record" : "Not activated";

  return (
    <section className={`${styles.panel} ${compact ? styles.compact : ""} ${className}`}>
      <div className={styles.panelMain}>
        <header className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}><Shield size={13} /> {isLocalSession ? "Browser-only simulation" : "Wallet session"}</span>
            <h2 className={styles.panelTitle}>{isLocalSession ? "Local workspace" : "Broker access"}</h2>
          </div>
          <span className={styles.statusPill}><span className={styles.liveDot} /> {isLocalSession ? "Local demo" : "Connected"}</span>
        </header>

        <div className={styles.accountRow}>
          <span className={styles.accountIdenticon} aria-hidden="true">Wallet</span>
          <span className={styles.accountMeta}>
            <strong>{shortAddress}</strong>
            <span>{isLocalSession ? "Browser-only demo account" : `${walletName} / Chain ${chainId}`}</span>
          </span>
          <button
            className={styles.copyButton}
            type="button"
            aria-label="Copy wallet address"
            title={copied ? "Copied" : "Copy address"}
            onClick={() => {
              if (!address) return;
              void navigator.clipboard.writeText(address).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              });
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <span className={styles.statusCardLabel}><Shield size={12} /> Network</span>
            <strong className={isCorrectChain ? styles.statusGood : styles.statusMuted}>
              {isLocalSession
                ? "Browser only"
                : !chainConfigured
                ? "Any EVM network"
                : isCorrectChain
                  ? targetChain.chainName
                  : `Switch to ${targetChain.chainName}`}
            </strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusCardLabel}><BadgeCheck size={12} /> Collection balance</span>
            <strong className={ownership.status === "owned" ? styles.statusGood : styles.statusMuted}>
              {isLocalSession ? "Demo Broker" : ownershipLabel(ownership.status, ownership.balance)}
            </strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusCardLabel}><Fingerprint size={12} /> Broker license</span>
            <strong className={license ? styles.statusGood : styles.statusMuted}>{licenseCopy}</strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusCardLabel}><Wallet size={12} /> Account</span>
            <strong>{shortAddress}</strong>
          </div>
        </div>

        <p className={styles.panelNote}>
          {isLocalSession
            ? "This simulated session unlocks every local workflow. Records stay in this browser and no blockchain, wallet signature, payment, or production service is used."
            : chainConfigured && collectionAddress
            ? "The collection balance is read from the configured contract; it does not identify a selected token. Access uses a gas-free, device-only signature stored locally - not server authentication or on-chain staking."
            : "Chain or collection checks are not configured. Local preview access is a gas-free, device-only signature stored in this browser - not server authentication or on-chain staking."}
        </p>

        {error || ownership.error ? (
          <p className={styles.panelError} role="alert">{error || ownership.error}</p>
        ) : null}

        <div className={styles.actionRow}>
          {!isLocalSession && chainConfigured && !isCorrectChain ? (
            <button className={styles.primaryButton} type="button" disabled={busy} onClick={() => void switchToConfiguredChain()}>
              {status === "switching-chain" ? <LoaderCircle className={styles.spinner} size={14} /> : <RefreshCw size={14} />}
              Switch network
            </button>
          ) : null}
          {!isLocalSession && chainConfigured && isCorrectChain && collectionAddress ? (
            <button className={styles.secondaryButton} type="button" disabled={ownership.status === "checking"} onClick={() => void refreshOwnership()}>
              {ownership.status === "checking" ? <LoaderCircle className={styles.spinner} size={14} /> : <RefreshCw size={14} />}
              Check NFT
            </button>
          ) : null}
          {!isLocalSession && isCorrectChain && !license ? (
            <button className={styles.primaryButton} type="button" disabled={busy || ownership.status === "checking"} onClick={() => void activateLicense()}>
              {status === "signing" ? <LoaderCircle className={styles.spinner} size={14} /> : <Fingerprint size={14} />}
              {chainConfigured && collectionAddress ? "Activate local access" : "Enable local preview"}
            </button>
          ) : null}
          {!isLocalSession && explorerUrl ? (
            <a className={styles.secondaryButton} href={explorerUrl} target="_blank" rel="noreferrer">
              Explorer <ExternalLink size={13} />
            </a>
          ) : null}
          <button className={styles.dangerButton} type="button" onClick={disconnect}>
            <LogOut size={14} /> {isLocalSession ? "Exit demo" : "Disconnect"}
          </button>
        </div>
      </div>
    </section>
  );
}
