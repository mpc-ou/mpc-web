import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-nunito"
});

export { nunito };
