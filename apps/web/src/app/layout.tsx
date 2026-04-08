import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "EduHire — India's Premier Teacher Hiring Platform",
  description:
    "Connect qualified teachers with schools across India. Find teaching jobs by subject, location, and board. Schools post vacancies, teachers apply in one click.",
  keywords: "teacher jobs india, school hiring, teaching vacancies, cbse teacher jobs, eduhire",
  openGraph: {
    title: "EduHire — India's Premier Teacher Hiring Platform",
    description: "Connect qualified teachers with schools across India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
