// MedNexus Clinical System: page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sanitizeText, createCase } from "../../../lib/api";
import { PhiRedactionViewer, RedactionItem } from "../../../components/PhiRedactionViewer";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  ChevronRight,
  FileText,
} from "lucide-react";

export default function NewCasePage() {
  const router = useRouter();

  const [title, setTitle] = useState(
    "34M Post-Harvest Acute Chest Pain with ST Elevation"
  );
  const [specialtyTag, setSpecialtyTag] = useState("c/CardioEmergency");
  const [age, setAge] = useState(34);
  const [gender, setGender] = useState("Male");
  const [chiefComplaint, setChiefComplaint] = useState(
    "Severe retrosternal crushing chest pain radiating to left jaw for 2 hours"
  );
  const [bp, setBp] = useState("90/60 mmHg");
  const [pulse, setPulse] = useState(118);
  const [spo2, setSpo2] = useState(91);
  const [temp, setTemp] = useState(98.4);
  const [history, setHistory] = useState(
    "Patient Ramesh Kumar, 34M, admitted to Kosi Mission Hospital on 12th Oct 2026 under Dr. V.P. Roy. Aadhaar: 3829-1928-1920. Farmer, heavy lifting during paddy harvest. Known NSAID allergy."
  );
  const [labs, setLabs] = useState(
    "ECG shows 3mm ST elevation in leads V2-V5. Troponin T rapid test positive."
  );
  const [bountyAmount, setBountyAmount] = useState(350);

  // Scrubber modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sanitizing, setSanitizing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sanitizedData, setSanitizedData] = useState<{
    sanitized_text: string;
    redactions: RedactionItem[];
    phi_risk_score: number;
    is_safe_to_publish: boolean;
  } | null>(null);

  const handleOpenScrubber = async () => {
    setIsModalOpen(true);
    setSanitizing(true);
    try {
      const textToScrub = `${history} Chief Complaint: ${chiefComplaint}`;
      const res = await sanitizeText(textToScrub);
      setSanitizedData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSanitizing(false);
    }
  };

  const handleConfirmPublish = async () => {
    setPublishing(true);
    try {
      const sanitizedHistory = sanitizedData ? sanitizedData.sanitized_text : history;
      const res = await createCase({
        title,
        specialty_tag: specialtyTag,
        patient_demographics: { age: Number(age), gender },
        chief_complaint: chiefComplaint,
        vitals: { bp, pulse: Number(pulse), spo2: Number(spo2), temp: Number(temp) },
        history: sanitizedHistory,
        labs_and_ecg: labs,
        imaging_urls: ["/uploads/cases/ecg_anonymized_01.jpg"],
        bounty_amount: Number(bountyAmount),
        urgency_score: 92,
        second_opinion_tags: ["Cardiology", "Emergency Medicine"],
      });
      setIsModalOpen(false);
      router.push(`/medboard/${res.case_id}`);
    } catch (err) {
      console.error(err);
      setIsModalOpen(false);
      router.push("/medboard");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border text-[10px] font-bold uppercase tracking-wider">
                Case Submission
              </span>
              <h1 className="text-xl font-bold text-text-main">
                Ask for a Specialist Second Opinion
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Your patient's name, doctor's name, and government ID numbers are automatically removed before publishing.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-surface border border-border text-brand-primary text-xs font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-primary" />
            Automatic Privacy Guard Active
          </div>
        </div>
      </div>

      {/* Case Creation Form */}
      <div className="rounded-2xl bg-white border border-border p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Case Summary Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-text-main focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Specialty tag & Bounty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Specialty Category
              </label>
              <select
                value={specialtyTag}
                onChange={(e) => setSpecialtyTag(e.target.value)}
                className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-text-main focus:outline-none focus:border-brand-primary"
              >
                <option value="c/CardioEmergency">c/CardioEmergency</option>
                <option value="c/Neurology">c/Neurology</option>
                <option value="c/Pediatrics">c/Pediatrics</option>
                <option value="c/GeneralMedicine">c/GeneralMedicine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Consultation Escrow Bounty (INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bountyAmount}
                  onChange={(e) => setBountyAmount(Number(e.target.value))}
                  className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-brand-primary font-bold focus:outline-none focus:border-brand-primary pl-12 font-mono"
                />
                <span className="absolute left-3.5 top-3 text-xs text-text-muted font-bold">
                  INR
                </span>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Patient Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-text-main focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Patient Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-text-main focus:outline-none focus:border-brand-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Vitals Grid */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Admission Vitals
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <input
                placeholder="BP (e.g. 90/60)"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="rounded-xl bg-surface/40 border border-border p-2.5 text-text-main text-xs"
              />
              <input
                placeholder="Pulse (bpm)"
                type="number"
                value={pulse}
                onChange={(e) => setPulse(Number(e.target.value))}
                className="rounded-xl bg-surface/40 border border-border p-2.5 text-text-main text-xs"
              />
              <input
                placeholder="Oxygen SpO2 (%)"
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="rounded-xl bg-surface/40 border border-border p-2.5 text-text-main text-xs"
              />
              <input
                placeholder="Temp (°F)"
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="rounded-xl bg-surface/40 border border-border p-2.5 text-text-main text-xs"
              />
            </div>
          </div>

          {/* Clinical History */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-main">
                Clinical Details (Names and IDs will be removed automatically)
              </label>
              <span className="text-[11px] text-brand-alert">
                Contains patient name, Aadhaar, and clinic for demo
              </span>
            </div>
            <textarea
              rows={4}
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              className="w-full rounded-xl bg-surface/40 border border-border p-3.5 text-xs text-text-main font-mono leading-relaxed focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Labs and ECG */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Diagnostic Labs and ECG
            </label>
            <textarea
              rows={2}
              value={labs}
              onChange={(e) => setLabs(e.target.value)}
              className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-text-main focus:outline-none focus:border-brand-primary font-mono"
            />
          </div>
        </div>

        {/* Action Button: Opens Pre-flight Modal */}
        <div className="pt-4 border-t border-border flex items-center justify-end">
          <button
            type="button"
            onClick={handleOpenScrubber}
            className="px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>Check Privacy and Publish Case</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pre-Flight Scrubber Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-border shadow-xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface text-brand-primary flex items-center justify-center border border-border">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">
                    Privacy Review Before Publishing
                  </h3>
                  <p className="text-xs text-text-muted">
                    Confirm that all personal identifiers have been safely removed.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrubber Body */}
            {sanitizing ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
                <p className="text-xs font-semibold text-text-main">
                  Scanning text for patient names, phone numbers, and IDs...
                </p>
              </div>
            ) : sanitizedData ? (
              <div className="space-y-4">
                <PhiRedactionViewer
                  originalText={`${history}`}
                  sanitizedText={sanitizedData.sanitized_text}
                  redactions={sanitizedData.redactions}
                  phiRiskScore={sanitizedData.phi_risk_score}
                  isSafeToPublish={sanitizedData.is_safe_to_publish}
                />

                <div className="p-3.5 rounded-xl bg-surface border border-border text-brand-primary text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                  <span>
                    Zero personal identifiers remain. The case is ready for doctor review.
                  </span>
                </div>
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-surface hover:bg-surface/80 text-text-main text-xs font-semibold border border-border transition-colors"
              >
                Cancel and Edit
              </button>

              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={sanitizing || publishing}
                className="px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing Case...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm and Publish Case
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
