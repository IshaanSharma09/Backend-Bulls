"use client";

import React from "react";
import { Clock, AlertCircle, Building, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";

export interface QueueSlot {
  slot_id: string;
  time: string;
  patient_masked: string;
  spoke_origin: string;
  urgency_score: number;
  status: "confirmed" | "booked" | "cancelled" | "promoted";
  fee_split: {
    patient_paid: number;
    spoke_share: number;
    hub_fee: number;
  };
}

interface UrgentQueueCardProps {
  slot: QueueSlot;
  isNewPromotion?: boolean;
}

export function UrgentQueueCard({ slot, isNewPromotion = false }: UrgentQueueCardProps) {
  const isHighUrgency = slot.urgency_score >= 90;
  const isPromoted = slot.status === "promoted" || isNewPromotion;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors shadow-sm ${
        isPromoted
          ? "bg-surface border-brand-primary"
          : isHighUrgency
          ? "bg-white border-brand-alert/60"
          : "bg-white border-border"
      }`}
    >
      {isPromoted && (
        <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-primary text-white text-[10px] font-bold tracking-wide uppercase shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-white" />
          Auto-Promoted Rural Emergency
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-brand-primary font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            {slot.time}
          </div>

          <div>
            <h4 className="text-xs font-bold text-text-main flex items-center gap-2">
              {slot.patient_masked}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
              <Building className="w-3 h-3 text-text-muted" />
              <span>{slot.spoke_origin}</span>
            </div>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 border ${
              slot.urgency_score >= 90
                ? "bg-surface border-brand-alert text-brand-alert"
                : slot.urgency_score >= 70
                ? "bg-surface border-brand-warning text-brand-warning"
                : "bg-surface border-brand-primary text-brand-primary"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Urgency Score: {slot.urgency_score}/100
          </div>
        </div>
      </div>

      {/* Financial Split Breakdown */}
      <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-text-muted gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-text-main font-medium">
            <DollarSign className="w-3 h-3 text-brand-primary" />
            Patient Fee: INR {slot.fee_split.patient_paid}
          </span>
          <span className="text-border">|</span>
          <span className="text-text-muted">
            Spoke Share: INR {slot.fee_split.spoke_share}
          </span>
          <span className="text-border">|</span>
          <span className="text-brand-primary font-medium">
            Metro Specialist Share: INR {slot.fee_split.hub_fee}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border ${
            slot.status === "confirmed"
              ? "bg-surface text-brand-primary border-brand-primary/40"
              : slot.status === "promoted"
              ? "bg-white text-brand-primary border-brand-primary font-bold"
              : "bg-white text-text-muted border-border"
          }`}
        >
          {slot.status}
        </span>
      </div>
    </div>
  );
}
