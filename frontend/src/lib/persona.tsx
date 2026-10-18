"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface DoctorPersona {
  doctor_id: string;
  pseudonym: string;
  badge: string;
  vote_weight: number;
  specialty: string;
  reputation_score: number;
  role: "rural_spoke" | "metro_hub";
  hospital: string;
}

export const PERSONAS: DoctorPersona[] = [
  {
    doctor_id: "doc_kosi_481",
    pseudonym: "Dr_Kosi_Care",
    badge: "Verified Spoke Physician, 4 yrs",
    vote_weight: 2,
    specialty: "General Medicine / Spoke",
    reputation_score: 95,
    role: "rural_spoke",
    hospital: "Kosi Rural Health Spoke (Bihar)",
  },
  {
    doctor_id: "doc_u8f93a12",
    pseudonym: "Dr_Pulse_9482",
    badge: "Verified Cardiologist, 8 yrs",
    vote_weight: 5,
    specialty: "Cardiology",
    reputation_score: 120,
    role: "metro_hub",
    hospital: "Apex Metro Super Specialty Hospital (Mumbai)",
  },
  {
    doctor_id: "doc_synapse_71",
    pseudonym: "Dr_Synapse_71",
    badge: "Verified Neurologist, 12 yrs",
    vote_weight: 5,
    specialty: "Neurology",
    reputation_score: 145,
    role: "metro_hub",
    hospital: "Apex Metro Super Specialty Hospital (Mumbai)",
  },
];

interface PersonaContextType {
  currentPersona: DoctorPersona;
  switchPersona: (doctorId: string) => void;
}

const PersonaContext = createContext<PersonaContextType>({
  currentPersona: PERSONAS[1], // default metro cardiologist
  switchPersona: () => {},
});

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<DoctorPersona>(PERSONAS[1]);

  useEffect(() => {
    const saved = localStorage.getItem("mednexus_active_doctor");
    if (saved) {
      const found = PERSONAS.find((p) => p.doctor_id === saved);
      if (found) setCurrentPersona(found);
    }
  }, []);

  const switchPersona = (doctorId: string) => {
    const found = PERSONAS.find((p) => p.doctor_id === doctorId);
    if (found) {
      setCurrentPersona(found);
      localStorage.setItem("mednexus_active_doctor", found.doctor_id);
    }
  };

  return (
    <PersonaContext.Provider value={{ currentPersona, switchPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
