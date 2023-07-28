"use client";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";

export default function Home() {
  const bridgeIn = useBridgeOut({});
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-center">Welcome to Canto-v3</h1>
      <button
        onClick={() =>
          bridgeIn.bridge().then((val) => {
            console.log(val);
          })
        }
      >
        bridge in
      </button>
    </main>
  );
}
