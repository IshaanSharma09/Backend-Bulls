// MedNexus Clinical System: PhiRedactionViewer.tsx
"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, EyeOff, Lock, Check } from "lucide-react";

export interface RedactionItem {
  type: string;
  original: string;
  replacement: string;
}

interface PhiRedactionViewerProps {
  originalText: string;
  sanitizedText: string;
  redactions: RedactionItem[];
  phiRiskScore?: number;
  isSafeToPublish?: boolean;
}

export function PhiRedactionViewer({
  originalText,
  sanitizedText,
  redactions,
  phiRiskScore = 0.0,
  isSafeToPublish = true,
}: PhiRedactionViewerProps) {
  const renderHighlightedOriginal = () => {
    let text = originalText;
    if (!redactions || redactions.length === 0) return <span>{text}</span>;

    const regex = new RegExp(
      `(${redactions.map((r) => r.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "g"
    );

    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => {
          const match = redactions.find((r) => r.original === part);
          if (match) {
            return (
              <span
                key={i}
                className="bg-brand-alert/15 text-brand-alert line-through font-semibold px-1 py-0.5 rounded border border-brand-alert/30 mx-0.5"
                title={`Identified Identifier: ${match.type}`}
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-border p-4 space-y-4 shadow-sm">
      {/* Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface text-brand-primary flex items-center justify-center border border-border">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5">
              DPDPA and HIPAA Pre-Flight Sanitizer
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-brand-primary border border-border font-mono">
                {redactions.length} Protected Entities Redacted
              </span>
            </h4>
            <p className="text-[11px] text-text-muted">
              Client-side de-identification before transmission across spoke and hub boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSafeToPublish ? (
            <span className="px-3 py-1 rounded-lg bg-surface border border-border text-brand-primary text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
              Safe to Publish (Risk: {phiRiskScore.toFixed(1)})
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-surface border border-brand-alert text-brand-alert text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-alert" />
              Direct Identifiers Detected
            </span>
          )}
        </div>
      </div>

      {/* Side-by-side View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Original with strikethroughs */}
        <div className="p-3.5 rounded-lg bg-surface/50 border border-border space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-brand-alert uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Raw Input (Sensitive)
            </span>
            <span className="text-[10px] text-text-muted">Local Device Only</span>
          </div>
          <p className="text-xs text-text-main leading-relaxed font-mono">
            {renderHighlightedOriginal()}
          </p>
        </div>

        {/* Right: Sanitized Output */}
        <div className="p-3.5 rounded-lg bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Sanitized Output (Network Payload)
            </span>
            <span className="text-[10px] text-brand-primary font-mono font-medium">De-Identified</span>
          </div>
          <p className="text-xs text-text-main leading-relaxed font-mono whitespace-pre-wrap">
            {sanitizedText}
          </p>
        </div>
      </div>

      {/* Entity Chips */}
      {redactions && redactions.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block mb-1.5">
            Identified Entities Redacted:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {redactions.map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-surface text-[11px] text-text-main border border-border flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-brand-primary" />
                <span className="text-brand-primary font-semibold">{r.type}:</span>
                <span className="line-through text-text-muted">{r.original}</span>
                <span className="text-text-muted">to</span>
                <span className="text-brand-primary font-mono">{r.replacement}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
