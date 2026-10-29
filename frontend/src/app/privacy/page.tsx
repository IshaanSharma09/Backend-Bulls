// MedNexus Clinical System: page.tsx
import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MedNexus B2B",
  description: "Data privacy practices, HIPAA de-identification standards, and DPDP Act 2023 compliance.",
};

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5" />
            DPDP Act 2023 and HIPAA Compliance Framework
          </div>
          <h1 className="text-2xl font-bold text-text-main">Privacy Policy</h1>
          <p className="text-xs text-text-muted">Effective Date: October 17, 2026</p>
        </div>

        <section className="space-y-3 text-xs text-text-main leading-relaxed">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            1. Overview and Scope
          </h2>
          <p>
            MedNexus operates a business-to-business (B2B) clinical operating network connecting rural primary health centers and spoke clinics with metropolitan specialist hospital hubs. This policy outlines how patient clinical data, doctor registration credentials, and institutional workplace reviews are gathered, sanitized, and stored.
          </p>
        </section>

        <section className="space-y-3 text-xs text-text-main leading-relaxed">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-primary" />
            2. Mandatory Pre-Flight Client-Side De-Identification
          </h2>
          <p>
            In compliance with the Digital Personal Data Protection Act (DPDPA 2023) of India and international HIPAA Safe Harbor principles, all clinical case submissions undergo algorithmic redaction prior to network transmission. The system strips:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-muted">
            <li>Direct identifiers including patient names, Aadhaar numbers, and phone numbers.</li>
            <li>Geographical and facility identifiers down to high-level regional classifications.</li>
            <li>Specific treating physician identity from the patient presentation body.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs text-text-main leading-relaxed">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-primary" />
            3. NMC Doctor Verification and Pseudonym Hashing
          </h2>
          <p>
            Doctor verification occurs through irreversible SHA-256 cryptographic hashing of National Medical Commission (NMC) registration numbers combined with an internal salt. Real doctor names and state council registration records are never stored in plaintext alongside public comments or case second opinions.
          </p>
        </section>

        <section className="space-y-3 text-xs text-text-main leading-relaxed">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            4. Institutional Reviews and k-Anonymity Protection
          </h2>
          <p>
            Workplace culture reviews are guarded by strict k-anonymity where k equals 5. Department scores and culture ratings are withheld from public indexing until at least five verified reviews exist for a designated hospital department. This prevents retaliatory deduction of reviewer identities in smaller units.
          </p>
        </section>

        <section className="space-y-3 text-xs text-text-main leading-relaxed border-t border-border pt-6">
          <h2 className="text-sm font-bold text-text-main">5. Data Retention and Contact</h2>
          <p className="text-text-muted">
            For privacy inquiries or audit verification, contact the Data Protection Officer at privacy@mednexus.in or via our registered nodal office in New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}
