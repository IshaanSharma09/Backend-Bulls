// MedNexus Clinical Case Details View
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getCaseDetail,
  getCaseAssistantPin,
  addCaseComment,
  claimBounty,
} from "../../../lib/api";
import { usePersona } from "../../../lib/persona";
import { ConsensusBar } from "../../../components/ConsensusBar";
import { JanAushadhiCard } from "../../../components/JanAushadhiCard";
import {
  Award,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
  Send,
  Loader2,
  ChevronLeft,
  ThumbsUp,
  Stethoscope,
} from "lucide-react";

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = (params?.case_id as string) || "case_cardio_101";
  const { currentPersona } = usePersona();

  const [caseData, setCaseData] = useState<any>(null);
  const [aiPin, setAiPin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState(
    "Concur with thrombolysis protocol. Start IV fluids cautiously due to borderline BP 90/60."
  );
  const [suggestedDx, setSuggestedDx] = useState("Acute Anterior STEMI");
  const [bountyClaimed, setBountyClaimed] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const detail = await getCaseDetail(caseId);
        setCaseData(detail);

        const pinRes = await getCaseAssistantPin({
          case_id: caseId,
          symptoms: detail.chief_complaint || "Retrosternal crushing chest pain",
          labs: detail.labs_and_ecg || "ST elevation V2-V5",
          patient_allergies: ["NSAID intolerance"],
        });
        setAiPin(pinRes.ai_pinned_summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await addCaseComment(caseId, {
        content: newCommentText,
        suggested_diagnosis: suggestedDx,
        is_second_opinion: true,
      });

      setCaseData((prev: any) => ({
        ...prev,
        consensus_percentage: res.new_consensus_percentage,
        consensus_status: res.consensus_reached ? "consensus_reached" : "in_progress",
        comments: [
          ...(prev.comments || []),
          {
            comment_id: res.comment_id,
            author_pseudonym: currentPersona.pseudonym,
            author_badge: currentPersona.badge,
            vote_weight: currentPersona.vote_weight,
            content: newCommentText,
            suggested_diagnosis: suggestedDx,
            upvotes: 1,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      setNewCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleClaimBounty = async () => {
    try {
      const res = await claimBounty(caseId);
      if (res.status === "bounty_claimed") {
        setBountyClaimed(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !caseData) {
    return (
      <div className="py-20 text-center text-xs text-text-muted space-y-3">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
        <p>Loading case and retrieving clinical guidelines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/medboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Case Forum</span>
        </Link>
      </div>

      {/* Case Header Card */}
      <div className="rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-primary px-3 py-1 rounded-md bg-surface border border-border font-mono">
              {caseData.specialty_tag}
            </span>
            <span className="text-xs text-text-muted">
              Submitted by{" "}
              <span className="text-text-main font-semibold">
                {caseData.author_pseudonym}
              </span>{" "}
              ({caseData.author_badge})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-surface text-brand-alert border border-border text-xs font-bold flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4" />
              Urgency: {caseData.urgency_score}/100
            </span>
            <span className="px-3 py-1 rounded-md bg-surface text-brand-primary border border-border text-xs font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              INR {caseData.bounty_amount} Bounty
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-text-main leading-snug">
          {caseData.title}
        </h1>

        {/* Clinical Presentation and Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-border">
          <div className="space-y-2">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Chief Complaint and History
              </span>
              <p className="text-text-main leading-relaxed">
                {caseData.chief_complaint}
              </p>
              <p className="text-text-muted text-[11px] mt-1.5">
                {caseData.history}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Recorded Vitals and Tests
              </span>
              {caseData.vitals && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white border border-border">
                    <span className="text-[10px] text-text-muted block">BP</span>
                    <span className="font-bold text-brand-alert">{caseData.vitals.bp}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-border">
                    <span className="text-[10px] text-text-muted block">Pulse</span>
                    <span className="font-bold text-text-main">{caseData.vitals.pulse}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-border">
                    <span className="text-[10px] text-text-muted block">SpO2</span>
                    <span className="font-bold text-brand-primary">{caseData.vitals.spo2}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-border">
                    <span className="text-[10px] text-text-muted block">Temp</span>
                    <span className="font-bold text-text-main">{caseData.vitals.temp}°F</span>
                  </div>
                </div>
              )}
              <p className="text-text-main font-mono text-[11px] pt-1">
                {caseData.labs_and_ecg}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consensus Bar Component */}
      <ConsensusBar
        percentage={caseData.consensus_percentage || 75}
        bountyAmount={caseData.bounty_amount || 350}
        leadingDiagnosis={caseData.leading_diagnosis}
        onClaimBounty={handleClaimBounty}
        bountyClaimed={bountyClaimed}
      />

      {/* Pinned Protocol Guidelines Box */}
      {aiPin && (
        <div className="rounded-2xl bg-white border-2 border-brand-primary p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface text-brand-primary flex items-center justify-center border border-border">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                  PINNED CLINICAL GUIDELINE BENCHMARK
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-surface text-brand-primary font-mono border border-border">
                    {aiPin.match_percentage}% Match | {aiPin.matched_benchmark}
                  </span>
                </h3>
                <p className="text-xs text-text-muted">
                  Official rural STEMI management protocol and generic medicine savings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-brand-primary font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Evidence-Based</span>
            </div>
          </div>

          {/* First-Aid Protocol Steps */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider block">
              Immediate Rural First-Aid Checklist:
            </span>
            <ul className="space-y-2 text-text-main">
              {aiPin.immediate_first_aid?.map((step: string, i: number) => {
                const isAlert = step.includes("ALERT") || step.includes("Avoid");
                return (
                  <li
                    key={i}
                    className={`p-3 rounded-xl flex items-start gap-2 border ${
                      isAlert
                        ? "bg-surface border-brand-alert/60 text-brand-alert font-medium"
                        : "bg-surface border-border text-text-main"
                    }`}
                  >
                    <span className="text-brand-primary font-bold mt-0.5">•</span>
                    <span>{step}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Jan Aushadhi Generic Savings Card */}
          <div className="pt-2">
            <JanAushadhiCard savings={aiPin.jan_aushadhi_savings} />
          </div>
        </div>
      )}

      {/* Discussion Thread */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-brand-primary" />
            Verified Specialist Opinions ({caseData.comments?.length || 0})
          </h3>
          <span className="text-xs text-text-muted">
            Specialist votes carry 5x weight to reach rapid consensus
          </span>
        </div>

        {/* Existing Comments List */}
        <div className="space-y-4">
          {caseData.comments?.map((c: any) => (
            <div
              key={c.comment_id}
              className="p-4 rounded-xl bg-surface border border-border space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-brand-primary font-bold text-xs">
                    {c.author_pseudonym[3]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-main">
                      {c.author_pseudonym}
                    </span>
                    <span className="text-[11px] text-text-muted ml-2">
                      {c.author_badge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-white text-brand-primary border border-border text-[10px] font-bold font-mono">
                    {c.vote_weight}x Weight
                  </span>
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-brand-primary" />
                    {c.upvotes || 1}
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-main leading-relaxed">
                {c.content}
              </p>

              {c.suggested_diagnosis && (
                <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-brand-primary font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Suggested Diagnosis: <strong>{c.suggested_diagnosis}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Second Opinion Submission Form */}
        <form
          onSubmit={handleAddComment}
          className="pt-4 border-t border-border space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-main flex items-center gap-2">
              <span>Post Your Second Opinion as:</span>
              <span className="text-brand-primary font-semibold">
                {currentPersona.pseudonym}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-surface text-brand-primary text-[10px] font-mono border border-border">
                {currentPersona.vote_weight}x Weight
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Enter clinical advice, medication doses, or recommended tests..."
                className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">
                  Voted Diagnosis:
                </label>
                <input
                  type="text"
                  value={suggestedDx}
                  onChange={(e) => setSuggestedDx(e.target.value)}
                  className="w-full rounded-xl bg-surface/40 border border-border p-2.5 text-xs text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="w-full py-2.5 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Recording Vote...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Cast {currentPersona.vote_weight}x Vote
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
