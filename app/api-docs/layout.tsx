import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | MPClub",
  robots: { index: false, follow: false }
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='min-h-screen bg-background'>{children}</div>
      </body>
    </html>
  );
}
