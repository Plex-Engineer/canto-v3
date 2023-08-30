"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TestPage from "./testPage";
import { QueryClient, QueryClientProvider } from "react-query";
import TestLending from "./testLending";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-center">Welcome to Canto-v3</h1>
      <ConnectButton />
      <TestPage />
    </main>
  );
}
