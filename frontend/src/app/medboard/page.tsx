// MedNexus Clinical System: page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCases } from "../../lib/api";
import { usePersona } from "../../lib/persona";
import {
  MessageSquare,
  Plus,
  Flame,
  Award,
  ChevronRight,
  ShieldCheck,
  Coins,
} from "lucide-react";

interface MedCase {
  case_id: string;
  title: string;
  specialty_tag: string;
  author_pseudonym: string;
  author_badge: string;
  patient_age: number;
  patient_gender: string;
  urgency_score: number;
  bounty_amount: number;
  status: string;
  consensus_score: number;
  comments_count: number;
  has_ai_pin: boolean;
  created_at: string;
}

export default function MedBoardFeedPage() {
  const { currentPersona } = usePersona();
  const [cases, setCases] = useState<MedCase[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedSort, setSelectedSort] = useState("urgent");
  const [loading, setLoading] = useState(true);

  const channels = [
    { id: "all", label: "All Specialties" },
    { id: "c/CardioEmergency", label: "Cardio Emergency" },
    { id: "c/Neurology", label: "Neurology" },
    { id: "c/Pediatrics", label: "Pediatrics" },
    { id: "c/GeneralMedicine", label: "General Medicine" },
  ];

  useEffect(() => {
    async function loadCases() {
      setLoading(true);
      try {
        const res = await getCases({
          specialty: selectedSpecialty,
          sort: selectedSort,
        });
        setCases(res.cases || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, [selectedSpecialty, selectedSort]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border text-[10px] font-bold uppercase tracking-wider">
                Module 4
              </span>
              <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
                MedBoard: Doctor Second Opinion Network
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              A private forum for doctors to discuss difficult patient cases without exposing names or personal data. Verified specialists vote to build clinical consensus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/medboard/new-case"
              className="px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post a Case for Review
            </Link>
          </div>
        </div>
      </div>

      {/* Specialty Filter Channels */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedSpecialty(ch.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSpecialty === ch.id
                  ? "bg-surface text-brand-primary border border-brand-primary/50"
                  : "bg-white text-text-muted border border-border hover:text-text-main hover:bg-surface/50"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="text-[11px] font-medium">Sort By:</span>
          <button
            onClick={() => setSelectedSort("urgent")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedSort === "urgent"
                ? "bg-surface text-brand-alert border border-border font-semibold"
                : "hover:text-text-main"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Highest Urgency
          </button>
          <button
            onClick={() => setSelectedSort("bounty")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedSort === "bounty"
                ? "bg-surface text-brand-primary border border-border font-semibold"
                : "hover:text-text-main"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Bounty Amount
          </button>
        </div>
      </div>

      {/* Cases Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Loading MedBoard cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted bg-white rounded-xl border border-border">
            No clinical cases found in this specialty.
          </div>
        ) : (
          cases.map((c) => (
            <Link
              key={c.case_id}
              href={`/medboard/${c.case_id}`}
              className="block rounded-2xl bg-white hover:border-brand-primary/60 border border-border p-5 space-y-3 transition-all hover:shadow-sm group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-primary px-2.5 py-0.5 rounded-md bg-surface border border-border font-mono">
                    {c.specialty_tag}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    Posted by{" "}
                    <span className="text-text-main font-medium">
                      {c.author_pseudonym}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      ({c.author_badge})
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Urgency Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      c.urgency_score >= 90
                        ? "bg-surface text-brand-alert border-brand-alert/40"
                        : "bg-surface text-brand-primary border-border"
                    }`}
                  >
                    Urgency: {c.urgency_score}/100
                  </span>

                  {/* Bounty Tag */}
                  <span className="px-2.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border text-[11px] font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-brand-primary" />
                    INR {c.bounty_amount} Bounty
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-sm font-bold text-text-main group-hover:text-brand-primary transition-colors">
                {c.title}
              </h2>

              {/* Details and Consensus stats */}
              <div className="flex flex-wrap items-center justify-between text-xs text-text-muted pt-2 border-t border-border gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-text-main">
                    Patient: {c.patient_age}M | Rural Clinic Referral
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1 text-text-main">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
                    {c.comments_count} Opinions
                  </span>
                  {c.has_ai_pin && (
                    <>
                      <span>|</span>
                      <span className="text-brand-primary flex items-center gap-1 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ICMR Guideline Pinned
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px]">Consensus:</span>
                  <span
                    className={`font-bold ${
                      c.consensus_score >= 80 ? "text-brand-primary" : "text-brand-warning"
                    }`}
                  >
                    {c.consensus_score}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform ml-1" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
