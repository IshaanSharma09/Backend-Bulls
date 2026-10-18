"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ScrollReveal } from "../../../components/ScrollReveal";
import { clinicalStore } from "../../../lib/clinicalStore";
import {
  MessageSquare,
  Stethoscope,
  Send,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Share2,
  PhoneCall,
  ShieldCheck,
  CheckSquare,
  Square,
  Pill,
  Lock,
  Building2,
  X,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  time: string;
  text: string;
  isMe: boolean;
  isRxOrder?: boolean;
}

export default function DoctorConsultationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "Dr_Kosi_Care (MBBS)",
      role: "Rural Spoke Clinician",
      time: "15:32",
      text: "Dr. Sharma, sending 12-lead ECG for patient Ramesh Kumar (54M). Presenting with severe substernal chest pressure for 2 hours, diaphoresis, BP 90/60 mmHg, SpO2 91%.",
      isMe: true,
    },
    {
      id: "msg-2",
      sender: "Dr_Pulse_9482 (DM Cardiology)",
      role: "Metro Interventional Cardiologist",
      time: "15:34",
      text: "Reviewed the ECG tracing. Clear 3mm ST-segment elevation in precordial leads V2 through V5. This is an acute anterior wall STEMI requiring urgent reperfusion.",
      isMe: false,
    },
    {
      id: "msg-3",
      sender: "Dr_Kosi_Care (MBBS)",
      role: "Rural Spoke Clinician",
      time: "15:35",
      text: "Understood. Please note the patient has a documented severe anaphylactoid reaction to Brufen / Ibuprofen in his EHR vault. We must strictly avoid any NSAID painkillers.",
      isMe: true,
    },
    {
      id: "msg-4",
      sender: "Dr_Pulse_9482 (DM Cardiology)",
      role: "Metro Interventional Cardiologist",
      time: "15:37",
      text: "Crucial catch. Give Aspirin 325mg chewable plus Clopidogrel 300mg immediately as loading dose (antiplatelet mechanism, not NSAID). Withhold Nitrates because systolic BP is 90. Start IV normal saline bolus and transfer to IIIT Delhi Hospital. Cath lab is pre-notified.",
      isMe: false,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxMedicine, setRxMedicine] = useState("Aspirin 325mg + Clopidogrel 300mg");
  const [rxSalt, setRxSalt] = useState("Acetylsalicylic Acid 325mg, Clopidogrel 300mg");
  const [rxDosage, setRxDosage] = useState("Loading dose (Chewable)");
  const [rxInstructions, setRxInstructions] = useState("Chew thoroughly immediately post-consultation");
  const [rxError, setRxError] = useState<string | null>(null);

  const [checklist, setChecklist] = useState([
    { id: 1, text: "Aspirin 325mg chewable + Clopidogrel 300mg loading dose administered", checked: true },
    { id: 2, text: "Sublingual Nitrates withheld (SBP 90 mmHg borderline)", checked: true },
    { id: 3, text: "Brufen / NSAIDs locked and contraindicated", checked: true },
    { id: 4, text: "108 Advanced Cardiac Ambulance dispatched with telemetry", checked: true },
    { id: 5, text: "Metro Cath Lab pre-activated for Primary PCI upon arrival", checked: false },
  ]);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "Dr_Kosi_Care (MBBS)",
      role: "Rural Spoke Clinician",
      time: "Just now",
      text: inputMessage.trim(),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Realistic specialist reply
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: "Dr_Pulse_9482 (DM Cardiology)",
        role: "Metro Interventional Cardiologist",
        time: "Just now",
        text: "Acknowledged. Monitoring telemetry in transit. Keep IV access patent and repeat vitals every 10 minutes.",
        isMe: false,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  const handlePrescribeInChat = (e: React.FormEvent) => {
    e.preventDefault();
    setRxError(null);

    const res = clinicalStore.addPrescription({
      patientId: "91-8273-1928-3920",
      patientName: "Ramesh Kumar",
      doctorName: "Dr_Pulse_9482 (DM Cardiology)",
      doctorBadge: "Metro Specialist",
      medicineName: rxMedicine,
      genericSalt: rxSalt,
      dosage: rxDosage,
      frequency: "Immediate",
      duration: "Single Dose",
      instructions: rxInstructions,
      janAushadhiGeneric: "Aspirin 300mg + Clopidogrel 75mg PMBI",
      brandedPrice: 48,
      janAushadhiPrice: 8,
    });

    if (!res.success) {
      setRxError(res.error || "Blocked due to allergy contraindication.");
      return;
    }

    // Sync to patient's digital prescription history
    clinicalStore.addDigitalPrescription({
      patientId: "RAMESH-54",
      medicationName: rxMedicine,
      dosage: rxDosage,
      prescribedBy: "Dr. Rajesh Sharma (DM Cardiology, IIIT Delhi Hospital)",
    });

    const rxMsg: ChatMessage = {
      id: `msg-rx-${Date.now()}`,
      sender: "Dr_Pulse_9482 (DM Cardiology)",
      role: "Metro Interventional Cardiologist",
      time: "Just now",
      text: `[OFFICIAL DIGITAL PRESCRIPTION ORDER ISSUED]: ${rxMedicine} (${rxDosage}). Instructions: "${rxInstructions}". Synchronized to Patient Portal & Hospital Pharmacy.`,
      isMe: false,
      isRxOrder: true,
    };

    setMessages((prev) => [...prev, rxMsg]);
    setShowRxModal(false);
  };

  const toggleChecklist = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleExportSummary = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Top Bar with Navigation */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/doctor"
                className="text-xs text-text-muted hover:text-brand-primary flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Doctor OS
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-brand-primary" />
              Doctor Talking Room: Private Peer Consultation
            </h1>
            <p className="text-xs text-text-muted">
              Direct peer dialogue between Rural Spoke Physician and Metro Super-Specialist
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRxModal(true)}
              className="px-4 py-2.5 rounded-lg bg-surface hover:bg-surface/80 text-brand-primary border border-border text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Pill className="w-4 h-4" />
              <span>Issue Digital Prescription</span>
            </button>
            <button
              onClick={handleExportSummary}
              className="px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Export Summary to EHR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Authority Transparency & Audit Notice */}
      <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-blue" />
          <span>
            <strong>Hospital Audit Notice:</strong> This clinical chat and all issued prescriptions are securely visible to the <strong>Hospital Authority Service</strong> for pharmacovigilance and pharmacy fulfillment.
          </span>
        </div>
        <span className="text-[11px] font-mono text-brand-primary bg-white px-2 py-0.5 rounded border border-border">
          DPDPA 2023 Compliant
        </span>
      </div>

      {/* Success Banner */}
      {exportSuccess && (
        <div className="p-4 rounded-xl bg-surface border-2 border-brand-primary text-brand-primary text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Peer consultation discussion summary and agreed treatment plan saved to Patient EHR Vault.</span>
        </div>
      )}

      {/* Main Grid: Discussion Chat & Clinical Case Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Peer Discussion (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col h-[600px]">
            {/* Room Header */}
            <div className="p-4 border-b border-border bg-surface/50 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-text-main">
                    Dr_Pulse_9482 (DM Cardiology)
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Consultant Interventional Cardiologist | AIIMS & Metro Hub
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-text-muted bg-white px-2.5 py-1 rounded-md border border-border">
                Encrypted Session ID: CN-9821
              </div>
            </div>

            {/* Chat Messages Scrollable */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-background">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-1 px-1">
                    <span className="font-semibold text-text-main">{msg.sender}</span>
                    <span>({msg.role})</span>
                    <span>at {msg.time}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      msg.isRxOrder
                        ? "bg-surface border-2 border-brand-primary text-text-main"
                        : msg.isMe
                        ? "bg-brand-primary text-white rounded-br-none"
                        : "bg-white text-text-main border border-border rounded-bl-none"
                    }`}
                  >
                    {msg.isRxOrder && (
                      <div className="flex items-center gap-1.5 text-brand-primary font-bold mb-1">
                        <Pill className="w-4 h-4" />
                        <span>Digital Prescription Order</span>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-border bg-white rounded-b-2xl flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type clinical consultation note or question..."
                className="flex-1 rounded-lg bg-surface/40 border border-border px-3.5 py-2.5 text-xs text-text-main focus:outline-none focus:border-brand-primary"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Case Summary & Shared Checklist (1 col) */}
        <div className="space-y-4">
          {/* Patient Card */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Consultation Case
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-brand-alert border border-brand-alert/40">
                Critical
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-main">
                Ramesh Kumar (54M)
              </h3>
              <p className="text-xs text-text-muted">
                ABHA: 91-8273-1928-3920 | Kosi Spoke
              </p>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-brand-alert/40 text-xs space-y-1">
              <div className="font-bold text-brand-alert flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Severe NSAID Allergy
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">
                Do not prescribe Brufen, Combiflam, or Ibuprofen. Patient has history of anaphylactoid bronchospasm.
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Vitals:</span>
                <span className="font-medium text-text-main">BP 90/60, HR 118, O2 91%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">ECG Diagnosis:</span>
                <span className="font-bold text-brand-alert">Anterior STEMI (V2-V5)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Troponin-T:</span>
                <span className="font-bold text-brand-primary">Elevated / Positive</span>
              </div>
            </div>
          </div>

          {/* Shared Clinical Action Checklist */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Joint Clinical Plan Checklist
            </h3>

            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="w-full text-left p-2.5 rounded-lg border border-border hover:bg-surface/50 transition-colors flex items-start gap-2.5 text-xs"
                >
                  {item.checked ? (
                    <CheckSquare className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`leading-relaxed ${
                      item.checked ? "text-text-main font-medium" : "text-text-muted"
                    }`}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-text-muted pt-2 border-t border-border">
              Agreed across both attending physicians under MedNexus B2B Protocol.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: PRESCRIBE MEDICINE IN CHAT */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-border shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-bold text-text-main">
                  Issue Digital Prescription from Chat Room
                </h3>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rxError && (
              <div className="p-3.5 rounded-xl bg-brand-alert/10 border-2 border-brand-alert text-brand-alert text-xs font-semibold flex items-start gap-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{rxError}</span>
              </div>
            )}

            <form onSubmit={handlePrescribeInChat} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  value={rxMedicine}
                  onChange={(e) => setRxMedicine(e.target.value)}
                  className="w-full rounded-lg bg-surface/40 border border-border p-2.5 text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Generic Salt
                </label>
                <input
                  type="text"
                  required
                  value={rxSalt}
                  onChange={(e) => setRxSalt(e.target.value)}
                  className="w-full rounded-lg bg-surface/40 border border-border p-2.5 text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Dosage & Instructions
                </label>
                <input
                  type="text"
                  required
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  className="w-full rounded-lg bg-surface/40 border border-border p-2.5 text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/80 text-text-main text-xs font-semibold border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Issue Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
