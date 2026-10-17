"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import {
  clinicalStore,
  HospitalQueueSlot,
  WaitingEarlyArrivalPatient,
  HospitalPatient,
  DoctorProfile,
  PatientHealthProfile,
} from "../../lib/clinicalStore";
import {
  Building2,
  Stethoscope,
  Key,
  Lock,
  Unlock,
  Search,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Pill,
  ShieldCheck,
  FileText,
  X,
  ChevronRight,
  Users,
  Check,
  Plus,
  Trash2,
  Edit3,
  UserPlus,
  ArrowRight,
} from "lucide-react";

function DoctorHospitalDashboardContent() {
  const { doctorHospitalUser } = useAuth();
  const searchParams = useSearchParams();

  // Active Tab state: only 3 clean tabs
  const [activeTab, setActiveTab] = useState<"queue" | "search" | "roster">("queue");

  const currentHospitalId = "HOSP-IIITD";
  const currentHospitalName = "IIIT Delhi Hospital";
  const currentDoctorName = doctorHospitalUser?.doctorName || "Dr. Rajesh Sharma";
  const currentDoctorSpecialty = doctorHospitalUser?.specialty || "Chief Medical Officer & Cardiology";

  // Data State for IIIT Delhi Hospital
  const [queueSlots, setQueueSlots] = useState<HospitalQueueSlot[]>([]);
  const [waitingPatients, setWaitingPatients] = useState<WaitingEarlyArrivalPatient[]>([]);
  const [hospitalPatients, setHospitalPatients] = useState<HospitalPatient[]>([]);
  const [hospitalDoctors, setHospitalDoctors] = useState<DoctorProfile[]>([]);

  // Patient Search & Dynamic Code Verification State
  const [searchPatientId, setSearchPatientId] = useState("RAMESH-54");
  const [enteredConsentCode, setEnteredConsentCode] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [unlockedPatient, setUnlockedPatient] = useState<{
    profile: PatientHealthProfile;
  } | null>(null);

  // Queue Notification & Modals
  const [queueNotice, setQueueNotice] = useState<string | null>(null);
  const [selectedSlotForReallocation, setSelectedSlotForReallocation] = useState<string | null>(null);

  // Add Early Arrival Waiting Patient Modal
  const [showAddWaitingModal, setShowAddWaitingModal] = useState(false);
  const [newWaitName, setNewWaitName] = useState("");
  const [newWaitAge, setNewWaitAge] = useState("");
  const [newWaitGender, setNewWaitGender] = useState("Female");
  const [newWaitReason, setNewWaitReason] = useState("");
  const [newWaitPhone, setNewWaitPhone] = useState("");

  // Edit Queue Slot Modal
  const [editingSlot, setEditingSlot] = useState<HospitalQueueSlot | null>(null);
  const [editSlotTime, setEditSlotTime] = useState("");
  const [editSlotDoctor, setEditSlotDoctor] = useState("");
  const [editSlotNotes, setEditSlotNotes] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "queue" || tabParam === "roster" || tabParam === "search") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const sync = () => {
      setQueueSlots(clinicalStore.getHospitalQueue(currentHospitalId));
      setWaitingPatients(clinicalStore.getWaitingPatients());
      setHospitalPatients(clinicalStore.getHospitalPatients(currentHospitalId));
      setHospitalDoctors(clinicalStore.getHospitalDoctors(currentHospitalId));
    };
    sync();
    const unsub = clinicalStore.subscribe(sync);
    return () => unsub();
  }, [currentHospitalId]);

  const showNotification = (msg: string) => {
    setQueueNotice(msg);
    setTimeout(() => setQueueNotice(null), 5000);
  };

  // Handle Search & Code Verification
  const handleVerifyPatientCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);

    const res = clinicalStore.verifyPatientAccess(searchPatientId, enteredConsentCode);
    if (!res.success) {
      setLookupError(res.error || "Access Denied: Invalid patient consent code.");
      setUnlockedPatient(null);
      return;
    }

    if (res.profile) {
      setUnlockedPatient({
        profile: res.profile,
      });
      setLookupError(null);
    }
  };

  const handleClosePatientSession = () => {
    setUnlockedPatient(null);
    setEnteredConsentCode("");
    setLookupError(null);
  };

  // --- Smart Queue Cancellation & Slot Flagging ---
  const handleCancelAppointment = (slotId: string) => {
    const slot = queueSlots.find((s) => s.id === slotId);
    clinicalStore.cancelSlot(slotId);
    showNotification(
      `Appointment for ${slot?.patientName || "patient"} at ${slot?.slotTime} CANCELLED. Slot is now FREE / VACANT for early-arrival patients.`
    );
  };

  // --- Reallocate Empty Slot with Waiting Patient ---
  const handleReallocateSlot = (slotId: string, waitingPatientId: string) => {
    const waiting = waitingPatients.find((w) => w.id === waitingPatientId);
    const slot = queueSlots.find((s) => s.id === slotId);

    const success = clinicalStore.reallocateSlotWithWaitingPatient(slotId, waitingPatientId);
    if (success) {
      setSelectedSlotForReallocation(null);
      showNotification(
        `SUCCESS: Empty slot at ${slot?.slotTime} reallocated to ${waiting?.name} (Waiting in OPD Lounge). Time saved for doctor and patient!`
      );
    }
  };

  // --- Add New Early-Arrival Patient to Waiting Lounge ---
  const handleAddWaitingPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaitName.trim()) return;

    clinicalStore.addWaitingPatient({
      name: newWaitName.trim(),
      age: parseInt(newWaitAge) || 40,
      gender: newWaitGender,
      requestedDoctor: currentDoctorName,
      reason: newWaitReason.trim() || "Arrived early in OPD waiting lounge",
      arrivalStatus: "Waiting in OPD Lounge",
      requestedTime: "Wants earlier slot",
      phone: newWaitPhone.trim() || "+91 98100-00000",
    });

    setNewWaitName("");
    setNewWaitAge("");
    setNewWaitReason("");
    setNewWaitPhone("");
    setShowAddWaitingModal(false);
    showNotification("Early-arrival patient checked into waiting lounge.");
  };

  // --- Edit Slot Details ---
  const handleStartEditSlot = (slot: HospitalQueueSlot) => {
    setEditingSlot(slot);
    setEditSlotTime(slot.slotTime);
    setEditSlotDoctor(slot.attendingDoctor);
    setEditSlotNotes(slot.notes || "");
  };

  const handleSaveSlotEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    clinicalStore.updateQueueSlot(editingSlot.id, {
      slotTime: editSlotTime.trim(),
      attendingDoctor: editSlotDoctor.trim(),
      notes: editSlotNotes.trim(),
    });

    setEditingSlot(null);
    showNotification("Slot details updated.");
  };

  // --- Update Hospital Inpatient / Outpatient Status ---
  const handleStatusChange = (patientId: string, status: HospitalPatient["status"]) => {
    clinicalStore.updateHospitalPatientStatus(patientId, status);
    showNotification(`Patient status updated to ${status}.`);
  };

  // Count empty / vacant slots
  const vacantSlots = queueSlots.filter(
    (s) => s.status === "Empty (Cancelled)" || s.status === "Vacated (Cancelled)"
  );

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner: IIIT Delhi Hospital Header */}
      <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface text-brand-primary text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>IIIT Delhi Medical Centre</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              {currentHospitalName} & Clinician OS
            </h1>
            <p className="text-xs text-text-muted">
              Attending Clinician: <strong className="text-text-main">{currentDoctorName}</strong> ({currentDoctorSpecialty}) | Facility ID: <span className="font-mono text-brand-primary">HOSP-IIITD</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface border border-border text-brand-primary flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-sm bg-brand-accent animate-pulse" />
              <span>Live Smart Queue Active</span>
            </span>
          </div>
        </div>

        {queueNotice && (
          <div className="mt-4 p-3 rounded-xl bg-surface border border-brand-accent/40 text-xs font-semibold text-brand-primary flex items-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span>{queueNotice}</span>
          </div>
        )}
      </div>

      {/* THREE DISTINCT TABS: NO SCROLL CLUTTER */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "queue"
              ? "bg-white text-brand-primary border border-border shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Smart Queue & Vacancy Auto-Fill</span>
          {vacantSlots.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
              {vacantSlots.length} Free
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "search"
              ? "bg-white text-brand-primary border border-border shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Search Patient (By Dynamic Code)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roster")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "roster"
              ? "bg-white text-brand-primary border border-border shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Hospital Patients & Clinicians (IIIT Delhi)</span>
        </button>
      </div>

      {/* TAB 1: SMART QUEUE & EARLY-ARRIVAL REALLOCATION ENGINE */}
      {activeTab === "queue" && (
        <div className="space-y-6 animate-fade-in">
          {/* Queue Overview Banner */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-text-main">
                Hospital Smart Queue & Automatic Slot Reallocation
              </h2>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                If a patient cancels, the slot is immediately flagged as <strong className="text-amber-700">FREE / VACANT</strong>. Hospital staff can reassign waiting early-arrival patients into the empty slot to save doctor and patient time.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAddWaitingModal(true)}
                className="px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Check In Early Patient</span>
              </button>
            </div>
          </div>

          {/* TWO COLUMN INTERACTIVE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT / MAIN COLUMN: SCHEDULED OPD SLOTS */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-primary" />
                  <span>OPD Consultation Schedule Today</span>
                </span>
                <span className="text-[11px] text-text-muted">
                  Total: {queueSlots.length} Slots
                </span>
              </div>

              <div className="space-y-3">
                {queueSlots.map((slot) => {
                  const isVacant =
                    slot.status === "Empty (Cancelled)" || slot.status === "Vacated (Cancelled)";
                  const isReallocated =
                    slot.status === "Reallocated (Early Arrival)" ||
                    slot.status === "Reallocated (Auto-Promoted)";

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isVacant
                          ? "bg-amber-50/70 border-amber-300 shadow-sm"
                          : isReallocated
                          ? "bg-emerald-50/60 border-brand-accent/60 shadow-sm"
                          : "bg-white border-border shadow-sm hover:border-brand-primary/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-surface text-brand-primary border border-border">
                              {slot.slotTime}
                            </span>

                            {isVacant ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-300 animate-pulse">
                                FREE / VACANT SLOT
                              </span>
                            ) : isReallocated ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Reallocated (Early Arrival)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface text-brand-primary border border-border">
                                {slot.severity}
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-bold text-text-main pt-0.5">
                            {isVacant ? (
                              <span className="text-amber-800 italic font-semibold">
                                Slot is Available (No Patient Assigned)
                              </span>
                            ) : (
                              <span>
                                {slot.patientName} ({slot.age} {slot.gender})
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-text-muted">
                            Doctor: <strong className="text-text-main">{slot.attendingDoctor}</strong> | {slot.notes}
                          </p>
                        </div>

                        {/* Actions on Slot */}
                        <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                          {isVacant ? (
                            /* Vacant Slot: Reallocate Button */
                            <button
                              type="button"
                              onClick={() => setSelectedSlotForReallocation(slot.id)}
                              className="px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Assign Waiting Patient</span>
                            </button>
                          ) : (
                            /* Confirmed / Reallocated Slot: Cancel & Edit Buttons */
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditSlot(slot)}
                                className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface transition-colors"
                                title="Edit slot details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(slot.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-border hover:border-red-200 text-xs font-semibold text-red-600 transition-colors shadow-sm"
                                title="Cancel patient appointment and mark slot as free"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dropdown selector when slot is clicked to assign */}
                      {selectedSlotForReallocation === slot.id && (
                        <div className="mt-3 pt-3 border-t border-amber-200 animate-fade-in space-y-2">
                          <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                            <span>Select early-arrival patient to fill this {slot.slotTime} slot:</span>
                            <button
                              type="button"
                              onClick={() => setSelectedSlotForReallocation(null)}
                              className="text-text-muted hover:text-text-main text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>

                          {waitingPatients.length === 0 ? (
                            <p className="text-xs text-text-muted italic">
                              No patients currently waiting in the OPD lounge. Check in a patient on the right.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {waitingPatients.map((wait) => (
                                <button
                                  key={wait.id}
                                  type="button"
                                  onClick={() => handleReallocateSlot(slot.id, wait.id)}
                                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-surface border border-amber-200 text-xs flex items-center justify-between gap-2 shadow-sm transition-all"
                                >
                                  <div>
                                    <strong className="text-text-main">{wait.name} ({wait.age}{wait.gender[0]})</strong>
                                    <span className="text-[11px] text-text-muted block">{wait.reason}</span>
                                  </div>
                                  <span className="px-2 py-1 rounded bg-brand-primary text-white text-[10px] font-semibold flex items-center gap-1">
                                    <span>Assign Slot</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: WAITING ROOM & EARLY ARRIVAL REQUESTS */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Early Arrival Requests (OPD Lounge)</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface text-brand-primary font-mono text-[11px] font-bold">
                  {waitingPatients.length} Waiting
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-border p-4 shadow-sm space-y-3">
                <p className="text-[11px] text-text-muted leading-relaxed">
                  These patients are physically waiting in the OPD lounge and requested an earlier consultation. When an appointment is cancelled, click <strong>&quot;Assign to Slot&quot;</strong> to fill the vacancy.
                </p>

                {waitingPatients.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted bg-surface/30 rounded-xl border border-dashed border-border">
                    OPD Waiting Lounge is currently empty.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {waitingPatients.map((wait) => (
                      <div
                        key={wait.id}
                        className="p-3 rounded-xl bg-surface/40 border border-border text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-text-main font-bold">
                            {wait.name} ({wait.age} {wait.gender})
                          </strong>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {wait.arrivalStatus}
                          </span>
                        </div>

                        <p className="text-[11px] text-text-muted">
                          {wait.reason}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-border/60">
                          <span className="text-[10px] text-text-muted font-mono">{wait.phone}</span>

                          {/* Quick assign helper if any vacant slot exists */}
                          {vacantSlots.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleReallocateSlot(vacantSlots[0].id, wait.id)}
                              className="px-2 py-1 rounded-lg bg-brand-primary text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <span>Fill {vacantSlots[0].slotTime} Slot</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-medium">
                              Waiting for cancellation
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEARCH PATIENT (BY 15-MINUTE DYNAMIC CODE) */}
      {activeTab === "search" && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-text-main">
              Search Patient (By 15-Minute Dynamic Code)
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              To protect patient privacy, health records at IIIT Delhi Hospital can only be unlocked with the patient&apos;s live 15-minute consent code. Doctors cannot view historical records without patient authorization.
            </p>
          </div>

          <form onSubmit={handleVerifyPatientCode} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-main mb-1.5">
                  1. Unique Patient ID / ABHA
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={searchPatientId}
                    onChange={(e) => setSearchPatientId(e.target.value)}
                    placeholder="e.g. RAMESH-54"
                    className="w-full rounded-xl bg-surface/50 border border-border pl-10 pr-4 py-2.5 text-xs font-mono text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1.5">
                  2. Patient&apos;s Live Dynamic 6-Digit Code
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={enteredConsentCode}
                    onChange={(e) => setEnteredConsentCode(e.target.value)}
                    placeholder="Enter 6-digit code (e.g. 849201)"
                    className="w-full rounded-xl bg-surface/50 border border-border pl-10 pr-4 py-2.5 text-xs font-mono tracking-widest text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-text-muted">
                Active Code for Ramesh: <strong className="font-mono text-brand-primary">849201</strong> (from Patient Portal).
              </span>

              <div className="flex items-center gap-2">
                {unlockedPatient && (
                  <button
                    type="button"
                    onClick={handleClosePatientSession}
                    className="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 text-text-main border border-border text-xs font-semibold"
                  >
                    Lock Session
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Verify Code & Unlock Record</span>
                </button>
              </div>
            </div>
          </form>

          {lookupError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-start gap-2 shadow-sm animate-fade-in">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <span className="block font-bold">ACCESS RESTRICTED</span>
                <span>{lookupError}</span>
              </div>
            </div>
          )}

          {/* UNLOCKED PATIENT RECORD (CRISP, MINIMAL, ZERO JARGON) */}
          {unlockedPatient && (
            <div className="pt-4 border-t border-border space-y-4 animate-fade-in text-xs">
              <div className="p-4 rounded-xl bg-surface border border-brand-primary/40 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-text-main">
                    {unlockedPatient.profile.patientName} ({unlockedPatient.profile.age} {unlockedPatient.profile.gender})
                  </h3>
                  <p className="text-xs text-text-muted">
                    ID: <span className="font-mono font-bold text-text-main">{unlockedPatient.profile.patientId}</span> | Blood Group: <strong className="font-mono text-brand-primary">{unlockedPatient.profile.bloodGroup}</strong> | Verified via 15-Minute Dynamic Code
                  </p>
                </div>
                <button
                  onClick={handleClosePatientSession}
                  className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-text-main hover:bg-surface shadow-sm"
                >
                  End Consultation & Lock
                </button>
              </div>

              {/* Patient Allergies - High Alert Banner */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 space-y-2 shadow-sm">
                <div className="font-bold text-xs flex items-center gap-1.5 text-red-700">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Documented Patient Allergies & Sensitivities:</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {unlockedPatient.profile.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-red-200 font-semibold text-xs text-red-700 shadow-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medicines */}
              <div className="space-y-1.5">
                <span className="font-bold text-text-main block">Patient&apos;s Current Prescriptions:</span>
                <div className="divide-y divide-border border border-border rounded-xl bg-white overflow-hidden">
                  {unlockedPatient.profile.currentMedicines.map((m) => (
                    <div key={m.id} className="p-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong className="text-text-main">{m.name}</strong> ({m.dose})
                        <p className="text-[11px] text-text-muted">{m.frequency} • {m.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Genetics & Vaccination Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface/50 border border-border space-y-1.5">
                  <span className="font-bold text-text-main block">Genetics & Family History:</span>
                  <ul className="space-y-1 text-text-muted text-[11px]">
                    {unlockedPatient.profile.genetics.map((g, idx) => (
                      <li key={idx}>• {g}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/50 border border-border space-y-1.5">
                  <span className="font-bold text-text-main block">Vaccination Status:</span>
                  <ul className="space-y-1 text-text-muted text-[11px]">
                    {unlockedPatient.profile.vaccinations.map((v, idx) => (
                      <li key={idx}>• {v.name}: <strong className="text-brand-primary">{v.status}</strong> ({v.date})</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Uploaded Lab Reports & Files */}
              <div className="space-y-1.5">
                <span className="font-bold text-text-main block">Patient&apos;s Uploaded Lab Reports & Medical Files:</span>
                <div className="space-y-2">
                  {unlockedPatient.profile.labFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl bg-surface/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-main">{file.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-brand-primary border border-border">
                            {file.category}
                          </span>
                          <span className="text-[11px] text-text-muted">{file.date} • {file.fileSize}</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">{file.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOSPITAL PATIENTS & CLINICIANS (IIIT DELHI HOSPITAL) */}
      {activeTab === "roster" && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-text-main">
              Hospital Patients & Attending Clinicians (IIIT Delhi Hospital)
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Clinical registry for admitted patients and consulting doctors at IIIT Delhi Medical Centre. Status updates persist in real time.
            </p>
          </div>

          {/* Hospital Patients Table with Editable Status */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-primary" />
              <span>Registered Hospital Patients ({hospitalPatients.length})</span>
            </span>

            <div className="space-y-2.5">
              {hospitalPatients.map((pat) => (
                <div
                  key={pat.id}
                  className="p-4 rounded-xl bg-surface/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-text-main">{pat.name}</strong>
                      <span className="text-[10px] text-text-muted">({pat.age} {pat.gender})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-brand-primary border border-border">
                        {pat.admissionType}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Attending: <strong className="text-text-main">{pat.attendingDoctor}</strong> | Allergy Flag: <strong className="text-red-700">{pat.allergyFlag}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-[10px] text-text-muted font-semibold mb-0.5">
                        Patient Status:
                      </label>
                      <select
                        value={pat.status}
                        onChange={(e) => handleStatusChange(pat.id, e.target.value as any)}
                        className="p-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-brand-primary focus:outline-none focus:border-brand-primary"
                      >
                        <option value="In Consultation">In Consultation</option>
                        <option value="Observation Ward">Observation Ward</option>
                        <option value="Cath Lab In Progress">Cath Lab In Progress</option>
                        <option value="Discharged">Discharged</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attending Doctors Roster */}
          <div className="pt-4 border-t border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-brand-primary" />
              <span>Attending Medical Specialists (IIIT Delhi Hospital)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hospitalDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-surface/30 border border-border space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-text-main">{doc.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface text-brand-primary border border-border">
                      {doc.specialty}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {doc.bio}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-text-muted">
                    <span>Experience: {doc.experienceYears} Years</span>
                    <span className="text-brand-primary font-semibold">{doc.availableNext}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD EARLY ARRIVAL WAITING PATIENT */}
      {showAddWaitingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-main">Check In Early-Arrival Patient</h3>
              <button
                type="button"
                onClick={() => setShowAddWaitingModal(false)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWaitingPatient} className="space-y-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sunita Verma"
                  value={newWaitName}
                  onChange={(e) => setNewWaitName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 48"
                    value={newWaitAge}
                    onChange={(e) => setNewWaitAge(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Gender
                  </label>
                  <select
                    value={newWaitGender}
                    onChange={(e) => setNewWaitGender(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Reason / Early Arrival Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g., BP check & chest tightness. Arrived 45 min early."
                  value={newWaitReason}
                  onChange={(e) => setNewWaitReason(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g., +91 98112-40192"
                  value={newWaitPhone}
                  onChange={(e) => setNewWaitPhone(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWaitingModal(false)}
                  className="px-3 py-2 rounded-xl bg-surface text-text-muted hover:text-text-main font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Check In Patient</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SLOT DETAILS */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-main">Edit Slot Details</h3>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlotEdit} className="space-y-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Slot Time
                </label>
                <input
                  type="text"
                  required
                  value={editSlotTime}
                  onChange={(e) => setEditSlotTime(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border font-mono text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Attending Doctor
                </label>
                <input
                  type="text"
                  required
                  value={editSlotDoctor}
                  onChange={(e) => setEditSlotDoctor(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={editSlotNotes}
                  onChange={(e) => setEditSlotNotes(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-3 py-2 rounded-xl bg-surface text-text-muted hover:text-text-main font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold"
                >
                  Save Slot Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorHospitalDashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading Hospital Console...</div>}>
      <DoctorHospitalDashboardContent />
    </React.Suspense>
  );
}
