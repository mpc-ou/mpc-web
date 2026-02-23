import "@/app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | MPClub",
    default: "MPClub - Where there's a bug, there's MPC!"
  },
  description:
    "MPClub - Where there's a bug, there's MPC! The official club of the Faculty of Information Technology, HCMOU.",
  authors: [{ name: "MPClub Team" }],
  category: "Technology",
  creator: "MPClub Team",
  keywords: ["MPClub", "HCMOU", "Faculty of Information Technology", "Student Club"],
  robots: "index, follow"
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}
