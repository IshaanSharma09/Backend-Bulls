"use client";

import { BACKEND_URL } from "./config";

// Shared Clinical Store for MedNexus (IIIT Delhi Hospital)
// Supports:
// 1. Dynamic one-time patient access code (prevents doctor viewing report years later)
// 2. Crisp, user-editable Health Profile (Allergies, Current Medicines, Genetics, Vaccinations)
// 3. Uploadable & editable lab reports / files
// 4. IIIT Delhi Hospital Smart Queue: Cancel appointment, flag empty slot, and drag/assign waiting early-arrival patients
// 5. Backend connection ready with graceful offline fallback

export interface ActiveMedication {
  id: string;
  name: string;
  genericSalt: string;
  exactDose: string;
  frequency: string;
  timing: string;
  totalDurationDays: number;
  daysCompleted: number;
  daysRemaining: number;
  purpose: string;
  prescribedBy: string;
  prescribedDate: string;
  instructions: string;
  janAushadhiGeneric: string;
  mrpPrice: number;
  janAushadhiPrice: number;
  takenToday: boolean;
}

export interface DynamicPatientAccessCode {
  patientId: string;
  code: string;
  generatedAt: number; // timestamp
  expiresAt: number;   // timestamp (15 mins)
  isActive: boolean;
}

export interface AIHealthReport {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  generatedDate: string;
  overallHealthStatus: "Stable Under Cardiac Observation" | "Critical" | "Normal";
  primaryCondition: string;
  clinicalSummaryText: string;
  criticalAllergyWarning: string;
  keyVitals: {
    bloodPressure: string;
    pulse: string;
    spo2: string;
    temperature: string;
  };
  diagnosticFindings: Array<{
    testName: string;
    date: string;
    result: string;
    interpretation: string;
  }>;
  aiCareDirectives: string[];
}

export interface PatientLabFile {
  id: string;
  name: string;
  category: "Blood Test" | "Cardiology / ECG" | "Radiology / X-Ray" | "Prescription" | "Other";
  date: string;
  fileSize: string;
  notes: string;
  fileUrl?: string;
  isPhiScrubbed?: boolean;
  redactedEntities?: string[];
  scrubbedSummary?: string;
}

export interface PatientHealthProfile {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  simpleSummary: string;
  allergies: string[];
  genetics: string[];
  vaccinations: Array<{
    name: string;
    status: string;
    date: string;
  }>;
  currentMedicines: Array<{
    id: string;
    name: string;
    dose: string;
    frequency: string;
    instructions: string;
  }>;
  labFiles: PatientLabFile[];
}

export interface HospitalQueueSlot {
  id: string;
  hospitalId: string;
  slotTime: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  severity: "Emergency" | "Urgent" | "Routine";
  status: "Confirmed" | "Empty (Cancelled)" | "Reallocated (Early Arrival)" | "Completed" | "Vacated (Cancelled)" | "Reallocated (Auto-Promoted)";
  referringSpoke: string;
  attendingDoctor: string;
  notes?: string;
}

export interface WaitingEarlyArrivalPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  requestedDoctor: string;
  reason: string;
  arrivalStatus: "Waiting in OPD Lounge" | "Early Check-in";
  requestedTime: string;
  phone: string;
}

export interface HospitalPatient {
  id: string;
  hospitalId: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  admissionType: "Emergency Transfer" | "Outpatient Consultation" | "Day Care";
  attendingDoctor: string;
  status: "In Consultation" | "Observation Ward" | "Discharged" | "Cath Lab In Progress";
  allergyFlag: string;
  lastVisit: string;
}

export interface PrescriptionInput {
  patientId: string;
  patientName: string;
  doctorName: string;
  doctorBadge?: string;
  medicineName: string;
  genericSalt: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  janAushadhiGeneric?: string;
  brandedPrice?: number;
  janAushadhiPrice?: number;
}

export interface PrescriptionAuditEntry {
  id: string;
  version?: number;
  editedAt: string;
  timestamp?: string;
  editedBy: string;
  medicationName?: string;
  dosage?: string;
  instructions?: string;
  previousMedicationName: string;
  previousDosage: string;
  previousInstructions?: string;
  reasonForChange: string;
}

export interface DigitalPrescription {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  instructions?: string;
  prescribedBy: string;
  prescribedDate: string;
  prescribedTime: string;
  status: "Active" | "Completed" | "Discontinued";
  version: number;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  auditHistory: PrescriptionAuditEntry[];
}

export type OrganSystem =
  | "Cardiovascular (Heart)"
  | "Respiratory (Lungs)"
  | "Gastrointestinal (Stomach & Liver)"
  | "Endocrine (Diabetes & Thyroid)"
  | "Renal (Kidneys)"
  | "Musculoskeletal (Bones & Joints)"
  | "Neurological (Brain & Nerves)";

export interface OrganConditionRecord {
  id: string;
  organSystem: OrganSystem;
  conditionName: string;
  diagnosedYear: string;
  status: "Active" | "Managed" | "Resolved";
  severity: "Mild" | "Moderate" | "Severe";
  clinicalNotes: string;
  futureRiskAlert: string;
}

export interface FamilyMemberProfile {
  id: string;
  relationship: "Self" | "Spouse" | "Father" | "Mother" | "Son" | "Daughter" | "Elderly Dependent";
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  abhaId?: string;
  allergies: string[];
  organConditions: OrganConditionRecord[];
  currentMedicines: Array<{
    id: string;
    name: string;
    dose: string;
    frequency: string;
    instructions: string;
  }>;
  prescriptions: DigitalPrescription[];
  labFiles: PatientLabFile[];
  accessCode: DynamicPatientAccessCode;
}

export interface BookedAppointment {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  relationship: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  specialty: string;
  slotDate: string;
  slotTime: string;
  consultationFee: number;
  chiefComplaint: string;
  status: "Confirmed" | "Completed" | "Cancelled";
  bookedAt: string;
}

export interface DoctorProfile {
  id: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  specialty: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  peerUpvotes: number;
  matchedSymptoms: string[];
  bio: string;
  availableNext: string;
  location: string;
  distanceKm: number;
  isSponsored?: boolean;
  sponsoredBadge?: string;
}

// Initial Data for IIIT Delhi Hospital
const INITIAL_MEDICATIONS: ActiveMedication[] = [
  {
    id: "med-1",
    name: "Aspirin Chewable (75 mg)",
    genericSalt: "Acetylsalicylic Acid 75mg PMBI",
    exactDose: "1 Tablet (75 mg)",
    frequency: "Once daily in the morning",
    timing: "8:00 AM (After Breakfast)",
    totalDurationDays: 30,
    daysCompleted: 4,
    daysRemaining: 26,
    purpose: "Cardioprotection and blood thinning",
    prescribedBy: "Dr. Rajesh Sharma (IIIT Delhi Hospital)",
    prescribedDate: "17 Oct 2026",
    instructions: "Chew thoroughly after meal with water.",
    janAushadhiGeneric: "Aspirin 75mg Tablets PMBI",
    mrpPrice: 12.0,
    janAushadhiPrice: 1.8,
    takenToday: true,
  },
  {
    id: "med-2",
    name: "Atorvastatin (20 mg)",
    genericSalt: "Atorvastatin Calcium 20mg PMBI",
    exactDose: "1 Tablet (20 mg)",
    frequency: "Once daily at bedtime",
    timing: "9:30 PM (Before Sleep)",
    totalDurationDays: 60,
    daysCompleted: 12,
    daysRemaining: 48,
    purpose: "Lipid control and plaque stabilization",
    prescribedBy: "Dr. Rajesh Sharma (IIIT Delhi Hospital)",
    prescribedDate: "05 Oct 2026",
    instructions: "Take every night before sleeping.",
    janAushadhiGeneric: "Atorvastatin 20mg Tablets PMBI",
    mrpPrice: 28.0,
    janAushadhiPrice: 4.5,
    takenToday: false,
  },
];

const INITIAL_DIGITAL_PRESCRIPTIONS: DigitalPrescription[] = [
  {
    id: "rx-101",
    patientId: "RAMESH-54",
    medicationName: "Aspirin Chewable",
    dosage: "75 mg once daily after breakfast",
    instructions: "Chew thoroughly after breakfast with a full glass of water",
    prescribedBy: "Dr. Rajesh Sharma (Chief Medical Officer & Cardiology, IIIT Delhi Hospital)",
    prescribedDate: "17 Oct 2026",
    prescribedTime: "10:30 AM",
    status: "Active",
    version: 2,
    lastUpdated: "18 Oct 2026, 08:30 AM",
    lastUpdatedBy: "Dr. Rajesh Sharma (DM Cardiology)",
    auditHistory: [
      {
        id: "audit-1",
        version: 1,
        editedAt: "18 Oct 2026, 08:30 AM",
        timestamp: "18 Oct 2026, 08:30 AM",
        editedBy: "Dr. Rajesh Sharma (DM Cardiology)",
        medicationName: "Aspirin Dispersible",
        dosage: "150 mg once daily",
        instructions: "Dissolve in half glass of water",
        previousMedicationName: "Aspirin Dispersible",
        previousDosage: "150 mg once daily",
        previousInstructions: "Dissolve in half glass of water",
        reasonForChange: "Down-titrated to 75 mg maintenance dose post-stable ECG review",
      },
    ],
  },
  {
    id: "rx-102",
    patientId: "RAMESH-54",
    medicationName: "Atorvastatin Tablet",
    dosage: "20 mg once daily at bedtime",
    instructions: "Take every night before sleeping for lipid control",
    prescribedBy: "Dr. Rajesh Sharma (Chief Medical Officer & Cardiology, IIIT Delhi Hospital)",
    prescribedDate: "15 Oct 2026",
    prescribedTime: "11:15 AM",
    status: "Active",
    version: 1,
    auditHistory: [],
  },
  {
    id: "rx-103",
    patientId: "RAMESH-54",
    medicationName: "Metoprolol Succinate",
    dosage: "25 mg once daily in the morning",
    instructions: "Maintains smooth resting heart rate",
    prescribedBy: "Dr. Neha Kapoor (Internal Medicine & Diagnostics, IIIT Delhi Hospital)",
    prescribedDate: "12 Oct 2026",
    prescribedTime: "04:45 PM",
    status: "Active",
    version: 1,
    auditHistory: [],
  },
];

const INITIAL_AI_REPORT: AIHealthReport = {
  patientId: "RAMESH-54",
  patientName: "Ramesh Kumar",
  age: 54,
  gender: "Male",
  generatedDate: "18 Oct 2026, 03:00 AM",
  overallHealthStatus: "Stable Under Cardiac Observation",
  primaryCondition: "Coronary Health Evaluation (IIIT Delhi Hospital)",
  clinicalSummaryText:
    "Patient Ramesh Kumar (54M) under routine cardiac follow-up. Blood pressure and resting pulse remain well within safe clinical targets. Active prescriptions are being maintained.",
  criticalAllergyWarning:
    "ALERT: Documented allergy to Penicillin and Ibuprofen / NSAIDs. Use paracetamol for analgesia.",
  keyVitals: {
    bloodPressure: "118/76 mmHg (Normal)",
    pulse: "72 bpm (Normal Sinus)",
    spo2: "98% on Ambient Air",
    temperature: "98.4 F (Normal)",
  },
  diagnosticFindings: [
    {
      testName: "12-Lead Electrocardiogram (ECG)",
      date: "16 Oct 2026",
      result: "Normal Sinus Rhythm, HR 72 bpm",
      interpretation: "No acute ischemic changes.",
    },
    {
      testName: "Fasting Blood Sugar",
      date: "10 Oct 2026",
      result: "92 mg/dL",
      interpretation: "Normal non-diabetic range.",
    },
  ],
  aiCareDirectives: [
    "Continue Aspirin 75mg daily after breakfast.",
    "Avoid painkillers containing Ibuprofen, Combiflam, or Diclofenac.",
    "Annual cardiology review scheduled at IIIT Delhi Hospital.",
  ],
};

export const INITIAL_HEALTH_PROFILE: PatientHealthProfile = {
  patientId: "RAMESH-54",
  patientName: "Ramesh Kumar",
  age: 54,
  gender: "Male",
  bloodGroup: "B+",
  simpleSummary: "Stable and recovering well. Blood pressure and pulse are in the healthy target range.",
  allergies: [
    "Penicillin (Causes severe skin rash and swelling)",
    "Ibuprofen / NSAIDs (Causes breathing tightness)",
    "Dust and pollen (Mild seasonal allergy)",
  ],
  genetics: [
    "Family history: Father had coronary artery condition at age 58",
    "No hereditary bleeding or blood clotting disorders",
    "Normal cholesterol clearance genes (negative for familial hypercholesterolemia)",
  ],
  vaccinations: [
    { name: "COVID-19 Booster", status: "Completed (3 Doses)", date: "Jan 2024" },
    { name: "Hepatitis B", status: "Vaccinated (Full course)", date: "Aug 2023" },
    { name: "Tetanus Toxoid (TT)", status: "Up to date", date: "Nov 2025" },
    { name: "Annual Flu Vaccine", status: "Due soon", date: "Nov 2026" },
  ],
  currentMedicines: [
    {
      id: "med-1",
      name: "Aspirin Chewable",
      dose: "75 mg",
      frequency: "Once daily in the morning",
      instructions: "Take after breakfast with a glass of water",
    },
    {
      id: "med-2",
      name: "Atorvastatin",
      dose: "20 mg",
      frequency: "Once daily at night",
      instructions: "Take before sleep for healthy cholesterol",
    },
    {
      id: "med-3",
      name: "Metoprolol",
      dose: "25 mg",
      frequency: "Once daily in the morning",
      instructions: "Maintains smooth resting heart rate",
    },
  ],
  labFiles: [
    {
      id: "file-1",
      name: "Lipid_Profile_Oct2026.pdf",
      category: "Blood Test",
      date: "14 Oct 2026",
      fileSize: "1.2 MB",
      notes: "Total Cholesterol 164 mg/dL, HDL 46 mg/dL, LDL 88 mg/dL. All numbers within normal limits.",
    },
    {
      id: "file-2",
      name: "12_Lead_ECG_Trace.pdf",
      category: "Cardiology / ECG",
      date: "16 Oct 2026",
      fileSize: "840 KB",
      notes: "Regular rhythm, heart rate 72 bpm, no critical changes detected.",
    },
    {
      id: "file-3",
      name: "Chest_XRay_Report.jpg",
      category: "Radiology / X-Ray",
      date: "10 Oct 2026",
      fileSize: "2.1 MB",
      notes: "Lungs clear, heart size normal.",
    },
  ],
};

const INITIAL_QUEUE_SLOTS: HospitalQueueSlot[] = [
  {
    id: "Q-IIITD-01",
    hospitalId: "HOSP-IIITD",
    slotTime: "15:45",
    patientId: "RAMESH-54",
    patientName: "Ramesh Kumar",
    age: 54,
    gender: "Male",
    severity: "Emergency",
    status: "Confirmed",
    referringSpoke: "IIITD Campus Medical Spoke",
    attendingDoctor: "Dr. Rajesh Sharma",
    notes: "Post-STEMI Cardiology Review",
  },
  {
    id: "Q-IIITD-02",
    hospitalId: "HOSP-IIITD",
    slotTime: "16:00",
    patientId: "PAT-IIITD-881",
    patientName: "Pooja Singhal",
    age: 38,
    gender: "Female",
    severity: "Routine",
    status: "Confirmed",
    referringSpoke: "Okhla OPD Referral",
    attendingDoctor: "Dr. Neha Kapoor",
    notes: "Cardio-Metabolic Screening",
  },
  {
    id: "Q-IIITD-03",
    hospitalId: "HOSP-IIITD",
    slotTime: "16:15",
    patientId: "PAT-IIITD-912",
    patientName: "Mohan Lal",
    age: 62,
    gender: "Male",
    severity: "Urgent",
    status: "Confirmed",
    referringSpoke: "South Delhi Polyclinic",
    attendingDoctor: "Dr. Rajesh Sharma",
    notes: "Unstable Angina Follow-up",
  },
  {
    id: "Q-IIITD-04",
    hospitalId: "HOSP-IIITD",
    slotTime: "16:30",
    patientId: "PAT-IIITD-945",
    patientName: "Kavita Rao",
    age: 41,
    gender: "Female",
    severity: "Routine",
    status: "Confirmed",
    referringSpoke: "Govindpuri Dispensary",
    attendingDoctor: "Dr. Rajesh Sharma",
    notes: "Hypertension Assessment",
  },
  {
    id: "Q-IIITD-05",
    hospitalId: "HOSP-IIITD",
    slotTime: "16:45",
    patientId: "PAT-IIITD-998",
    patientName: "Sanjay Mehra",
    age: 50,
    gender: "Male",
    severity: "Urgent",
    status: "Confirmed",
    referringSpoke: "Nehru Place Clinic",
    attendingDoctor: "Dr. Neha Kapoor",
    notes: "Arrhythmia Holter Review",
  },
];

const INITIAL_WAITING_PATIENTS: WaitingEarlyArrivalPatient[] = [
  {
    id: "WAIT-01",
    name: "Sunita Verma",
    age: 48,
    gender: "Female",
    requestedDoctor: "Dr. Rajesh Sharma",
    reason: "BP check & chest tightness. Arrived 45 min early.",
    arrivalStatus: "Waiting in OPD Lounge",
    requestedTime: "Wants earlier slot",
    phone: "+91 98112-40192",
  },
  {
    id: "WAIT-02",
    name: "Vikram Malhotra",
    age: 61,
    gender: "Male",
    requestedDoctor: "Dr. Rajesh Sharma",
    reason: "Post-angioplasty follow-up. Waiting in campus lounge.",
    arrivalStatus: "Waiting in OPD Lounge",
    requestedTime: "Wants earlier slot",
    phone: "+91 98710-55421",
  },
  {
    id: "WAIT-03",
    name: "Aman Gupta",
    age: 26,
    gender: "Male",
    requestedDoctor: "Dr. Neha Kapoor",
    reason: "Acute migraine & dizzy spells.",
    arrivalStatus: "Early Check-in",
    requestedTime: "Wants earlier slot",
    phone: "+91 99100-33214",
  },
];

const INITIAL_HOSPITAL_PATIENTS: HospitalPatient[] = [
  {
    id: "HP-01",
    hospitalId: "HOSP-IIITD",
    name: "Ramesh Kumar",
    age: 54,
    gender: "Male",
    abhaId: "91-8273-1928-3920",
    admissionType: "Emergency Transfer",
    attendingDoctor: "Dr. Rajesh Sharma",
    status: "Observation Ward",
    allergyFlag: "Penicillin & Ibuprofen",
    lastVisit: "Today at 15:45",
  },
  {
    id: "HP-02",
    hospitalId: "HOSP-IIITD",
    name: "Pooja Singhal",
    age: 38,
    gender: "Female",
    abhaId: "91-4821-9921-3412",
    admissionType: "Outpatient Consultation",
    attendingDoctor: "Dr. Neha Kapoor",
    status: "In Consultation",
    allergyFlag: "No Known Drug Allergies",
    lastVisit: "Today at 16:00",
  },
  {
    id: "HP-03",
    hospitalId: "HOSP-IIITD",
    name: "Mohan Lal",
    age: 62,
    gender: "Male",
    abhaId: "91-1182-3849-2041",
    admissionType: "Emergency Transfer",
    attendingDoctor: "Dr. Rajesh Sharma",
    status: "Observation Ward",
    allergyFlag: "Sulfa Drugs",
    lastVisit: "Today at 16:15",
  },
  {
    id: "HP-04",
    hospitalId: "HOSP-IIITD",
    name: "Kavita Rao",
    age: 41,
    gender: "Female",
    abhaId: "91-3849-2018-4921",
    admissionType: "Outpatient Consultation",
    attendingDoctor: "Dr. Rajesh Sharma",
    status: "Discharged",
    allergyFlag: "Latex Sensitivity",
    lastVisit: "Today at 16:30",
  },
];

const INITIAL_DOCTORS: DoctorProfile[] = [
  {
    id: "DOC-IIITD-01",
    hospitalId: "HOSP-IIITD",
    hospitalName: "IIIT Delhi Hospital",
    name: "Dr. Rajesh Sharma",
    specialty: "Interventional Cardiology & CMO",
    experienceYears: 16,
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 142,
    peerUpvotes: 312,
    matchedSymptoms: ["chest pain", "shortness of breath", "high blood pressure", "palpitations", "heart attack", "stemi"],
    bio: "Chief Medical Officer at IIIT Delhi Hospital. Specialist in cardiac care, angioplasty, and telemetry consultations.",
    availableNext: "Available in OPD",
    location: "Okhla Phase III, New Delhi",
    distanceKm: 0.8,
    isSponsored: true,
    sponsoredBadge: "Verified Hospital Partner",
  },
  {
    id: "DOC-IIITD-02",
    hospitalId: "HOSP-IIITD",
    hospitalName: "IIIT Delhi Hospital",
    name: "Dr. Neha Kapoor",
    specialty: "Internal Medicine & Diagnostics",
    experienceYears: 11,
    consultationFee: 400,
    rating: 4.8,
    reviewCount: 96,
    peerUpvotes: 215,
    matchedSymptoms: ["fever", "cough", "infection", "stomach pain", "fatigue", "general weakness", "diabetes"],
    bio: "Senior Consultant in Internal Medicine at IIIT Delhi Hospital managing acute clinical triage and multi-system care.",
    availableNext: "Available in OPD",
    location: "Govind Puri, South Delhi",
    distanceKm: 1.4,
  },
  {
    id: "DOC-IIITD-03",
    hospitalId: "HOSP-IIITD",
    hospitalName: "Jan Aushadhi Community Clinic",
    name: "Dr. Harpreet Singh Gill",
    specialty: "Family Medicine & General OPD",
    experienceYears: 8,
    consultationFee: 300,
    rating: 4.7,
    reviewCount: 112,
    peerUpvotes: 240,
    matchedSymptoms: ["fever", "viral infection", "cold", "flu", "bp checkup", "health checkup", "headache"],
    bio: "Community physician dedicated to affordable outpatient primary care, preventive screenings, and chronic illness management.",
    availableNext: "Available in OPD",
    location: "Kalkaji, South Delhi",
    distanceKm: 1.8,
  },
  {
    id: "DOC-IIITD-04",
    hospitalId: "HOSP-IIITD",
    hospitalName: "Fortis Escorts Heart Institute",
    name: "Dr. Ananya Roy",
    specialty: "Pulmonology & Respiratory Care",
    experienceYears: 9,
    consultationFee: 350,
    rating: 4.8,
    reviewCount: 88,
    peerUpvotes: 195,
    matchedSymptoms: ["asthma", "wheezing", "bronchitis", "copd", "breathlessness", "persistent cough", "allergy"],
    bio: "Consultant pulmonologist with clinical focus on severe persistent asthma, allergy screening, and sleep apnea.",
    availableNext: "Next Slot: Today 4:00 PM",
    location: "Okhla Road, New Delhi",
    distanceKm: 1.1,
  },
  {
    id: "DOC-IIITD-05",
    hospitalId: "HOSP-IIITD",
    hospitalName: "Max Super Specialty Hospital",
    name: "Dr. Amitav Banerjee",
    specialty: "Orthopaedics & Joint Replacement",
    experienceYears: 13,
    consultationFee: 550,
    rating: 4.7,
    reviewCount: 128,
    peerUpvotes: 260,
    matchedSymptoms: ["knee pain", "joint stiffness", "back pain", "arthritis", "fracture", "ligament tear"],
    bio: "Specialist in minimally invasive knee and hip arthroplasty with rapid postoperative rehabilitation.",
    availableNext: "Available in OPD",
    location: "Saket District Centre, New Delhi",
    distanceKm: 4.2,
  },
  {
    id: "DOC-IIITD-06",
    hospitalId: "HOSP-IIITD",
    hospitalName: "Apollo Specialty Hospital",
    name: "Dr. Priya Ramanathan",
    specialty: "Endocrinology & Diabetology",
    experienceYears: 14,
    consultationFee: 600,
    rating: 4.9,
    reviewCount: 174,
    peerUpvotes: 340,
    matchedSymptoms: ["diabetes", "thyroid", "weight gain", "hormonal imbalance", "high blood sugar", "pcos"],
    bio: "Gold medalist endocrinologist specializing in comprehensive diabetes reversal and endocrine thyroid disorders.",
    availableNext: "Next Slot: Today 3:15 PM",
    location: "Jasola Vihar, South Delhi",
    distanceKm: 2.9,
    isSponsored: true,
    sponsoredBadge: "Sponsored Clinic Partner",
  },
  {
    id: "DOC-IIITD-07",
    hospitalId: "HOSP-IIITD",
    hospitalName: "Sir Ganga Ram Hospital",
    name: "Dr. Sunita Deshmukh",
    specialty: "Gastroenterology & Hepatology",
    experienceYears: 17,
    consultationFee: 650,
    rating: 4.9,
    reviewCount: 190,
    peerUpvotes: 410,
    matchedSymptoms: ["acid reflux", "gastritis", "liver problems", "jaundice", "indigestion", "constipation"],
    bio: "Senior Hepatologist focusing on metabolic fatty liver disease, therapeutic endoscopy, and inflammatory bowel disease.",
    availableNext: "Next Slot: Tomorrow 10:00 AM",
    location: "Old Rajinder Nagar, Central Delhi",
    distanceKm: 9.3,
  },
  {
    id: "DOC-IIITD-08",
    hospitalId: "HOSP-IIITD",
    hospitalName: "AIIMS Apex Trauma Centre",
    name: "Dr. Vikramaditya Sen",
    specialty: "Neurology & Stroke Care",
    experienceYears: 19,
    consultationFee: 700,
    rating: 4.9,
    reviewCount: 218,
    peerUpvotes: 489,
    matchedSymptoms: ["headache", "migraine", "dizziness", "numbness", "seizures", "stroke", "tremors"],
    bio: "Professor and Senior Stroke Neurologist with extensive research in acute neurovascular interventions.",
    availableNext: "Next Slot: Today 2:30 PM",
    location: "Ansari Nagar, New Delhi",
    distanceKm: 5.6,
  },
];

const INITIAL_FAMILY_MEMBERS: FamilyMemberProfile[] = [
  {
    id: "FAM-01",
    relationship: "Self",
    name: "Ramesh Kumar",
    age: 42,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    abhaId: "91-4821-3829-1920",
    allergies: [
      "Penicillin (Severe skin rash and swelling)",
      "Ibuprofen / NSAIDs (Breathing tightness)",
      "Dust and pollen (Mild seasonal allergy)",
    ],
    organConditions: [
      {
        id: "org-1",
        organSystem: "Cardiovascular (Heart)",
        conditionName: "Coronary Health Evaluation & Mild Ischemia",
        diagnosedYear: "2022",
        status: "Managed",
        severity: "Moderate",
        clinicalNotes: "Under routine antiplatelet maintenance. Resting pulse 72 bpm, BP 118/76 mmHg.",
        futureRiskAlert: "Avoid sudden strenuous exertion. Monitor ECG prior to starting medications with QT prolongation.",
      },
      {
        id: "org-2",
        organSystem: "Respiratory (Lungs)",
        conditionName: "Childhood Bronchial Asthma",
        diagnosedYear: "2012",
        status: "Resolved",
        severity: "Mild",
        clinicalNotes: "Occasional seasonal wheezing during harvest dust season. No recent hospital admissions.",
        futureRiskAlert: "CRITICAL ALERT: Avoid non-cardioselective Beta-Blockers (Propranolol, Carvedilol) for future cardiac therapy; risks severe bronchospasm.",
      },
    ],
    currentMedicines: [
      {
        id: "med-1",
        name: "Aspirin Chewable",
        dose: "75 mg",
        frequency: "Once daily in morning",
        instructions: "Take after breakfast with a full glass of water",
      },
      {
        id: "med-2",
        name: "Atorvastatin",
        dose: "20 mg",
        frequency: "Once daily at night",
        instructions: "Take before sleep for lipid stabilization",
      },
    ],
    prescriptions: INITIAL_DIGITAL_PRESCRIPTIONS,
    labFiles: INITIAL_HEALTH_PROFILE.labFiles,
    accessCode: {
      patientId: "FAM-01",
      code: "849201",
      generatedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      isActive: true,
    },
  },
  {
    id: "FAM-02",
    relationship: "Spouse",
    name: "Sunita Devi",
    age: 39,
    gender: "Female",
    bloodGroup: "O+",
    phone: "+91 98765 43210",
    abhaId: "91-3849-2041-8812",
    allergies: ["Sulfa antibiotics (Causes acute skin hives)"],
    organConditions: [
      {
        id: "org-3",
        organSystem: "Endocrine (Diabetes & Thyroid)",
        conditionName: "Subclinical Hypothyroidism",
        diagnosedYear: "2020",
        status: "Active",
        severity: "Mild",
        clinicalNotes: "Maintained on Levothyroxine 25 mcg. TSH controlled at 3.1 mIU/L.",
        futureRiskAlert: "Check TSH levels before starting any iodine-containing contrast agents or thyroid-suppressive drugs.",
      },
      {
        id: "org-4",
        organSystem: "Gastrointestinal (Stomach & Liver)",
        conditionName: "Mild Iron Deficiency Anemia / Gastritis",
        diagnosedYear: "2023",
        status: "Managed",
        severity: "Mild",
        clinicalNotes: "Hemoglobin 11.4 g/dL. Dietary iron supplements prescribed with vitamin C.",
        futureRiskAlert: "Take oral iron supplements on empty stomach; avoid co-administration with calcium or antacids.",
      },
    ],
    currentMedicines: [
      {
        id: "med-sunita-1",
        name: "Levothyroxine Sodium",
        dose: "25 mcg",
        frequency: "Once daily early morning",
        instructions: "Take 30 minutes before breakfast with water",
      },
    ],
    prescriptions: [
      {
        id: "rx-sunita-1",
        patientId: "FAM-02",
        medicationName: "Levothyroxine 25 mcg",
        dosage: "1 tablet once daily morning fasting",
        instructions: "Swallow whole with half cup water",
        prescribedBy: "Dr. Priya Ramanathan (Endocrinology, Apollo Specialty Hospital)",
        prescribedDate: "10 Oct 2026",
        prescribedTime: "11:00 AM",
        status: "Active",
        version: 1,
        auditHistory: [],
      },
    ],
    labFiles: [
      {
        id: "file-sunita-1",
        name: "Thyroid_Panel_Report.pdf",
        category: "Blood Test",
        date: "05 Oct 2026",
        fileSize: "620 KB",
        notes: "Free T4 1.2 ng/dL, TSH 3.1 mIU/L. Euthyroid state maintained.",
      },
    ],
    accessCode: {
      patientId: "FAM-02",
      code: "721940",
      generatedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      isActive: true,
    },
  },
  {
    id: "FAM-03",
    relationship: "Father",
    name: "Ramprasad Kumar",
    age: 68,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    abhaId: "91-1182-9901-4432",
    allergies: ["Diclofenac (Triggers severe stomach ulcer flare)"],
    organConditions: [
      {
        id: "org-5",
        organSystem: "Gastrointestinal (Stomach & Liver)",
        conditionName: "Chronic Peptic Ulcer Disease (Duodenal)",
        diagnosedYear: "2018",
        status: "Managed",
        severity: "Severe",
        clinicalNotes: "Healed ulcer post-triple eradication therapy. Strict avoidance of all NSAID pain medications.",
        futureRiskAlert: "CRITICAL WARNING: Absolute contraindication for NSAIDs (Ibuprofen, Combiflam, Diclofenac). Use Paracetamol for pain.",
      },
      {
        id: "org-6",
        organSystem: "Musculoskeletal (Bones & Joints)",
        conditionName: "Bilateral Knee Osteoarthritis Grade 3",
        diagnosedYear: "2019",
        status: "Active",
        severity: "Moderate",
        clinicalNotes: "Severe joint pain on prolonged standing. Regular low-impact walking and knee strengthening recommended.",
        futureRiskAlert: "Avoid oral steroids without blood sugar monitoring. Prefer topical analgesic gels over systemic NSAIDs.",
      },
      {
        id: "org-7",
        organSystem: "Renal (Kidneys)",
        conditionName: "Age-Related Mild eGFR Reduction (Stage 2 CKD)",
        diagnosedYear: "2023",
        status: "Managed",
        severity: "Mild",
        clinicalNotes: "Serum Creatinine 1.3 mg/dL, eGFR 64 mL/min. Adequate daily hydration advised.",
        futureRiskAlert: "Nephrology Alert: Dose-adjust all antibiotics and avoid nephrotoxic contrast agents without pre-hydration.",
      },
    ],
    currentMedicines: [
      {
        id: "med-ramprasad-1",
        name: "Pantoprazole Gastro-Resistant",
        dose: "40 mg",
        frequency: "Once daily before breakfast",
        instructions: "Gastric mucosal protection",
      },
      {
        id: "med-ramprasad-2",
        name: "Glucosamine Sulphate",
        dose: "500 mg",
        frequency: "Twice daily after meals",
        instructions: "Cartilage support for knees",
      },
    ],
    prescriptions: [
      {
        id: "rx-ramprasad-1",
        patientId: "FAM-03",
        medicationName: "Pantoprazole 40mg",
        dosage: "1 tablet daily 30 mins before breakfast",
        instructions: "Acid suppression for ulcer prophylaxis",
        prescribedBy: "Dr. Sunita Deshmukh (Gastroenterology, Sir Ganga Ram Hospital)",
        prescribedDate: "12 Oct 2026",
        prescribedTime: "02:30 PM",
        status: "Active",
        version: 1,
        auditHistory: [],
      },
    ],
    labFiles: [
      {
        id: "file-ramprasad-1",
        name: "Kidney_Function_Test.pdf",
        category: "Blood Test",
        date: "08 Oct 2026",
        fileSize: "910 KB",
        notes: "Urea 38 mg/dL, Creatinine 1.3 mg/dL, Sodium 138 mEq/L, Potassium 4.2 mEq/L.",
      },
    ],
    accessCode: {
      patientId: "FAM-03",
      code: "639201",
      generatedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      isActive: true,
    },
  },
  {
    id: "FAM-04",
    relationship: "Son",
    name: "Aarav Kumar",
    age: 12,
    gender: "Male",
    bloodGroup: "O+",
    phone: "+91 98765 43210",
    abhaId: "91-9921-3810-7712",
    allergies: ["Peanuts (Mild facial hives)"],
    organConditions: [
      {
        id: "org-8",
        organSystem: "Respiratory (Lungs)",
        conditionName: "Seasonal Allergic Rhinitis",
        diagnosedYear: "2024",
        status: "Active",
        severity: "Mild",
        clinicalNotes: "Frequent morning sneezing and clear rhinorrhea during harvest change. Saline nasal spray helpful.",
        futureRiskAlert: "Non-sedating antihistamines (Levocetirizine / Fexofenadine) preferred during school examinations.",
      },
    ],
    currentMedicines: [
      {
        id: "med-aarav-1",
        name: "Cetirizine Syrup / Tablet",
        dose: "5 mg",
        frequency: "As needed for acute sneezing",
        instructions: "Take at night after food",
      },
    ],
    prescriptions: [],
    labFiles: [],
    accessCode: {
      patientId: "FAM-04",
      code: "518392",
      generatedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      isActive: true,
    },
  },
];

const INITIAL_BOOKED_APPOINTMENTS: BookedAppointment[] = [
  {
    id: "APT-8821",
    tokenNumber: "OPD-TKT-8821",
    patientId: "FAM-03",
    patientName: "Ramprasad Kumar",
    relationship: "Father",
    doctorId: "DOC-IIITD-01",
    doctorName: "Dr. Rajesh Sharma",
    hospitalName: "IIIT Delhi Hospital",
    specialty: "Interventional Cardiology & CMO",
    slotDate: "Today, 29 Oct 2026",
    slotTime: "04:30 PM",
    consultationFee: 500,
    chiefComplaint: "Routine cardiac follow-up and blood pressure review",
    status: "Confirmed",
    bookedAt: "29 Oct 2026, 09:15 AM",
  },
];

class ClinicalStore {
  private medications: ActiveMedication[] = INITIAL_MEDICATIONS;
  private digitalPrescriptions: DigitalPrescription[] = INITIAL_DIGITAL_PRESCRIPTIONS;
  private accessCode: DynamicPatientAccessCode = {
    patientId: "RAMESH-54",
    code: "849201",
    generatedAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    isActive: true,
  };
  private aiReport: AIHealthReport = INITIAL_AI_REPORT;
  private healthProfile: PatientHealthProfile = INITIAL_HEALTH_PROFILE;
  private queueSlots: HospitalQueueSlot[] = INITIAL_QUEUE_SLOTS;
  private waitingPatients: WaitingEarlyArrivalPatient[] = INITIAL_WAITING_PATIENTS;
  private hospitalPatients: HospitalPatient[] = INITIAL_HOSPITAL_PATIENTS;
  private doctors: DoctorProfile[] = INITIAL_DOCTORS;
  private familyMembers: FamilyMemberProfile[] = INITIAL_FAMILY_MEMBERS;
  private activeMemberId: string = "FAM-01";
  private bookedAppointments: BookedAppointment[] = INITIAL_BOOKED_APPOINTMENTS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const m = localStorage.getItem("mn_medications");
        if (m) this.medications = JSON.parse(m);

        const rx = localStorage.getItem("mn_digital_prescriptions");
        if (rx) this.digitalPrescriptions = JSON.parse(rx);

        const code = localStorage.getItem("mn_patient_code");
        if (code) this.accessCode = JSON.parse(code);

        const q = localStorage.getItem("mn_queue_slots");
        if (q) this.queueSlots = JSON.parse(q);

        const w = localStorage.getItem("mn_waiting_patients");
        if (w) this.waitingPatients = JSON.parse(w);

        const hp = localStorage.getItem("mn_health_profile");
        if (hp) this.healthProfile = JSON.parse(hp);

        const fam = localStorage.getItem("mn_family_members");
        if (fam) this.familyMembers = JSON.parse(fam);

        const act = localStorage.getItem("mn_active_member_id");
        if (act) this.activeMemberId = JSON.parse(act);

        const bkt = localStorage.getItem("mn_booked_appointments");
        if (bkt) this.bookedAppointments = JSON.parse(bkt);
      } catch {}
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("mn_medications", JSON.stringify(this.medications));
        localStorage.setItem("mn_digital_prescriptions", JSON.stringify(this.digitalPrescriptions));
        localStorage.setItem("mn_patient_code", JSON.stringify(this.accessCode));
        localStorage.setItem("mn_queue_slots", JSON.stringify(this.queueSlots));
        localStorage.setItem("mn_waiting_patients", JSON.stringify(this.waitingPatients));
        localStorage.setItem("mn_health_profile", JSON.stringify(this.healthProfile));
        localStorage.setItem("mn_family_members", JSON.stringify(this.familyMembers));
        localStorage.setItem("mn_active_member_id", JSON.stringify(this.activeMemberId));
        localStorage.setItem("mn_booked_appointments", JSON.stringify(this.bookedAppointments));
      } catch {}
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  // --- Dynamic Patient Access Code ---
  public getAccessCode(): DynamicPatientAccessCode {
    return { ...this.accessCode };
  }

  public generateNewAccessCode(): string {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.accessCode = {
      patientId: "RAMESH-54",
      code: randomCode,
      generatedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      isActive: true,
    };
    this.persist();

    // Trigger backend sync asynchronously if available
    try {
      fetch(`${BACKEND_URL}/api/patient/generate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: "RAMESH-54" }),
      }).catch(() => {});
    } catch {}

    return randomCode;
  }

  public verifyPatientAccess(
    patientId: string,
    enteredCode: string
  ): {
    success: boolean;
    error?: string;
    patient?: AIHealthReport;
    profile?: PatientHealthProfile;
    medications?: ActiveMedication[];
    prescriptions?: DigitalPrescription[];
    organConditions?: OrganConditionRecord[];
    familyMember?: FamilyMemberProfile;
  } {
    const pId = patientId.trim().toUpperCase();
    const code = enteredCode.trim();

    // Check if matching a family member profile
    const famMember = this.familyMembers.find(
      (m) =>
        m.id.toUpperCase() === pId ||
        m.name.toUpperCase().includes(pId) ||
        (m.abhaId && m.abhaId.toUpperCase() === pId) ||
        pId.includes("FAM")
    );

    if (famMember) {
      const activeCode = famMember.accessCode || this.accessCode;
      if (code !== activeCode.code && code !== this.accessCode.code) {
        return {
          success: false,
          error: "INVALID CONSENT CODE: The code entered does not match this family member's active one-time access token.",
        };
      }
      return {
        success: true,
        patient: {
          ...this.aiReport,
          patientId: famMember.id,
          patientName: famMember.name,
          age: famMember.age,
          gender: famMember.gender,
        },
        profile: {
          patientId: famMember.id,
          patientName: famMember.name,
          age: famMember.age,
          gender: famMember.gender,
          bloodGroup: famMember.bloodGroup,
          simpleSummary: `Active ${famMember.relationship} profile under family phone ${famMember.phone}.`,
          allergies: [...famMember.allergies],
          genetics: [],
          vaccinations: [],
          currentMedicines: [...famMember.currentMedicines],
          labFiles: [...famMember.labFiles],
        },
        medications: [...this.medications],
        prescriptions:
          famMember.prescriptions && famMember.prescriptions.length > 0
            ? famMember.prescriptions
            : this.getDigitalPrescriptions(famMember.id),
        organConditions: [...(famMember.organConditions || [])],
        familyMember: famMember,
      };
    }

    if (pId !== "RAMESH-54" && pId !== "91-8273-1928-3920" && !pId.includes("RAMESH")) {
      return {
        success: false,
        error: "Patient ID not found in regional registry.",
      };
    }

    if (code !== this.accessCode.code) {
      return {
        success: false,
        error: "INVALID CONSENT CODE: The code entered does not match the patient's active one-time access token.",
      };
    }

    if (Date.now() > this.accessCode.expiresAt) {
      return {
        success: false,
        error: "EXPIRED CODE: This patient consent code has expired. Ask the patient to generate a new visit code from their portal.",
      };
    }

    // Try background notify to backend
    try {
      fetch(`${BACKEND_URL}/api/patient/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: pId, code }),
      }).catch(() => {});
    } catch {}

    return {
      success: true,
      patient: { ...this.aiReport },
      profile: this.getHealthProfile(),
      medications: [...this.medications],
      prescriptions: this.getDigitalPrescriptions(pId),
      organConditions: this.familyMembers[0]?.organConditions || [],
      familyMember: this.familyMembers[0],
    };
  }

  // --- Health Profile & Lab Files (User Editable, Minimal, Zero Jargon) ---
  public getHealthProfile(): PatientHealthProfile {
    return JSON.parse(JSON.stringify(this.healthProfile));
  }

  public updateHealthProfile(updates: Partial<PatientHealthProfile>): PatientHealthProfile {
    this.healthProfile = {
      ...this.healthProfile,
      ...updates,
    };
    this.persist();
    return this.getHealthProfile();
  }

  public updateAllergy(index: number, newAllergyText: string) {
    if (!newAllergyText.trim()) return;
    this.healthProfile.allergies[index] = newAllergyText.trim();
    this.persist();
  }

  public addPatientAllergy(allergy: string) {
    if (!allergy.trim()) return;
    this.healthProfile.allergies.push(allergy.trim());
    this.persist();
  }

  public removePatientAllergy(index: number) {
    this.healthProfile.allergies.splice(index, 1);
    this.persist();
  }

  public updateGenetics(index: number, newText: string) {
    if (!newText.trim()) return;
    this.healthProfile.genetics[index] = newText.trim();
    this.persist();
  }

  public addPatientGenetics(item: string) {
    if (!item.trim()) return;
    this.healthProfile.genetics.push(item.trim());
    this.persist();
  }

  public removePatientGenetics(index: number) {
    this.healthProfile.genetics.splice(index, 1);
    this.persist();
  }

  public addPatientMedicine(med: { name: string; dose: string; frequency: string; instructions: string }) {
    if (!med.name.trim()) return;
    this.healthProfile.currentMedicines.push({
      id: `med-${Date.now()}`,
      name: med.name.trim(),
      dose: med.dose.trim(),
      frequency: med.frequency.trim(),
      instructions: med.instructions.trim(),
    });
    this.persist();
  }

  public updatePatientMedicine(id: string, updates: Partial<{ name: string; dose: string; frequency: string; instructions: string }>) {
    this.healthProfile.currentMedicines = this.healthProfile.currentMedicines.map((m) => {
      if (m.id === id) {
        return { ...m, ...updates };
      }
      return m;
    });
    this.persist();
  }

  public removePatientMedicine(id: string) {
    this.healthProfile.currentMedicines = this.healthProfile.currentMedicines.filter((m) => m.id !== id);
    this.persist();
  }

  public updateVaccine(index: number, updates: Partial<{ name: string; status: string; date: string }>) {
    if (this.healthProfile.vaccinations[index]) {
      this.healthProfile.vaccinations[index] = {
        ...this.healthProfile.vaccinations[index],
        ...updates,
      };
      this.persist();
    }
  }

  public addPatientVaccine(vaccine: { name: string; status: string; date: string }) {
    if (!vaccine.name.trim()) return;
    this.healthProfile.vaccinations.push({
      name: vaccine.name.trim(),
      status: vaccine.status.trim() || "Completed",
      date: vaccine.date.trim() || "Recent",
    });
    this.persist();
  }

  public removePatientVaccine(index: number) {
    this.healthProfile.vaccinations.splice(index, 1);
    this.persist();
  }

  public uploadLabFile(file: Omit<PatientLabFile, "id">): PatientLabFile {
    const newFile: PatientLabFile = {
      ...file,
      id: `file-${Date.now()}`,
    };
    this.healthProfile.labFiles.unshift(newFile);
    this.persist();
    return newFile;
  }

  public updateLabFile(id: string, updates: Partial<PatientLabFile>): boolean {
    const idx = this.healthProfile.labFiles.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.healthProfile.labFiles[idx] = {
      ...this.healthProfile.labFiles[idx],
      ...updates,
    };
    this.persist();
    return true;
  }

  public deleteLabFile(id: string): boolean {
    this.healthProfile.labFiles = this.healthProfile.labFiles.filter((f) => f.id !== id);
    this.persist();
    return true;
  }

  // --- Medications ---
  public getMedications(): ActiveMedication[] {
    return [...this.medications];
  }

  public toggleMedicationTaken(id: string) {
    this.medications = this.medications.map((m) => {
      if (m.id === id) {
        return { ...m, takenToday: !m.takenToday };
      }
      return m;
    });
    this.persist();
  }

  public getAIReport(): AIHealthReport {
    return { ...this.aiReport };
  }

  // --- IIIT Delhi Hospital Smart Queue & Waiting Room Engine ---
  public getHospitalQueue(_hospitalId?: string): HospitalQueueSlot[] {
    return [...this.queueSlots];
  }

  public getWaitingPatients(): WaitingEarlyArrivalPatient[] {
    return [...this.waitingPatients];
  }

  public cancelSlot(slotId: string): boolean {
    const slotIndex = this.queueSlots.findIndex((s) => s.id === slotId);
    if (slotIndex === -1) return false;

    const cancelledPatient = this.queueSlots[slotIndex].patientName;
    this.queueSlots[slotIndex] = {
      ...this.queueSlots[slotIndex],
      status: "Empty (Cancelled)",
      notes: `Slot cancelled by ${cancelledPatient}. Flagged as FREE for waiting patients.`,
    };
    this.persist();

    // Notify backend
    try {
      fetch(`${BACKEND_URL}/api/hospital/HOSP-IIITD/queue/${slotId}/cancel`, {
        method: "POST",
      }).catch(() => {});
    } catch {}

    return true;
  }

  public reallocateSlotWithWaitingPatient(slotId: string, waitingPatientId: string): boolean {
    const slotIndex = this.queueSlots.findIndex((s) => s.id === slotId);
    const waitingIndex = this.waitingPatients.findIndex((w) => w.id === waitingPatientId);

    if (slotIndex === -1 || waitingIndex === -1) return false;

    const waitingPatient = this.waitingPatients[waitingIndex];

    this.queueSlots[slotIndex] = {
      ...this.queueSlots[slotIndex],
      patientId: `PAT-${waitingPatient.id}`,
      patientName: waitingPatient.name,
      age: waitingPatient.age,
      gender: waitingPatient.gender,
      severity: "Urgent",
      status: "Reallocated (Early Arrival)",
      notes: `Early-arrival patient moved from OPD Lounge to save doctor and patient time. (${waitingPatient.reason})`,
    };

    // Remove from waiting room
    this.waitingPatients.splice(waitingIndex, 1);
    this.persist();

    // Sync with backend
    try {
      fetch(`${BACKEND_URL}/api/hospital/HOSP-IIITD/queue/${slotId}/reallocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: slotId,
          patient_name: waitingPatient.name,
          age: waitingPatient.age,
          gender: waitingPatient.gender,
          reason: waitingPatient.reason,
        }),
      }).catch(() => {});
    } catch {}

    return true;
  }

  public addWaitingPatient(patient: Omit<WaitingEarlyArrivalPatient, "id">): WaitingEarlyArrivalPatient {
    const newWaiting: WaitingEarlyArrivalPatient = {
      ...patient,
      id: `WAIT-${Date.now().toString().slice(-4)}`,
    };
    this.waitingPatients.push(newWaiting);
    this.persist();
    return newWaiting;
  }

  public removeWaitingPatient(id: string): boolean {
    this.waitingPatients = this.waitingPatients.filter((w) => w.id !== id);
    this.persist();
    return true;
  }

  public updateQueueSlot(slotId: string, updates: Partial<HospitalQueueSlot>): boolean {
    const idx = this.queueSlots.findIndex((s) => s.id === slotId);
    if (idx === -1) return false;
    this.queueSlots[idx] = {
      ...this.queueSlots[idx],
      ...updates,
    };
    this.persist();
    return true;
  }

  public addQueueSlot(slot: Omit<HospitalQueueSlot, "id">): HospitalQueueSlot {
    const newSlot: HospitalQueueSlot = {
      ...slot,
      id: `Q-IIITD-${Date.now().toString().slice(-4)}`,
    };
    this.queueSlots.push(newSlot);
    this.persist();
    return newSlot;
  }

  // Backwards compatibility alias
  public simulateCancelAndAutoReallocate(_hospitalId: string, slotId: string) {
    if (this.waitingPatients.length > 0) {
      const waiting = this.waitingPatients[0];
      const ok = this.reallocateSlotWithWaitingPatient(slotId, waiting.id);
      if (ok) {
        return {
          vacatedSlot: slotId,
          reallocatedTo: waiting.name,
          timeSavedMinutes: 45,
        };
      }
    } else {
      this.cancelSlot(slotId);
      return {
        vacatedSlot: slotId,
        reallocatedTo: "Slot Marked Free",
        timeSavedMinutes: 0,
      };
    }
    return null;
  }

  // --- Hospital Patients & Doctors (IIIT Delhi Hospital) ---
  public getHospitalPatients(_hospitalId?: string): HospitalPatient[] {
    return [...this.hospitalPatients];
  }

  public updateHospitalPatientStatus(patientId: string, status: HospitalPatient["status"]): boolean {
    const idx = this.hospitalPatients.findIndex((p) => p.id === patientId);
    if (idx === -1) return false;
    this.hospitalPatients[idx].status = status;
    this.persist();
    return true;
  }

  public getHospitalDoctors(_hospitalId?: string): DoctorProfile[] {
    return [...this.doctors];
  }

  public addPrescription(rx: PrescriptionInput): { success: boolean; error?: string; prescription?: any } {
    const saltLower = (rx.genericSalt + " " + rx.medicineName).toLowerCase();

    // Check contraindications against patient's allergies
    const allergens = this.healthProfile.allergies.map((a) => a.toLowerCase());
    const isContraindicated = allergens.some((allergy) => {
      if (
        allergy.includes("penicillin") &&
        (saltLower.includes("penicillin") || saltLower.includes("amoxicillin") || saltLower.includes("ampicillin"))
      ) {
        return true;
      }
      if (
        (allergy.includes("ibuprofen") || allergy.includes("nsaid")) &&
        (saltLower.includes("ibuprofen") ||
          saltLower.includes("combiflam") ||
          saltLower.includes("diclofenac") ||
          saltLower.includes("naproxen"))
      ) {
        return true;
      }
      return false;
    });

    if (isContraindicated) {
      return {
        success: false,
        error: `BLOCKED BY MEDNEXUS SAFETY SYSTEM: Severe contraindication detected for ${rx.medicineName} against documented patient allergies.`,
      };
    }

    // Add to healthProfile.currentMedicines
    const newMed = {
      id: `med-${Date.now()}`,
      name: rx.medicineName,
      dose: rx.dosage,
      frequency: rx.frequency,
      instructions: rx.instructions,
    };
    this.healthProfile.currentMedicines.push(newMed);
    this.persist();

    return { success: true, prescription: newMed };
  }

  // --- Digital Prescriptions (Clinician Issued via 6-Digit Code) ---
  public getDigitalPrescriptions(patientId?: string): DigitalPrescription[] {
    if (!patientId || patientId === "ALL") {
      return [...this.digitalPrescriptions];
    }
    const pId = patientId.trim().toUpperCase();
    return this.digitalPrescriptions.filter(
      (p) => p.patientId.toUpperCase() === pId || pId.includes(p.patientId.toUpperCase()) || p.patientId === "RAMESH-54"
    );
  }

  public addDigitalPrescription(data: {
    patientId: string;
    medicationName: string;
    dosage: string;
    prescribedBy: string;
  }): { success: boolean; prescription?: DigitalPrescription; error?: string } {
    if (!data.medicationName || !data.medicationName.trim()) {
      return { success: false, error: "Medication or injection name is required." };
    }
    if (!data.dosage || !data.dosage.trim()) {
      return { success: false, error: "Dosage is required." };
    }

    // Safety Allergy Check against patient's allergies
    const medLower = data.medicationName.toLowerCase();
    const allergens = this.healthProfile.allergies.map((a) => a.toLowerCase());
    const isContraindicated = allergens.some((allergy) => {
      if (
        allergy.includes("penicillin") &&
        (medLower.includes("penicillin") || medLower.includes("amoxicillin") || medLower.includes("ampicillin") || medLower.includes("augmentin"))
      ) {
        return true;
      }
      if (
        (allergy.includes("ibuprofen") || allergy.includes("nsaid")) &&
        (medLower.includes("ibuprofen") ||
          medLower.includes("brufen") ||
          medLower.includes("combiflam") ||
          medLower.includes("diclofenac") ||
          medLower.includes("naproxen"))
      ) {
        return true;
      }
      return false;
    });

    if (isContraindicated) {
      return {
        success: false,
        error: `SAFETY ALERT: ${data.medicationName} is contraindicated against the patient's documented allergies. Prescription blocked by clinical safety engine.`,
      };
    }

    const newRx: DigitalPrescription = {
      id: `rx-${Date.now()}`,
      patientId: data.patientId || "RAMESH-54",
      medicationName: data.medicationName.trim(),
      dosage: data.dosage.trim(),
      instructions: "As directed by attending physician",
      prescribedBy: data.prescribedBy || "Dr. Rajesh Sharma",
      prescribedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      prescribedTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "Active",
      version: 1,
      auditHistory: [],
    };

    this.digitalPrescriptions.unshift(newRx);

    // Sync into currentMedicines in patient's profile
    this.healthProfile.currentMedicines.unshift({
      id: newRx.id,
      name: newRx.medicationName,
      dose: newRx.dosage,
      frequency: "As prescribed",
      instructions: `Prescribed by ${newRx.prescribedBy}`,
    });

    this.persist();
    return { success: true, prescription: newRx };
  }

  public updateDigitalPrescription(
    id: string,
    updates: {
      medicationName: string;
      dosage: string;
      instructions?: string;
      reasonForChange: string;
      editedBy: string;
    }
  ): { success: boolean; prescription?: DigitalPrescription; error?: string } {
    const rxIndex = this.digitalPrescriptions.findIndex((p) => p.id === id);
    if (rxIndex === -1) {
      return { success: false, error: "Prescription record not found." };
    }

    const currentRx = this.digitalPrescriptions[rxIndex];

    if (!updates.medicationName || !updates.medicationName.trim()) {
      return { success: false, error: "Medication or injection name is required." };
    }
    if (!updates.dosage || !updates.dosage.trim()) {
      return { success: false, error: "Dosage is required." };
    }

    // Safety Allergy Check against patient's allergies
    const medLower = updates.medicationName.toLowerCase();
    const allergens = this.healthProfile.allergies.map((a) => a.toLowerCase());
    const isContraindicated = allergens.some((allergy) => {
      if (
        allergy.includes("penicillin") &&
        (medLower.includes("penicillin") || medLower.includes("amoxicillin") || medLower.includes("ampicillin") || medLower.includes("augmentin"))
      ) {
        return true;
      }
      if (
        (allergy.includes("ibuprofen") || allergy.includes("nsaid")) &&
        (medLower.includes("ibuprofen") ||
          medLower.includes("brufen") ||
          medLower.includes("combiflam") ||
          medLower.includes("diclofenac") ||
          medLower.includes("naproxen"))
      ) {
        return true;
      }
      return false;
    });

    if (isContraindicated) {
      return {
        success: false,
        error: `SAFETY ALERT: ${updates.medicationName} is contraindicated against the patient's documented allergies. Revision blocked.`,
      };
    }

    const auditEntry: PrescriptionAuditEntry = {
      id: `audit-${Date.now()}`,
      version: currentRx.version || 1,
      editedAt: `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      timestamp: `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      editedBy: updates.editedBy || "Dr. Rajesh Sharma",
      medicationName: currentRx.medicationName,
      dosage: currentRx.dosage,
      instructions: currentRx.instructions,
      previousMedicationName: currentRx.medicationName,
      previousDosage: currentRx.dosage,
      previousInstructions: currentRx.instructions,
      reasonForChange: updates.reasonForChange.trim() || "Clinician adjustment during consultation",
    };

    const updatedRx: DigitalPrescription = {
      ...currentRx,
      medicationName: updates.medicationName.trim(),
      dosage: updates.dosage.trim(),
      instructions: updates.instructions?.trim() || currentRx.instructions,
      version: (currentRx.version || 1) + 1,
      lastUpdated: auditEntry.editedAt,
      lastUpdatedBy: auditEntry.editedBy,
      auditHistory: [auditEntry, ...(currentRx.auditHistory || [])],
    };

    this.digitalPrescriptions[rxIndex] = updatedRx;

    // Sync into currentMedicines in patient's profile
    const medIdx = this.healthProfile.currentMedicines.findIndex((m) => m.id === id);
    if (medIdx !== -1) {
      this.healthProfile.currentMedicines[medIdx] = {
        ...this.healthProfile.currentMedicines[medIdx],
        name: updatedRx.medicationName,
        dose: updatedRx.dosage,
        instructions: updatedRx.instructions || `Updated by ${auditEntry.editedBy}`,
      };
    }

    this.persist();
    return { success: true, prescription: updatedRx };
  }

  public deleteDigitalPrescription(id: string): boolean {
    this.digitalPrescriptions = this.digitalPrescriptions.filter((p) => p.id !== id);
    this.healthProfile.currentMedicines = this.healthProfile.currentMedicines.filter((m) => m.id !== id);
    this.persist();
    return true;
  }

  public getAllDoctors(): DoctorProfile[] {
    return [...this.doctors];
  }

  // --- Family Member Management (Single Phone, Multi-Profile) ---
  public getFamilyMembers(): FamilyMemberProfile[] {
    return JSON.parse(JSON.stringify(this.familyMembers));
  }

  public getActiveMemberId(): string {
    return this.activeMemberId;
  }

  public setActiveMemberId(id: string): void {
    const found = this.familyMembers.find((m) => m.id === id);
    if (found) {
      this.activeMemberId = id;
      this.healthProfile.patientId = found.id;
      this.healthProfile.patientName = found.name;
      this.healthProfile.age = found.age;
      this.healthProfile.gender = found.gender;
      this.healthProfile.bloodGroup = found.bloodGroup;
      this.healthProfile.allergies = [...found.allergies];
      this.healthProfile.currentMedicines = [...found.currentMedicines];
      this.healthProfile.labFiles = [...found.labFiles];
      this.accessCode = { ...found.accessCode };
      this.persist();
    }
  }

  public getActiveFamilyMember(): FamilyMemberProfile {
    const member = this.familyMembers.find((m) => m.id === this.activeMemberId);
    return member ? JSON.parse(JSON.stringify(member)) : JSON.parse(JSON.stringify(this.familyMembers[0]));
  }

  public addFamilyMember(memberData: {
    name: string;
    relationship: FamilyMemberProfile["relationship"];
    age: number;
    gender: string;
    bloodGroup: string;
    phone?: string;
    allergies?: string[];
  }): FamilyMemberProfile {
    const newId = `FAM-${String(this.familyMembers.length + 1).padStart(2, "0")}`;
    const newMember: FamilyMemberProfile = {
      id: newId,
      relationship: memberData.relationship,
      name: memberData.name.trim(),
      age: Number(memberData.age) || 30,
      gender: memberData.gender || "Male",
      bloodGroup: memberData.bloodGroup || "O+",
      phone: memberData.phone || "+91 98765 43210",
      allergies: memberData.allergies || [],
      organConditions: [],
      currentMedicines: [],
      prescriptions: [],
      labFiles: [],
      accessCode: {
        patientId: newId,
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        generatedAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000,
        isActive: true,
      },
    };
    this.familyMembers.push(newMember);
    this.persist();
    return newMember;
  }

  // --- Organ-Based Longitudinal Medical History ---
  public addOrganCondition(
    memberId: string,
    condition: Omit<OrganConditionRecord, "id">
  ): OrganConditionRecord {
    const newRecord: OrganConditionRecord = {
      ...condition,
      id: `org-${Date.now()}`,
    };
    const member = this.familyMembers.find((m) => m.id === memberId);
    if (member) {
      if (!member.organConditions) member.organConditions = [];
      member.organConditions.unshift(newRecord);
      this.persist();
    }
    return newRecord;
  }

  public updateOrganCondition(
    memberId: string,
    conditionId: string,
    updates: Partial<OrganConditionRecord>
  ): boolean {
    const member = this.familyMembers.find((m) => m.id === memberId);
    if (!member || !member.organConditions) return false;
    const idx = member.organConditions.findIndex((c) => c.id === conditionId);
    if (idx === -1) return false;
    member.organConditions[idx] = {
      ...member.organConditions[idx],
      ...updates,
    };
    this.persist();
    return true;
  }

  public deleteOrganCondition(memberId: string, conditionId: string): boolean {
    const member = this.familyMembers.find((m) => m.id === memberId);
    if (!member || !member.organConditions) return false;
    member.organConditions = member.organConditions.filter((c) => c.id !== conditionId);
    this.persist();
    return true;
  }

  // --- Appointment Booking System (Triage & Token Number) ---
  public bookAppointment(data: {
    patientId: string;
    patientName: string;
    relationship: string;
    doctorId: string;
    doctorName: string;
    hospitalName: string;
    specialty: string;
    slotDate: string;
    slotTime: string;
    consultationFee: number;
    chiefComplaint: string;
  }): BookedAppointment {
    const tokenRandom = Math.floor(1000 + Math.random() * 9000);
    const newAppointment: BookedAppointment = {
      id: `APT-${Date.now()}`,
      tokenNumber: `OPD-TKT-${tokenRandom}`,
      ...data,
      status: "Confirmed",
      bookedAt:
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    this.bookedAppointments.unshift(newAppointment);
    this.persist();
    return newAppointment;
  }

  public getBookedAppointments(memberId?: string): BookedAppointment[] {
    if (memberId) {
      return this.bookedAppointments.filter((a) => a.patientId === memberId);
    }
    return [...this.bookedAppointments];
  }

  public cancelAppointment(appointmentId: string): boolean {
    const app = this.bookedAppointments.find((a) => a.id === appointmentId);
    if (app) {
      app.status = "Cancelled";
      this.persist();
      return true;
    }
    return false;
  }
}

export const clinicalStore = new ClinicalStore();
