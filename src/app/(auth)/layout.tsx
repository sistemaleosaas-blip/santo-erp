import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <ShieldCheck className="h-6 w-6 text-accent" /> SANTO
        </Link>
        {children}
      </div>
    </div>
  );
}
