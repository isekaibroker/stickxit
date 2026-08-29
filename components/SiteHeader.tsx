"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WalletAccountPanel, WalletConnectModal, useWallet } from "@/components/wallet";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Stickxit home">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      <span>STICKXIT</span>
    </Link>
  );
}

const navItems = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/isekai-brokers", label: "Isekai Brokers" },
  { href: "/create-listing", label: "List a spot" },
  { href: "/broker", label: "Broker HQ" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isConnected, isLocalSession, shortAddress, status } = useWallet();

  useEffect(() => {
    if (!accountOpen) return;
    const close = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [accountOpen]);

  const restoring = status === "discovering" || status === "restoring";

  return (
    <header className="topbar">
      <Brand />
      <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/marketplace" && pathname.startsWith("/campaigns"));
          return (
            <Link key={item.href} className={active ? "nav-active" : ""} aria-current={active ? "page" : undefined} href={item.href} onClick={() => { setMenuOpen(false); setAccountOpen(false); }}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        <div className="header-wallet" ref={accountRef}>
          <button
            className={`wallet-button ${isConnected ? "connected" : ""}`}
            type="button"
            aria-expanded={isConnected ? accountOpen : walletModalOpen}
            onClick={() => isConnected ? setAccountOpen((open) => !open) : setWalletModalOpen(true)}
          >
            <Wallet size={15} aria-hidden="true" />
            {restoring ? "Checking access" : isConnected ? isLocalSession ? "Local demo" : shortAddress : "Open workspace"}
            {isConnected ? <ChevronDown size={13} aria-hidden="true" /> : null}
          </button>
          {isConnected && accountOpen ? (
            <div className="header-wallet-popover">
              <WalletAccountPanel compact />
            </div>
          ) : null}
        </div>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <WalletConnectModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </header>
  );
}
