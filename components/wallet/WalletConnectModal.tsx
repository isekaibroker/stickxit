"use client";

import {
  ArrowRight,
  LoaderCircle,
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
    isLocalSession,
    walletName,
    shortAddress,
    targetChain,
    chainConfigured,
    connect,
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
    if (open && isConnected && !isLocalSession) onClose();
  }, [isConnected, isLocalSession, onClose, open]);

  if (!open || (isConnected && !isLocalSession)) return null;

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
              Choose an installed EVM wallet to verify Isekai Broker ownership and access Stickxit.
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

        {isConnected && !isLocalSession ? (
          <div className={styles.noticeBox}>
            <ShieldCheck size={16} />
            <span>Connected with {walletName}: {shortAddress}</span>
          </div>
        ) : null}

        <div className={styles.walletList} aria-live="polite">
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
              <p>Install or unlock an EVM-compatible browser wallet, then scan again.</p>
              <button className={styles.secondaryButton} type="button" onClick={refreshWallets}>
                <RefreshCw size={14} /> Scan again
              </button>
            </div>
          )}
        </div>

        <footer className={styles.modalFooter}>
          <LockKeyhole size={15} />
          Stickxit never receives your seed phrase. Connecting does not create a transaction.
        </footer>
      </section>
    </div>
  );
}
