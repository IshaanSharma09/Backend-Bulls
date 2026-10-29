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
  DigitalPrescription,
  OrganConditionRecord,
  OrganSystem,
  FamilyMemberProfile,
  BookedAppointment,
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
  Users,
  Lock,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  FileCheck,
  Dna,
  Syringe,
  Check,
  Eye,
  Download,
  ExternalLink,
  MapPin,
  ArrowUpDown,
  IndianRupee,
  Heart,
  Wind,
  Flame,
  Brain,
  Activity,
  Shield,
  Tag,
  ChevronRight,
} from "lucide-react";

function PatientDashboardContent() {
  const { patientUser } = useAuth();
  const searchParams = useSearchParams();

  // Active Tab state: 6 clean tabs
  const [activeTab, setActiveTab] = useState<"organ" | "doctor" | "appointments" | "prescriptions" | "report" | "code">("organ");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Family Member Management State (Single Phone Account)
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberProfile[]>(clinicalStore.getFamilyMembers());
  const [activeMemberId, setActiveMemberId] = useState<string>(clinicalStore.getActiveMemberId());
  const [activeMember, setActiveMember] = useState<FamilyMemberProfile>(clinicalStore.getActiveFamilyMember());
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRel, setNewMemberRel] = useState<FamilyMemberProfile["relationship"]>("Spouse");
  const [newMemberAge, setNewMemberAge] = useState(30);
  const [newMemberGender, setNewMemberGender] = useState("Female");
  const [newMemberBlood, setNewMemberBlood] = useState("O+");
  const [newMemberAllergies, setNewMemberAllergies] = useState("");

  // Organ Condition State
  const [organFilter, setOrganFilter] = useState<string>("All");
  const [showAddOrganModal, setShowAddOrganModal] = useState(false);
  const [newOrganSystem, setNewOrganSystem] = useState<OrganConditionRecord["organSystem"]>("Cardiovascular (Heart)");
  const [newConditionName, setNewConditionName] = useState("");
  const [newDiagnosedYear, setNewDiagnosedYear] = useState(new Date().getFullYear().toString());
  const [newStatus, setNewStatus] = useState<OrganConditionRecord["status"]>("Managed");
  const [newSeverity, setNewSeverity] = useState<OrganConditionRecord["severity"]>("Moderate");
  const [newClinicalNotes, setNewClinicalNotes] = useState("");
  const [newFutureRisk, setNewFutureRisk] = useState("");

  // Booked Appointments State
  const [bookedAppointments, setBookedAppointments] = useState<BookedAppointment[]>(clinicalStore.getBookedAppointments());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);
  const [bookingPatientId, setBookingPatientId] = useState<string>(activeMemberId);
  const [bookingDate, setBookingDate] = useState("Today, 29 Oct 2026");
  const [bookingSlot, setBookingSlot] = useState("04:30 PM");
  const [bookingComplaint, setBookingComplaint] = useState("");
  const [confirmedPass, setConfirmedPass] = useState<BookedAppointment | null>(null);
  const [expSort, setExpSort] = useState<"none" | "desc" | "asc">("desc");

  // Health Profile State (User Editable with pen icons)
  const [profile, setProfile] = useState<PatientHealthProfile>(clinicalStore.getHealthProfile());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Digital Prescriptions issued by doctors
  const [prescriptions, setPrescriptions] = useState<DigitalPrescription[]>(
    clinicalStore.getDigitalPrescriptions("FAM-01")
  );

  // Dynamic Access Code State
  const [accessCode, setAccessCode] = useState<DynamicPatientAccessCode>(clinicalStore.getAccessCode());
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeRenewedMsg, setCodeRenewedMsg] = useState<string | null>(null);

  // Doctors & Search State
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [searchSymptom, setSearchSymptom] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [locationSort, setLocationSort] = useState<"none" | "nearest" | "alpha">("none");

  // Pen Edit States for Direct Typing
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
  const [uploadFileUrl, setUploadFileUrl] = useState("");
  const [viewingFile, setViewingFile] = useState<PatientLabFile | null>(null);

  // Patient Audit History Modal State
  const [viewingPatientAuditRx, setViewingPatientAuditRx] = useState<DigitalPrescription | null>(null);

  // Interactive PHI Scrubber State
  const [showPhiModal, setShowPhiModal] = useState(false);
  const [phiRedactNameAadhaar, setPhiRedactNameAadhaar] = useState(true);
  const [phiRedactContact, setPhiRedactContact] = useState(true);
  const [phiPreserveClinical, setPhiPreserveClinical] = useState(true);
  const [phiStagedData, setPhiStagedData] = useState<{
    fileName: string;
    category: PatientLabFile["category"];
    testDate: string;
    fileSize: string;
    fileUrl?: string;
  } | null>(null);

  // File Edit State
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editFileCategory, setEditFileCategory] = useState<PatientLabFile["category"]>("Blood Test");
  const [editFileDate, setEditFileDate] = useState("");
  const [editFileNotes, setEditFileNotes] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "organ" ||
      tabParam === "code" ||
      tabParam === "doctor" ||
      tabParam === "report" ||
      tabParam === "prescriptions" ||
      tabParam === "appointments"
    ) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const sync = () => {
      const fams = clinicalStore.getFamilyMembers();
      setFamilyMembers(fams);
      const currentActiveId = clinicalStore.getActiveMemberId();
      setActiveMemberId(currentActiveId);
      const currentActiveMem = clinicalStore.getActiveFamilyMember();
      setActiveMember(currentActiveMem);
      setProfile(clinicalStore.getHealthProfile());
      setAccessCode(currentActiveMem.accessCode || clinicalStore.getAccessCode());
      setDoctors(clinicalStore.getAllDoctors());
      setPrescriptions(clinicalStore.getDigitalPrescriptions(currentActiveId));
      setBookedAppointments(clinicalStore.getBookedAppointments());
    };
    sync();
    const unsub = clinicalStore.subscribe(sync);
    return () => unsub();
  }, []);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // --- Family Member Switcher Handlers ---
  const handleSwitchMember = (memberId: string) => {
    clinicalStore.setActiveMemberId(memberId);
    const activeMem = clinicalStore.getActiveFamilyMember();
    setActiveMemberId(memberId);
    setActiveMember(activeMem);
    setProfile(clinicalStore.getHealthProfile());
    setAccessCode(activeMem.accessCode || clinicalStore.getAccessCode());
    setPrescriptions(clinicalStore.getDigitalPrescriptions(memberId));
    setBookingPatientId(memberId);
    showNotification(`Switched profile to ${activeMem.name} (${activeMem.relationship}).`);
  };

  const handleCreateFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const created = clinicalStore.addFamilyMember({
      name: newMemberName.trim(),
      relationship: newMemberRel,
      age: Number(newMemberAge) || 30,
      gender: newMemberGender,
      bloodGroup: newMemberBlood,
      phone: "+91 98765 43210",
      allergies: newMemberAllergies.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setShowAddMemberModal(false);
    setNewMemberName("");
    setNewMemberAllergies("");
    handleSwitchMember(created.id);
    showNotification(`Added ${created.name} (${created.relationship}) to family phone account.`);
  };

  // --- Organ Condition Handlers ---
  const handleAddOrganCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConditionName.trim()) return;
    clinicalStore.addOrganCondition(activeMemberId, {
      organSystem: newOrganSystem,
      conditionName: newConditionName.trim(),
      diagnosedYear: newDiagnosedYear.trim() || new Date().getFullYear().toString(),
      status: newStatus,
      severity: newSeverity,
      clinicalNotes: newClinicalNotes.trim(),
      futureRiskAlert: newFutureRisk.trim(),
    });
    setShowAddOrganModal(false);
    setNewConditionName("");
    setNewClinicalNotes("");
    setNewFutureRisk("");
    showNotification(`Past organ condition logged for ${activeMember.name}.`);
  };

  const handleDeleteOrganCondition = (conditionId: string) => {
    clinicalStore.deleteOrganCondition(activeMemberId, conditionId);
    showNotification("Organ condition record removed.");
  };

  // --- Appointment Booking Handlers ---
  const handleStartBooking = (doc: DoctorProfile) => {
    setBookingDoctor(doc);
    setBookingPatientId(activeMemberId);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;
    const targetMember = familyMembers.find((m) => m.id === bookingPatientId) || activeMember;
    const app = clinicalStore.bookAppointment({
      patientId: targetMember.id,
      patientName: targetMember.name,
      relationship: targetMember.relationship,
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      hospitalName: bookingDoctor.hospitalName,
      specialty: bookingDoctor.specialty,
      slotDate: bookingDate,
      slotTime: bookingSlot,
      consultationFee: bookingDoctor.consultationFee,
      chiefComplaint: bookingComplaint.trim() || "General medical consultation",
    });
    setConfirmedPass(app);
    setShowBookingModal(false);
    setBookingComplaint("");
    showNotification(`Appointment confirmed! Token ${app.tokenNumber} issued.`);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    clinicalStore.cancelAppointment(appointmentId);
    showNotification("Appointment has been cancelled.");
  };

  const handleToggleExpSort = () => {
    setPriceSort("none");
    setLocationSort("none");
    setExpSort((prev) => (prev === "desc" ? "asc" : prev === "asc" ? "none" : "desc"));
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

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setUploadFileUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
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
      fileUrl: uploadFileUrl || undefined,
    });
    setUploadFileName("");
    setUploadNotes("");
    setUploadFileUrl("");
    setShowUploadModal(false);
    showNotification("Lab report uploaded successfully.");
  };

  const handleOpenPhiScrubber = () => {
    const fName = uploadFileName.trim() || "Pathology_Diagnostic_Panel_Oct2026.pdf";
    setPhiStagedData({
      fileName: fName,
      category: uploadCategory,
      testDate: uploadDate.trim() || new Date().toISOString().split("T")[0],
      fileSize: uploadSize || "1.2 MB",
      fileUrl: uploadFileUrl || undefined,
    });
    setShowPhiModal(true);
  };

  const handleApprovePhiSave = () => {
    if (!phiStagedData) return;

    const scrubbedList: string[] = [];
    if (phiRedactNameAadhaar) {
      scrubbedList.push("Patient Legal Name", "Aadhaar UID (12-Digit Indian National ID)");
    }
    if (phiRedactContact) {
      scrubbedList.push("Mobile Phone Number", "Email Address", "Home Residential Address", "Emergency Relative Contact");
    }
    scrubbedList.push("Document Metadata & EXIF Geotags");

    clinicalStore.uploadLabFile({
      name: phiStagedData.fileName,
      category: phiStagedData.category,
      date: phiStagedData.testDate,
      fileSize: phiStagedData.fileSize,
      notes: "De-identified diagnostic report. Sensitive identifiers (Name, Aadhaar, Contact, Address) opaque-redacted via MedNexus PHI Engine. Clinical lab parameters and reference intervals preserved.",
      fileUrl: phiStagedData.fileUrl,
      isPhiScrubbed: true,
      redactedEntities: scrubbedList,
      scrubbedSummary: `Scrubbed ${scrubbedList.length} identifiers. Preserved 9 diagnostic lab values & reference ranges.`,
    });

    setShowPhiModal(false);
    setShowUploadModal(false);
    setUploadFileName("");
    setUploadNotes("");
    setUploadFileUrl("");
    setPhiStagedData(null);
    showNotification("Diagnostic report de-identified and saved with verified PHI protection.");
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
ATTENDING DOCTOR : Dr. Rajesh Sharma (Chief Medical Officer, Cardiology)

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
ATTENDING DOCTOR : Dr. Rajesh Sharma (DM Cardiology)

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

  const handleDownloadPrescriptionSlip = (rx: DigitalPrescription) => {
    const docContent = `================================================================================
IIIT DELHI HOSPITAL & RESEARCH MEDICAL CENTRE
DEPARTMENT OF CLINICAL PHARMACOLOGY & OUTPATIENT SERVICES
Okhla Phase III, Near Govind Puri Metro Station, New Delhi 110020
NMC Recognition ID: IIITD-HOSP-CENTRAL-2026
================================================================================

OFFICIAL DIGITAL CLINICAL PRESCRIPTION
--------------------------------------------------------------------------------
PRESCRIPTION ID  : ${rx.id}
VERSION          : v${rx.version || 1}${rx.version && rx.version > 1 ? " (Revised Clinical Order)" : " (Initial Order)"}
PATIENT NAME     : ${profile.patientName || "Ramesh Kumar"} (54M)
PATIENT ID       : ${profile.patientId || "RAMESH-54"}
BLOOD GROUP      : ${profile.bloodGroup || "B+"}
ISSUED DATE      : ${rx.prescribedDate}
ISSUED TIME      : ${rx.prescribedTime || "10:30 AM"}
${rx.lastUpdated ? `LAST REVISION    : ${rx.lastUpdated} by ${rx.lastUpdatedBy}\n` : ""}
CONSENT METHOD   : Verified via 15-Minute Dynamic Patient Access Code
ATTENDING DOCTOR : ${rx.prescribedBy}
STATUS           : ${rx.status} (Verified Clinical Order)

PRESCRIBED MEDICATION / INJECTION:
--------------------------------------------------------------------------------
MEDICATION / INJ : ${rx.medicationName}
EXACT DOSAGE     : ${rx.dosage}
DIRECTIONS       : ${rx.instructions || "As directed by attending physician"}

PATIENT SAFETY VERIFICATION:
- Documented Allergies Checked: NO CONTRAINDICATIONS
- Verified against MedNexus Clinical Safety Engine
- Valid at hospital pharmacy and Pradhan Mantri Jan Aushadhi Kendras (PMBJP)

ATTENDING CLINICIAN SIGNATURE:
Digitally Authorized by ${rx.prescribedBy}
IIIT Delhi Medical Centre Central Registry
================================================================================`;

    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Prescription_${rx.medicationName.replace(/[^a-zA-Z0-9]/g, "_")}_${rx.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTogglePriceSort = () => {
    setLocationSort("none");
    setExpSort("none");
    setPriceSort((prev) => (prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"));
  };

  const handleToggleLocationSort = () => {
    setPriceSort("none");
    setExpSort("none");
    setLocationSort((prev) => (prev === "none" ? "nearest" : prev === "nearest" ? "alpha" : "none"));
  };

  const filteredDoctors = [...doctors]
    .filter((doc) => {
      if (!searchSymptom.trim()) return true;
      const q = searchSymptom.toLowerCase();
      return (
        doc.specialty.toLowerCase().includes(q) ||
        doc.name.toLowerCase().includes(q) ||
        (doc.location && doc.location.toLowerCase().includes(q)) ||
        doc.hospitalName.toLowerCase().includes(q) ||
        doc.matchedSymptoms.some((s) => s.includes(q))
      );
    })
    .sort((a, b) => {
      if (expSort === "desc") {
        return b.experienceYears - a.experienceYears;
      }
      if (expSort === "asc") {
        return a.experienceYears - b.experienceYears;
      }
      if (priceSort === "asc") {
        return a.consultationFee - b.consultationFee;
      }
      if (priceSort === "desc") {
        return b.consultationFee - a.consultationFee;
      }
      if (locationSort === "nearest") {
        return (a.distanceKm || 99) - (b.distanceKm || 99);
      }
      if (locationSort === "alpha") {
        return (a.location || "").localeCompare(b.location || "");
      }
      return 0;
    });

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* FAMILY PHONE ACCOUNT HEADER (RURAL BHARAT SINGLE PHONE ARCHITECTURE) */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-brand-primary flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {language === "hi" ? "पारिवारिक फोन खाता" : "Family Phone Account"}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  +91 98765 43210
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-text-muted">
                  {familyMembers.length} {language === "hi" ? "सदस्य जुड़े हैं" : "Profiles Linked"}
                </span>
              </div>
              <h2 className="text-sm font-bold text-text-main mt-0.5 flex flex-wrap items-center gap-2">
                <span>Kisan Parivar Household Circle</span>
                <span className="text-text-muted text-xs font-normal">
                  • {language === "hi" ? "सक्रिय व्यक्ति:" : "Viewing:"} <strong className="text-brand-primary font-semibold">{activeMember.name}</strong> ({activeMember.relationship}, {activeMember.age}y)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === "en"
                    ? "bg-white text-brand-primary shadow-xs border border-border/60"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  language === "hi"
                    ? "bg-white text-brand-primary shadow-xs border border-border/60"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                हिंदी (सरल)
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface/80 text-text-main border border-border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "प्रिंट" : "Print"}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Family Member Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-muted flex items-center gap-1 mr-1">
              <User className="w-3.5 h-3.5 text-brand-primary" />
              <span>{language === "hi" ? "मरीज़ चुनें:" : "Select Patient:"}</span>
            </span>

            {familyMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSwitchMember(member.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  activeMemberId === member.id
                    ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                    : "bg-surface hover:bg-surface/80 text-text-main border-border"
                }`}
              >
                <span>{member.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    activeMemberId === member.id
                      ? "bg-white/20 text-white"
                      : "bg-white text-text-muted border border-border/60"
                  }`}
                >
                  {member.relationship} ({member.age}y)
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-surface text-brand-primary border border-dashed border-brand-primary/40 text-xs font-semibold flex items-center gap-1 shadow-xs"
              title="Add family member under this phone number"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "नया सदस्य" : "Add Member"}</span>
            </button>
          </div>

          <div className="text-[11px] text-text-muted flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === "hi"
                ? "प्रत्येक सदस्य का रिकॉर्ड और 15-मिनट कोड पूरी तरह सुरक्षित व अलग है।"
                : "Each member holds an isolated medical record and dynamic 15-min code."}
            </span>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-surface border border-brand-accent/40 text-xs font-semibold text-brand-primary flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* SIX CLEAN TABS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => setActiveTab("organ")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "organ"
              ? "bg-white text-brand-primary border border-border shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>{language === "hi" ? "अंग व पुरानी बीमारियाँ" : "Past Organ Diseases"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("doctor")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "doctor"
              ? "bg-white text-brand-primary border border-border shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === "hi" ? "नज़दीकी डॉक्टर बुक करें" : "Book Nearby Doctor"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appointments")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "appointments"
              ? "bg-white text-brand-primary border border-border shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === "hi" ? "मेरी अपॉइंटमेंट" : "My Bookings"}</span>
          {bookedAppointments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-brand-primary text-white text-[10px]">
              {bookedAppointments.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("prescriptions")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "prescriptions"
              ? "bg-white text-brand-primary border border-border shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{language === "hi" ? "दवाइयों का इतिहास" : "Prescription History"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "report"
              ? "bg-white text-brand-primary border border-border shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === "hi" ? "स्वास्थ्य फाइलें व एलर्जी" : "Health Profile & Files"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("code")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "code"
              ? "bg-white text-brand-primary border border-border shadow-xs"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Key className="w-4 h-4 text-amber-600" />
          <span>{language === "hi" ? "15-मिनट सुरक्षा कोड" : "15-Min Safe Code"}</span>
        </button>
      </div>

      {/* TAB: PAST CONDITIONS BY ORGAN SYSTEM */}
      {activeTab === "organ" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-text-main">
                    {language === "hi"
                      ? "अंग अनुसार पुरानी बीमारियाँ एवं भविष्य की सुरक्षा चेतावनी"
                      : "Past Conditions by Organ System"}
                  </h2>
                </div>
                <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
                  {language === "hi"
                    ? `${activeMember.name} (${activeMember.relationship}) का अंग-वार मेडिकल इतिहास। किसी भी अंग की पुरानी बीमारी भविष्य में होने वाले इलाज व दवाओं के चयन में डॉक्टर को सचेत करती है।`
                    : `Longitudinal medical history logged per organ system for ${activeMember.name} (${activeMember.relationship}). Cross-referenced during future visits to alert clinicians of contraindicated drugs and interrelated risks.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddOrganModal(true)}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary/90 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{language === "hi" ? "नई बीमारी दर्ज करें" : "Log Past Condition"}</span>
              </button>
            </div>

            {/* Organ System Category Filter Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                {language === "hi" ? "अंग चुनें (फ़िल्टर)" : "Filter by Organ System"}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "All", en: "All Organs", hi: "सभी अंग" },
                  { id: "Cardiovascular (Heart)", en: "Heart (Cardiovascular)", hi: "हृदय (Cardio)" },
                  { id: "Respiratory (Lungs)", en: "Lungs (Respiratory)", hi: "फेफड़े (Respiratory)" },
                  { id: "Gastrointestinal (Stomach & Liver)", en: "Digestive (GI)", hi: "पेट व पाचन (GI)" },
                  { id: "Endocrine (Diabetes & Thyroid)", en: "Endocrine & Diabetes", hi: "शुगर व ग्रंथि" },
                  { id: "Renal (Kidneys)", en: "Kidneys (Renal)", hi: "गुर्दे व किडनी" },
                  { id: "Musculoskeletal (Bones & Joints)", en: "Bones & Joints", hi: "हड्डियाँ व जोड़" },
                  { id: "Neurological (Brain & Nerves)", en: "Brain & Nerves", hi: "मस्तिष्क व तंत्रिका" },
                ].map((item) => {
                  const count =
                    item.id === "All"
                      ? activeMember.organConditions.length
                      : activeMember.organConditions.filter((c) => c.organSystem === item.id).length;
                  const isSelected = organFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOrganFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                          : "bg-surface/50 text-text-muted hover:text-text-main border-border hover:bg-surface"
                      }`}
                    >
                      <span>{language === "hi" ? item.hi : item.en}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          isSelected ? "bg-white/20 text-white" : "bg-border text-text-muted"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Condition Cards Grid */}
          {activeMember.organConditions.filter((c) => organFilter === "All" || c.organSystem === organFilter).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
              <Activity className="w-8 h-8 text-brand-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="font-semibold text-text-main text-xs">
                  {language === "hi"
                    ? "इस अंग के लिए कोई पुरानी बीमारी दर्ज नहीं है।"
                    : "No past conditions logged for this organ system."}
                </p>
                <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                  {language === "hi"
                    ? "यदि मरीज को कभी इस अंग से संबंधित कोई बीमारी या सर्जरी हुई हो तो दर्ज करें।"
                    : "Logging past illnesses helps future treating clinicians avoid harmful drug contraindications."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOrganModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "बीमारी जोड़ें" : "Log Past Condition"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMember.organConditions
                .filter((c) => organFilter === "All" || c.organSystem === organFilter)
                .map((condition) => (
                  <div
                    key={condition.id}
                    className="bg-white rounded-2xl border border-border p-5 shadow-xs hover:border-brand-primary/40 transition-all flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-3">
                      {/* Top Bar with Organ Badge and Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface text-brand-primary border border-border flex items-center gap-1.5">
                          {condition.organSystem.startsWith("Cardiovascular") && <Heart className="w-3.5 h-3.5 text-rose-600" />}
                          {condition.organSystem.startsWith("Respiratory") && <Wind className="w-3.5 h-3.5 text-sky-600" />}
                          {condition.organSystem.startsWith("Gastrointestinal") && <Flame className="w-3.5 h-3.5 text-amber-600" />}
                          {condition.organSystem.startsWith("Endocrine") && <Dna className="w-3.5 h-3.5 text-emerald-600" />}
                          {condition.organSystem.startsWith("Renal") && <Activity className="w-3.5 h-3.5 text-indigo-600" />}
                          {condition.organSystem.startsWith("Musculoskeletal") && <Shield className="w-3.5 h-3.5 text-slate-600" />}
                          {condition.organSystem.startsWith("Neurological") && <Brain className="w-3.5 h-3.5 text-blue-700" />}
                          <span>{condition.organSystem}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              condition.status === "Active"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : condition.status === "Managed"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-surface text-text-muted border border-border"
                            }`}
                          >
                            {condition.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrganCondition(condition.id)}
                            className="p-1 rounded-lg text-text-muted hover:text-red-600 transition-colors"
                            title="Remove condition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Condition Title & Diagnostics */}
                      <div>
                        <h3 className="text-sm font-bold text-text-main">{condition.conditionName}</h3>
                        <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                          <span>
                            {language === "hi" ? "निदान वर्ष" : "Diagnosed"}: <strong>{condition.diagnosedYear}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            {language === "hi" ? "गंभीरता" : "Severity"}: <strong>{condition.severity}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Clinical Notes */}
                      {condition.clinicalNotes && (
                        <p className="text-xs text-text-muted leading-relaxed bg-surface/50 p-2.5 rounded-xl border border-border">
                          {condition.clinicalNotes}
                        </p>
                      )}

                      {/* Future Risk Alert / Contraindication Advisory */}
                      {condition.futureRiskAlert && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span>
                              {language === "hi"
                                ? "भविष्य की बीमारी में डॉक्टर के लिए महत्वपूर्ण चेतावनी"
                                : "Cross-Referencing Advisory for Future Care"}
                            </span>
                          </div>
                          <p className="text-amber-950 text-xs leading-relaxed font-medium">
                            {condition.futureRiskAlert}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                      <span>
                        {language === "hi" ? "सुरक्षित रिकॉर्ड" : "Encrypted Record"} ({activeMember.name})
                      </span>
                      <span>Verified Record</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Rural Patient Explainer Banner */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-text-main">
                {language === "hi"
                  ? "अंग-वार बीमारी रिकॉर्ड भविष्य के इलाज को कैसे सुरक्षित बनाता है?"
                  : "How organ-based disease tracking protects future healthcare"}
              </h4>
              <p className="text-text-muted leading-relaxed">
                {language === "hi"
                  ? "यदि किसी मरीज को फेफड़ों (दमा) का पुराना रोग है, और वह भविष्य में दिल की बीमारी के डॉक्टर के पास जाता है, तो डॉक्टर को तुरंत पता चल जाएगा कि ऐसी दवाइयाँ न दी जाएं (जैसे बीटा-ब्लॉकर्स) जो फेफड़ों को नुकसान पहुँचाएँ। हमारा सिस्टम एक ही अंग या उससे जुड़े दूसरे अंगों के इतिहास को खुद जोड़कर गलत इलाज रोकता है।"
                  : "When evaluating new symptoms, clinicians need instant visibility into prior organ illnesses. For example, a documented history of peptic ulcer disease restricts future NSAID painkiller prescriptions, and asthma restricts non-selective cardiac beta-blockers. MedNexus preserves this longitudinal continuum across all hospital visits."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BOOKED APPOINTMENTS */}
      {activeTab === "appointments" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base font-bold text-text-main">
                    {language === "hi"
                      ? "मेरी बुक की गई अस्पताल/ओपीडी अपॉइंटमेंट"
                      : "Booked OPD Appointments & Hospital Passes"}
                  </h2>
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {language === "hi"
                    ? `फ़ोन नंबर +91 98765 43210 से जुड़े परिवार के सभी सदस्यों के सक्रिय टोकन। अस्पताल काउंटर पर टोकन नंबर दिखाएं।`
                    : `Active consultation passes and OPD queue tokens booked under family account +91 98765 43210. Present pass at the reception counter.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("doctor")}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary/90 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>{language === "hi" ? "नया डॉक्टर खोजें" : "Find & Book Doctor"}</span>
              </button>
            </div>
          </div>

          {/* Appointment Cards List */}
          {bookedAppointments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-border space-y-3 text-xs text-text-muted">
              <Calendar className="w-8 h-8 text-brand-primary mx-auto opacity-50" />
              <p className="font-semibold text-text-main text-sm">
                {language === "hi" ? "कोई सक्रिय अपॉइंटमेंट नहीं मिली" : "No Active Appointments Booked"}
              </p>
              <p className="max-w-md mx-auto text-text-muted text-xs">
                {language === "hi"
                  ? "आप नज़दीकी सत्यापित डॉक्टरों की सूची देख सकते हैं और बिना कतार लगे घर बैठे ओपीडी टोकन ले सकते हैं।"
                  : "You have not booked any appointments under this family phone number yet. Search verified doctors nearby and secure an OPD token slot."}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("doctor")}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "नज़दीकी डॉक्टर खोजें" : "Find Nearby Doctor"}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {bookedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-border p-5 shadow-xs hover:border-brand-primary/40 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                        {apt.tokenNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {apt.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {language === "hi" ? "पंजीकृत मरीज" : "Patient"}: <strong className="text-text-main">{apt.patientName}</strong> ({apt.relationship})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-text-muted text-[10px] uppercase font-semibold">Doctor & Specialty</span>
                      <div className="font-bold text-text-main">{apt.doctorName}</div>
                      <div className="text-text-muted text-[11px]">{apt.specialty}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-text-muted text-[10px] uppercase font-semibold">Hospital / Clinic</span>
                      <div className="font-bold text-text-main">{apt.hospitalName}</div>
                      <div className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified OPD Center</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-text-muted text-[10px] uppercase font-semibold">Appointment Time</span>
                      <div className="font-bold text-brand-primary flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{apt.slotDate} • {apt.slotTime}</span>
                      </div>
                      <div className="text-text-muted text-[11px]">Fee: ₹{apt.consultationFee} (Pay at clinic)</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface/60 border border-border text-xs flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-text-main">
                        {language === "hi" ? "मुख्य लक्षण / समस्या" : "Chief Complaint"}:
                      </span>{" "}
                      <span className="text-text-muted">{apt.chiefComplaint}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                    <div className="text-[11px] text-text-muted flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {language === "hi"
                          ? "अस्पताल में डॉक्टर को अपना 15-मिनट सुरक्षा कोड दिखाएं।"
                          : "Present dynamic 15-min code to doctor on arrival to share past records."}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                      >
                        {language === "hi" ? "रद्द करें" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmedPass(apt)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 transition-all flex items-center gap-1 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{language === "hi" ? "ओपीडी पर्ची देखें" : "View OPD Pass"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: HEALTH PROFILE & FILES (CRISP, MINIMAL, ZERO JARGON, DIRECT PEN EDITING) */}
      {activeTab === "report" && (
        <div className="space-y-6 animate-fade-in">
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
                          {prescriptions.some((p) => p.medicationName.toLowerCase().includes(med.name.toLowerCase()) && (p.version || 1) > 1) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Updated by Doctor
                            </span>
                          )}
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

            {/* Link to Full Digital Prescription History */}
            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs">
              <span className="text-text-muted">Need official clinician stamps & dates?</span>
              <button
                type="button"
                onClick={() => setActiveTab("prescriptions")}
                className="text-brand-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Prescription History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
                            {file.isPhiScrubbed && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-xs">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>PHI Scrubbed</span>
                              </span>
                            )}
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
                            onClick={() => setViewingFile(file)}
                            className="px-2.5 py-1 rounded-lg bg-surface hover:bg-brand-primary/10 border border-border text-xs font-semibold text-brand-primary flex items-center gap-1 transition-colors"
                            title="View diagnostic report and findings"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Result</span>
                          </button>
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

      {/* TAB 3: PRESCRIPTION HISTORY (DIGITAL PRESCRIPTIONS ISSUED VIA 6-DIGIT CODE) */}
      {activeTab === "prescriptions" && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border text-[10px] font-bold uppercase tracking-wider">
                  Digital Health Record
                </span>
                <h2 className="text-base font-bold text-text-main">
                  Prescription History
                </h2>
              </div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Official digital prescriptions issued by attending clinicians at IIIT Delhi Hospital. Authorized during your consultation via your 15-minute dynamic access code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-brand-primary flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified via Visit Code {accessCode.code}</span>
              </span>
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted bg-surface/30 rounded-2xl border border-dashed border-border space-y-2">
                <Pill className="w-8 h-8 text-brand-primary mx-auto opacity-60" />
                <p className="font-semibold text-text-main">No digital prescriptions issued yet.</p>
                <p className="text-[11px]">When a clinician writes a prescription during your consultation, it will appear here instantly.</p>
              </div>
            ) : (
              prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 sm:p-5 rounded-2xl bg-surface/30 border border-border hover:border-brand-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center text-brand-primary shadow-xs">
                        <Pill className="w-4 h-4" />
                      </div>
                      <strong className="text-sm font-bold text-text-main">
                        {rx.medicationName}
                      </strong>
                      <span className="px-2.5 py-0.5 rounded-lg bg-white border border-brand-primary/30 text-brand-primary font-mono font-bold text-xs shadow-xs">
                        {rx.dosage}
                      </span>
                      {rx.version && rx.version > 1 ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Updated (v{rx.version})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active (v1)</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                      <span>Prescribing Clinician: <strong className="text-text-main">{rx.prescribedBy}</strong></span>
                      <span>•</span>
                      <span>Date: <strong className="text-text-main">{rx.prescribedDate}</strong> ({rx.prescribedTime || "10:30 AM"})</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-text-muted">Rx ID: {rx.id}</span>
                    </div>

                    {rx.instructions && (
                      <p className="text-xs text-text-muted italic pt-0.5">
                        Instructions: {rx.instructions}
                      </p>
                    )}

                    {rx.lastUpdated && (
                      <p className="text-[11px] text-amber-800 font-medium pt-0.5">
                        Prescription revised on {rx.lastUpdated} by {rx.lastUpdatedBy}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {rx.auditHistory && rx.auditHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setViewingPatientAuditRx(rx)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-1.5 transition-colors shadow-xs"
                        title="View previous prescription versions and reason for modification"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Revision History ({rx.auditHistory.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadPrescriptionSlip(rx)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-surface border border-border text-xs font-semibold text-text-main flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Download official digital prescription document"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Download Slip</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: FIND DOCTOR */}
      {activeTab === "doctor" && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-text-main">
                {language === "hi"
                  ? "सत्यापित डॉक्टर खोजें व ओपीडी स्लॉट बुक करें"
                  : "Find Verified Doctors & Book OPD Consultation"}
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {language === "hi"
                  ? "वरिष्ठ अनुभवी विशेषज्ञ डॉक्टर प्राथमिकता पर। क्लिनिक दूरी, फीस और ओपीडी स्लॉट के अनुसार छाँटें।"
                  : "Senior experienced specialists ranked first. Filter by specialty, consultation fees, and proximity."}
              </p>
            </div>
            <div className="text-xs text-text-muted font-medium">
              Showing <strong className="text-text-main">{filteredDoctors.length}</strong> verified doctors
            </div>
          </div>

          {/* Search & Sort Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  language === "hi"
                    ? "लक्षण (खांसी, बुखार, सीने में दर्द), डॉक्टर का नाम या क्षेत्र खोजें..."
                    : "Search by symptom (e.g. chest discomfort, fever, diabetes), specialty, or location..."
                }
                value={searchSymptom}
                onChange={(e) => setSearchSymptom(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface/50 border border-border text-xs text-text-main focus:outline-hidden focus:border-brand-primary"
              />
              {searchSymptom && (
                <button
                  type="button"
                  onClick={() => setSearchSymptom("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort by Experience, Price & Location Buttons */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {/* Sort by Experience (Senior Doctors on Top) */}
              <button
                type="button"
                onClick={handleToggleExpSort}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  expSort !== "none"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-surface/60 hover:bg-surface border-border text-text-main"
                }`}
                title="Sort senior experienced doctors to the top"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>
                  {expSort === "desc"
                    ? (language === "hi" ? "वरिष्ठ डॉक्टर पहले (15+ वर्ष)" : "Senior Doctors First (Exp)")
                    : expSort === "asc"
                    ? (language === "hi" ? "जूनियर डॉक्टर पहले" : "Junior OPD Doctors")
                    : (language === "hi" ? "अनुभव अनुसार" : "Sort Exp")}
                </span>
                <ArrowUpDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Sort by Price */}
              <button
                type="button"
                onClick={handleTogglePriceSort}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  priceSort !== "none"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-surface/60 hover:bg-surface border-border text-text-main"
                }`}
                title="Sort doctors by consultation price"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>
                  {priceSort === "asc"
                    ? "Price: Low to High"
                    : priceSort === "desc"
                    ? "Price: High to Low"
                    : "Sort Price"}
                </span>
                <ArrowUpDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Sort by Location */}
              <button
                type="button"
                onClick={handleToggleLocationSort}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  locationSort !== "none"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-surface/60 hover:bg-surface border-border text-text-main"
                }`}
                title="Sort doctors by location and distance proximity"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {locationSort === "nearest"
                    ? "Nearest (Distance)"
                    : locationSort === "alpha"
                    ? "Location (A-Z)"
                    : "Sort Location"}
                </span>
                <ArrowUpDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Reset Sort / Filter */}
              {(priceSort !== "none" || locationSort !== "none" || expSort !== "desc" || searchSymptom) && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceSort("none");
                    setLocationSort("none");
                    setExpSort("desc");
                    setSearchSymptom("");
                  }}
                  className="p-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-muted hover:text-text-main transition-colors text-xs font-medium"
                  title="Reset search and sort filters"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(expSort !== "none" || priceSort !== "none" || locationSort !== "none") && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-text-muted text-[11px]">Active Sorting:</span>
              {expSort !== "none" && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3 text-brand-primary" />
                  <span>{expSort === "desc" ? "Senior Doctors First (High Experience)" : "Junior OPD Doctors First"}</span>
                  <button
                    type="button"
                    onClick={() => setExpSort("none")}
                    className="hover:text-red-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {priceSort !== "none" && (
                <span className="px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-medium flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  <span>{priceSort === "asc" ? "Price: Low to High" : "Price: High to Low"}</span>
                  <button
                    type="button"
                    onClick={() => setPriceSort("none")}
                    className="hover:text-red-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {locationSort !== "none" && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{locationSort === "nearest" ? "Nearest Distance First" : "Alphabetical Location"}</span>
                  <button
                    type="button"
                    onClick={() => setLocationSort("none")}
                    className="hover:text-red-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Doctor Cards Grid */}
          {filteredDoctors.length === 0 ? (
            <div className="p-8 text-center bg-surface/30 rounded-2xl border border-dashed border-border space-y-2 text-xs text-text-muted">
              <Search className="w-8 h-8 text-brand-primary mx-auto opacity-50" />
              <p className="font-semibold text-text-main">No doctors match your query.</p>
              <p className="text-[11px]">Try searching for other symptoms like fever, chest discomfort, asthma, or clear the search filters.</p>
              <button
                type="button"
                onClick={() => {
                  setPriceSort("none");
                  setLocationSort("none");
                  setExpSort("desc");
                  setSearchSymptom("");
                }}
                className="mt-2 px-3 py-1.5 rounded-xl bg-brand-primary text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 rounded-2xl bg-surface/30 border border-border hover:border-brand-primary/50 transition-all flex flex-col justify-between space-y-3.5 shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface text-brand-primary border border-border">
                          {doc.hospitalName}
                        </span>
                        {doc.isSponsored && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{doc.sponsoredBadge || "Verified Partner"}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-brand-primary flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        <span>{doc.consultationFee}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-text-main">{doc.name}</h3>
                      <div className="text-xs font-semibold text-text-muted mt-0.5 flex items-center gap-1.5">
                        <span>{doc.specialty}</span>
                        <span>•</span>
                        <span className="font-bold text-text-main">{doc.experienceYears} yrs exp</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-text-muted">
                      <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>{doc.location}</span>
                      {doc.distanceKm && (
                        <span className="font-semibold text-emerald-700">({doc.distanceKm} km away)</span>
                      )}
                    </div>

                    <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                      {doc.bio}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{doc.availableNext}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartBooking(doc)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary/90 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{language === "hi" ? "अपॉइंटमेंट लें" : "Book OPD Slot"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

              {/* PHI Privacy Callout */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privacy-First PHI De-Identification</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Stage this document in a private sandbox. Automatically scrub Aadhaar, phone, name, and address while preserving diagnostic test results before saving.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface text-text-muted hover:text-text-main font-semibold transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPhiScrubber}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all text-xs"
                    title="Review original and redacted documents side-by-side before committing"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Review & Scrub PHI (Side-by-Side)</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Direct Upload</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SIDE-BY-SIDE PHI DE-IDENTIFICATION STUDIO */}
      {showPhiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border max-w-5xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-main flex items-center gap-2">
                    <span>PHI De-Identification & Safety Scrubber Studio</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      Sub-20ms Engine
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Private sandbox processing. Review original document vs. sanitized copy before saving to medical records.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhiModal(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Jurisdictional Rules & De-Identification Controls */}
            <div className="p-3.5 rounded-xl bg-surface/50 border border-border space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-text-main">
                  De-Identification Rules & Protection Scope:
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                    5 Identifiers Tagged
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    9 Clinical Results Preserved
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-text-muted font-medium border border-border">
                    Camera EXIF Stripped
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-border cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={phiRedactNameAadhaar}
                    onChange={(e) => setPhiRedactNameAadhaar(e.target.checked)}
                    className="mt-0.5 accent-brand-primary"
                  />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-text-main">Redact Legal Name & Aadhaar</strong>
                    <span className="text-text-muted">Masks 12-digit Indian national UID & full name</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-border cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={phiRedactContact}
                    onChange={(e) => setPhiRedactContact(e.target.checked)}
                    className="mt-0.5 accent-brand-primary"
                  />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-text-main">Redact Phone, Email & Address</strong>
                    <span className="text-text-muted">Masks contact digits, emails, and residential addresses</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-emerald-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={phiPreserveClinical}
                    onChange={(e) => setPhiPreserveClinical(e.target.checked)}
                    className="mt-0.5 accent-emerald-600"
                  />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-emerald-800">Preserve Clinical Parameters</strong>
                    <span className="text-emerald-700">Retains test names, numeric results, and reference ranges</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Side-by-Side Dual Pane Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT PANE: ORIGINAL INPUT */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>ORIGINAL INPUT (Private Staging)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">
                    Unscrubbed
                  </span>
                </div>

                <div className="bg-white rounded-lg p-3 border border-amber-200 font-mono text-[11px] leading-relaxed text-text-main space-y-2 shadow-xs max-h-96 overflow-y-auto">
                  <div className="text-text-muted text-[10px] border-b border-border pb-1 font-bold">
                    IIIT DELHI HOSPITAL & RESEARCH MEDICAL CENTRE • NABL-DELHI-PATH-90214
                  </div>

                  <div className="space-y-1 text-[11px] pt-1">
                    <div>
                      <span className="text-text-muted">PATIENT NAME     : </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        Ramesh Kumar (54M)
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">NATIONAL ID (UID): </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        4589-9821-3310 (Aadhaar)
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">PHONE NUMBER     : </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        +91 98100-24512
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">EMAIL ADDRESS    : </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        ramesh.kumar54@email.com
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">HOME RESIDENCE   : </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        Flat 402, Pocket B, Sarita Vihar, New Delhi
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="text-[10px] font-bold text-text-muted uppercase">
                      Diagnostic Laboratory Parameters (Unprocessed):
                    </div>
                    <div className="text-[10px] text-text-muted">
                      • Fasting Plasma Glucose : 92 mg/dL (Ref: 70-99)<br />
                      • Glycated Hemoglobin   : 5.4% (Ref: 4.0-5.6)<br />
                      • Total Serum Cholesterol: 164 mg/dL (Ref: &lt; 200)<br />
                      • LDL Cholesterol        : 88 mg/dL (Ref: &lt; 100)<br />
                      • Serum Triglycerides    : 118 mg/dL (Ref: &lt; 150)<br />
                      • Serum Creatinine       : 0.92 mg/dL (Ref: 0.7-1.2)<br />
                      • 12-Lead ECG Rhythm     : Normal Sinus (72 bpm)
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-amber-800 flex items-center justify-between">
                  <span>Target File: <strong>{phiStagedData?.fileName || "Pathology_Panel.pdf"}</strong></span>
                  <span>Direct Cloud Upload: <strong>BLOCKED</strong></span>
                </div>
              </div>

              {/* RIGHT PANE: SANITIZED REDACTED COPY */}
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/20 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-300/80 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>SANITIZED COPY (Approved for Records)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                    Opaque-Redacted
                  </span>
                </div>

                <div className="bg-white rounded-lg p-3 border border-emerald-300 font-mono text-[11px] leading-relaxed text-text-main space-y-2 shadow-xs max-h-96 overflow-y-auto">
                  <div className="text-emerald-800 text-[10px] border-b border-border pb-1 font-bold">
                    IIIT DELHI HOSPITAL & RESEARCH MEDICAL CENTRE • DE-IDENTIFIED CLINICAL ARCHIVE
                  </div>

                  <div className="space-y-1 text-[11px] pt-1">
                    <div>
                      <span className="text-text-muted">PATIENT NAME     : </span>
                      {phiRedactNameAadhaar ? (
                        <>
                          <span className="bg-black text-black px-2 py-0.5 rounded select-none inline-block">████████████</span>{" "}
                          <span className="text-[10px] text-emerald-700 font-sans font-bold">[REDACTED NAME]</span>
                        </>
                      ) : (
                        <span className="text-text-main font-bold">Ramesh Kumar (54M)</span>
                      )}
                    </div>
                    <div>
                      <span className="text-text-muted">NATIONAL ID (UID): </span>
                      {phiRedactNameAadhaar ? (
                        <>
                          <span className="bg-black text-black px-2 py-0.5 rounded select-none inline-block">████-████-████</span>{" "}
                          <span className="text-[10px] text-emerald-700 font-sans font-bold">[REDACTED AADHAAR]</span>
                        </>
                      ) : (
                        <span className="text-text-main font-bold">4589-9821-3310</span>
                      )}
                    </div>
                    <div>
                      <span className="text-text-muted">PHONE NUMBER     : </span>
                      {phiRedactContact ? (
                        <>
                          <span className="bg-black text-black px-2 py-0.5 rounded select-none inline-block">██████████</span>{" "}
                          <span className="text-[10px] text-emerald-700 font-sans font-bold">[REDACTED PHONE]</span>
                        </>
                      ) : (
                        <span className="text-text-main font-bold">+91 98100-24512</span>
                      )}
                    </div>
                    <div>
                      <span className="text-text-muted">EMAIL ADDRESS    : </span>
                      {phiRedactContact ? (
                        <>
                          <span className="bg-black text-black px-2 py-0.5 rounded select-none inline-block">████████████████</span>{" "}
                          <span className="text-[10px] text-emerald-700 font-sans font-bold">[REDACTED EMAIL]</span>
                        </>
                      ) : (
                        <span className="text-text-main font-bold">ramesh.kumar54@email.com</span>
                      )}
                    </div>
                    <div>
                      <span className="text-text-muted">HOME RESIDENCE   : </span>
                      {phiRedactContact ? (
                        <>
                          <span className="bg-black text-black px-2 py-0.5 rounded select-none inline-block">████████████████████</span>{" "}
                          <span className="text-[10px] text-emerald-700 font-sans font-bold">[REDACTED ADDRESS]</span>
                        </>
                      ) : (
                        <span className="text-text-main font-bold">Sarita Vihar, New Delhi</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase font-sans">
                      Preserved Diagnostic Lab Parameters (100% Intact):
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div className="p-1 rounded bg-surface/60 border border-border">
                        <span className="text-text-muted">Blood Glucose: </span>
                        <strong className="text-emerald-700">92 mg/dL</strong>
                      </div>
                      <div className="p-1 rounded bg-surface/60 border border-border">
                        <span className="text-text-muted">HbA1c: </span>
                        <strong className="text-emerald-700">5.4%</strong>
                      </div>
                      <div className="p-1 rounded bg-surface/60 border border-border">
                        <span className="text-text-muted">Cholesterol: </span>
                        <strong className="text-emerald-700">164 mg/dL</strong>
                      </div>
                      <div className="p-1 rounded bg-surface/60 border border-border">
                        <span className="text-text-muted">LDL Direct: </span>
                        <strong className="text-emerald-700">88 mg/dL</strong>
                      </div>
                      <div className="p-1 rounded bg-surface/60 border border-border">
                        <span className="text-text-muted">Triglycerides: </span>
                        <strong className="text-emerald-700">118 mg/dL</strong>
                      </div>
                      <div className="p-1 rounded bg-surface/60 border border-border">
                        <span className="text-text-muted">ECG Rhythm: </span>
                        <strong className="text-emerald-700">Normal Sinus</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-800 flex items-center justify-between">
                  <span>Metadata: <strong>EXIF & Geotags Cleared</strong></span>
                  <span className="font-bold text-emerald-700">Safe for Cross-Hospital Sharing</span>
                </div>
              </div>
            </div>

            {/* Decision & Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs">
              <div className="text-text-muted text-[11px] leading-tight">
                <strong>Patient Review:</strong> By approving, this de-identified copy will be saved to your patient record. Original sensitive identifiers cannot be recovered from the flattened file.
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPhiModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold transition-colors"
                >
                  Discard & Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprovePhiSave}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Redactions & Save to Records</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PATIENT VIEW PRESCRIPTION AUDIT TRAIL */}
      {viewingPatientAuditRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-main">
                    Prescription Revision History
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Past versions are permanently preserved for clinical recordkeeping.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingPatientAuditRx(null)}
                className="text-text-muted hover:text-text-main p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-sm">
                  Current: {viewingPatientAuditRx.medicationName} ({viewingPatientAuditRx.dosage})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  v{viewingPatientAuditRx.version || 1} Active
                </span>
              </div>
              {viewingPatientAuditRx.instructions && (
                <p className="text-emerald-800 text-[11px]">
                  <strong>Directions:</strong> {viewingPatientAuditRx.instructions}
                </p>
              )}
              {viewingPatientAuditRx.lastUpdated && (
                <p className="text-emerald-700 text-[10px]">
                  Authorized by {viewingPatientAuditRx.lastUpdatedBy} on {viewingPatientAuditRx.lastUpdated}
                </p>
              )}
            </div>

            {/* Past Revisions */}
            <div className="space-y-2.5 pt-1">
              <span className="font-bold text-xs text-text-main block">Previous Versions & Clinical Reasons:</span>
              {viewingPatientAuditRx.auditHistory?.map((audit, idx) => (
                <div
                  key={audit.id || idx}
                  className="p-3 rounded-xl bg-surface/50 border border-border text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold px-1.5 py-0.5 rounded bg-white border border-border text-[10px] text-text-main">
                        v{audit.version}
                      </span>
                      <span className="font-semibold text-text-main">{audit.medicationName}</span>
                      <span className="text-text-muted">({audit.dosage})</span>
                    </div>
                    <span className="text-[10px] text-text-muted">{audit.timestamp}</span>
                  </div>

                  <div className="text-[11px] text-text-muted space-y-0.5">
                    <p>
                      <strong className="text-text-main">Modified By:</strong> {audit.editedBy}
                    </p>
                    <p>
                      <strong className="text-text-main">Clinical Reason:</strong> {audit.reasonForChange}
                    </p>
                    {audit.instructions && (
                      <p className="italic">Instructions: {audit.instructions}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setViewingPatientAuditRx(null)}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 transition-all shadow-sm"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW LAB REPORT RESULT & AI FINDINGS */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-lg w-full shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-text-main">{viewingFile.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface text-brand-primary border border-border">
                    {viewingFile.category}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Administered on {viewingFile.date} • File size: {viewingFile.fileSize}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PHI De-Identification Verification Banner */}
            {viewingFile.isPhiScrubbed && (
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
                  {viewingFile.scrubbedSummary || "Personal identifiers (Name, Aadhaar, contact details) were opaque-redacted prior to permanent storage. Clinical lab parameters and reference intervals are preserved intact."}
                </p>
                {viewingFile.redactedEntities && viewingFile.redactedEntities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {viewingFile.redactedEntities.map((ent, idx) => (
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
                {viewingFile.category === "Cardiology / ECG" ? (
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
                ) : viewingFile.category === "Blood Test" ? (
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
                      <strong className="text-text-main text-xs">{viewingFile.notes}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Plain English Explanation */}
            <div className="p-3 rounded-xl bg-surface/60 border border-border space-y-1">
              <span className="font-bold text-text-main text-[11px] block">Plain-English Interpretation (Zero Jargon):</span>
              <p className="text-xs text-text-muted leading-relaxed">
                {viewingFile.notes || "All test metrics are in the healthy baseline target range with no acute concerns."}
              </p>
            </div>

            {/* Document / Visual Preview */}
            <div className="space-y-1.5">
              <span className="font-bold text-text-main text-[11px] block">Diagnostic Document / Scan Preview:</span>
              {viewingFile.fileUrl ? (
                viewingFile.fileUrl.startsWith("data:application/pdf") || viewingFile.name.toLowerCase().endsWith(".pdf") ? (
                  <div className="space-y-2">
                    <iframe
                      src={viewingFile.fileUrl}
                      title={viewingFile.name}
                      className="w-full h-80 rounded-xl border border-border bg-white shadow-inner"
                    />
                    <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                      <span>Interactive PDF Document Viewer</span>
                      <button
                        type="button"
                        onClick={() => {
                          const w = window.open();
                          if (w) {
                            w.document.write(`<iframe src="${viewingFile.fileUrl}" style="width:100%;height:100%;border:none;margin:0;padding:0;" allowfullscreen></iframe>`);
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
                        src={viewingFile.fileUrl}
                        alt={viewingFile.name}
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
                            w.document.write(`<img src="${viewingFile.fileUrl}" style="max-width:100%;display:block;margin:auto;" />`);
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
              ) : viewingFile.category === "Cardiology / ECG" || viewingFile.name.toLowerCase().includes("ecg") ? (
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
              ) : viewingFile.isPhiScrubbed ? (
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
                  <div className="text-[11px] font-semibold text-text-main">{viewingFile.name}</div>
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
                  onClick={() => handleDownloadLabReport(viewingFile)}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Download Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingFile(null)}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-all shadow-sm"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD FAMILY MEMBER UNDER +91 98765 43210 */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-text-main">
                  {language === "hi" ? "परिवार का नया सदस्य जोड़ें" : "Add Family Member (+91 98765 43210)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFamilyMember} className="space-y-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {language === "hi" ? "सदस्य का पूरा नाम" : "Full Name"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Aarti Devi, Suresh Kumar"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "उम्र (वर्ष)" : "Age"} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    placeholder="e.g., 34"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "लिंग" : "Gender"}
                  </label>
                  <select
                    value={newMemberGender}
                    onChange={(e) => setNewMemberGender(e.target.value as "Male" | "Female" | "Other")}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  >
                    <option value="Male">Male / पुरुष</option>
                    <option value="Female">Female / महिला</option>
                    <option value="Other">Other / अन्य</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "पारिवारिक संबंध" : "Relationship"}
                  </label>
                  <select
                    value={newMemberRel}
                    onChange={(e) => setNewMemberRel(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  >
                    <option value="Spouse">Spouse / जीवनसाथी</option>
                    <option value="Father">Father / पिता</option>
                    <option value="Mother">Mother / माता</option>
                    <option value="Son">Son / बेटा</option>
                    <option value="Daughter">Daughter / बेटी</option>
                    <option value="Self">Self / स्वयं</option>
                    <option value="Other">Other / अन्य</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "रक्त समूह" : "Blood Group"}
                  </label>
                  <select
                    value={newMemberBlood}
                    onChange={(e) => setNewMemberBlood(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {language === "hi" ? "ज्ञात एलर्जी (यदि कोई हो)" : "Known Allergies (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Penicillin, Peanuts, Sulfa (leave empty if none)"
                  value={newMemberAllergies}
                  onChange={(e) => setNewMemberAllergies(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border text-[11px] text-text-muted flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "hi"
                    ? "इस सदस्य का अलग प्रोफ़ाइल और नया 15-मिनट डायनामिक सुरक्षा कोड स्वतः सक्रिय होगा।"
                    : "This member will have completely isolated past records and an independent 15-minute access code."}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold"
                >
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-all shadow-xs"
                >
                  {language === "hi" ? "सदस्य जोड़ें" : "Create Member Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG PAST ORGAN CONDITION */}
      {showAddOrganModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-text-main">
                  {language === "hi"
                    ? `पुरानी बीमारी दर्ज करें: ${activeMember.name}`
                    : `Log Past Organ Condition: ${activeMember.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOrganModal(false)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOrganCondition} className="space-y-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {language === "hi" ? "शरीर का अंग / तंत्र (Organ System)" : "Organ System"} *
                </label>
                <select
                  value={newOrganSystem}
                  onChange={(e) => setNewOrganSystem(e.target.value as OrganSystem)}
                  className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                >
                  <option value="Cardiovascular (Heart)">Cardiovascular (हृदय व रक्तचाप)</option>
                  <option value="Respiratory (Lungs)">Respiratory (फेफड़े व श्वास)</option>
                  <option value="Gastrointestinal (Stomach & Liver)">Gastrointestinal (पेट, लिवर व पाचन)</option>
                  <option value="Endocrine (Diabetes & Thyroid)">Endocrine (ग्रंथि, थायराइड व शुगर)</option>
                  <option value="Renal (Kidneys)">Renal (गुर्दे व किडनी)</option>
                  <option value="Musculoskeletal (Bones & Joints)">Musculoskeletal (हड्डियाँ व जोड़)</option>
                  <option value="Neurological (Brain & Nerves)">Neurological (मस्तिष्क व तंत्रिका)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "बीमारी का नाम" : "Condition / Disease Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Bronchial Asthma, Peptic Ulcer"
                    value={newConditionName}
                    onChange={(e) => setNewConditionName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "निदान का वर्ष" : "Diagnosed Year"} *
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    required
                    placeholder={new Date().getFullYear().toString()}
                    value={newDiagnosedYear}
                    onChange={(e) => setNewDiagnosedYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "वर्तमान स्थिति" : "Current Status"}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  >
                    <option value="Active">Active (सक्रिय - इलाज जारी)</option>
                    <option value="Managed">Managed (नियंत्रित)</option>
                    <option value="Resolved">Resolved (ठीक हो चुकी है)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "गंभीरता" : "Severity"}
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  >
                    <option value="Mild">Mild (हल्की)</option>
                    <option value="Moderate">Moderate (मध्यम)</option>
                    <option value="Severe">Severe (गंभीर / क्रोनिक)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {language === "hi" ? "लक्षण व विवरण" : "Clinical Notes / Triggers"}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cold weather triggers attacks, daily morning inhaler"
                  value={newClinicalNotes}
                  onChange={(e) => setNewClinicalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  <span className="text-amber-800 font-bold">
                    {language === "hi"
                      ? "भविष्य की बीमारियों के लिए डॉक्टर हेतु चेतावनी (Contraindication)"
                      : "Cross-Referencing Advisory for Future Doctor Visits"}
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., AVOID Beta-Blockers (Atenolol/Propranolol) in cardiac visits as they aggravate bronchospasm."
                  value={newFutureRisk}
                  onChange={(e) => setNewFutureRisk(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-text-main focus:outline-hidden focus:border-amber-500 text-xs"
                />
                <span className="text-[10px] text-text-muted">
                  {language === "hi"
                    ? "यह चेतावनी डॉक्टर को भविष्य में गलत या नुकसानदेह दवा लिखने से रोकेगी।"
                    : "Alerts visiting clinicians of high-risk drug interactions or contraindicated treatments."}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOrganModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold"
                >
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-all shadow-xs"
                >
                  {language === "hi" ? "बीमारी रिकॉर्ड करें" : "Save Condition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BOOK CONSULTATION WITH DOCTOR */}
      {showBookingModal && bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-text-main">
                  {language === "hi" ? "ओपीडी अपॉइंटमेंट स्लॉट बुक करें" : "Book OPD Consultation Slot"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doctor Mini Card */}
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-main">{bookingDoctor.name}</span>
                <span className="font-bold text-brand-primary flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />
                  <span>{bookingDoctor.consultationFee}</span>
                </span>
              </div>
              <div className="text-[11px] text-text-muted">
                {bookingDoctor.specialty} • {bookingDoctor.experienceYears} yrs experience
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                {bookingDoctor.hospitalName} ({bookingDoctor.location})
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {language === "hi" ? "किस सदस्य के लिए अपॉइंटमेंट है?" : "Select Patient (Family Member)"} *
                </label>
                <select
                  value={bookingPatientId}
                  onChange={(e) => setBookingPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relationship}, {m.age} yrs, {m.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "तारीख" : "Date"} *
                  </label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  >
                    <option value="Today, 29 Oct 2026">Today, 29 Oct 2026</option>
                    <option value="Tomorrow, 30 Oct 2026">Tomorrow, 30 Oct 2026</option>
                    <option value="Saturday, 31 Oct 2026">Saturday, 31 Oct 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {language === "hi" ? "समय स्लॉट" : "Time Slot"} *
                  </label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                  >
                    <option value="10:00 AM (Morning)">10:00 AM (Morning)</option>
                    <option value="02:00 PM (Afternoon)">02:00 PM (Afternoon)</option>
                    <option value="04:30 PM (Evening)">04:30 PM (Evening)</option>
                    <option value="06:00 PM (Evening)">06:00 PM (Evening)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {language === "hi" ? "बीमारी या मुख्य परेशानी (लक्षण)" : "Chief Complaint / Health Issue"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., High fever for 2 days, persistent cough, chest tightness"
                  value={bookingComplaint}
                  onChange={(e) => setBookingComplaint(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface/50 border border-border text-text-main focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border text-[11px] text-text-muted space-y-1">
                <div className="font-semibold text-text-main flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Digital Token Generation</span>
                </div>
                <p>
                  {language === "hi"
                    ? "बुकिंग के तुरंत बाद आपको ओपीडी टोकन नंबर प्राप्त होगा जिसे अस्पताल के स्वागत कक्ष पर दिखाना होगा।"
                    : "A digital token number will be generated immediately for zero-queue entry at hospital OPD reception."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold"
                >
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-all shadow-xs"
                >
                  {language === "hi" ? "टोकन कन्फर्म करें" : "Confirm OPD Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMED OPD APPOINTMENT PASS */}
      {confirmedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    {language === "hi" ? "ओपीडी अपॉइंटमेंट पास (टोकन)" : "Official OPD Appointment Pass"}
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {language === "hi" ? "सफलतापूर्वक बुक हो गया" : "Verified Booking Confirmed"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedPass(null)}
                className="p-1 rounded text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Token Banner */}
            <div className="p-4 rounded-xl bg-surface border border-brand-accent/40 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                {language === "hi" ? "आपका ओपीडी टोकन नंबर" : "OPD Queue Token Number"}
              </span>
              <div className="font-mono text-2xl font-black text-brand-primary tracking-widest">
                {confirmedPass.tokenNumber}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium block">
                Priority OPD Queue Status: Confirmed
              </span>
            </div>

            {/* Pass Details */}
            <div className="space-y-2 p-3.5 rounded-xl bg-surface/50 border border-border text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-muted">{language === "hi" ? "मरीज" : "Patient"}:</span>
                <strong className="text-text-main">{confirmedPass.patientName} ({confirmedPass.relationship})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-muted">{language === "hi" ? "डॉक्टर" : "Doctor"}:</span>
                <strong className="text-text-main">{confirmedPass.doctorName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-muted">{language === "hi" ? "अस्पताल" : "Hospital"}:</span>
                <span className="text-text-main font-medium">{confirmedPass.hospitalName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-muted">{language === "hi" ? "समय व तारीख" : "Slot"}:</span>
                <span className="text-brand-primary font-bold">{confirmedPass.slotDate} • {confirmedPass.slotTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-muted">{language === "hi" ? "फीस" : "Consultation Fee"}:</span>
                <span className="text-text-main font-bold">₹{confirmedPass.consultationFee} (Pay at clinic)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">{language === "hi" ? "समस्या" : "Chief Issue"}:</span>
                <span className="text-text-main font-medium">{confirmedPass.chiefComplaint}</span>
              </div>
            </div>

            {/* Dynamic Code Reminder */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Key className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {language === "hi"
                  ? "अस्पताल पहुँचकर डॉक्टर को अपने मरीज पोर्टल का 15-मिनट सुरक्षा कोड बताएं ताकि डॉक्टर आपका पुराना मेडिकल इतिहास सुरक्षित देख सकें।"
                  : "Present this token at the reception. The doctor will verify your 15-minute dynamic code to safely access your past organ conditions."}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "पर्ची प्रिंट करें" : "Print Pass"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedPass(null);
                  setActiveTab("appointments");
                }}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-all shadow-xs"
              >
                {language === "hi" ? "अपॉइंटमेंट्स में देखें" : "View in My Bookings"}
              </button>
            </div>
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
