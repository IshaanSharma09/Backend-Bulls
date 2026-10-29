// MedNexus Clinical System: ConsensusBar.tsx
"use client";

import React from "react";
import { CheckCircle2, ShieldAlert, Award, ArrowUpRight } from "lucide-react";

interface ConsensusBarProps {
  percentage: number;
  bountyAmount?: number;
  leadingDiagnosis?: string;
  onClaimBounty?: () => void;
  bountyClaimed?: boolean;
}

export function ConsensusBar({
  percentage,
  bountyAmount = 350,
  leadingDiagnosis = "Acute Anterior STEMI with Cardiogenic Shock Risk",
  onClaimBounty,
  bountyClaimed = false,
}: ConsensusBarProps) {
  const isReached = percentage >= 80;

  return (
    <div className="rounded-xl bg-white border border-border p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isReached ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface text-brand-primary text-xs font-semibold border border-border">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
              Consensus Finalized ({percentage}%)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface text-brand-warning text-xs font-semibold border border-border">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-warning" />
              Consensus In Progress ({percentage}% of 80% target)
            </div>
          )}
          <span className="text-xs text-text-muted hidden sm:inline">
            Credential-Weighted Voting
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Escrow Bounty:</span>
          <span className="text-xs font-bold text-brand-primary bg-surface px-2.5 py-1 rounded-md border border-border">
            INR {bountyAmount}
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="relative w-full h-3 bg-surface rounded-md overflow-hidden mb-2 border border-border">
        {/* 80% Threshold Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-text-muted/40 z-10"
          style={{ left: "80%" }}
          title="80% Settlement Threshold"
        />
        {/* Filled Bar */}
        <div
          className={`h-full transition-all duration-500 ease-out rounded-sm ${
            isReached ? "bg-brand-primary" : "bg-brand-accent"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
        <span>0%</span>
        <span className="text-text-main font-medium">80% Required to Unlock Escrow</span>
        <span>100%</span>
      </div>

      {/* Leading diagnosis banner */}
      <div className="p-3 rounded-lg bg-surface border border-border flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
            Leading Clinical Diagnosis
          </span>
          <span className="text-xs font-semibold text-text-main">{leadingDiagnosis}</span>
        </div>

        {isReached && (
          <div className="flex items-center gap-2">
            {bountyClaimed ? (
              <span className="px-3 py-1.5 rounded-lg bg-white border border-border text-brand-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Award className="w-3.5 h-3.5 text-brand-primary" />
                INR {bountyAmount} Bounty Credited to Dr_Pulse_9482
              </span>
            ) : (
              <button
                type="button"
                onClick={onClaimBounty}
                className="px-3.5 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                Claim INR {bountyAmount} Bounty Escrow
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
