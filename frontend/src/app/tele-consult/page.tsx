"use client";

import React, { useState } from "react";
import Link from "next/link";
import { generateSoapNote } from "../../lib/api";
import { usePersona } from "../../lib/persona";
import {
  Activity,
  DollarSign,
  HeartPulse,
  Loader2,
  ChevronRight,
  ShieldAlert,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function TeleConsultPage() {
  const { currentPersona } = usePersona();

  const [rawNotes, setRawNotes] = useState(
    "pt 34m came clutching chest sweating profusely bp 90/60 p 118 spo2 91 st elevates v2 to v5 trop t pos allergic to brufen says chest feels crushed like elephant sitting on it since 1pm"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    soap_note: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
    urgency_score: number;
    urgency_tier: string;
    contraindication_flag: string;
  } | null>(null);

  const handleRunScribe = async () => {
    setLoading(true);
    try {
      const response = await generateSoapNote({
        raw_doctor_notes: rawNotes,
        patient_timeline: [
          "15 Jan 2026: Acute Viral Gastroenteritis treated with ORS and Cipro",
          "02 Aug 2025: Bronchospasm attack after taking Ibuprofen (Severe NSAID intolerance documented)",
        ],
      });
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border text-[10px] font-bold uppercase tracking-wider">
                Module 2
              </span>
              <h1 className="text-xl font-bold text-text-main">
                Tele-Consult Scribe and Fair Fee Split
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Turns rushed notes into clear clinical documentation, flags dangerous drug allergies, and divides consultation fees automatically.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-muted">Referring Clinic:</span>
            <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-text-main font-medium">
              Kosi Rural Health Spoke
            </span>
          </div>
        </div>
      </div>

      {/* Financial Split Banner in Simple Language */}
      <div className="rounded-2xl bg-white border border-border p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface text-brand-primary flex items-center justify-center border border-border">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main block">
                Automatic Consultation Fee Split
              </span>
              <span className="text-[11px] text-text-muted">
                Transparent revenue division between the village clinic and the hospital specialist
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3.5 py-2 rounded-lg bg-surface border border-border">
              <span className="text-text-muted">Patient Pays: </span>
              <span className="font-bold text-text-main">INR 500</span>
            </div>
            <span className="text-border">to</span>
            <div className="px-3.5 py-2 rounded-lg bg-surface border border-border text-brand-primary">
              <span className="text-text-muted">Village Clinic Retains: </span>
              <span className="font-bold">INR 150</span>
            </div>
            <span className="text-border">+</span>
            <div className="px-3.5 py-2 rounded-lg bg-surface border border-border text-brand-blue">
              <span className="text-text-muted">Metro Specialist Receives: </span>
              <span className="font-bold">INR 350</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Raw Doctor Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white border border-border p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-primary" />
                Doctor's Quick Notes
              </h2>
              <span className="text-[10px] text-text-muted">
                Typing or Voice Note
              </span>
            </div>

            <textarea
              rows={8}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Type rough notes, symptoms, vitals..."
              className="w-full rounded-xl bg-surface/40 border border-border p-3.5 text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary font-mono leading-relaxed"
            />

            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[11px] font-semibold text-text-main block">
                Automatic Timeline Context Connected:
              </span>
              <p className="text-[11px] text-text-muted">
                Patient has a recorded severe reaction to Brufen (Ibuprofen).
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunScribe}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Organizing Notes with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Format Clean Notes and Calculate Urgency
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Pane: Clean Structured Output */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="rounded-2xl bg-white border border-border p-6 space-y-5 shadow-sm animate-fade-in">
              {/* Urgency Badge Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-lg bg-surface border border-brand-alert text-brand-alert font-bold text-xs flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-brand-alert" />
                    Urgency Score: {result.urgency_score} / 100
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface text-brand-alert border border-border">
                    High Emergency
                  </span>
                </div>

                <div className="text-xs text-text-muted">
                  ICMR Protocol Matched
                </div>
              </div>

              {/* Contraindication Flag Alert */}
              {result.contraindication_flag && (
                <div className="p-4 rounded-xl bg-white border-2 border-brand-alert text-brand-alert text-xs flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-brand-alert flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wide">
                      Safety Warning: Avoid NSAID Painkillers
                    </span>
                    <p className="mt-0.5 leading-relaxed text-text-main">
                      {result.contraindication_flag}
                    </p>
                  </div>
                </div>
              )}

              {/* SOAP Note Sections */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider block">
                    Subjective (Patient's Symptoms)
                  </span>
                  <p className="text-text-main leading-relaxed">
                    {result.soap_note.subjective}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider block">
                    Objective (Vitals and Lab Signs)
                  </span>
                  <p className="text-text-main leading-relaxed font-mono">
                    {result.soap_note.objective}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-[11px] font-bold text-text-main uppercase tracking-wider block">
                    Assessment (Suspected Diagnosis)
                  </span>
                  <p className="text-text-main leading-relaxed font-semibold">
                    {result.soap_note.assessment}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider block">
                    Plan (Next Steps and Medication)
                  </span>
                  <p className="text-text-main leading-relaxed whitespace-pre-line">
                    {result.soap_note.plan}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-text-muted">
                  Ready to request a specialist second opinion
                </span>
                <Link
                  href="/medboard/new-case"
                  className="px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Post to MedBoard with Privacy Filter</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-dashed border-border p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-surface text-brand-primary flex items-center justify-center mx-auto border border-border">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-text-main">
                Ready to Organize Doctor Notes
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Click <strong>"Format Clean Notes"</strong> on the left to see instant structured documentation, emergency triage, and safety warnings.
              </p>
              <button
                type="button"
                onClick={handleRunScribe}
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/80 text-brand-primary text-xs font-semibold inline-flex items-center gap-1.5 border border-border transition-colors"
              >
                Load Sample Clinical Case
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
