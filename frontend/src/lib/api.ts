// MedNexus Clinical System: api.ts
import { BACKEND_URL, AI_URL } from "./config";
import mockCasesData from "../mock/cases.json";
import mockHospitalsData from "../mock/hospitals.json";
import mockQueueData from "../mock/queue.json";

// In-memory clones for interactive mock mutations during demo
let localCases = JSON.parse(JSON.stringify(mockCasesData.cases));
let localCaseDetails = JSON.parse(JSON.stringify(mockCasesData.caseDetails));
let localHospitals = JSON.parse(JSON.stringify(mockHospitalsData.hospitals));
let localQueue = JSON.parse(JSON.stringify(mockQueueData.queue));

export interface ServiceStatus {
  backend: "connected" | "offline";
  ai: "connected" | "offline";
  isDemoMode: boolean;
}

let currentServiceStatus: ServiceStatus = {
  backend: "offline",
  ai: "offline",
  isDemoMode: true,
};

const listeners = new Set<(status: ServiceStatus) => void>();

export function subscribeServiceStatus(callback: (status: ServiceStatus) => void) {
  listeners.add(callback);
  callback(currentServiceStatus);
  return () => {
    listeners.delete(callback);
  };
}

function updateStatus(updates: Partial<ServiceStatus>) {
  currentServiceStatus = { ...currentServiceStatus, ...updates };
  currentServiceStatus.isDemoMode =
    currentServiceStatus.backend === "offline" || currentServiceStatus.ai === "offline";
  listeners.forEach((cb) => cb(currentServiceStatus));
}

// Timeout fetch wrapper (2500ms limit per plan)
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// -------------------------------------------------------------
// CORE BACKEND API CALLS (Laptop 2)
// -------------------------------------------------------------

export async function verifyNmcDoctor(data: {
  doctor_name: string;
  nmc_reg_no: string;
  state_council: string;
  year_of_reg: number;
  specialty: string;
  degree: string;
  years_experience: number;
}) {
  const url = `${BACKEND_URL}/api/auth/verify-nmc`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    const voteWeight = data.years_experience >= 8 || data.degree.toLowerCase().includes("dm") ? 5 : 2;
    const cleanPrefix = data.specialty.toLowerCase().includes("cardio")
      ? "Pulse"
      : data.specialty.toLowerCase().includes("neuro")
      ? "Synapse"
      : "Kosi";
    return {
      token: "eyJhGciOiJIUzI1NiIsInMockToken...",
      doctor_id: `doc_${Math.random().toString(36).substring(2, 9)}`,
      pseudonym: `Dr_${cleanPrefix}_${Math.floor(1000 + Math.random() * 9000)}`,
      badge: `Verified ${data.specialty}, ${data.years_experience} yrs`,
      vote_weight: voteWeight,
      specialty: data.specialty,
      reputation_score: 120,
    };
  }
}

export async function getAuthMe(token?: string) {
  const url = `${BACKEND_URL}/api/auth/me`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token || "eyJhGciOiJIUzI1NiIsIn..."}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    return {
      doctor_id: "doc_u8f93a12",
      pseudonym: "Dr_Pulse_9482",
      badge: "Verified Cardiologist, 8 yrs",
      vote_weight: 5,
      specialty: "Cardiology",
      reputation_score: 120,
    };
  }
}

export async function getCases(params?: { specialty?: string; status?: string; sort?: string }) {
  const query = new URLSearchParams();
  if (params?.specialty) query.set("specialty", params.specialty);
  if (params?.status) query.set("status", params.status);
  if (params?.sort) query.set("sort", params.sort);

  const url = `${BACKEND_URL}/api/cases${query.toString() ? `?${query.toString()}` : ""}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    let filtered = [...localCases];
    if (params?.specialty && params.specialty !== "all") {
      filtered = filtered.filter(
        (c) => c.specialty_tag.toLowerCase().includes(params.specialty!.toLowerCase())
      );
    }
    if (params?.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }
    if (params?.sort === "urgent") {
      filtered.sort((a, b) => b.urgency_score - a.urgency_score);
    } else if (params?.sort === "bounty") {
      filtered.sort((a, b) => b.bounty_amount - a.bounty_amount);
    }
    return { cases: filtered };
  }
}

export async function createCase(data: {
  title: string;
  specialty_tag: string;
  patient_demographics: { age: number; gender: string };
  chief_complaint: string;
  vitals: { bp: string; pulse: number; spo2: number; temp: number };
  history: string;
  labs_and_ecg: string;
  imaging_urls: string[];
  bounty_amount: number;
  urgency_score: number;
  second_opinion_tags: string[];
}) {
  const url = `${BACKEND_URL}/api/cases`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    const newCaseId = `case_${Date.now()}`;
    const newCaseItem = {
      case_id: newCaseId,
      title: data.title,
      specialty_tag: data.specialty_tag,
      author_pseudonym: "Dr_Kosi_Care",
      author_badge: "Verified Spoke Physician, 4 yrs",
      patient_age: data.patient_demographics.age,
      patient_gender: data.patient_demographics.gender,
      urgency_score: data.urgency_score,
      bounty_amount: data.bounty_amount,
      status: "open",
      consensus_score: 50,
      comments_count: 0,
      has_ai_pin: true,
      created_at: new Date().toISOString(),
    };
    localCases.unshift(newCaseItem);
    localCaseDetails[newCaseId] = {
      case_id: newCaseId,
      title: data.title,
      specialty_tag: data.specialty_tag,
      author_pseudonym: "Dr_Kosi_Care",
      author_badge: "Verified Spoke Physician, 4 yrs",
      patient_demographics: data.patient_demographics,
      chief_complaint: data.chief_complaint,
      vitals: data.vitals,
      history: data.history,
      labs_and_ecg: data.labs_and_ecg,
      imaging_urls: data.imaging_urls,
      bounty_amount: data.bounty_amount,
      urgency_score: data.urgency_score,
      consensus_status: "in_progress",
      consensus_percentage: 50,
      leading_diagnosis: "Preliminary Rural Spoke Assessment Pending Consensus",
      comments: [],
    };
    return {
      case_id: newCaseId,
      status: "published",
      created_at: newCaseItem.created_at,
    };
  }
}

export async function getCaseDetail(caseId: string) {
  const url = `${BACKEND_URL}/api/cases/${caseId}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    if (localCaseDetails[caseId]) {
      return localCaseDetails[caseId];
    }
    return localCaseDetails["case_cardio_101"];
  }
}

export async function addCaseComment(
  caseId: string,
  data: {
    content: string;
    suggested_diagnosis: string;
    is_second_opinion: boolean;
  }
) {
  const url = `${BACKEND_URL}/api/cases/${caseId}/comments`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    const targetCase = localCaseDetails[caseId] || localCaseDetails["case_cardio_101"];
    const newComment = {
      comment_id: `comm_${Date.now()}`,
      author_pseudonym: "Dr_Pulse_9482",
      author_badge: "Verified Cardiologist, 8 yrs",
      vote_weight: 5,
      content: data.content,
      suggested_diagnosis: data.suggested_diagnosis,
      upvotes: 1,
      created_at: new Date().toISOString(),
    };
    targetCase.comments = targetCase.comments || [];
    targetCase.comments.push(newComment);
    const newConsensus = Math.min(100, (targetCase.consensus_percentage || 75) + 10);
    targetCase.consensus_percentage = newConsensus;
    targetCase.consensus_status = newConsensus >= 80 ? "consensus_reached" : "in_progress";

    return {
      comment_id: newComment.comment_id,
      author_pseudonym: newComment.author_pseudonym,
      author_badge: newComment.author_badge,
      vote_weight: 5,
      new_consensus_percentage: newConsensus,
      consensus_reached: newConsensus >= 80,
    };
  }
}

export async function claimBounty(caseId: string) {
  const url = `${BACKEND_URL}/api/cases/${caseId}/claim-bounty`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    return {
      status: "bounty_claimed",
      amount: 350,
      credited_to_pseudonym: "Dr_Pulse_9482",
      hospital_escrow_settled: true,
    };
  }
}

export async function getHospitals() {
  const url = `${BACKEND_URL}/api/hospitals`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    return { hospitals: localHospitals };
  }
}

export async function submitHospitalReview(
  hospitalId: string,
  data: {
    department: string;
    workload_rating: number;
    safety_rating: number;
    bullying_free_rating: number;
    pay_fairness_rating: number;
    equipment_rating: number;
    review_text: string;
  }
) {
  const url = `${BACKEND_URL}/api/hospitals/${hospitalId}/reviews`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer eyJhGciOiJIUzI1NiIsIn...",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    const targetHosp = localHospitals.find((h: any) => h.hospital_id === hospitalId);
    if (targetHosp) {
      targetHosp.review_count += 1;
      if (targetHosp.review_count >= 5) {
        targetHosp.is_unlocked = true;
        targetHosp.reviews_needed_to_unlock = 0;
        targetHosp.scores = targetHosp.scores || {
          workload: (data.workload_rating + 2.5) / 2,
          safety: (data.safety_rating + 4.2) / 2,
          bullying_free: (data.bullying_free_rating + 4.0) / 2,
          pay_fairness: (data.pay_fairness_rating + 3.8) / 2,
          equipment: (data.equipment_rating + 4.4) / 2,
          overall_culture: 4.0,
        };
      } else {
        targetHosp.reviews_needed_to_unlock = 5 - targetHosp.review_count;
      }
    }
    return {
      status: "success",
      message: "Review recorded anonymously. Identity detached.",
      total_hospital_reviews: targetHosp ? targetHosp.review_count : 5,
      is_now_unlocked: targetHosp ? targetHosp.is_unlocked : true,
    };
  }
}

export async function getB2BQueue(hubHospitalId = "hosp_metro_apex") {
  const url = `${BACKEND_URL}/api/b2b/queue?hub_hospital_id=${encodeURIComponent(hubHospitalId)}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    return { queue: localQueue };
  }
}

export async function simulateCancellation(slotId: string) {
  const url = `${BACKEND_URL}/api/b2b/simulate-cancellation`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot_id: slotId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ backend: "connected" });
    return json;
  } catch (err) {
    updateStatus({ backend: "offline" });
    // Update local queue slot
    const slot = localQueue.find((s: any) => s.slot_id === slotId);
    if (slot) {
      slot.patient_masked = "M**** S**** (45M) [URGENT AUTO-PROMOTED]";
      slot.spoke_origin = "Araria Spoke Clinic";
      slot.urgency_score = 96;
      slot.status = "promoted";
    }
    return mockQueueData.simulatedCancellation;
  }
}

// -------------------------------------------------------------
// AI ENGINE SERVICES (Laptop 3)
// -------------------------------------------------------------

export async function sanitizeText(rawText: string) {
  const url = `${AI_URL}/ai/sanitize/text`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text: rawText }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ ai: "connected" });
    return json;
  } catch (err) {
    updateStatus({ ai: "offline" });
    // Deterministic regex-based fallback matching the contract
    let sanitized = rawText;
    const redactions: Array<{ type: string; original: string; replacement: string }> = [];

    // Aadhaar / ID pattern
    const aadhaarMatch = rawText.match(/\d{4}-\d{4}-\d{4}/);
    if (aadhaarMatch) {
      redactions.push({ type: "GOVT_ID", original: aadhaarMatch[0], replacement: "[REDACTED_AADHAAR]" });
      sanitized = sanitized.replace(aadhaarMatch[0], "[REDACTED_AADHAAR]");
    }

    // Doctor name pattern
    const docMatch = rawText.match(/Dr\.?\s+[A-Z][a-zA-Z\.]*(?:\s+[A-Z][a-zA-Z]*)*/);
    if (docMatch) {
      redactions.push({ type: "DOCTOR_NAME", original: docMatch[0], replacement: "[ATTENDING_PHYSICIAN]" });
      sanitized = sanitized.replace(docMatch[0], "[ATTENDING_PHYSICIAN]");
    }

    // Hospital / Clinic pattern
    const hospMatch = rawText.match(/([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:Hospital|Clinic|Mission|Center|Care))/);
    if (hospMatch) {
      redactions.push({ type: "HOSPITAL_NAME", original: hospMatch[0], replacement: "[SPOKE_FACILITY_A]" });
      sanitized = sanitized.replace(hospMatch[0], "[SPOKE_FACILITY_A]");
    }

    // Patient Name pattern
    const patMatch = rawText.match(/(?:Patient|pt)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i);
    if (patMatch && patMatch[1]) {
      redactions.push({ type: "PATIENT_NAME", original: patMatch[1], replacement: "[PATIENT_MALE_34]" });
      sanitized = sanitized.replace(patMatch[1], "[PATIENT_MALE_34]");
    }

    return {
      sanitized_text: sanitized,
      redactions:
        redactions.length > 0
          ? redactions
          : [
              { type: "PATIENT_NAME", original: "Ramesh Kumar", replacement: "[PATIENT_MALE_34]" },
              { type: "HOSPITAL_NAME", original: "Kosi Mission Hospital", replacement: "[SPOKE_FACILITY_A]" },
              { type: "DOCTOR_NAME", original: "Dr. V.P. Roy", replacement: "[ATTENDING_PHYSICIAN]" },
              { type: "GOVT_ID", original: "3829-1928-1920", replacement: "[REDACTED_AADHAAR]" },
            ],
      phi_risk_score: 0.0,
      is_safe_to_publish: true,
    };
  }
}

export async function moderateReview(reviewText: string) {
  const url = `${AI_URL}/ai/moderate/review`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_text: reviewText }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ ai: "connected" });
    return json;
  } catch (err) {
    updateStatus({ ai: "offline" });
    const hasDoctorName = /dr\.?\s+[a-z]+/i.test(reviewText);
    const hasDefamatoryWord = /(thief|steals|incompetent|fraud|cheat|scammer|criminal)/i.test(reviewText);

    if (hasDoctorName && hasDefamatoryWord) {
      return {
        is_allowed: false,
        moderation_verdict: "REJECTED_DEFAMATION",
        flags: ["PERSONAL_NAME_TARGETING", "UNSUBSTANTIATED_CRIMINAL_ACCUSATION"],
        explanation:
          "Reviews must focus on departmental culture, hours, safety, and equipment. Personal targeting of named individuals is blocked.",
        cleaned_suggestion: null,
      };
    }
    return {
      is_allowed: true,
      moderation_verdict: "APPROVED_INSTITUTIONAL_FEEDBACK",
      flags: [],
      explanation: "Review focuses strictly on operational and clinical workplace environment.",
      cleaned_suggestion: null,
    };
  }
}

export async function searchCases(query: string, specialty = "Cardiology", topK = 3) {
  const url = `${AI_URL}/ai/search/cases`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, specialty, top_k: topK }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ ai: "connected" });
    return json;
  } catch (err) {
    updateStatus({ ai: "offline" });
    return {
      query,
      matches: [
        {
          match_id: "hist_case_09",
          title: "Anterior Wall MI in Young Agricultural Worker Post-Organophosphate Exposure",
          similarity_score: 0.91,
          outcome:
            "Successful pharmacoinvasive strategy with Tenecteplase followed by delayed PCI at 18 hours. Complete recovery.",
          protocol_reference: "ICMR Guidelines on Acute Coronary Syndromes in Rural Settings",
        },
        {
          match_id: "hist_case_44",
          title: "Hyperacute STEMI mimicking Myocarditis in 30yo",
          similarity_score: 0.84,
          outcome: "Primary angioplasty with drug-eluting stent to LAD.",
          protocol_reference: "Cardiological Society of India (CSI) STEMI Protocol",
        },
      ],
    };
  }
}

export async function getCaseAssistantPin(data: {
  case_id: string;
  symptoms: string;
  labs: string;
  patient_allergies: string[];
}) {
  const url = `${AI_URL}/ai/case/assistant-pin`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ ai: "connected" });
    return json;
  } catch (err) {
    updateStatus({ ai: "offline" });
    return {
      ai_pinned_summary: {
        match_percentage: 91,
        matched_benchmark: "ICMR Rural STEMI Protocol #4",
        immediate_first_aid: [
          "Maintain semi-recumbent posture with supplemental oxygen to keep SpO2 > 90%",
          "Dual Antiplatelet Therapy (DAPT) loading: Aspirin 300mg chewable + Clopidogrel 300mg",
          "Stat high-intensity Statin (Atorvastatin 80mg)",
          "Avoid Nitrates due to borderline SBP (90 mmHg)",
          "ALERT: Patient has NSAID intolerance: avoid Diclofenac/Ibuprofen for pain relief; use Morphine 2-4mg IV cautiously",
        ],
        jan_aushadhi_savings: [
          {
            branded_drug: "Brilinta (Ticagrelor 90mg)",
            branded_mrp_inr: 48.5,
            jan_aushadhi_generic: "Generic Ticagrelor 90mg (PMBI)",
            jan_aushadhi_inr: 9.2,
            cost_reduction: "81% OFF",
          },
          {
            branded_drug: "Lipitor (Atorvastatin 40mg)",
            branded_mrp_inr: 28.0,
            jan_aushadhi_generic: "Generic Atorvastatin 40mg (PMBI)",
            jan_aushadhi_inr: 4.5,
            cost_reduction: "84% OFF",
          },
        ],
      },
    };
  }
}

export async function generateSoapNote(data: {
  raw_doctor_notes: string;
  patient_timeline: string[];
}) {
  const url = `${AI_URL}/ai/scribe/soap`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    updateStatus({ ai: "connected" });
    return json;
  } catch (err) {
    updateStatus({ ai: "offline" });
    return {
      soap_note: {
        subjective:
          "34-year-old male presents with acute severe retrosternal crushing chest pain ('elephant sitting on chest') of 2 hours duration, associated with diaphoresis and dyspnea. Known history of severe NSAID intolerance (bronchospasm).",
        objective:
          "Vitals: BP 90/60 mmHg (borderline hypotensive), Pulse 118 bpm (sinus tachycardia), SpO2 91% on room air. Labs/ECG: 3mm ST-segment elevation in precordial leads V2-V5; Troponin T rapid test positive.",
        assessment:
          "Acute Extensive Anterior Wall ST-Elevation Myocardial Infarction (STEMI) complicated by impending cardiogenic shock. High mortality risk without emergent reperfusion.",
        plan: "1. Immediate DAPT (Aspirin 300mg + Clopidogrel 300mg chewable). 2. Atorvastatin 80mg. 3. Supplemental O2. 4. Strict contraindication: NO NSAIDs. 5. If PCI transfer >120 min, proceed with weight-adjusted Tenecteplase thrombolysis under continuous cardiac monitoring.",
      },
      urgency_score: 94,
      urgency_tier: "CRITICAL_EMERGENCY",
      contraindication_flag:
        "CRITICAL WARNING: NSAIDs contraindicated due to prior documented anaphylactoid bronchospasm.",
    };
  }
}

// Background ping to check connectivity
export async function testConnectionHealth() {
  try {
    const resB = await fetchWithTimeout(`${BACKEND_URL}/api/cases`, {}, 1500);
    updateStatus({ backend: resB.ok ? "connected" : "offline" });
  } catch {
    updateStatus({ backend: "offline" });
  }

  try {
    const resA = await fetchWithTimeout(`${AI_URL}/ai/sanitize/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text: "ping" }),
    }, 1500);
    updateStatus({ ai: resA.ok ? "connected" : "offline" });
  } catch {
    updateStatus({ ai: "offline" });
  }
}
