import StyledComponentsRegistry from "@/lib/registry";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import InfoBar from "@/components/info_bar/infoBar";

export const metadata: Metadata = {
  title: "Canto v3",
  description: "canto v3 is gonna be cool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <InfoBar
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
          />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
