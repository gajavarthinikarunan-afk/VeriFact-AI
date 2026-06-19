"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScoreRing } from "@/components/ui/score-ring";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import {
  ShieldCheck, Loader2, Search, CheckCircle, XCircle,
  AlertTriangle, ExternalLink, Lightbulb, Zap, Copy, RotateCcw
} from "lucide-react";
import type { VerificationResult } from "@/lib/ai-engine";

const SAMPLE_CLAIMS = [
  "The Great Wall of China is visible from space with the naked eye.",
  "Humans only use 10% of their brain.",
  "Lightning never strikes the same place twice.",
  "COVID-19 vaccines contain microchips for tracking.",
  "Global CO2 levels are at their highest in 800,000 years.",
];

const PIPELINE_STAGES = [
  { label: "Extracting Claims", icon: Search },
  { label: "Gathering Evidence", icon: Zap },
  { label: "Validating Sources", icon: CheckCircle },
  { label: "Cross-Referencing", icon: ShieldCheck },
  { label: "Scoring Truth", icon: AlertTriangle },
  { label: "Estimating Confidence", icon: CheckCircle },
];

export default function VerifyPage() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(-1);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");

  async function runVerification() {
    if (!claim.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError("");
    setPipelineStage(0);

    // Animate pipeline stages
    const interval = setInterval(() => {
      setPipelineStage((s) => {
        if (s >= PIPELINE_STAGES.length - 1) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 600);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: claim.trim() }),
      });
      const data = await res.json();
      clearInterval(interval);
      setPipelineStage(PIPELINE_STAGES.length - 1);
      if (data.success) setResult(data.data);
      else setError(data.error || "Verification failed.");
    } catch {
      clearInterval(interval);
      setError("Could not connect to DeepFact™ Engine. Please try again.");
    }
    setLoading(false);
    setTimeout(() => setPipelineStage(-1), 500);
  }

  function reset() { setClaim(""); setResult(null); setError(""); setPipelineStage(-1); }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          Claim Verification
        </h1>
        <p className="text-muted-foreground text-sm mt-1 ml-12">Powered by DeepFact™ Engine — Enter any claim, headline, or statement</p>
      </div>

      {/* Input */}
      <div className="glass-card p-6">
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-blue-500/50 transition-colors min-h-[120px]"
          placeholder="Enter a claim, news headline, statement, or social media post to verify..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {SAMPLE_CLAIMS.slice(0, 3).map((s) => (
              <button key={s} onClick={() => setClaim(s)}
                className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1 transition-colors truncate max-w-[180px]">
                {s.substring(0, 40)}...
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {result && (
              <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-white/10 rounded-lg px-3 py-2 transition-colors">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
            <button
              onClick={runVerification}
              disabled={!claim.trim() || loading}
              className="brand-button text-sm py-2 px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Zap className="w-4 h-4" /> Verify Claim</>}
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <AnimatePresence>
        {loading && pipelineStage >= 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-semibold">DeepFact™ Pipeline Running</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage.label} className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                  i < pipelineStage ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                  i === pipelineStage ? "bg-white/8 border-white/20 text-foreground" :
                  "bg-white/3 border-white/5 text-muted-foreground"
                }`}>
                  {i < pipelineStage ? <CheckCircle className="w-4 h-4 shrink-0" /> :
                   i === pipelineStage ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> :
                   <stage.icon className="w-4 h-4 shrink-0 opacity-40" />}
                  <span className="text-xs font-medium">{stage.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score Summary */}
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex gap-8">
                  <div className="text-center">
                    <ScoreRing score={result.truthScore} size={110} label="Truth Score" />
                  </div>
                  <div className="text-center">
                    <ScoreRing score={result.confidenceScore} size={110} label="Confidence" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Verdict</p>
                    <VerdictBadge verdict={result.verdict} size="lg" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trust Verdict</p>
                    <span className="text-sm font-semibold text-blue-400">{result.trustVerdict}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Summary</p>
                    <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Supporting Evidence */}
              <div className="glass-card p-5">
                <h3 className="font-semibold font-display text-sm mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Supporting Evidence
                </h3>
                <ul className="space-y-2">
                  {result.analysis.supportingEvidence.length > 0 ? result.analysis.supportingEvidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                      {e}
                    </li>
                  )) : <li className="text-sm text-muted-foreground italic">No strong supporting evidence found.</li>}
                </ul>
              </div>

              {/* Contradicting Evidence */}
              <div className="glass-card p-5">
                <h3 className="font-semibold font-display text-sm mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" /> Contradicting Evidence
                </h3>
                <ul className="space-y-2">
                  {result.analysis.contradictingEvidence.length > 0 ? result.analysis.contradictingEvidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                      {e}
                    </li>
                  )) : <li className="text-sm text-muted-foreground italic">No contradicting evidence found.</li>}
                </ul>
              </div>
            </div>

            {/* Factual Claims */}
            {result.analysis.factualClaims?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold font-display text-sm mb-4">Extracted Factual Claims</h3>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.factualClaims.map((c, i) => (
                    <span key={i} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-muted-foreground">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Scores */}
            <div className="glass-card p-5">
              <h3 className="font-semibold font-display text-sm mb-4">Risk Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {[
                  { label: "Emotional Manipulation", value: result.analysis.emotionalManipulation, color: "bg-orange-500" },
                  { label: "Clickbait Score", value: result.analysis.clickbaitScore, color: "bg-yellow-500" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{r.label}</span>
                      <span className="text-xs font-medium">{r.value}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${r.value}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                        className={`h-full ${r.color} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            {result.sources?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold font-display text-sm mb-4">Referenced Sources</h3>
                <div className="space-y-3">
                  {result.sources.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.relevance}</p>
                      </div>
                      <div className="text-xs font-semibold text-blue-400 shrink-0">{s.credibility}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="glass-card p-5 bg-blue-500/5 border-blue-500/20">
                <h3 className="font-semibold font-display text-sm mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-400" /> Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-blue-400 shrink-0">→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
