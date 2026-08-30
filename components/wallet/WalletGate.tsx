"use client";

import Link from "@/components/AppLink";
import { Fingerprint, LoaderCircle, Radio, Wallet } from "lucide-react";
import { useState, type ReactNode } from "react";
import { WalletConnectModal } from "./WalletConnectModal";
import { useWallet } from "./WalletProvider";
import styles from "./wallet.module.css";

export interface WalletGateProps {
  children: ReactNode;
  requireLicense?: boolean;
  className?: string;
}

export function WalletGate({ children, requireLicense = false, className = "" }: WalletGateProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    isConnected,
    isCorrectChain,
    chainConfigured,
    collectionAddress,
    targetChain,
    ownership,
    license,
    status,
    error,
    switchToConfiguredChain,
    activateLicense,
  } = useWallet();

  const verifiedAccess = Boolean(
    chainConfigured
    && collectionAddress
    && ownership.status === "owned"
    && license,
  );

  if (isConnected && isCorrectChain && (!requireLicense || verifiedAccess)) {
    return <>{children}</>;
  }

  const restoring = status === "restoring" || status === "discovering";
  let icon = <Wallet size={25} />;
  let title = "Connect your wallet";
  let copy = "Connect an installed EVM wallet to continue.";
  let action = (
    <button className={styles.primaryButton} type="button" onClick={() => setModalOpen(true)}>
      <Wallet size={14} /> Connect wallet
    </button>
  );

  if (restoring) {
    icon = <LoaderCircle className={styles.spinner} size={25} />;
    title = "Checking wallet access";
    copy = "Looking for a previously authorized wallet without opening a prompt.";
    action = <></>;
  } else if (isConnected && chainConfigured && !isCorrectChain) {
    icon = <Radio size={25} />;
    title = `Switch to ${targetChain.chainName}`;
    copy = `This workspace is configured for chain ${targetChain.id}. Switching does not create a transaction.`;
    action = (
      <button className={styles.primaryButton} type="button" onClick={() => void switchToConfiguredChain()}>
        <Radio size={14} /> Switch network
      </button>
    );
  } else if (isConnected && requireLicense && (!chainConfigured || !collectionAddress)) {
    icon = <Fingerprint size={25} />;
    title = "Broker access is not live";
    copy = "Ownership verification will activate after the official network and collection contract are published.";
    action = (
      <Link className={styles.primaryButton} href="/launchpad">
        View mint status
      </Link>
    );
  } else if (isConnected && requireLicense && !verifiedAccess) {
    icon = <Fingerprint size={25} />;
    title = ownership.status === "not-owned" ? "Isekai Broker required" : "Activate Broker access";
    copy = ownership.status === "not-owned"
      ? "This wallet does not currently hold an Isekai Broker NFT."
      : "Verify the collection balance, then sign a gas-free access message. This does not create an on-chain transaction.";
    action = (
      ownership.status === "not-owned"
        ? <Link className={styles.primaryButton} href="/launchpad">View mint status</Link>
        : <button className={styles.primaryButton} type="button" onClick={() => void activateLicense()}>
            <Fingerprint size={14} /> Activate Broker access
          </button>
    );
  }

  return (
    <>
      <section className={`${styles.gate} ${className}`}>
        <div className={styles.gateInner}>
          <span className={styles.gateIcon}>{icon}</span>
          <h2 className={styles.gateTitle}>{title}</h2>
          <p className={styles.gateCopy}>{error || copy}</p>
          {action}
        </div>
      </section>
      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
