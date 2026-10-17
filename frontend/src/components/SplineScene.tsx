"use client";

import React, { useRef, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface SplineSceneProps {
  sceneUrl?: string;
  className?: string;
}

export function SplineScene({
  sceneUrl = "https://prod.spline.design/Wa6fFtk18h2S2bDj/scene.splinecode",
  className = "",
}: SplineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let app: any = null;
    let isCancelled = false;

    async function initSpline() {
      if (!canvasRef.current) return;
      try {
        setLoading(true);
        setHasError(false);

        // Dynamically import @splinetool/runtime strictly in the browser
        const { Application } = await import("@splinetool/runtime");
        if (isCancelled || !canvasRef.current) return;

        app = new Application(canvasRef.current);
        await app.load(sceneUrl);

        // Attempt to clear large WebGL watermark from pipeline to keep view crisp
        try {
          if (app._renderer && app._renderer.pipeline) {
            app._renderer.pipeline.setWatermark(null);
            if (typeof app._requestRenderAutoMode === "function") {
              app._requestRenderAutoMode();
            }
          }
        } catch {}

        if (!isCancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.warn("Spline 3D canvas notice:", err);
        if (!isCancelled) {
          setHasError(true);
          setLoading(false);
        }
      }
    }

    initSpline();

    return () => {
      isCancelled = true;
      if (app) {
        try {
          app.dispose();
        } catch {}
      }
    };
  }, [sceneUrl]);

  const fallbackVisual = (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center opacity-70">
      <div className="relative w-28 h-28 rounded-2xl bg-white/80 border border-border overflow-hidden shadow-xs mb-3">
        <img
          src="/hero-doctor.png"
          alt="MedNexus Network"
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="text-xs font-semibold text-text-main flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
        <span>MedNexus 3D Medical Scene</span>
      </div>
    </div>
  );

  return (
    <div
      className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}
    >
      {hasError ? (
        fallbackVisual
      ) : (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/30 backdrop-blur-xs z-10 text-xs text-text-muted font-medium pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-border/60 shadow-xs">
                <span className="w-2 h-2 rounded-sm bg-brand-primary animate-pulse" />
                <span className="text-[11px]">Loading 3D Scene...</span>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Short, subtle Built with Spline watermark badge */}
          <div className="absolute bottom-3 right-4 z-20 pointer-events-none select-none">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-md border border-border/70 text-[10px] text-text-muted font-medium shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              Built with Spline
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default SplineScene;
