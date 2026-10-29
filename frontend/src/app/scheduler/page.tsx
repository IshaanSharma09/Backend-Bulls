// MedNexus Clinical System: page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getB2BQueue, simulateCancellation } from "../../lib/api";
import { UrgentQueueCard, QueueSlot } from "../../components/UrgentQueueCard";
import {
  Calendar,
  Zap,
  CheckCircle2,
  RotateCcw,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function SchedulerPage() {
  const [queue, setQueue] = useState<QueueSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [cancellationEvent, setCancellationEvent] = useState<{
    cancelled_slot: string;
    event: string;
    promoted_patient: {
      b2b_ticket_id: string;
      patient_masked: string;
      spoke_hospital: string;
      diagnosis: string;
      urgency_score: number;
      wait_time_minutes: number;
      reallocated_time_slot: string;
      time_saved_minutes: number;
    };
  } | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await getB2BQueue();
      setQueue(res.queue || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSimulateCancellation = async () => {
    setSimulating(true);
    try {
      const res = await simulateCancellation("slot_02");
      setCancellationEvent(res);
      setQueue((prev) =>
        prev.map((slot) => {
          if (slot.slot_id === "slot_02") {
            return {
              ...slot,
              patient_masked: `${res.promoted_patient.patient_masked} [AUTO-PROMOTED]`,
              spoke_origin: res.promoted_patient.spoke_hospital,
              urgency_score: res.promoted_patient.urgency_score,
              status: "promoted",
            };
          }
          return slot;
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    setCancellationEvent(null);
    fetchQueue();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-surface text-brand-primary border border-border text-[10px] font-bold uppercase tracking-wider">
                Module 3
              </span>
              <h1 className="text-xl font-bold text-text-main">
                Smart OPD Queue and Emergency Slot Reallocation
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1 max-w-2xl">
              When an appointment is cancelled at a metro hospital, the system instantly reallocates the open slot to an emergency rural patient waiting in line.
            </p>
          </div>

          {/* Action Button: Simulation Trigger */}
          <div className="flex items-center gap-2">
            {cancellationEvent ? (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-lg bg-surface hover:bg-surface/80 text-text-main text-xs font-semibold flex items-center gap-2 transition-colors border border-border"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-primary" />
                Reset Queue Demo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSimulateCancellation}
                disabled={simulating}
                className="px-5 py-2.5 rounded-lg bg-brand-alert hover:bg-brand-alert/90 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4" />
                <span>Simulate Patient Cancellation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Event Banner when Cancellation is Simulated */}
      {cancellationEvent && (
        <div className="rounded-2xl bg-white border-2 border-brand-primary p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface text-brand-primary flex items-center justify-center font-bold border border-border">
                <CheckCircle2 className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary font-mono">
                    Instant Gap Detected
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-brand-primary font-semibold border border-border">
                    Zero Idle Doctor Time
                  </span>
                </div>
                <h3 className="text-sm font-bold text-text-main">
                  Slot 2 (15:45) Re-Allocated in 420ms to Rural Emergency Patient
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-lg bg-surface border border-border text-brand-primary font-bold text-xs">
                Saved Patient: {cancellationEvent.promoted_patient.time_saved_minutes} Minutes of Waiting
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-text-muted block text-[11px]">Promoted Patient</span>
              <span className="font-bold text-text-main text-sm">
                {cancellationEvent.promoted_patient.patient_masked}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Rural Spoke Clinic</span>
              <span className="font-semibold text-brand-primary">
                {cancellationEvent.promoted_patient.spoke_hospital}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Urgent Diagnosis</span>
              <span className="font-medium text-text-main">
                {cancellationEvent.promoted_patient.diagnosis}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Urgency Score</span>
              <span className="font-bold text-brand-alert text-sm">
                {cancellationEvent.promoted_patient.urgency_score} / 100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* OPD Slots Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            Today's Tele-OPD Consultation Schedule (Apex Metro Hub)
          </h2>
          <span className="text-xs text-text-muted font-mono">
            {queue.length} Slots Scheduled
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Loading consultation queue...
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((slot) => (
              <UrgentQueueCard
                key={slot.slot_id}
                slot={slot}
                isNewPromotion={
                  cancellationEvent?.promoted_patient.reallocated_time_slot ===
                  slot.time
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
