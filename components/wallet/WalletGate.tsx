"use client";

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
    license,
    status,
    error,
    switchToConfiguredChain,
    activateLicense,
    startLocalSession,
  } = useWallet();

  if (isConnected && isCorrectChain && (!requireLicense || license)) {
    return <>{children}</>;
  }

  const restoring = status === "restoring" || status === "discovering";
  let icon = <Wallet size={25} />;
  let title = "Connect your wallet";
  let copy = "Open the local demo to use every workspace without an extension, blockchain, or backend.";
  let action = (
    <div className={styles.gateActions}>
      <button className={styles.primaryButton} type="button" onClick={() => void startLocalSession()}>
        <Fingerprint size={14} /> Enter local demo
      </button>
      <button className={styles.secondaryButton} type="button" onClick={() => setModalOpen(true)}>
        <Wallet size={14} /> Use wallet
      </button>
    </div>
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
  } else if (isConnected && requireLicense && !license) {
    icon = <Fingerprint size={25} />;
    title = chainConfigured && collectionAddress
      ? "Activate local Broker access"
      : "Enable local preview access";
    copy = chainConfigured && collectionAddress
      ? "After the collection balance check, sign a gas-free message stored only on this device. This is not server authentication or on-chain staking."
      : "Sign a gas-free message for device-only preview access. This is not server authentication, ownership verification, or on-chain staking.";
    action = (
      <button className={styles.primaryButton} type="button" onClick={() => void activateLicense()}>
        <Fingerprint size={14} /> {chainConfigured && collectionAddress ? "Activate local access" : "Enable local preview"}
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
