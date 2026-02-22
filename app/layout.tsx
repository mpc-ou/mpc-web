import "@/app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | MPClub",
    default: "MPClub - Where there's a bug, there's MPC!",
  },
  description:
    "MPClub - Where there's a bug, there's MPC! The official club of the Faculty of Information Technology, HCMOU.",
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}
