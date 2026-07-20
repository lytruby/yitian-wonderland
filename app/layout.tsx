import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReminderWatcher } from "@/components/routine/ReminderWatcher";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Yitian's Lab",
    template: "%s · Yitian's Lab",
  },
  description:
    "A small digital garden for tools, thoughts, experiments, and strange little dreams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-orb ambient-orb-left" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-right" aria-hidden="true" />
        <div className="relative flex min-h-screen flex-col">
          <ReminderWatcher />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
