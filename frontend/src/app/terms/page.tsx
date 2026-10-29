// MedNexus Clinical System: page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | MedNexus B2B",
  description: "Terms governing clinical second opinions, B2B tele-consult ledger, and doctor peer review.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Clinical OS
      </Link>

      <div className="bg-white rounded-xl border border-border p-8 shadow-sm space-y-6">
        <div className="border-b border-border pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface text-brand-primary text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            Clinical Operating Agreement and Disclaimers
          </div>
          <h1 className="text-2xl font-bold text-text-main">Terms and Conditions</h1>
          <p className="text-xs text-text-muted">Last Updated: October 17, 2026</p>
        </div>

        <section className="space-y-3 text-xs text-text-main leading-relaxed">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-primary" />
            1. Nature of Secondary Clinical Opinions
          </h2>
          <p>
            MedNexus provides a peer-to-peer clinical discussion and tele-consultation facilitation medium for verified healthcare practitioners. Case postings, AI-generated guideline matches, and consensus votes represent clinical decision support only and do not constitute a direct patient-doctor relationship between the metro specialist and the rural patient. Final clinical discretion and prescribing authority remain exclusively with the bedside attending physician.
          </p>
        </section>

        <section className="space-y-3 text-xs text-text-main leading-relaxed">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            2. B2B Tele-Consult Escrow and Fee Allocation
          </h2>
          <p>
            Consultation charges are settled through an automated B2B escrow split mechanism. When a rural patient pays the standard consultation fee (INR 500), the rural spoke facility retains its operational facility share (INR 150), and the remaining specialist escrow balance (INR 350) is allocated upon consensus or tele-session completion.
          </p>
        </section>

        <section className="space-y-3 text-xs text-text-main leading-relaxed">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand-primary" />
            3. Professional Conduct and Zero Defamation Mandate
          </h2>
          <p>
            Institutional workplace reviews must strictly focus on operational standards, shift hours, patient safety, and medical equipment. Targeting individual practitioners by name or issuing unsubstantiated criminal allegations is strictly prohibited and subject to algorithmic rejection and account suspension under National Medical Commission ethics codes.
          </p>
        </section>

        <section className="space-y-3 text-xs text-text-main leading-relaxed border-t border-border pt-6">
          <h2 className="text-sm font-bold text-text-main">4. Jurisdiction</h2>
          <p className="text-text-muted">
            These terms are governed by the laws of India. Any disputes arising in connection with the MedNexus clinical network are subject to the exclusive jurisdiction of the competent courts in New Delhi.
          </p>
        </section>
      </div>
    </div>
  );
}
