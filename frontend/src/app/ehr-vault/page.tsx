"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Clock,
  HeartPulse,
  Syringe,
  FileText,
  Activity,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Pill,
  User,
} from "lucide-react";

export default function EhrVaultPage() {
  const [activeTab, setActiveTab] = useState<"timeline" | "allergies" | "vitals">("timeline");

  const timelineEvents = [
    {
      date: "17 Oct 2026, 14:30",
      title: "Acute Chest Pain (Current Hospital Visit)",
      category: "Cardiology",
      facility: "Kosi Rural Health Spoke",
      physician: "Dr_Kosi_Care (Verified Spoke Physician)",
      icon: HeartPulse,
      summary:
        "Severe 2-hour crushing chest pain radiating to left jaw after heavy lifting. Blood pressure 90/60 mmHg, Pulse 118 bpm, Oxygen 91%. ECG shows ST elevation in leads V2-V5. Troponin test positive.",
      flag: "Immediate Reperfusion Needed",
    },
    {
      date: "15 Jan 2026",
      title: "Stomach Infection and Dehydration",
      category: "Outpatient",
      facility: "Saharsa Sub-Divisional Hospital",
      physician: "Dr. A. Verma",
      icon: Activity,
      summary:
        "Treated with oral fluids and Ciprofloxacin for 5 days. Full recovery within 48 hours.",
      flag: null,
    },
    {
      date: "02 Aug 2025",
      title: "Severe Allergic Attack After Taking Ibuprofen (Brufen)",
      category: "Allergic Reaction",
      facility: "Purnia Regional Medical Center",
      physician: "Dr. R. Sengupta",
      icon: AlertTriangle,
      summary:
        "Patient developed severe wheezing and throat swelling 25 minutes after taking Brufen for dental pain. Required emergency Epinephrine injection. Complete lifelong NSAID allergy logged.",
      flag: "LIFELONG ALLERGY: Never give Brufen, Diclofenac or Aspirin for pain",
    },
    {
      date: "10 Mar 2024",
      title: "Tetanus Injection and Arm Wound Care",
      category: "Vaccine",
      facility: "Araria Primary Health Center",
      physician: "Community Health Officer",
      icon: Syringe,
      summary:
        "Farming cut on right forearm cleaned and dressed. Routine tetanus injection given.",
      flag: null,
    },
    {
      date: "22 Sep 2022",
      title: "Malaria Fever Treated",
      category: "Infection",
      facility: "Kosi Rural Health Spoke",
      physician: "Dr. P. Jha",
      icon: FileText,
      summary:
        "Treated for vivax malaria with complete 14-day medication course. Full recovery.",
      flag: null,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Header Card with Real Doctor / Spoke Clinic Picture */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border flex-shrink-0 bg-surface">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
                alt="Attending physician Dr Kosi Care"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-text-main">
                  P**** K**** (34M)
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-surface text-xs font-mono text-text-muted border border-border">
                  ABHA ID: 91-8273-1928-3920
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface text-xs text-brand-primary border border-border font-semibold">
                  Verified Rural Record
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Attending Spoke: Dr_Kosi_Care | Kosi Rural Health Center, Bihar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tele-consult"
              className="px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Start Tele-Consult
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Red Alert Banner: Documented NSAID Intolerance */}
      <div className="rounded-2xl bg-white border-2 border-brand-alert p-5 shadow-sm flex items-start gap-4 animate-pulse-subtle">
        <div className="w-10 h-10 rounded-xl bg-brand-alert/15 text-brand-alert flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-alert/30">
          <AlertTriangle className="w-5 h-5 text-brand-alert" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-brand-alert uppercase tracking-wide">
              Critical Warning: Documented Severe NSAID Allergy
            </h2>
            <span className="text-xs text-text-muted">
              Logged on August 2, 2025
            </span>
          </div>
          <p className="text-xs text-text-main leading-relaxed">
            This patient had a life-threatening allergic reaction (throat swelling and asthma attack) after taking Brufen.{" "}
            <strong>DO NOT PRESCRIBE OR INJECT:</strong> Brufen, Ibuprofen, Diclofenac, Naproxen, or any NSAID painkillers. Use cautious intravenous morphine if chest pain relief is required.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "timeline"
              ? "bg-surface text-brand-primary border border-border"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Past Medical Visits
        </button>
        <button
          onClick={() => setActiveTab("allergies")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "allergies"
              ? "bg-surface text-brand-primary border border-border"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          Drug Allergies (1)
        </button>
        <button
          onClick={() => setActiveTab("vitals")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "vitals"
              ? "bg-surface text-brand-primary border border-border"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Current Vitals
        </button>
      </div>

      {/* Tab Content: Timeline */}
      {activeTab === "timeline" && (
        <div className="rounded-2xl bg-white border border-border p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-text-main">
              Medical History Timeline
            </h3>
            <p className="text-xs text-text-muted">
              All records combined from village clinics and regional hospitals
            </p>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {timelineEvents.map((evt, idx) => {
              const Icon = evt.icon;
              return (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-0 w-5 h-5 rounded-md flex items-center justify-center border ${
                      idx === 0
                        ? "bg-brand-alert text-white border-brand-alert"
                        : "bg-surface text-brand-primary border-border"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="rounded-xl bg-white border border-border p-4 space-y-2 hover:border-brand-primary/40 transition-colors shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-brand-primary flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {evt.date}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-surface text-brand-primary border border-border">
                          {evt.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {evt.facility} | {evt.physician}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-main">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-text-muted leading-relaxed">
                      {evt.summary}
                    </p>

                    {evt.flag && (
                      <div className="p-2 rounded-md bg-surface border border-border text-[11px] font-semibold text-brand-alert flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{evt.flag}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Allergies */}
      {activeTab === "allergies" && (
        <div className="rounded-2xl bg-white border border-border p-6 space-y-4 shadow-sm animate-fade-in">
          <h3 className="text-sm font-bold text-text-main">Recorded Drug Allergies</h3>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand-alert">NSAID Painkillers (Brufen, Diclofenac)</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white text-brand-alert font-semibold border border-border">High Severity Allergy</span>
            </div>
            <p className="text-xs text-text-muted">
              Reaction: Sudden severe asthma, facial swelling, low blood pressure within 30 minutes.
            </p>
            <div className="text-xs text-text-main font-mono">
              Do not give: Ibuprofen (Brufen), Diclofenac, Naproxen, Combiflam, Ketorolac.
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Vitals */}
      {activeTab === "vitals" && (
        <div className="rounded-2xl bg-white border border-border p-6 space-y-4 shadow-sm animate-fade-in">
          <h3 className="text-sm font-bold text-text-main">Today's Admission Vitals (14:30)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="text-text-muted block mb-1">Blood Pressure</span>
              <span className="text-xl font-bold text-brand-alert">90/60 mmHg</span>
              <span className="text-[10px] text-brand-alert block mt-0.5">Low - Risk of Shock</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="text-text-muted block mb-1">Pulse</span>
              <span className="text-xl font-bold text-text-main">118 bpm</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Rapid Heart Rate</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="text-text-muted block mb-1">Oxygen Level</span>
              <span className="text-xl font-bold text-brand-primary">91%</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Needs Supplemental O2</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="text-text-muted block mb-1">Temperature</span>
              <span className="text-xl font-bold text-text-main">98.4 °F</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Normal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
