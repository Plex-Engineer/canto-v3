"use client";
import CantoWalletProvider from "@/provider/rainbowProvider";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TestPage from "./testPage";

export default function Home() {
  return (
    <CantoWalletProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold text-center">Welcome to Canto-v3</h1>
        <ConnectButton />
        <TestPage />
      </main>
    </CantoWalletProvider>
  );
}
