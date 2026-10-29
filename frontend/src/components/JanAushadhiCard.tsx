// MedNexus Clinical System: JanAushadhiCard.tsx
"use client";

import React from "react";
import { Pill, TrendingDown, Check } from "lucide-react";

export interface JanAushadhiItem {
  branded_drug: string;
  branded_mrp_inr: number;
  jan_aushadhi_generic: string;
  jan_aushadhi_inr: number;
  cost_reduction: string;
}

interface JanAushadhiCardProps {
  savings?: JanAushadhiItem[];
}

export function JanAushadhiCard({ savings }: JanAushadhiCardProps) {
  const defaultSavings: JanAushadhiItem[] = [
    {
      branded_drug: "Brilinta (Ticagrelor 90mg)",
      branded_mrp_inr: 48.5,
      jan_aushadhi_generic: "Generic Ticagrelor 90mg (PMBI)",
      jan_aushadhi_inr: 9.2,
      cost_reduction: "81% OFF",
    },
    {
      branded_drug: "Lipitor (Atorvastatin 40mg)",
      branded_mrp_inr: 28.0,
      jan_aushadhi_generic: "Generic Atorvastatin 40mg (PMBI)",
      jan_aushadhi_inr: 4.5,
      cost_reduction: "84% OFF",
    },
    {
      branded_drug: "Ecosprin (Aspirin 325mg)",
      branded_mrp_inr: 12.0,
      jan_aushadhi_generic: "Generic Aspirin 300mg (PMBI)",
      jan_aushadhi_inr: 1.8,
      cost_reduction: "85% OFF",
    },
  ];

  const items = savings && savings.length > 0 ? savings : defaultSavings;

  const totalBranded = items.reduce((acc, it) => acc + it.branded_mrp_inr, 0);
  const totalGeneric = items.reduce((acc, it) => acc + it.jan_aushadhi_inr, 0);
  const totalSaved = totalBranded - totalGeneric;
  const overallPct = Math.round((totalSaved / totalBranded) * 100);

  return (
    <div className="rounded-xl bg-white border border-border p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface text-brand-primary flex items-center justify-center border border-border">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5">
              Jan Aushadhi Generic Cost Optimizer
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface text-brand-primary border border-border">
                PMBI Verified
              </span>
            </h4>
            <p className="text-[11px] text-text-muted">
              Auto-mapped equivalent generics to eliminate catastrophic out-of-pocket expenditure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-brand-primary text-xs font-semibold">
          <TrendingDown className="w-3.5 h-3.5" />
          Average {overallPct}% Rural Cost Reduction
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] text-text-muted uppercase tracking-wider bg-surface">
              <th className="py-2.5 px-3">Branded Reference Drug</th>
              <th className="py-2.5 px-3">MRP (INR)</th>
              <th className="py-2.5 px-3">Jan Aushadhi Generic</th>
              <th className="py-2.5 px-3">PMBI Price</th>
              <th className="py-2.5 px-3 text-right">Patient Savings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-main">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-surface/50 transition-colors">
                <td className="py-2 px-3 font-medium text-text-main">
                  {item.branded_drug}
                </td>
                <td className="py-2 px-3 text-brand-alert line-through font-mono">
                  INR {item.branded_mrp_inr.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-brand-primary font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-brand-primary" />
                  {item.jan_aushadhi_generic}
                </td>
                <td className="py-2 px-3 font-bold text-text-main font-mono">
                  INR {item.jan_aushadhi_inr.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface text-brand-primary border border-border">
                    {item.cost_reduction}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
        <span>Total Prescription: Branded <span className="line-through text-brand-alert">INR {totalBranded.toFixed(2)}</span> to Jan Aushadhi <span className="font-bold text-brand-primary">INR {totalGeneric.toFixed(2)}</span></span>
        <span className="font-semibold text-brand-primary">Total Patient Savings: INR {totalSaved.toFixed(2)}</span>
      </div>
    </div>
  );
}
