// MedNexus Clinical System: authContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "patient" | "doctor_hospital" | null;

export interface PatientUser {
  id: string;
  name: string;
  email: string;
  abhaId: string;
  age: number;
  gender: string;
  primaryClinic: string;
}

export interface DoctorHospitalUser {
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  email: string;
}

export interface AuthContextType {
  role: UserRole;
  patientUser: PatientUser | null;
  doctorHospitalUser: DoctorHospitalUser | null;
  loginAsPatient: (patientIdOrEmail: string, pass: string) => boolean;
  loginAsDoctorHospital: (hospitalCode: string, doctorEmail: string, pass: string) => boolean;
  quickLoginPatient: () => void;
  quickLoginDoctor: () => void;
  quickLoginDoctorHospital: () => void;
  logout: () => void;
}

const DEFAULT_PATIENT: PatientUser = {
  id: "RAMESH-54",
  name: "Ramesh Kumar",
  email: "ramesh@mednexus.in",
  abhaId: "91-8273-1928-3920",
  age: 54,
  gender: "Male",
  primaryClinic: "Hospital Health Centre",
};

export const HOSPITAL_DOCTOR: DoctorHospitalUser = {
  doctorId: "DOC-HOSP-01",
  doctorName: "Dr. Rajesh Sharma",
  specialty: "Chief Medical Officer & Cardiology",
  hospitalId: "HOSP-01",
  hospitalName: "Hospital",
  email: "dr.sharma@hospital.care",
};

const AuthContext = createContext<AuthContextType>({
  role: null,
  patientUser: null,
  doctorHospitalUser: null,
  loginAsPatient: () => false,
  loginAsDoctorHospital: () => false,
  quickLoginPatient: () => {},
  quickLoginDoctor: () => {},
  quickLoginDoctorHospital: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("patient");
  const [patientUser, setPatientUser] = useState<PatientUser | null>(DEFAULT_PATIENT);
  const [doctorHospitalUser, setDoctorHospitalUser] = useState<DoctorHospitalUser | null>(null);

  // Load from localStorage on mount to remember login
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("mn_saved_role") as UserRole;
      const savedPatient = localStorage.getItem("mn_saved_patient");
      const savedDocHosp = localStorage.getItem("mn_saved_doc_hosp");

      if (savedRole === "patient") {
        setRole("patient");
        setPatientUser(savedPatient ? JSON.parse(savedPatient) : DEFAULT_PATIENT);
        setDoctorHospitalUser(null);
      } else if (savedRole === "doctor_hospital") {
        setRole("doctor_hospital");
        setDoctorHospitalUser(savedDocHosp ? JSON.parse(savedDocHosp) : HOSPITAL_DOCTOR);
        setPatientUser(null);
      }
    } catch {
      // fallback to default
    }
  }, []);

  const loginAsPatient = (patientIdOrEmail: string, pass: string): boolean => {
    const p = DEFAULT_PATIENT;
    setRole("patient");
    setPatientUser(p);
    setDoctorHospitalUser(null);
    try {
      localStorage.setItem("mn_saved_role", "patient");
      localStorage.setItem("mn_saved_patient", JSON.stringify(p));
      localStorage.removeItem("mn_saved_doc_hosp");
    } catch {}
    return true;
  };

  const loginAsDoctorHospital = (
    hospitalCode: string,
    doctorEmail: string,
    pass: string
  ): boolean => {
    const d: DoctorHospitalUser = {
      ...HOSPITAL_DOCTOR,
      email: doctorEmail || HOSPITAL_DOCTOR.email,
    };
    setRole("doctor_hospital");
    setDoctorHospitalUser(d);
    setPatientUser(null);
    try {
      localStorage.setItem("mn_saved_role", "doctor_hospital");
      localStorage.setItem("mn_saved_doc_hosp", JSON.stringify(d));
      localStorage.removeItem("mn_saved_patient");
    } catch {}
    return true;
  };

  const quickLoginPatient = () => {
    loginAsPatient("RAMESH-54", "patient123");
  };

  const quickLoginDoctor = () => {
    loginAsDoctorHospital("HOSP-01", "dr.sharma@hospital.care", "doctor123");
  };

  const logout = () => {
    setRole(null);
    setPatientUser(null);
    setDoctorHospitalUser(null);
    try {
      localStorage.removeItem("mn_saved_role");
      localStorage.removeItem("mn_saved_patient");
      localStorage.removeItem("mn_saved_doc_hosp");
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        patientUser,
        doctorHospitalUser,
        loginAsPatient,
        loginAsDoctorHospital,
        quickLoginPatient,
        quickLoginDoctor,
        quickLoginDoctorHospital: quickLoginDoctor,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
