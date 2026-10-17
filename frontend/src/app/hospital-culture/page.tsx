"use client";

import React, { useEffect, useState } from "react";
import { getHospitals, submitHospitalReview, moderateReview } from "../../lib/api";
import {
  Building2,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  Star,
  CheckCircle2,
  Plus,
  Loader2,
  Scale,
} from "lucide-react";

interface Hospital {
  hospital_id: string;
  name: string;
  city: string;
  state: string;
  review_count: number;
  is_unlocked: boolean;
  reviews_needed_to_unlock?: number;
  scores?: {
    workload: number;
    safety: number;
    bullying_free: number;
    pay_fairness: number;
    equipment: number;
    overall_culture: number;
  } | null;
}

export default function HospitalCulturePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Review form state
  const [department, setDepartment] = useState("Cardiology");
  const [workload, setWorkload] = useState(2);
  const [safety, setSafety] = useState(4);
  const [bullyingFree, setBullyingFree] = useState(4);
  const [payFairness, setPayFairness] = useState(4);
  const [equipment, setEquipment] = useState(5);
  const [reviewText, setReviewText] = useState(
    "Equipment is top notch with 2 cath labs. However 36-hour weekend duties for junior residents are common without resting rooms."
  );

  // Live moderation state
  const [moderating, setModerating] = useState(false);
  const [moderationResult, setModerationResult] = useState<{
    is_allowed: boolean;
    moderation_verdict: string;
    flags: string[];
    explanation: string;
  } | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchHospitalsList = async () => {
    setLoading(true);
    try {
      const res = await getHospitals();
      setHospitals(res.hospitals || []);
      if (!selectedHospital && res.hospitals && res.hospitals.length > 1) {
        setSelectedHospital(res.hospitals[1]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalsList();
  }, []);

  const handleTextChange = async (text: string) => {
    setReviewText(text);
    if (text.length > 15) {
      setModerating(true);
      try {
        const modRes = await moderateReview(text);
        setModerationResult(modRes);
      } catch (err) {
        console.error(err);
      } finally {
        setModerating(false);
      }
    } else {
      setModerationResult(null);
    }
  };

  const handleTestDefamation = () => {
    const toxicText = "Dr. Suresh Verma in Ortho is an incompetent thief who steals surgical kits.";
    handleTextChange(toxicText);
  };

  const handleResetReviewForm = () => {
    const legitText = "Equipment is top notch with 2 cath labs. However 36-hour weekend duties for junior residents are common without resting rooms.";
    handleTextChange(legitText);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;
    if (moderationResult && !moderationResult.is_allowed) return;

    setSubmittingReview(true);
    try {
      const res = await submitHospitalReview(selectedHospital.hospital_id, {
        department,
        workload_rating: workload,
        safety_rating: safety,
        bullying_free_rating: bullyingFree,
        pay_fairness_rating: payFairness,
        equipment_rating: equipment,
        review_text: reviewText,
      });

      setSuccessBanner(
        `Review recorded anonymously! ${
          res.is_now_unlocked
            ? `The hospital reached 5 verified reviews and the culture scores are now unlocked live!`
            : `Total reviews: ${res.total_hospital_reviews}/5 needed.`
        }`
      );

      await fetchHospitalsList();
      setSelectedHospital((prev: any) =>
        prev
          ? {
              ...prev,
              review_count: res.total_hospital_reviews,
              is_unlocked: res.is_now_unlocked,
              reviews_needed_to_unlock: 0,
              scores: prev.scores || {
                workload: 2.2,
                safety: 4.1,
                bullying_free: 3.9,
                pay_fairness: 3.8,
                equipment: 4.6,
                overall_culture: 3.8,
              },
            }
          : null
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border text-[10px] font-bold uppercase tracking-wider">
                Module 5
              </span>
              <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
                Anonymous Hospital Culture Reviews
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              Honest workplace reviews for doctors. Protected by k-anonymity (k=5) so junior doctors can review shift hours, safety, and equipment without fear of retaliation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-text-main font-mono flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-brand-primary" />
              Privacy Lock: 5 Reviews Needed
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-surface border-2 border-brand-primary text-brand-primary text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Hospital Cards Grid (Unlocked vs Locked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-text-muted">
            Loading hospitals...
          </div>
        ) : (
          hospitals.map((hosp) => {
            const isSelected = selectedHospital?.hospital_id === hosp.hospital_id;
            return (
              <div
                key={hosp.hospital_id}
                onClick={() => setSelectedHospital(hosp)}
                className={`rounded-2xl border p-5 cursor-pointer transition-all space-y-4 shadow-sm ${
                  isSelected
                    ? "border-brand-primary bg-white ring-2 ring-brand-primary/20"
                    : "border-border bg-white hover:border-brand-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-text-main">
                      {hosp.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {hosp.city}, {hosp.state}
                    </p>
                  </div>

                  {hosp.is_unlocked ? (
                    <span className="px-2.5 py-1 rounded-md bg-surface text-brand-primary border border-border text-[10px] font-bold flex items-center gap-1">
                      <Unlock className="w-3 h-3 text-brand-primary" />
                      UNLOCKED ({hosp.review_count} Reviews)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-surface text-brand-warning border border-border text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-brand-warning" />
                      LOCKED ({hosp.review_count}/5 Reviews)
                    </span>
                  )}
                </div>

                {/* Score breakdown or Locked placeholder */}
                {hosp.is_unlocked && hosp.scores ? (
                  <div className="space-y-3 pt-2 border-t border-border animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Overall Workplace Score:</span>
                      <span className="font-bold text-brand-primary text-sm flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-brand-primary" />
                        {hosp.scores.overall_culture} / 5.0
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2.5 rounded-lg bg-surface border border-border">
                        <span className="text-text-muted block">Workload / Shifts</span>
                        <span className="font-bold text-brand-alert">
                          {hosp.scores.workload} / 5 (36h shifts)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface border border-border">
                        <span className="text-text-muted block">Safety & Security</span>
                        <span className="font-bold text-brand-primary">
                          {hosp.scores.safety} / 5
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface border border-border">
                        <span className="text-text-muted block">Supportive Culture</span>
                        <span className="font-bold text-brand-warning">
                          {hosp.scores.bullying_free} / 5
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface border border-border">
                        <span className="text-text-muted block">Cath Lab Equipment</span>
                        <span className="font-bold text-brand-primary">
                          {hosp.scores.equipment} / 5
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-surface border border-dashed border-border text-center space-y-2">
                    <Lock className="w-6 h-6 text-brand-warning mx-auto" />
                    <p className="text-xs font-semibold text-text-main">
                      Scores Locked for Privacy
                    </p>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Requires <strong>{hosp.reviews_needed_to_unlock || 1} more review</strong> to unlock ratings, ensuring reviewers cannot be individually identified.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Write Anonymous Review Form */}
      {selectedHospital && (
        <div className="rounded-2xl bg-white border border-border p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-primary" />
                Submit Anonymous Workplace Review:{" "}
                <span className="text-brand-primary">{selectedHospital.name}</span>
              </h2>
              <p className="text-xs text-text-muted">
                Your medical registration confirms you are a real doctor, but your identity is never attached to this review.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestDefamation}
                className="px-3 py-1.5 rounded-lg bg-surface border border-brand-alert/40 text-brand-alert text-[11px] font-semibold hover:bg-surface/80 transition-colors"
                title="Test policy against personal name attacks"
              >
                Test Personal Targeting Example
              </button>
              <button
                type="button"
                onClick={handleResetReviewForm}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-text-muted text-[11px] font-semibold hover:bg-surface/80 transition-colors"
              >
                Reset Allowed Review
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Department & Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl bg-surface/40 border border-border p-2.5 text-text-main focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Workload / Shift Hours (1=Severe, 5=Balanced): {workload}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={workload}
                  onChange={(e) => setWorkload(Number(e.target.value))}
                  className="w-full accent-brand-primary mt-2"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Bullying-Free Culture (1=Toxic, 5=Supportive): {bullyingFree}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={bullyingFree}
                  onChange={(e) => setBullyingFree(Number(e.target.value))}
                  className="w-full accent-brand-primary mt-2"
                />
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-xs text-text-main font-semibold mb-1">
                Hospital Review (Checked automatically to ensure no personal name-calling)
              </label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Share thoughts on shift hours, equipment, safety, rest rooms..."
                className="w-full rounded-xl bg-surface/40 border border-border p-3 text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary font-sans leading-relaxed"
              />
            </div>

            {/* Live Moderation Banner */}
            {moderating ? (
              <div className="p-3 rounded-lg bg-surface border border-border text-xs text-text-muted flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                <span>Checking feedback guidelines...</span>
              </div>
            ) : moderationResult ? (
              moderationResult.is_allowed ? (
                <div className="p-3.5 rounded-xl bg-surface border border-border text-brand-primary text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                  <div>
                    <span className="font-bold">Approved Institutional Feedback</span>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {moderationResult.explanation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white border-2 border-brand-alert text-brand-alert text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-brand-alert flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wide block">
                      Personal Name Targeting Blocked
                    </span>
                    <p className="mt-0.5 leading-relaxed text-text-main">
                      {moderationResult.explanation}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {moderationResult.flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-surface text-brand-alert font-mono text-[10px] border border-border"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : null}

            {/* Submit Action */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {selectedHospital.review_count === 4
                  ? "Adding this review will reach 5 reviews and unlock this hospital live."
                  : `Hospital currently has ${selectedHospital.review_count} reviews.`}
              </span>

              <button
                type="submit"
                disabled={
                  submittingReview ||
                  (moderationResult !== null && !moderationResult.is_allowed)
                }
                className="px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Anonymous Review...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Submit Review and Unlock Scorecard
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
