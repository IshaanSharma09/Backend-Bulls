"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import {
  clinicalStore,
  PatientHealthProfile,
  PatientLabFile,
  DoctorProfile,
  DynamicPatientAccessCode,
} from "../../lib/clinicalStore";
import {
  ShieldCheck,
  Key,
  RefreshCw,
  Clock,
  Pill,
  CheckCircle2,
  FileText,
  Search,
  Printer,
  AlertTriangle,
  Calendar,
  ArrowRight,
  User,
  Star,
  Lock,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  FileCheck,
  Activity,
  Dna,
  Syringe,
  Check,
} from "lucide-react";

function PatientDashboardContent() {
  const { patientUser } = useAuth();
  const searchParams = useSearchParams();

  // Active Tab state: only 3 clean tabs
  const [activeTab, setActiveTab] = useState<"report" | "code" | "doctor">("report");

  // Health Profile State (100% User Editable with pen icons)
  const [profile, setProfile] = useState<PatientHealthProfile>(clinicalStore.getHealthProfile());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Dynamic Access Code State
  const [accessCode, setAccessCode] = useState<DynamicPatientAccessCode>(clinicalStore.getAccessCode());
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeRenewedMsg, setCodeRenewedMsg] = useState<string | null>(null);

  // Doctors & Search State
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [searchSymptom, setSearchSymptom] = useState("");

  // Pen Edit States for Direct Typing
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryInput, setSummaryInput] = useState("");

  const [editingAllergyIndex, setEditingAllergyIndex] = useState<number | null>(null);
  const [allergyInput, setAllergyInput] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  const [editingGeneticsIndex, setEditingGeneticsIndex] = useState<number | null>(null);
  const [geneticsInput, setGeneticsInput] = useState("");
  const [newGenetics, setNewGenetics] = useState("");

  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [medEditName, setMedEditName] = useState("");
  const [medEditDose, setMedEditDose] = useState("");
  const [medEditFreq, setMedEditFreq] = useState("");
  const [medEditNote, setMedEditNote] = useState("");

  const [newMedName, setNewMedName] = useState("");
  const [newMedDose, setNewMedDose] = useState("");
  const [newMedFreq, setNewMedFreq] = useState("");
  const [newMedNote, setNewMedNote] = useState("");
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  const [editingVaccineIndex, setEditingVaccineIndex] = useState<number | null>(null);
  const [vaccineEditName, setVaccineEditName] = useState("");
  const [vaccineEditStatus, setVaccineEditStatus] = useState("");
  const [vaccineEditDate, setVaccineEditDate] = useState("");

  const [newVaccineName, setNewVaccineName] = useState("");
  const [newVaccineStatus, setNewVaccineStatus] = useState("Completed");
  const [newVaccineDate, setNewVaccineDate] = useState("");
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<PatientLabFile["category"]>("Blood Test");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadSize, setUploadSize] = useState("1.0 MB");
  const [uploadNotes, setUploadNotes] = useState("");

  // File Edit State
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editFileCategory, setEditFileCategory] = useState<PatientLabFile["category"]>("Blood Test");
  const [editFileDate, setEditFileDate] = useState("");
  const [editFileNotes, setEditFileNotes] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "code" || tabParam === "doctor" || tabParam === "report") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const sync = () => {
      const p = clinicalStore.getHealthProfile();
      setProfile(p);
      setSummaryInput(p.simpleSummary);
      setAccessCode(clinicalStore.getAccessCode());
      setDoctors(clinicalStore.getAllDoctors());
    };
    sync();
    const unsub = clinicalStore.subscribe(sync);
    return () => unsub();
  }, []);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // --- Dynamic Code Handlers ---
  const handleGenerateNewCode = () => {
    const newCode = clinicalStore.generateNewAccessCode();
    setCodeRenewedMsg(`New 15-minute visit code ${newCode} generated. Old codes revoked.`);
    setTimeout(() => setCodeRenewedMsg(null), 5000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 3000);
  };

  // --- Overall Status Handlers ---
  const handleSaveSummary = () => {
    if (!summaryInput.trim()) return;
    clinicalStore.updateHealthProfile({ simpleSummary: summaryInput.trim() });
    setEditingSummary(false);
    showNotification("Health summary updated.");
  };

  // --- Allergy Pen Handlers ---
  const handleStartEditAllergy = (idx: number, currentText: string) => {
    setEditingAllergyIndex(idx);
    setAllergyInput(currentText);
  };

  const handleSaveAllergy = (idx: number) => {
    if (!allergyInput.trim()) return;
    clinicalStore.updateAllergy(idx, allergyInput.trim());
    setEditingAllergyIndex(null);
    showNotification("Allergy record updated.");
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    clinicalStore.addPatientAllergy(newAllergy.trim());
    setNewAllergy("");
    showNotification("New allergy added.");
  };

  const handleRemoveAllergy = (idx: number) => {
    clinicalStore.removePatientAllergy(idx);
    showNotification("Allergy removed.");
  };

  // --- Genetics / Family History Pen Handlers ---
  const handleStartEditGenetics = (idx: number, currentText: string) => {
    setEditingGeneticsIndex(idx);
    setGeneticsInput(currentText);
  };

  const handleSaveGenetics = (idx: number) => {
    if (!geneticsInput.trim()) return;
    clinicalStore.updateGenetics(idx, geneticsInput.trim());
    setEditingGeneticsIndex(null);
    showNotification("Family history updated.");
  };

  const handleAddGenetics = () => {
    if (!newGenetics.trim()) return;
    clinicalStore.addPatientGenetics(newGenetics.trim());
    setNewGenetics("");
    showNotification("Family history item added.");
  };

  const handleRemoveGenetics = (idx: number) => {
    clinicalStore.removePatientGenetics(idx);
    showNotification("Item removed.");
  };

  // --- Medicine Pen Handlers ---
  const handleStartEditMed = (med: PatientHealthProfile["currentMedicines"][0]) => {
    setEditingMedId(med.id);
    setMedEditName(med.name);
    setMedEditDose(med.dose);
    setMedEditFreq(med.frequency);
    setMedEditNote(med.instructions);
  };

  const handleSaveMed = (id: string) => {
    if (!medEditName.trim()) return;
    clinicalStore.updatePatientMedicine(id, {
      name: medEditName.trim(),
      dose: medEditDose.trim(),
      frequency: medEditFreq.trim(),
      instructions: medEditNote.trim(),
    });
    setEditingMedId(null);
    showNotification("Medicine updated.");
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    clinicalStore.addPatientMedicine({
      name: newMedName.trim(),
      dose: newMedDose.trim() || "1 Dose",
      frequency: newMedFreq.trim() || "Once daily",
      instructions: newMedNote.trim() || "As advised",
    });
    setNewMedName("");
    setNewMedDose("");
    setNewMedFreq("");
    setNewMedNote("");
    setShowAddMedModal(false);
    showNotification("Medicine added.");
  };

  const handleRemoveMedicine = (id: string) => {
    clinicalStore.removePatientMedicine(id);
    showNotification("Medicine removed.");
  };

  // --- Vaccine Pen Handlers ---
  const handleStartEditVaccine = (idx: number, vac: PatientHealthProfile["vaccinations"][0]) => {
    setEditingVaccineIndex(idx);
    setVaccineEditName(vac.name);
    setVaccineEditStatus(vac.status);
    setVaccineEditDate(vac.date);
  };

  const handleSaveVaccine = (idx: number) => {
    if (!vaccineEditName.trim()) return;
    clinicalStore.updateVaccine(idx, {
      name: vaccineEditName.trim(),
      status: vaccineEditStatus.trim(),
      date: vaccineEditDate.trim(),
    });
    setEditingVaccineIndex(null);
    showNotification("Vaccine record updated.");
  };

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineName.trim()) return;
    clinicalStore.addPatientVaccine({
      name: newVaccineName.trim(),
      status: newVaccineStatus.trim() || "Completed",
      date: newVaccineDate.trim() || "Recent",
    });
    setNewVaccineName("");
    setNewVaccineDate("");
    setShowAddVaccineModal(false);
    showNotification("Vaccine added.");
  };

  const handleRemoveVaccine = (idx: number) => {
    clinicalStore.removePatientVaccine(idx);
    showNotification("Vaccine removed.");
  };

  // --- File Upload & Edit Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadSize(`${sizeMb} MB`);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    clinicalStore.uploadLabFile({
      name: uploadFileName.trim(),
      category: uploadCategory,
      date: uploadDate.trim() || new Date().toLocaleDateString("en-GB"),
      fileSize: uploadSize,
      notes: uploadNotes.trim() || "Uploaded by patient for medical review.",
    });
    setUploadFileName("");
    setUploadNotes("");
    setShowUploadModal(false);
    showNotification("Lab report uploaded successfully.");
  };

  const handleStartEditFile = (file: PatientLabFile) => {
    setEditingFileId(file.id);
    setEditFileName(file.name);
    setEditFileCategory(file.category);
    setEditFileDate(file.date);
    setEditFileNotes(file.notes);
  };

  const handleSaveEditFile = () => {
    if (!editingFileId) return;
    clinicalStore.updateLabFile(editingFileId, {
      name: editFileName,
      category: editFileCategory,
      date: editFileDate,
      notes: editFileNotes,
    });
    setEditingFileId(null);
    showNotification("File details saved.");
  };

  const handleDeleteFile = (id: string) => {
    clinicalStore.deleteLabFile(id);
    showNotification("File deleted.");
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!searchSymptom.trim()) return true;
    const q = searchSymptom.toLowerCase();
    return (
      doc.specialty.toLowerCase().includes(q) ||
      doc.name.toLowerCase().includes(q) ||
      doc.matchedSymptoms.some((s) => s.includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* Top Patient Profile Header */}
      <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface text-brand-primary text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personal Health Profile (IIIT Delhi Hospital)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              {profile.patientName || patientUser?.name || "Ramesh Kumar"}
            </h1>
            <p className="text-xs text-text-muted">
              Patient ID: <strong className="text-text-main font-mono">{profile.patientId}</strong> | Blood Group: <strong className="text-brand-primary font-mono">{profile.bloodGroup}</strong> | Age: {profile.age} {profile.gender}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 text-text-main border border-border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Profile</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-surface border border-brand-accent/40 text-xs font-semibold text-brand-primary flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* THREE DISTINCT TABS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "report"
              ? "bg-white text-brand-primary border border-border shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Health Profile & Lab Files</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("code")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "code"
              ? "bg-white text-brand-primary border border-border shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Doctor Visit Code (15-Min)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("doctor")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "doctor"
              ? "bg-white text-brand-primary border border-border shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Find Doctor</span>
        </button>
      </div>

      {/* TAB 1: HEALTH PROFILE & FILES (CRISP, MINIMAL, ZERO JARGON, DIRECT PEN EDITING) */}
      {activeTab === "report" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Status Bar with Pen Edit */}
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-brand-primary flex-shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Overall Health Status
                </span>
                {editingSummary ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={summaryInput}
                      onChange={(e) => setSummaryInput(e.target.value)}
                      className="flex-1 p-1.5 rounded-lg border border-brand-primary bg-white text-xs text-text-main focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSummary}
                      className="p-1.5 rounded-lg bg-brand-primary text-white"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSummary(false)}
                      className="p-1.5 rounded-lg bg-surface text-text-muted"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs font-medium text-text-main">
                      {profile.simpleSummary}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSummaryInput(profile.simpleSummary);
                        setEditingSummary(true);
                      }}
                      className="p-1 rounded text-text-muted hover:text-brand-primary hover:bg-surface"
                      title="Edit status"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1. ALLERGIES & SENSITIVITIES (WITH DIRECT PEN EDITING) */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-bold text-text-main">
                  Things I Am Allergic To
                </h2>
              </div>
              <span className="text-[11px] text-text-muted">
                Click the pen icon on any allergy to edit and type directly
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2.5">
                {profile.allergies.map((allergy, idx) => (
                  <div key={idx} className="flex items-center">
                    {editingAllergyIndex === idx ? (
                      /* Inline pen editor */
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-red-50 border-2 border-brand-primary shadow-sm">
                        <input
                          type="text"
                          value={allergyInput}
                          autoFocus
                          onChange={(e) => setAllergyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveAllergy(idx);
                            if (e.key === "Escape") setEditingAllergyIndex(null);
                          }}
                          className="px-2 py-1 text-xs text-text-main bg-white rounded-lg border border-border focus:outline-none focus:border-brand-primary min-w-[200px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveAllergy(idx)}
                          className="p-1 rounded bg-brand-primary text-white hover:bg-brand-primary/90"
                          title="Save change"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAllergyIndex(null)}
                          className="p-1 rounded bg-surface text-text-muted hover:text-text-main"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Tag with pen icon */
                      <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 shadow-sm group">
                        <span>{allergy}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditAllergy(idx, allergy)}
                            className="p-1 rounded hover:bg-red-200 text-red-800 transition-colors"
                            title="Edit this allergy"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAllergy(idx)}
                            className="p-1 rounded hover:bg-red-200 text-red-800 transition-colors"
                            title="Remove allergy"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Allergy input */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <input
                  type="text"
                  placeholder="Type an allergy (e.g., Penicillin, Ibuprofen, Peanuts, Shellfish, Dust)"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddAllergy();
                  }}
                  className="flex-1 p-2 rounded-xl border border-border bg-surface text-xs text-text-main focus:outline-none focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Allergy</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. FAMILY HISTORY & GENETICS (WITH DIRECT PEN EDITING) */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-brand-blue" />
                <h2 className="text-sm font-bold text-text-main">
                  Genetics & Family History
                </h2>
              </div>
              <span className="text-[11px] text-text-muted">
                Click the pen icon on any item to edit and type directly
              </span>
            </div>

            <div className="space-y-2.5">
              <ul className="space-y-2 text-xs">
                {profile.genetics.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface/40 border border-border flex items-center justify-between gap-2"
                  >
                    {editingGeneticsIndex === idx ? (
                      /* Inline pen editor */
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={geneticsInput}
                          autoFocus
                          onChange={(e) => setGeneticsInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveGenetics(idx);
                            if (e.key === "Escape") setEditingGeneticsIndex(null);
                          }}
                          className="flex-1 p-1.5 text-xs text-text-main bg-white rounded-lg border border-brand-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveGenetics(idx)}
                          className="p-1.5 rounded-lg bg-brand-primary text-white"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingGeneticsIndex(null)}
                          className="p-1.5 rounded-lg bg-surface text-text-muted"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Display with pen */
                      <>
                        <span className="text-text-main flex-1">{item}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditGenetics(idx, item)}
                            className="p-1 rounded text-text-muted hover:text-brand-primary hover:bg-surface"
                            title="Edit this family history"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGenetics(idx)}
                            className="p-1 rounded text-text-muted hover:text-red-600"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* Add New Genetics input */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <input
                  type="text"
                  placeholder="Add family medical history (e.g., Father had heart condition at 58, Mother has diabetes)"
                  value={newGenetics}
                  onChange={(e) => setNewGenetics(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddGenetics();
                  }}
                  className="flex-1 p-2 rounded-xl border border-border bg-surface text-xs text-text-main focus:outline-none focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={handleAddGenetics}
                  className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add History</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. CURRENT MEDICINES (WITH DIRECT PEN EDITING) */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-brand-primary" />
                <h2 className="text-sm font-bold text-text-main">
                  Current Medicines
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMedModal(true)}
                className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface/80 text-brand-primary border border-border text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {profile.currentMedicines.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl bg-surface/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {editingMedId === med.id ? (
                    /* Inline Medicine Editor */
                    <div className="w-full space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={medEditName}
                          onChange={(e) => setMedEditName(e.target.value)}
                          placeholder="Medicine Name"
                          className="p-1.5 rounded-lg border border-brand-primary bg-white text-xs text-text-main focus:outline-none"
                        />
                        <input
                          type="text"
                          value={medEditDose}
                          onChange={(e) => setMedEditDose(e.target.value)}
                          placeholder="Dose (e.g. 75 mg)"
                          className="p-1.5 rounded-lg border border-border bg-white text-xs text-text-main focus:outline-none"
                        />
                        <input
                          type="text"
                          value={medEditFreq}
                          onChange={(e) => setMedEditFreq(e.target.value)}
                          placeholder="Frequency (e.g. Once daily)"
                          className="p-1.5 rounded-lg border border-border bg-white text-xs text-text-main focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={medEditNote}
                          onChange={(e) => setMedEditNote(e.target.value)}
                          placeholder="Instructions (e.g. Take after breakfast)"
                          className="flex-1 p-1.5 rounded-lg border border-border bg-white text-xs text-text-main focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveMed(med.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMedId(null)}
                          className="px-2.5 py-1.5 rounded-lg bg-surface text-text-muted text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode with Pen Icon */
                    <>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-text-main">
                            {med.name}
                          </strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-brand-primary border border-border">
                            {med.dose}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          Frequency: <strong className="text-text-main">{med.frequency}</strong> • Note: {med.instructions}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditMed(med)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface transition-colors"
                          title="Edit this medicine with pen"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(med.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. VACCINATION STATUS (WITH DIRECT PEN EDITING) */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-brand-accent" />
                <h2 className="text-sm font-bold text-text-main">
                  Vaccination Status
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVaccineModal(true)}
                className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface/80 text-brand-primary border border-border text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vaccine</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.vaccinations.map((vac, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface/40 border border-border text-xs"
                >
                  {editingVaccineIndex === idx ? (
                    /* Inline Vaccine Editor */
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={vaccineEditName}
                        onChange={(e) => setVaccineEditName(e.target.value)}
                        placeholder="Vaccine Name"
                        className="w-full p-1.5 rounded border border-brand-primary bg-white text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={vaccineEditStatus}
                          onChange={(e) => setVaccineEditStatus(e.target.value)}
                          placeholder="Status"
                          className="p-1.5 rounded border border-border bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={vaccineEditDate}
                          onChange={(e) => setVaccineEditDate(e.target.value)}
                          placeholder="Date"
                          className="p-1.5 rounded border border-border bg-white text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveVaccine(idx)}
                          className="px-2 py-1 rounded bg-brand-primary text-white text-[11px] font-semibold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingVaccineIndex(null)}
                          className="px-2 py-1 rounded bg-surface text-text-muted text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display with Pen */
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-text-main">{vac.name}</div>
                        <div className="text-[11px] text-text-muted">
                          Status: <strong className="text-brand-primary">{vac.status}</strong> ({vac.date})
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditVaccine(idx, vac)}
                          className="p-1 rounded text-text-muted hover:text-brand-primary hover:bg-surface"
                          title="Edit with pen"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveVaccine(idx)}
                          className="p-1 rounded text-text-muted hover:text-red-600"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. UPLOADED LAB REPORTS & MEDICAL FILES (WITH PEN EDITING) */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-brand-primary" />
                  <span>Uploaded Lab Reports and Medical Files</span>
                </h2>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Blood tests, ECG reports, X-rays, and prescriptions
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Lab Report</span>
              </button>
            </div>

            {/* List of Files */}
            <div className="space-y-3">
              {profile.labFiles.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted bg-surface/30 rounded-xl border border-dashed border-border">
                  No lab files uploaded yet. Click &quot;Upload New Lab Report&quot; to add your medical tests.
                </div>
              ) : (
                profile.labFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl bg-surface/40 border border-border hover:border-brand-primary/40 transition-all space-y-2 text-xs"
                  >
                    {editingFileId === file.id ? (
                      /* Inline File Editor */
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-text-muted mb-1">
                              File Title
                            </label>
                            <input
                              type="text"
                              value={editFileName}
                              onChange={(e) => setEditFileName(e.target.value)}
                              className="w-full p-2 rounded-lg bg-white border border-border text-xs text-text-main focus:outline-none focus:border-brand-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-text-muted mb-1">
                              Category
                            </label>
                            <select
                              value={editFileCategory}
                              onChange={(e) => setEditFileCategory(e.target.value as any)}
                              className="w-full p-2 rounded-lg bg-white border border-border text-xs text-text-main focus:outline-none focus:border-brand-primary"
                            >
                              <option value="Blood Test">Blood Test</option>
                              <option value="Cardiology / ECG">Cardiology / ECG</option>
                              <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                              <option value="Prescription">Prescription</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-text-muted mb-1">
                            Notes / Plain English Findings
                          </label>
                          <textarea
                            rows={2}
                            value={editFileNotes}
                            onChange={(e) => setEditFileNotes(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white border border-border text-xs text-text-main focus:outline-none focus:border-brand-primary"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSaveEditFile}
                            className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save File Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFileId(null)}
                            className="px-3 py-1.5 rounded-lg bg-surface text-text-muted text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode with Pen */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-text-main text-xs">
                              {file.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-brand-primary border border-border">
                              {file.category}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {file.date} • {file.fileSize}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">
                            {file.notes}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditFile(file)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-surface border border-border text-xs font-medium text-text-main flex items-center gap-1 transition-colors"
                            title="Edit file details with pen"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR VISIT CODE (DYNAMIC 15-MINUTE ACCESS TOKEN) */}
      {activeTab === "code" && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-text-main">
              Your Dynamic Doctor Visit Code
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              To protect your medical privacy, doctors at IIIT Delhi Hospital cannot view your health reports without your permission. Share this temporary code with your doctor during your consultation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface/60 border border-border text-center space-y-4 max-w-md mx-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Active Consent Code (Valid for 15 minutes)
            </div>

            <div className="text-4xl sm:text-5xl font-extrabold tracking-widest font-mono text-brand-primary py-2 select-all">
              {accessCode.code}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              <span>Expires in approximately 15 minutes</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-white hover:bg-surface border border-border text-xs font-semibold text-text-main transition-colors shadow-sm flex items-center gap-1.5"
              >
                {codeCopied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGenerateNewCode}
                className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate New Code</span>
              </button>
            </div>

            {codeRenewedMsg && (
              <div className="text-xs font-medium text-brand-primary bg-white p-2 rounded-lg border border-border animate-fade-in">
                {codeRenewedMsg}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface/40 border border-border text-xs text-text-muted space-y-1">
            <div className="font-bold text-text-main">Why do I need a dynamic code?</div>
            <p>
              Traditional hospital portals allow anyone with your ID to view your records even 2-3 years after your visit. MedNexus requires your real-time 15-minute code, revoking doctor access the moment your consultation concludes.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: FIND DOCTOR */}
      {activeTab === "doctor" && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-text-main">
              Find Verified Doctors (IIIT Delhi Hospital)
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Search by symptoms, medical specialty, or compare consultation fees.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by symptom (e.g., chest discomfort, fever, headache, allergy) or specialty..."
              value={searchSymptom}
              onChange={(e) => setSearchSymptom(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface/50 border border-border text-xs text-text-main focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-surface/30 border border-border hover:border-brand-primary/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface text-brand-primary border border-border">
                      {doc.hospitalName}
                    </span>
                    <span className="text-xs font-bold text-brand-primary">
                      INR {doc.consultationFee}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-main">{doc.name}</h3>
                  <div className="text-xs font-semibold text-text-muted">{doc.specialty}</div>
                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                    {doc.bio}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{doc.rating} ({doc.reviewCount})</span>
                  </div>

                  <span className="text-[11px] text-brand-primary font-semibold">
                    {doc.availableNext}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD MEDICINE */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-main">Add Current Medicine</h3>
              <button
                type="button"
                onClick={() => setShowAddMedModal(false)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Paracetamol, Aspirin, Telmisartan"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Dose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 500 mg, 1 Tablet"
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Once daily, Twice daily"
                    value={newMedFreq}
                    onChange={(e) => setNewMedFreq(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Instructions / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g., Take after food with water"
                  value={newMedNote}
                  onChange={(e) => setNewMedNote(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-3 py-2 rounded-xl bg-surface text-text-muted hover:text-text-main font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD VACCINE */}
      {showAddVaccineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-main">Add Vaccine Record</h3>
              <button
                type="button"
                onClick={() => setShowAddVaccineModal(false)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVaccine} className="space-y-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., COVID-19 Booster, Hepatitis B, Tetanus"
                  value={newVaccineName}
                  onChange={(e) => setNewVaccineName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={newVaccineStatus}
                    onChange={(e) => setNewVaccineStatus(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Up to date">Up to date</option>
                    <option value="Due soon">Due soon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Date / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jan 2024"
                    value={newVaccineDate}
                    onChange={(e) => setNewVaccineDate(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVaccineModal(false)}
                  className="px-3 py-2 rounded-xl bg-surface text-text-muted hover:text-text-main font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold"
                >
                  Save Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD LAB REPORT FILE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-main">Upload Lab Report or Medical File</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              {/* File picker */}
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Select File from Computer
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.dcm"
                  className="block w-full text-xs text-text-muted file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-surface file:text-brand-primary hover:file:bg-surface/80"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Report Title / File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Blood_Sugar_Test_Oct2026.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="Cardiology / ECG">Cardiology / ECG</option>
                    <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  Notes / Brief Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Fasting blood sugar 92 mg/dL. Normal baseline."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 rounded-xl bg-surface text-text-muted hover:text-text-main font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientDashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading Patient Portal...</div>}>
      <PatientDashboardContent />
    </React.Suspense>
  );
}
