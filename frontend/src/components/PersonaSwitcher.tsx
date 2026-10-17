"use client";

import React, { useState } from "react";
import { usePersona, PERSONAS } from "../lib/persona";
import { UserCheck, Stethoscope, ChevronDown } from "lucide-react";

export function PersonaSwitcher() {
  const { currentPersona, switchPersona } = usePersona();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border hover:border-brand-primary/50 text-xs text-text-main transition-colors shadow-sm"
      >
        <span className="h-2 w-2 rounded-sm bg-brand-primary inline-block" />
        <Stethoscope className="w-3.5 h-3.5 text-brand-primary" />
        <span className="font-semibold text-text-main">{currentPersona.pseudonym}</span>
        <span className="text-text-muted hidden sm:inline">
          ({currentPersona.vote_weight}x Weight)
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-border shadow-lg py-2 z-50">
          <div className="px-3 py-1.5 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Switch Verified Persona
          </div>
          {PERSONAS.map((p) => {
            const isSelected = p.doctor_id === currentPersona.doctor_id;
            return (
              <button
                key={p.doctor_id}
                onClick={() => {
                  switchPersona(p.doctor_id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-surface transition-colors ${
                  isSelected ? "bg-surface border-l-2 border-brand-primary" : ""
                }`}
              >
                <UserCheck
                  className={`w-4 h-4 mt-0.5 ${
                    isSelected ? "text-brand-primary" : "text-text-muted"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-main">
                      {p.pseudonym}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-border text-brand-primary font-mono font-medium">
                      {p.vote_weight}x Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{p.badge}</p>
                  <p className="text-[10px] text-text-muted truncate">{p.hospital}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
