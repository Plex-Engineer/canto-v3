"use client";

import "./globals.scss";
import InfoBar from "@/components/info_bar/infoBar";
import Footer from "@/components/footer/footer";
import NavBar from "@/components/nav_bar/navBar";
import CantoWalletProvider from "@/provider/rainbowProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import localFont from "next/font/local";

const rm_mono = localFont({
  src: "../fonts/rm-mono-regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--rm-mono",
});

const proto_mono = localFont({
  src: "../fonts/proto-mono-regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--proto-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={"dark"}
        style={
          {
            "--rm-mono": rm_mono.style.fontFamily,
            "--proto-mono": proto_mono.style.fontFamily,
          } as React.CSSProperties
        }
      >
        <CantoWalletProvider>
          <QueryClientProvider client={new QueryClient()}>
            <div className="body">
              {/* <InfoBar
                values={[
                  {
                    name: "contracts w/ CSR enabled:",
                    value: "$1,210.56",
                    change: "+2% $23.4",
                    isPositive: true,
                  },
                  {
                    name: "CANTO price:",
                    value: "$1,210.56",
                    change: "+22%",
                    isPositive: true,
                  },
                  {
                    name: "TVL:",
                    value: "$1,210.56",
                    change: "-1.2%",
                    isPositive: false,
                  },
                  {
                    name: "Market Cap:",
                    value: "$1,435,438.56",
                    change: "-34.2%",
                    isPositive: false,
                  },
                ]}
              /> */}
              <div></div>
              <NavBar />
              {children}
              <div id="modal-root"></div>
              <Footer />
            </div>
          </QueryClientProvider>
        </CantoWalletProvider>
      </body>
    </html>
  );
}
