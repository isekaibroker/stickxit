"use client";

import {
  ArrowRight,
  LoaderCircle,
  MonitorPlay,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useWallet } from "./WalletProvider";
import styles from "./wallet.module.css";

export interface WalletConnectModalProps {
  open: boolean;
  onClose(): void;
  title?: string;
}

export function WalletConnectModal({
  open,
  onClose,
  title = "Connect your wallet",
}: WalletConnectModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const {
    wallets,
    status,
    error,
    isConnected,
    walletName,
    shortAddress,
    targetChain,
    chainConfigured,
    connect,
    startLocalSession,
    refreshWallets,
    clearError,
  } = useWallet();

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (open && isConnected) onClose();
  }, [isConnected, onClose, open]);

  if (!open || isConnected) return null;

  const busy = ["connecting", "restoring", "switching-chain", "signing"].includes(status);

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}><ShieldCheck size={13} /> Secure connection</span>
            <h2 className={styles.modalTitle} id={titleId}>{title}</h2>
            <p className={styles.modalSubtitle}>
              Open the complete local workspace now, or connect an installed wallet.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            className={styles.iconButton}
            type="button"
            aria-label="Close wallet dialog"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.networkStrip}>
          <span>Network requirement</span>
          <span className={styles.networkName}>
            <span className={styles.networkDot} />
            {chainConfigured
              ? `${targetChain.chainName} / Chain ${targetChain.id}`
              : "Any EVM network"}
          </span>
        </div>

        {error ? (
          <div className={styles.errorBox} role="alert">
            <span>{error}</span>
            <button className={styles.inlineDismiss} type="button" onClick={clearError} aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        ) : null}

        {isConnected ? (
          <div className={styles.noticeBox}>
            <ShieldCheck size={16} />
            <span>Connected with {walletName}: {shortAddress}</span>
          </div>
        ) : null}

        <div className={styles.walletList} aria-live="polite">
          <button
            className={styles.localOption}
            type="button"
            disabled={busy}
            onClick={() => void startLocalSession()}
          >
            <span className={styles.walletGlyph} aria-hidden="true"><MonitorPlay size={19} /></span>
            <span className={styles.walletText}>
              <strong>Use the local demo workspace</strong>
              <span>No extension, blockchain, signature prompt, or payment required</span>
            </span>
            {busy ? <LoaderCircle className={styles.spinner} size={18} /> : <ArrowRight className={styles.walletArrow} size={17} />}
          </button>
          <div className={styles.walletDivider}><span>or use a browser wallet</span></div>
          {wallets.length ? wallets.map((wallet) => (
            <button
              className={styles.walletOption}
              type="button"
              key={wallet.info.uuid}
              disabled={busy}
              onClick={() => void connect(wallet.info.uuid)}
            >
              <span className={styles.walletGlyph} aria-hidden="true">
                {wallet.info.name.trim().slice(0, 1).toUpperCase() || "W"}
              </span>
              <span className={styles.walletText}>
                <strong>{wallet.info.name}</strong>
                <span>{wallet.source === "eip6963" ? "Discovered browser wallet" : "Legacy injected wallet"}</span>
              </span>
              {busy ? <LoaderCircle className={styles.spinner} size={18} /> : <ArrowRight className={styles.walletArrow} size={17} />}
            </button>
          )) : (
            <div className={styles.emptyWallets}>
              <Wallet size={30} />
              <strong>No browser wallet detected</strong>
              <p>No extension is required for the local demo. Install or unlock an EVM-compatible wallet only if you want to test wallet connection.</p>
              <button className={styles.secondaryButton} type="button" onClick={refreshWallets}>
                <RefreshCw size={14} /> Scan again
              </button>
            </div>
          )}
        </div>

        <footer className={styles.modalFooter}>
          <LockKeyhole size={15} />
          Local demo records stay in this browser. Wallet connection never asks for a seed phrase.
        </footer>
      </section>
    </div>
  );
}
