import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function CheckEmailPage() {
  return (
    <AuthLayout title="Check your inbox" description="One small step before you get started.">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <MailCheck className="mx-auto mb-4 text-indigo-600" size={38} />
        <p className="text-sm leading-6 text-slate-600">If email confirmation is enabled for your Supabase project, follow the link in your inbox to activate your account.</p>
        <Link className="btn-secondary mt-5 w-full" href="/login">Return to sign in</Link>
      </div>
    </AuthLayout>
  );
}
