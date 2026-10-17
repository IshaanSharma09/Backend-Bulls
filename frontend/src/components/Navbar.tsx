"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/authContext";
import {
  PlusCircle,
  ShieldCheck,
  Building2,
  Stethoscope,
  LogOut,
  ChevronDown,
  User,
  Key,
  Lock,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const {
    role,
    patientUser,
    doctorHospitalUser,
    quickLoginPatient,
    quickLoginDoctor,
    logout,
  } = useAuth();

  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const isPatientActive = pathname.startsWith("/patient");
  const isHospitalActive = pathname.startsWith("/hospital") || pathname.startsWith("/doctor");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white shadow-sm">
      {/* Top Banner: Active Portal & Quick Role Switcher */}
      <div className="border-b border-border bg-surface px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-brand-primary" />
            <span>Active Portal:</span>
          </span>

          <div className="flex items-center gap-1.5">
            <Link
              href="/patient"
              onClick={() => {
                if (role !== "patient") quickLoginPatient();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isPatientActive
                  ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                  : "bg-white text-text-muted hover:text-text-main border-border"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </Link>

            <Link
              href="/hospital"
              onClick={() => {
                if (role !== "doctor_hospital") quickLoginDoctor();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isHospitalActive
                  ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                  : "bg-white text-text-muted hover:text-text-main border-border"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>IIIT Delhi Hospital & Doctor Hub</span>
            </Link>
          </div>
        </div>

        {/* Current Active Account Indicator with Quick Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-border hover:border-brand-primary/60 text-xs font-medium text-text-main transition-colors shadow-sm"
          >
            <span className="w-2 h-2 rounded-sm bg-brand-primary inline-block" />
            {role === "patient" && patientUser ? (
              <span className="font-semibold text-text-main truncate max-w-[180px]">
                {patientUser.name} ({patientUser.id})
              </span>
            ) : role === "doctor_hospital" && doctorHospitalUser ? (
              <span className="font-semibold text-text-main truncate max-w-[220px]">
                {doctorHospitalUser.doctorName} @ IIIT Delhi Hospital
              </span>
            ) : (
              <span className="text-text-muted">Select Account</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>

          {/* Quick Switch Dropdown */}
          {showSwitchMenu && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-white border border-border shadow-xl py-2 z-50 animate-fade-in text-xs">
              <div className="px-3 py-1.5 border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Switch Verified Credentials
              </div>

              {/* Patient Option */}
              <button
                type="button"
                onClick={() => {
                  quickLoginPatient();
                  setShowSwitchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-surface transition-colors ${
                  role === "patient" ? "bg-surface border-l-2 border-brand-primary" : ""
                }`}
              >
                <User className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-text-main">Ramesh Kumar (Patient)</div>
                  <div className="text-[11px] text-text-muted">ID: RAMESH-54 | ABHA: 91-8273...</div>
                </div>
              </button>

              {/* IIIT Delhi Doctor Option */}
              <button
                type="button"
                onClick={() => {
                  quickLoginDoctor();
                  setShowSwitchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-surface transition-colors ${
                  role === "doctor_hospital"
                    ? "bg-surface border-l-2 border-brand-primary"
                    : ""
                }`}
              >
                <Stethoscope className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-text-main">Dr. Rajesh Sharma (CMO)</div>
                  <div className="text-[11px] text-text-muted">IIIT Delhi Hospital</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold shadow-sm">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-text-main">
                Med<span className="text-brand-primary">Nexus</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border tracking-wider uppercase">
                {isPatientActive ? "Patient Care" : "Doctor + Hospital OS"}
              </span>
            </div>
            <p className="text-[10px] text-text-muted hidden sm:block">
              {isPatientActive
                ? "My AI Health Record & Active Medication Schedule"
                : "Hospital Smart Queue & Dynamic Patient Lookup"}
            </p>
          </div>
        </Link>

        {/* Links tailored strictly to active role */}
        <nav className="flex items-center gap-2">
          {isPatientActive ? (
            <>
              <Link
                href="/patient?tab=report"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-main hover:bg-surface transition-colors"
              >
                Health Profile & Files
              </Link>
              <Link
                href="/patient?tab=code"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-primary bg-surface border border-border transition-colors flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Doctor Access Code</span>
              </Link>
              <Link
                href="/patient?tab=doctor"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-main hover:bg-surface transition-colors"
              >
                Find Doctor
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/hospital?tab=search"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-primary bg-surface border border-border transition-colors flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Patient Search (By Code)</span>
              </Link>
              <Link
                href="/hospital?tab=queue"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-main hover:bg-surface transition-colors"
              >
                Smart Queue
              </Link>
              <Link
                href="/hospital?tab=roster"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-main hover:bg-surface transition-colors"
              >
                Hospital Roster
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
