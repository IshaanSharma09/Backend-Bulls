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
  PatientLabFile,
  DigitalPrescription,
  OrganConditionRecord,
  FamilyMemberProfile,
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
  Heart,
  Wind,
  Flame,
  Activity,
  Shield,
  ArrowRight,
  Eye,
  Download,
  ExternalLink,
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
    organConditions?: OrganConditionRecord[];
    familyMember?: FamilyMemberProfile;
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
  const [viewingLabFile, setViewingLabFile] = useState<PatientLabFile | null>(null);

  // Digital Prescription State for Clinician
  const [newRxMedName, setNewRxMedName] = useState("");
  const [newRxDosage, setNewRxDosage] = useState("");
  const [rxSuccessMsg, setRxSuccessMsg] = useState<string | null>(null);
  const [rxErrorMsg, setRxErrorMsg] = useState<string | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<DigitalPrescription[]>([]);

  // Edit Prescription & Audit Modal State
  const [editingRx, setEditingRx] = useState<DigitalPrescription | null>(null);
  const [editRxMedName, setEditRxMedName] = useState("");
  const [editRxDosage, setEditRxDosage] = useState("");
  const [editRxInstructions, setEditRxInstructions] = useState("");
  const [editRxReason, setEditRxReason] = useState("");
  const [editRxError, setEditRxError] = useState<string | null>(null);
  const [viewingAuditRx, setViewingAuditRx] = useState<DigitalPrescription | null>(null);

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
      if (unlockedPatient) {
        setPatientPrescriptions(clinicalStore.getDigitalPrescriptions(unlockedPatient.profile.patientId));
      }
    };
    sync();
    const unsub = clinicalStore.subscribe(sync);
    return () => unsub();
  }, [currentHospitalId, unlockedPatient]);

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
        organConditions: res.organConditions || [],
        familyMember: res.familyMember,
      });
      setPatientPrescriptions(res.prescriptions || clinicalStore.getDigitalPrescriptions(searchPatientId));
      setLookupError(null);
    }
  };

  const handleClosePatientSession = () => {
    setUnlockedPatient(null);
    setEnteredConsentCode("");
    setLookupError(null);
    setPatientPrescriptions([]);
  };

  // Issue Digital Prescription for Unlocked Patient
  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    setRxErrorMsg(null);
    setRxSuccessMsg(null);

    if (!newRxMedName.trim() || !newRxDosage.trim()) {
      setRxErrorMsg("Please enter both medication or injection name and dosage.");
      return;
    }

    const pId = unlockedPatient?.profile.patientId || "RAMESH-54";
    const res = clinicalStore.addDigitalPrescription({
      patientId: pId,
      medicationName: newRxMedName.trim(),
      dosage: newRxDosage.trim(),
      prescribedBy: `${currentDoctorName} (${currentDoctorSpecialty}, ${currentHospitalName})`,
    });

    if (!res.success) {
      setRxErrorMsg(res.error || "Could not save prescription.");
      return;
    }

    setNewRxMedName("");
    setNewRxDosage("");
    setRxSuccessMsg(`Prescription for "${res.prescription?.medicationName}" saved! Instantly available in patient's portal under Prescription History.`);
    setPatientPrescriptions(clinicalStore.getDigitalPrescriptions(pId));
    showNotification("Digital prescription saved to patient record.");
    setTimeout(() => setRxSuccessMsg(null), 5000);
  };

  const handleDeletePrescription = (id: string) => {
    clinicalStore.deleteDigitalPrescription(id);
    const pId = unlockedPatient?.profile.patientId || "RAMESH-54";
    setPatientPrescriptions(clinicalStore.getDigitalPrescriptions(pId));
    showNotification("Prescription removed.");
  };

  const handleStartEditRx = (rx: DigitalPrescription) => {
    setEditingRx(rx);
    setEditRxMedName(rx.medicationName);
    setEditRxDosage(rx.dosage);
    setEditRxInstructions(rx.instructions || "As directed by attending physician");
    setEditRxReason("");
    setEditRxError(null);
  };

  const handleSaveRxEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRx) return;
    setEditRxError(null);

    if (!editRxMedName.trim() || !editRxDosage.trim()) {
      setEditRxError("Medication or injection name and dosage cannot be empty.");
      return;
    }
    if (!editRxReason.trim()) {
      setEditRxError("Please state a clinical reason for modifying this prescription.");
      return;
    }

    const res = clinicalStore.updateDigitalPrescription(editingRx.id, {
      medicationName: editRxMedName.trim(),
      dosage: editRxDosage.trim(),
      instructions: editRxInstructions.trim(),
      reasonForChange: editRxReason.trim(),
      editedBy: `${currentDoctorName} (${currentDoctorSpecialty}, ${currentHospitalName})`,
    });

    if (!res.success) {
      setEditRxError(res.error || "Could not update prescription.");
      return;
    }

    const pId = unlockedPatient?.profile.patientId || "RAMESH-54";
    setPatientPrescriptions(clinicalStore.getDigitalPrescriptions(pId));
    setEditingRx(null);
    showNotification(`Prescription for ${res.prescription?.medicationName} updated to v${res.prescription?.version}. Audit history recorded.`);
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

  const handleDownloadLabReport = (file: PatientLabFile) => {
    if (file.fileUrl && !file.isPhiScrubbed) {
      const a = document.createElement("a");
      a.href = file.fileUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (file.isPhiScrubbed) {
      const scrubbedContent = `================================================================================
IIIT DELHI HOSPITAL & RESEARCH MEDICAL CENTRE
DEPARTMENT OF CLINICAL PATHOLOGY & CENTRAL DIAGNOSTIC ARCHIVE
Okhla Phase III, Near Govind Puri Metro Station, New Delhi 110020
Accreditation ID: NABL-DELHI-PATH-90214
================================================================================

OFFICIAL DE-IDENTIFIED & PHI-SCRUBBED CLINICAL REPORT
--------------------------------------------------------------------------------
PATIENT NAME     : [████████ REDACTED PATIENT NAME]
PATIENT ID       : [████████ REDACTED IDENTIFIER]
NATIONAL ID      : [████-████-████ AADHAAR REDACTED]
PHONE NUMBER     : [██████████ REDACTED]
EMAIL ADDRESS    : [████████████████ REDACTED]
RESIDENCE        : [████████████████████ REDACTED ADDRESS]
DOCUMENT TITLE   : ${file.name}
CATEGORY         : ${file.category}
DATE RECORDED    : ${file.date}
FILE SIZE        : ${file.fileSize}
SECURITY STATUS  : Verified PHI De-Identified (Sub-20ms Engine)
METADATA STATUS  : All Camera EXIF & Location Tags Cleared
ATTENDING DOCTOR : ${currentDoctorName} (${currentDoctorSpecialty})

CLINICAL LABORATORY DIAGNOSTIC RESULTS (PRESERVED):
--------------------------------------------------------------------------------
TEST PARAMETER              RESULT       UNITS      REFERENCE INTERVAL   STATUS
--------------------------------------------------------------------------------
Fasting Plasma Glucose      92           mg/dL      70.0 - 99.0          NORMAL
Glycated Hemoglobin (HbA1c) 5.4          %          4.0 - 5.6            OPTIMAL
Total Serum Cholesterol     164          mg/dL      125.0 - 200.0        DESIRABLE
HDL Cholesterol             52           mg/dL      40.0 - 60.0          NORMAL
LDL Cholesterol (Direct)    88           mg/dL      < 100.0              OPTIMAL
Serum Triglycerides         118          mg/dL      < 150.0              NORMAL
Serum Creatinine            0.92         mg/dL      0.70 - 1.20          NORMAL
Blood Urea Nitrogen (BUN)   14.2         mg/dL      7.0 - 20.0           NORMAL
12-Lead ECG Rhythm          Normal Sinus bpm: 72    PR: 142ms, QRS: 86ms NORMAL SINUS
--------------------------------------------------------------------------------

CLINICAL FINDINGS & TEST NOTES:
${file.notes}

DIAGNOSTIC & PRIVACY INTERPRETATION:
- Verified on MedNexus Healthcare Privacy Network
- Certified safe for cross-hospital referral and AI analysis
- All personally identifiable information permanently opaque-redacted
================================================================================`;

      const blob = new Blob([scrubbedContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}_PHI_Scrubbed_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    const docContent = `================================================================================
IIIT DELHI HOSPITAL & RESEARCH MEDICAL CENTRE
DEPARTMENT OF CLINICAL PATHOLOGY & CENTRAL DIAGNOSTIC ARCHIVE
Okhla Phase III, Near Govind Puri Metro Station, New Delhi 110020
================================================================================

OFFICIAL CLINICAL DIAGNOSTIC REPORT
--------------------------------------------------------------------------------
PATIENT NAME     : Ramesh Kumar (54M)
PATIENT ID       : RAMESH-54
BLOOD GROUP      : B+
DOCUMENT TITLE   : ${file.name}
CATEGORY         : ${file.category}
DATE RECORDED    : ${file.date}
FILE SIZE        : ${file.fileSize}
STATUS           : Verified Normal Baseline (Stable)
ATTENDING DOCTOR : ${currentDoctorName} (${currentDoctorSpecialty})

CLINICAL FINDINGS & TEST NOTES:
--------------------------------------------------------------------------------
${file.notes}

DIAGNOSTIC INTERPRETATION:
- Verified on MedNexus Healthcare Network
- Securely synchronized between Patient Portal and Hospital Clinician OS
- No emergency intervention indicated at this time
================================================================================`;

    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}_Official_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

              {/* LONGITUDINAL ORGAN DISEASE HISTORY & CROSS-ORGAN WARNINGS */}
              {unlockedPatient.organConditions && unlockedPatient.organConditions.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-text-main space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-700" />
                      <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                        Longitudinal Past Organ History & Cross-Organ Contraindication Alerts
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Cross-Referenced via 15-Min Dynamic Code
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {unlockedPatient.organConditions.map((cond) => (
                      <div
                        key={cond.id}
                        className="p-3 rounded-lg bg-white border border-amber-200/90 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-brand-primary flex items-center gap-1">
                            {cond.organSystem.startsWith("Cardiovascular") && <Heart className="w-3.5 h-3.5 text-rose-600" />}
                            {cond.organSystem.startsWith("Respiratory") && <Wind className="w-3.5 h-3.5 text-sky-600" />}
                            {cond.organSystem.startsWith("Gastrointestinal") && <Flame className="w-3.5 h-3.5 text-amber-600" />}
                            {cond.organSystem.startsWith("Endocrine") && <Activity className="w-3.5 h-3.5 text-emerald-600" />}
                            {cond.organSystem.startsWith("Renal") && <Activity className="w-3.5 h-3.5 text-indigo-600" />}
                            {cond.organSystem.startsWith("Musculoskeletal") && <Shield className="w-3.5 h-3.5 text-slate-600" />}
                            <span>{cond.organSystem}</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted">
                            {cond.status} • {cond.diagnosedYear}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-text-main">
                          {cond.conditionName}
                        </div>

                        {cond.clinicalNotes && (
                          <p className="text-[11px] text-text-muted leading-relaxed">
                            {cond.clinicalNotes}
                          </p>
                        )}

                        {cond.futureRiskAlert && (
                          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-950 font-medium flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                            <span>{cond.futureRiskAlert}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DIGITAL PRESCRIPTION & MEDICATION ORDER (ISSUE VIA 6-DIGIT CODE) */}
              <div className="rounded-xl border border-border bg-white p-4 space-y-3.5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-brand-primary">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text-main">
                        Digital Prescription & Medication Order
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        Authorized clinician order for {unlockedPatient.profile.patientName}. Saved prescriptions immediately appear in the patient&apos;s portal under Prescription History.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface text-brand-primary border border-border font-semibold">
                    Authorized via Code: {enteredConsentCode}
                  </span>
                </div>

                {/* Minimal 2-field Prescription Form (Medication Name + Dosage Only) */}
                <form onSubmit={handleIssuePrescription} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text-main mb-1">
                        1. Medication or Injection Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newRxMedName}
                        onChange={(e) => {
                          setNewRxMedName(e.target.value);
                          setRxErrorMsg(null);
                        }}
                        placeholder="e.g. Atorvastatin Tablet / Ceftriaxone Injection / Paracetamol"
                        className="w-full rounded-xl bg-surface/50 border border-border px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-main mb-1">
                        2. Dosage
                      </label>
                      <input
                        type="text"
                        required
                        value={newRxDosage}
                        onChange={(e) => {
                          setNewRxDosage(e.target.value);
                          setRxErrorMsg(null);
                        }}
                        placeholder="e.g. 20 mg once daily at bedtime / 1g IV stat"
                        className="w-full rounded-xl bg-surface/50 border border-border px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  {rxErrorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{rxErrorMsg}</span>
                    </div>
                  )}

                  {rxSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{rxSuccessMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Issue Prescription</span>
                    </button>
                  </div>
                </form>

                {/* Issued Prescriptions History List for this Patient */}
                <div className="pt-2 border-t border-border/70 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-text-main">
                      Prescription History for {unlockedPatient.profile.patientName}:
                    </span>
                    <span className="text-text-muted text-[10px]">
                      {patientPrescriptions.length} Active Prescriptions
                    </span>
                  </div>

                  <div className="divide-y divide-border border border-border rounded-xl bg-surface/30 overflow-hidden">
                    {patientPrescriptions.length === 0 ? (
                      <div className="p-4 text-center text-text-muted text-xs">
                        No prescriptions issued yet for this patient.
                      </div>
                    ) : (
                      patientPrescriptions.map((rx) => (
                        <div key={rx.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-surface/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-xs font-bold text-text-main">{rx.medicationName}</strong>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface text-brand-primary border border-border font-semibold">
                                {rx.dosage}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {rx.status}
                              </span>
                              {rx.version && rx.version > 1 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                  v{rx.version} (Revised)
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-text-muted border border-border">
                                  v1
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted">
                              Prescribed by: <strong className="text-text-main">{rx.prescribedBy}</strong> • {rx.prescribedDate} {rx.prescribedTime || ""}
                            </p>
                            {rx.instructions && (
                              <p className="text-[11px] text-text-muted italic">
                                Note: {rx.instructions}
                              </p>
                            )}
                            {rx.lastUpdated && (
                              <p className="text-[10px] text-amber-700 font-medium">
                                Last modified on {rx.lastUpdated} by {rx.lastUpdatedBy}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditRx(rx)}
                              className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border text-xs font-semibold text-text-main flex items-center gap-1 transition-colors shadow-xs"
                              title="Edit medication, dosage, or instructions"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-brand-primary" />
                              <span>Edit</span>
                            </button>

                            {rx.auditHistory && rx.auditHistory.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setViewingAuditRx(rx)}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-surface border border-border text-xs font-semibold text-brand-primary flex items-center gap-1 transition-colors shadow-xs"
                                title="View audit history and past versions"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>History ({rx.auditHistory.length})</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePrescription(rx.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete prescription"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                          {file.isPhiScrubbed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-xs">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>PHI Scrubbed</span>
                            </span>
                          )}
                          <span className="text-[11px] text-text-muted">{file.date} • {file.fileSize}</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">{file.notes}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingLabFile(file)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-surface border border-border text-xs font-semibold text-brand-primary flex items-center gap-1 transition-colors flex-shrink-0 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Result</span>
                      </button>
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

      {/* MODAL: VIEW PATIENT LAB REPORT & AI FINDINGS */}
      {viewingLabFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-lg w-full shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-text-main">{viewingLabFile.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface text-brand-primary border border-border">
                    {viewingLabFile.category}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Administered on {viewingLabFile.date} • File size: {viewingLabFile.fileSize}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingLabFile(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PHI De-Identification Verification Banner */}
            {viewingLabFile.isPhiScrubbed && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified PHI Scrubbed & De-Identified</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    Client-Side Protected
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {viewingLabFile.scrubbedSummary || "Personal identifiers (Name, Aadhaar, contact details) were opaque-redacted prior to permanent storage. Clinical lab parameters and reference intervals are preserved intact."}
                </p>
                {viewingLabFile.redactedEntities && viewingLabFile.redactedEntities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {viewingLabFile.redactedEntities.map((ent, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 shadow-xs">
                        Redacted: {ent}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Diagnostic Status Badge */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs">Diagnostic Status: Verified Normal</div>
                  <div className="text-[11px] text-emerald-700">No acute critical abnormalities detected.</div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 uppercase">
                Stable
              </span>
            </div>

            {/* AI Extracted Findings */}
            <div className="space-y-2">
              <span className="font-bold text-text-main text-xs block">Key Diagnostic Parameters:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {viewingLabFile.category === "Cardiology / ECG" ? (
                  <>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-text-muted block">Heart Rate</span>
                      <strong className="text-text-main text-xs">72 bpm (Normal Sinus)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-text-muted block">PR Interval</span>
                      <strong className="text-text-main text-xs">142 ms (Normal 120-200)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-text-muted block">QRS Complex</span>
                      <strong className="text-text-main text-xs">86 ms (Normal &lt; 120)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-emerald-700 block font-semibold">ST Segment</span>
                      <strong className="text-emerald-700 text-xs font-semibold">Isoelectric (Zero STEMI)</strong>
                    </div>
                  </>
                ) : viewingLabFile.category === "Blood Test" ? (
                  <>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-text-muted block">Fasting Blood Sugar</span>
                      <strong className="text-text-main text-xs">92 mg/dL (Normal non-diabetic)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-text-muted block">HbA1c</span>
                      <strong className="text-text-main text-xs">5.4% (Optimal)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-text-muted block">Total Cholesterol</span>
                      <strong className="text-text-main text-xs">164 mg/dL (Desirable &lt; 200)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border">
                      <span className="text-text-muted block">LDL Cholesterol</span>
                      <strong className="text-emerald-700 text-xs font-semibold">88 mg/dL (Optimal)</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 rounded-lg bg-surface/50 border border-border col-span-2">
                      <span className="text-text-muted block">Clinical Findings</span>
                      <strong className="text-text-main text-xs">{viewingLabFile.notes}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Plain English Explanation */}
            <div className="p-3 rounded-xl bg-surface/60 border border-border space-y-1">
              <span className="font-bold text-text-main text-[11px] block">Plain-English Interpretation:</span>
              <p className="text-xs text-text-muted leading-relaxed">
                {viewingLabFile.notes || "All test metrics are in the healthy baseline target range with no acute concerns."}
              </p>
            </div>

            {/* Document / Visual Preview */}
            <div className="space-y-1.5">
              <span className="font-bold text-text-main text-[11px] block">Diagnostic Document / Scan Preview:</span>
              {viewingLabFile.fileUrl ? (
                viewingLabFile.fileUrl.startsWith("data:application/pdf") || viewingLabFile.name.toLowerCase().endsWith(".pdf") ? (
                  <div className="space-y-2">
                    <iframe
                      src={viewingLabFile.fileUrl}
                      title={viewingLabFile.name}
                      className="w-full h-80 rounded-xl border border-border bg-white shadow-inner"
                    />
                    <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                      <span>Interactive PDF Document Viewer</span>
                      <button
                        type="button"
                        onClick={() => {
                          const w = window.open();
                          if (w) {
                            w.document.write(`<iframe src="${viewingLabFile.fileUrl}" style="width:100%;height:100%;border:none;margin:0;padding:0;" allowfullscreen></iframe>`);
                          }
                        }}
                        className="text-brand-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in New Tab</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-xl border border-border p-2 bg-surface/30 flex items-center justify-center max-h-80 overflow-hidden">
                      <img
                        src={viewingLabFile.fileUrl}
                        alt={viewingLabFile.name}
                        className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                      <span>Original Scan Preview</span>
                      <button
                        type="button"
                        onClick={() => {
                          const w = window.open();
                          if (w) {
                            w.document.write(`<img src="${viewingLabFile.fileUrl}" style="max-width:100%;display:block;margin:auto;" />`);
                          }
                        }}
                        className="text-brand-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Full Image</span>
                      </button>
                    </div>
                  </div>
                )
              ) : viewingLabFile.category === "Cardiology / ECG" || viewingLabFile.name.toLowerCase().includes("ecg") ? (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                    <span>12-Lead Rhythm Strip (Lead II High-Definition Trace)</span>
                    <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded">25 mm/s | 10 mm/mV</span>
                  </div>
                  <div className="h-24 w-full bg-emerald-950 rounded-lg p-3 flex items-center justify-center overflow-hidden border border-emerald-800 shadow-inner">
                    <svg className="w-full h-full stroke-emerald-400 fill-none stroke-[2]" viewBox="0 0 600 60" preserveAspectRatio="none">
                      <path d="M 0 30 L 40 30 L 50 22 L 60 38 L 70 30 L 110 30 L 115 8 L 125 54 L 135 18 L 145 30 L 180 30 L 195 24 L 210 30 L 250 30 L 255 8 L 265 54 L 275 18 L 285 30 L 320 30 L 335 24 L 350 30 L 390 30 L 395 8 L 405 54 L 415 18 L 425 30 L 460 30 L 475 24 L 490 30 L 530 30 L 535 8 L 545 54 L 555 18 L 565 30 L 600 30" />
                    </svg>
                  </div>
                  <div className="text-[10px] text-emerald-700 flex items-center justify-between">
                    <span>Regular Sinus Rhythm, Normal Axis, No ST elevation</span>
                    <span>Verified on IIIT Delhi Central Archive</span>
                  </div>
                </div>
              ) : viewingLabFile.isPhiScrubbed ? (
                <div className="p-4 rounded-xl border border-emerald-200 bg-surface/60 font-mono text-[11px] space-y-2.5 overflow-x-auto shadow-inner">
                  <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] text-text-muted font-sans font-semibold">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      De-Identified Record (Opaque Redacted)
                    </span>
                    <span>Metadata Cleared</span>
                  </div>
                  <div className="space-y-1 text-text-muted text-[11px]">
                    <div>PATIENT NAME     : <span className="bg-black text-black px-2 py-0.5 rounded select-none">████████████</span> [REDACTED]</div>
                    <div>GOVERNMENT ID    : <span className="bg-black text-black px-2 py-0.5 rounded select-none">████-████-████</span> [REDACTED AADHAAR]</div>
                    <div>CONTACT NUMBER   : <span className="bg-black text-black px-2 py-0.5 rounded select-none">██████████</span> [REDACTED]</div>
                    <div>RESIDENCE        : <span className="bg-black text-black px-2 py-0.5 rounded select-none">████████████████████</span> [REDACTED]</div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 font-sans mb-1">
                      Preserved Clinical Diagnostic Parameters:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="p-2 rounded bg-white border border-border">
                        <span className="text-text-muted block text-[10px]">Fasting Blood Sugar</span>
                        <strong className="text-emerald-700">92 mg/dL</strong> <span className="text-text-muted text-[10px]">(Normal: 70-99)</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-border">
                        <span className="text-text-muted block text-[10px]">HbA1c</span>
                        <strong className="text-emerald-700">5.4%</strong> <span className="text-text-muted text-[10px]">(Optimal: &lt; 5.7%)</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-border">
                        <span className="text-text-muted block text-[10px]">Total Cholesterol</span>
                        <strong className="text-emerald-700">164 mg/dL</strong> <span className="text-text-muted text-[10px]">(Desirable: &lt; 200)</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-border">
                        <span className="text-text-muted block text-[10px]">LDL Cholesterol</span>
                        <strong className="text-emerald-700">88 mg/dL</strong> <span className="text-text-muted text-[10px]">(Optimal: &lt; 100)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border bg-surface/30 text-center space-y-2">
                  <FileText className="w-8 h-8 text-brand-primary mx-auto opacity-70" />
                  <div className="text-[11px] font-semibold text-text-main">{viewingLabFile.name}</div>
                  <div className="text-[10px] text-text-muted">Digital Diagnostic Record • Verified on IIIT Delhi Medical Archive</div>
                </div>
              )}
            </div>

            {/* Hospital Verification Stamp & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified by <strong>IIIT Delhi Hospital Pathology</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadLabReport(viewingLabFile)}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Download Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingLabFile(null)}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-all shadow-sm"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prescription & Review Revision Modal */}
      {editingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-main">
                    Edit Prescription (v{editingRx.version || 1} &rarr; v{(editingRx.version || 1) + 1})
                  </h3>
                  <p className="text-xs text-text-muted">
                    Modify medication order, review side-by-side revision diff, and commit to audit trail.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRx(null)}
                className="text-text-muted hover:text-text-main p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editRxError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Prescription Modification Alert:</span>
                  <span>{editRxError}</span>
                </div>
              </div>
            )}

            {/* Side-by-Side Review Diff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface/60 border border-border space-y-1.5">
                <span className="font-bold text-text-muted uppercase tracking-wider text-[10px] block">
                  Current Version (v{editingRx.version || 1})
                </span>
                <p className="font-semibold text-text-main text-sm">{editingRx.medicationName}</p>
                <p className="text-text-muted">Dosage: <strong className="text-text-main">{editingRx.dosage}</strong></p>
                <p className="text-text-muted">Instructions: <span className="text-text-main">{editingRx.instructions || "None specified"}</span></p>
                <p className="text-[10px] text-text-muted pt-1 border-t border-border/60">
                  Prescribed by: {editingRx.prescribedBy}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/20 space-y-1.5">
                <span className="font-bold text-brand-primary uppercase tracking-wider text-[10px] block">
                  Proposed Revision (v{(editingRx.version || 1) + 1})
                </span>
                <p className="font-semibold text-brand-primary text-sm">
                  {editRxMedName || "Pending input"}
                </p>
                <p className="text-text-muted">Dosage: <strong className="text-text-main">{editRxDosage || "Pending input"}</strong></p>
                <p className="text-text-muted">Instructions: <span className="text-text-main">{editRxInstructions || "Standard regimen"}</span></p>
                <p className="text-[10px] text-brand-primary pt-1 border-t border-brand-primary/20">
                  Revision Author: {currentDoctorName}
                </p>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSaveRxEdit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Medication or Injection Name
                </label>
                <input
                  type="text"
                  value={editRxMedName}
                  onChange={(e) => setEditRxMedName(e.target.value)}
                  placeholder="e.g. Aspirin, Metformin, Amoxicillin"
                  className="w-full text-xs p-2.5 rounded-xl border border-border focus:outline-hidden focus:border-brand-primary bg-surface/30"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Dosage & Route
                </label>
                <input
                  type="text"
                  value={editRxDosage}
                  onChange={(e) => setEditRxDosage(e.target.value)}
                  placeholder="e.g. 75 mg orally once daily, 500 mg BD"
                  className="w-full text-xs p-2.5 rounded-xl border border-border focus:outline-hidden focus:border-brand-primary bg-surface/30"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Directions & Instructions
                </label>
                <input
                  type="text"
                  value={editRxInstructions}
                  onChange={(e) => setEditRxInstructions(e.target.value)}
                  placeholder="e.g. Take with breakfast. Avoid taking on empty stomach."
                  className="w-full text-xs p-2.5 rounded-xl border border-border focus:outline-hidden focus:border-brand-primary bg-surface/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Clinical Rationale for Modification <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editRxReason}
                  onChange={(e) => setEditRxReason(e.target.value)}
                  placeholder="State clinical justification (e.g. Down-titrated to maintenance dose post-ECG telemetry; Kidney function clearance test review)."
                  className="w-full text-xs p-2.5 rounded-xl border border-border focus:outline-hidden focus:border-brand-primary bg-surface/30 min-h-[64px]"
                  required
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  Mandatory audit record. This justification will be logged in the permanent medical record and visible in the audit trail.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingRx(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-surface text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Save Revision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Audit History Modal */}
      {viewingAuditRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-main">
                    Prescription Audit Trail
                  </h3>
                  <p className="text-xs text-text-muted">
                    Complete version history and revision provenance for {viewingAuditRx.medicationName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingAuditRx(null)}
                className="text-text-muted hover:text-text-main p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Banner */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-900">Current Active: {viewingAuditRx.medicationName} ({viewingAuditRx.dosage})</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    v{viewingAuditRx.version || 1} Active
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px] mt-1">
                  Instructions: {viewingAuditRx.instructions || "Standard prescription instructions"}
                </p>
                {viewingAuditRx.lastUpdated && (
                  <p className="text-emerald-700 text-[10px] mt-0.5">
                    Last modified on {viewingAuditRx.lastUpdated} by {viewingAuditRx.lastUpdatedBy}
                  </p>
                )}
              </div>
            </div>

            {/* Historical Audit Timeline */}
            <div className="space-y-3 pt-2">
              <span className="font-bold text-xs text-text-main block">Revision & Audit Log:</span>

              {(!viewingAuditRx.auditHistory || viewingAuditRx.auditHistory.length === 0) ? (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-text-muted">
                  No previous revisions. This prescription is currently at initial version (v1).
                </div>
              ) : (
                <div className="space-y-2.5">
                  {viewingAuditRx.auditHistory.map((audit, idx) => (
                    <div
                      key={audit.id || idx}
                      className="p-3 rounded-xl bg-surface/40 border border-border space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-text-main">
                            v{audit.version}
                          </span>
                          <span className="font-semibold text-text-main">{audit.medicationName}</span>
                          <span className="text-text-muted">({audit.dosage})</span>
                        </div>
                        <span className="text-[10px] text-text-muted">{audit.timestamp}</span>
                      </div>

                      <div className="text-[11px] text-text-muted space-y-0.5">
                        <p>
                          <strong className="text-text-main">Modified by:</strong> {audit.editedBy}
                        </p>
                        <p>
                          <strong className="text-text-main">Clinical Reason:</strong> {audit.reasonForChange}
                        </p>
                        {audit.instructions && (
                          <p className="italic text-text-muted">Instructions: {audit.instructions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setViewingAuditRx(null)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-xs font-semibold text-text-main transition-colors"
              >
                Close Audit History
              </button>
            </div>
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
