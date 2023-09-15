"use client";
import useTestLP from "@/hooks/lpInterface/testUseLP";
import TestLending from "./testLending";

export default function Home() {
  const lp = useTestLP();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-center">Welcome to Canto-v3</h1>
      {/* <TestLending /> */}
    </main>
  );
}
