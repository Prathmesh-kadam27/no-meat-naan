import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "No Meat Naan | Play, Sip & Win — Concept Demo",
  description: "An independent gamified café experience concept for No Meat Naan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
