"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext";
import {
  ShieldCheck,
  Building2,
  Stethoscope,
  ArrowRight,
  User,
  Key,
  Pill,
  FileText,
  Calendar,
  Lock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const {
    loginAsPatient,
    loginAsDoctorHospital,
    quickLoginPatient,
    quickLoginDoctor,
  } = useAuth();

  const [showCustomLogin, setShowCustomLogin] = useState(false);

  // Simple login inputs state
  const [patientIdInput, setPatientIdInput] = useState("RAMESH-54");
  const [patientPassInput, setPatientPassInput] = useState("patient123");

  const [hospitalCodeInput, setHospitalCodeInput] = useState("HOSP-01");
  const [doctorEmailInput, setDoctorEmailInput] = useState("dr.sharma@hospital.care");
  const [doctorPassInput, setDoctorPassInput] = useState("doctor123");

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsPatient(patientIdInput, patientPassInput);
    router.push("/patient");
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDoctorHospital(hospitalCodeInput, doctorEmailInput, doctorPassInput);
    router.push("/hospital");
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] pb-16 animate-fade-in max-w-5xl mx-auto space-y-10 pt-2">
      {/* Hero Header */}
      <section className="text-center space-y-3 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface text-brand-primary text-xs font-semibold border border-border shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Patient-Governed Health Operating System</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-main leading-tight">
          Med<span className="text-brand-primary">Nexus</span> Healthcare OS
        </h1>

        <p className="text-sm text-text-muted max-w-xl mx-auto leading-relaxed bg-surface/60 px-4 py-2 rounded-xl border border-border/60 shadow-xs">
          Clean clinical workflows: Full AI health reports, active medicine dosage schedules, 15-minute dynamic access codes, and hospital Smart Queue vacancy auto-fill.
        </p>
      </section>

        {/* Two Clean Portal Entry Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 1. Patient Portal Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-border hover:border-brand-primary/40 transition-all p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-primary">
                <User className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-surface text-brand-primary border border-border uppercase">
                Patient Portal
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-text-main">
                Patient Health Portal
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Full AI health records, active medicine dosage countdown, verified doctor search, and your 15-minute dynamic visit code.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Crisp Health Profile: Allergies, Medicines, Genetics, and Vaccines</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Upload and manage Lab Reports & Medical Files (fully editable)</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>15-Minute Dynamic Code (prevents unauthorized access years later)</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Find Best Doctor by symptom match and consultation fee</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                quickLoginPatient();
                router.push("/patient");
              }}
              className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Launch Patient Portal (Ramesh Kumar)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-[11px] text-center text-text-muted">
              Auto-login credentials: <span className="font-mono font-medium text-text-main">RAMESH-54</span>
            </div>
          </div>
        </div>

        {/* 2. Doctor + Hospital Hub Card */}
        <div className="bg-white rounded-2xl border-2 border-border hover:border-brand-primary/40 transition-all p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-primary">
                <Building2 className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-surface text-brand-primary border border-border uppercase">
                Doctor + Hospital Hub
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-text-main">
                Doctor and Hospital Hub
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Search patient with their one-time consent code, manage hospital Smart Queue with vacancy auto-reallocation, and view isolated records.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Search patient by unique ID + 15-minute consent code</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Smart Queue: Auto-promote waiting patients on cancellation</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Smart Queue: Real-time cancellation flagging and early-arrival slot reallocation</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>OPD Lounge waiting room management to eliminate idle doctor time</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                quickLoginDoctor();
                router.push("/hospital");
              }}
              className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Launch Hub: Hospital (Dr. Rajesh Sharma)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Manual Login Accordion Toggle (For entering custom credentials if needed) */}
      <section className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setShowCustomLogin(!showCustomLogin)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text-main"
        >
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-primary" />
            <span>Enter Custom Login Credentials</span>
          </span>
          <span className="text-brand-primary hover:underline">
            {showCustomLogin ? "Hide Login Forms" : "Show Login Forms"}
          </span>
        </button>

        {showCustomLogin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 mt-4 border-t border-border animate-fade-in text-xs">
            {/* Custom Patient Login */}
            <form onSubmit={handlePatientSubmit} className="space-y-3">
              <div className="font-bold text-text-main">Patient Sign In</div>
              <div>
                <label className="block text-text-muted mb-1 font-medium">Patient ID / ABHA</label>
                <input
                  type="text"
                  required
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border font-mono text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-text-muted mb-1 font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={patientPassInput}
                  onChange={(e) => setPatientPassInput(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold transition-colors"
              >
                Sign In as Patient
              </button>
            </form>

            {/* Custom Doctor + Hospital Login */}
            <form onSubmit={handleDoctorSubmit} className="space-y-3">
              <div className="font-bold text-text-main">Doctor and Hospital Sign In</div>
              <div>
                <label className="block text-text-muted mb-1 font-medium">Hospital Code</label>
                <input
                  type="text"
                  required
                  value={hospitalCodeInput}
                  onChange={(e) => setHospitalCodeInput(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border font-mono text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-text-muted mb-1 font-medium">Doctor Email</label>
                <input
                  type="email"
                  required
                  value={doctorEmailInput}
                  onChange={(e) => setDoctorEmailInput(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-text-muted mb-1 font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={doctorPassInput}
                  onChange={(e) => setDoctorPassInput(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold transition-colors"
              >
                Sign In to Hospital OS
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
