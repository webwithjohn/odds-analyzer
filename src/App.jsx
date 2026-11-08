import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  ComposedChart
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Calculator,
  Database,
  Code,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ArrowRightLeft,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Download,
  Award,
  Layers
} from 'lucide-react';

// ==========================================
// PRESET DATASETS
// ==========================================
const USER_EXAMPLE_JSON = {
  generated_at: "2026-11-08 15:06:23",
  data: {
    "1": {
      moves: [
        { t: "2026-11-04 21:29:19", y: "1.89" },
        { t: "2026-11-07 12:14:51", y: "1.85" },
        { t: "2026-11-07 14:52:19", y: "1.88" },
        { t: "2026-11-07 17:45:49", y: "1.85" },
        { t: "2026-11-07 20:09:57", y: "1.88" },
        { t: "2026-11-07 20:11:20", y: "1.86" },
        { t: "2026-11-07 20:19:24", y: "1.83" },
        { t: "2026-11-07 20:56:33", y: "1.8" }
      ],
      open: { t: "2026-11-04 21:29:19", y: "1.89" },
      highest: { t: "2026-11-04 21:29:19", y: "1.89" },
      lowest: { t: "2026-11-07 20:56:33", y: "1.8" }
    },
    "2": {
      moves: [
        { t: "2026-11-04 21:29:19", y: "1.82" },
        { t: "2026-11-07 12:14:51", y: "1.85" },
        { t: "2026-11-07 14:52:19", y: "1.82" },
        { t: "2026-11-07 17:45:49", y: "1.85" },
        { t: "2026-11-07 20:09:57", y: "1.89" },
        { t: "2026-11-07 20:11:20", y: "1.92" },
        { t: "2026-11-07 20:19:24", y: "1.95" },
        { t: "2026-11-07 20:56:33", y: "1.98" }
      ],
      open: { t: "2026-11-04 21:29:19", y: "1.82" },
      highest: { t: "2026-11-07 20:56:33", y: "1.98" },
      lowest: { t: "2026-11-04 21:29:19", y: "1.82" }
    }
  }
};

const PRESETS = {
  user_steam_flip: {
    name: "Late Sharp Steam & Flip (Your JSON)",
    desc: "3 days of equilibrium followed by a 47-min late steam rush that flips the favorite and compresses vig.",
    label1: "Outcome 1 (Home)",
    label2: "Outcome 2 (Away)",
    payload: USER_EXAMPLE_JSON
  },
  pinnacle_sharp_drop: {
    name: "Low-Vig Syndicate Steam Run",
    desc: "High-liquidity exchange/sharp book profile (~2.5% margin) with heavy one-way syndicate accumulation.",
    label1: "Team Alpha",
    label2: "Team Bravo",
    payload: {
      generated_at: "2026-11-08 18:00:00",
      data: {
        "1": {
          moves: [
            { t: "2026-11-06 10:00:00", y: "2.12" },
            { t: "2026-11-06 18:30:00", y: "2.06" },
            { t: "2026-11-07 09:15:00", y: "1.98" },
            { t: "2026-11-07 15:00:00", y: "1.91" },
            { t: "2026-11-07 17:30:00", y: "1.84" },
            { t: "2026-11-07 17:55:00", y: "1.76" }
          ]
        },
        "2": {
          moves: [
            { t: "2026-11-06 10:00:00", y: "1.81" },
            { t: "2026-11-06 18:30:00", y: "1.86" },
            { t: "2026-11-07 09:15:00", y: "1.93" },
            { t: "2026-11-07 15:00:00", y: "2.01" },
            { t: "2026-11-07 17:30:00", y: "2.10" },
            { t: "2026-11-07 17:55:00", y: "2.22" }
          ]
        }
      }
    }
  },
  whipsaw_buyback: {
    name: "Two-Way Resistance & Late Buyback",
    desc: "Early move on Outcome 1 hits a resistance ceiling at 1.72, triggering sharp buyback on Outcome 2 before kickoff.",
    label1: "Fighter A",
    label2: "Fighter B",
    payload: {
      generated_at: "2026-11-08 22:00:00",
      data: {
        "1": {
          moves: [
            { t: "2026-11-05 12:00:00", y: "1.90" },
            { t: "2026-11-06 14:00:00", y: "1.80" },
            { t: "2026-11-07 11:00:00", y: "1.72" },
            { t: "2026-11-07 18:00:00", y: "1.78" },
            { t: "2026-11-07 21:15:00", y: "1.87" },
            { t: "2026-11-07 21:50:00", y: "1.93" }
          ]
        },
        "2": {
          moves: [
            { t: "2026-11-05 12:00:00", y: "1.90" },
            { t: "2026-11-06 14:00:00", y: "2.00" },
            { t: "2026-11-07 11:00:00", y: "2.12" },
            { t: "2026-11-07 18:00:00", y: "2.04" },
            { t: "2026-11-07 21:15:00", y: "1.94" },
            { t: "2026-11-07 21:50:00", y: "1.88" }
          ]
        }
      }
    }
  }
};

// ==========================================
// QUANTITATIVE MATH HELPERS
// ==========================================

/**
 * Solves for k in Power Method vig removal: (1/O1)^k + (1/O2)^k = 1
 */
function solvePowerK(raw1, raw2) {
  let low = 0.5;
  let high = 2.0;
  for (let i = 0; i < 35; i++) {
    const mid = (low + high) / 2;
    const sum = Math.pow(raw1, mid) + Math.pow(raw2, mid);
    if (sum > 1) {
      low = mid; // Since raw < 1, raising to a higher power decreases the value
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

/**
 * Computes Vig-Free True Probabilities for a 2-way market
 * @param {number} o1 Decimal odds 1
 * @param {number} o2 Decimal odds 2
 * @param {string} method 'multiplicative' | 'additive' | 'power'
 */
function calculateTrueProbabilities(o1, o2, method = 'multiplicative') {
  const raw1 = 1 / o1;
  const raw2 = 1 / o2;
  const bookSum = raw1 + raw2;
  const overround = (bookSum - 1) * 100;

  let p1 = 0.5;
  let p2 = 0.5;

  if (method === 'additive') {
    const marginPerOutcome = (bookSum - 1) / 2;
    p1 = Math.max(0.01, Math.min(0.99, raw1 - marginPerOutcome));
    p2 = 1 - p1;
  } else if (method === 'power') {
    const k = solvePowerK(raw1, raw2);
    p1 = Math.pow(raw1, k);
    p2 = 1 - p1;
  } else {
    // Multiplicative (Proportional) default
    p1 = raw1 / bookSum;
    p2 = raw2 / bookSum;
  }

  return {
    rawProb1: raw1 * 100,
    rawProb2: raw2 * 100,
    overroundPct: overround,
    trueProb1: p1 * 100,
    trueProb2: p2 * 100,
    fairOdds1: 1 / p1,
    fairOdds2: 1 / p2
  };
}

/**
 * Formats duration in hours to human readable string
 */
function formatDeltaTime(hours) {
  if (hours === 0) return "Open";
  const totalSeconds = Math.round(hours * 3600);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  if (mins < 60) {
    const remSec = totalSeconds % 60;
    return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) {
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  }
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  return `${days}d ${remHrs}h`;
}

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // Market Data State
  const [label1, setLabel1] = useState("Outcome 1 (Home)");
  const [label2, setLabel2] = useState("Outcome 2 (Away)");
  const [rawJsonText, setRawJsonText] = useState(() =>
    JSON.stringify(USER_EXAMPLE_JSON, null, 2)
  );
  const [jsonError, setJsonError] = useState(null);
  const [activePreset, setActivePreset] = useState("user_steam_flip");

  // Parsed Moves Array [{ t: string, o1: number, o2: number }]
  const [movesData, setMovesData] = useState(() => {
    const m1 = USER_EXAMPLE_JSON.data["1"].moves;
    const m2 = USER_EXAMPLE_JSON.data["2"].moves;
    return m1.map((item, idx) => ({
      t: item.t,
      o1: parseFloat(item.y),
      o2: parseFloat(m2[idx]?.y || 1.9)
    }));
  });

  // Quantitative Configuration State
  const [vigMethod, setVigMethod] = useState("multiplicative"); // 'multiplicative' | 'additive' | 'power'
  const [chartMode, setChartMode] = useState("odds"); // 'odds' | 'prob' | 'vig_velocity'
  const [timeScaleMode, setTimeScaleMode] = useState("step"); // 'step' | 'realtime'
  const [showFairLines, setShowFairLines] = useState(true);
  const [showDataEditor, setShowDataEditor] = useState(false);

  // CLV & EV Simulator State
  const [simSide, setSimSide] = useState("1"); // '1' | '2'
  const [simEntryOdds, setSimEntryOdds] = useState(1.89);
  const [simBankroll, setSimBankroll] = useState(1000);
  const [simKellyFraction, setSimKellyFraction] = useState(0.5); // 0.25, 0.5, 1.0
  const [copiedFeatureFormat, setCopiedFeatureFormat] = useState(null);

  // New Row State for manual editing
  const [newRowT, setNewRowT] = useState("2026-11-07 21:10:00");
  const [newRowO1, setNewRowO1] = useState("1.78");
  const [newRowO2, setNewRowO2] = useState("2.02");

  // Load Preset Handler
  const handleSelectPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setActivePreset(presetKey);
    setLabel1(preset.label1);
    setLabel2(preset.label2);
    const formatted = JSON.stringify(preset.payload, null, 2);
    setRawJsonText(formatted);
    setJsonError(null);

    const m1 = preset.payload.data["1"].moves;
    const m2 = preset.payload.data["2"].moves;
    const merged = m1.map((item, idx) => ({
      t: item.t,
      o1: parseFloat(item.y),
      o2: parseFloat(m2[idx]?.y || 1.9)
    }));
    setMovesData(merged);
    if (merged.length > 0) {
      setSimEntryOdds(merged[0].o1);
    }
  };

  // Parse Custom JSON Handler
  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      const d1 = parsed?.data?.["1"]?.moves || parsed?.["1"]?.moves;
      const d2 = parsed?.data?.["2"]?.moves || parsed?.["2"]?.moves;

      if (!Array.isArray(d1) || !Array.isArray(d2) || d1.length === 0) {
        throw new Error(
          'JSON must contain data["1"].moves and data["2"].moves arrays.'
        );
      }

      // Align timestamps across both outcomes
      const map2 = new Map();
      d2.forEach((m) => map2.set(m.t, parseFloat(m.y)));

      let lastO2 = parseFloat(d2[0].y);
      const merged = d1.map((m, idx) => {
        const matchedO2 = map2.has(m.t)
          ? map2.get(m.t)
          : parseFloat(d2[idx]?.y ?? lastO2);
        lastO2 = matchedO2;
        return {
          t: String(m.t),
          o1: parseFloat(m.y),
          o2: matchedO2
        };
      });

      const valid = merged.filter(
        (r) => !isNaN(r.o1) && !isNaN(r.o2) && r.o1 > 1.0 && r.o2 > 1.0
      );
      if (valid.length < 2) {
        throw new Error("Need at least 2 valid odds movement rows (> 1.00).");
      }

      setMovesData(valid);
      setSimEntryOdds(valid[0].o1);
      setJsonError(null);
      setActivePreset("custom");
    } catch (err) {
      setJsonError(err.message);
    }
  };

  // Add manual move step
  const handleAddManualMove = () => {
    const o1 = parseFloat(newRowO1);
    const o2 = parseFloat(newRowO2);
    if (isNaN(o1) || isNaN(o2) || o1 <= 1.01 || o2 <= 1.01) return;
    const updated = [...movesData, { t: newRowT.trim() || `Step ${movesData.length + 1}`, o1, o2 }];
    setMovesData(updated);
    setActivePreset("custom");
  };

  const handleDeleteMove = (idx) => {
    if (movesData.length <= 2) return;
    setMovesData(movesData.filter((_, i) => i !== idx));
    setActivePreset("custom");
  };

  // ==========================================
  // CORE QUANTITATIVE ENGINE (useMemo)
  // ==========================================
  const analysis = useMemo(() => {
    if (!movesData || movesData.length === 0) return null;

    // Sort or preserve order while parsing timestamps
    const firstTs = Date.parse(movesData[0].t.replace(" ", "T"));
    const hasValidDates = !isNaN(firstTs);

    let reversalCount = 0;
    let lastDir = 0; // 1 for prob1 up, -1 for prob1 down

    const steps = movesData.map((row, idx) => {
      const metrics = calculateTrueProbabilities(row.o1, row.o2, vigMethod);
      const currentTs = Date.parse(row.t.replace(" ", "T"));
      const prevTs =
        idx > 0 ? Date.parse(movesData[idx - 1].t.replace(" ", "T")) : currentTs;

      const elapsedHoursFromOpen =
        hasValidDates && !isNaN(currentTs)
          ? Math.max(0, (currentTs - firstTs) / (1000 * 3600))
          : idx;

      const stepDeltaHours =
        idx === 0
          ? 0
          : hasValidDates && !isNaN(currentTs) && !isNaN(prevTs)
          ? Math.max(1 / 3600, (currentTs - prevTs) / (1000 * 3600))
          : 1;

      const prevMetrics =
        idx > 0
          ? calculateTrueProbabilities(
              movesData[idx - 1].o1,
              movesData[idx - 1].o2,
              vigMethod
            )
          : metrics;

      const probChange1 = idx === 0 ? 0 : metrics.trueProb1 - prevMetrics.trueProb1;
      const oddsChange1 = idx === 0 ? 0 : row.o1 - movesData[idx - 1].o1;

      // Track direction reversals
      if (Math.abs(probChange1) > 0.05) {
        const dir = probChange1 > 0 ? 1 : -1;
        if (lastDir !== 0 && dir !== lastDir) {
          reversalCount++;
        }
        lastDir = dir;
      }

      // Velocity (% true prob shift per hour)
      // Cap extreme instantaneous sub-minute noise by putting a 3-minute floor on denominator for rate scaling
      const effectiveHours = Math.max(0.05, stepDeltaHours);
      const velocityPctPerHr = idx === 0 ? 0 : probChange1 / effectiveHours;

      // Short timestamp label for axis
      const shortLabel =
        row.t.length >= 16 ? row.t.slice(5, 16) : `Step ${idx + 1}`;

      // Phase classification
      let phase = "Equilibrium";
      let phaseColor = "text-slate-400 bg-slate-800/70 border-slate-700";
      if (idx === 0) {
        phase = "Market Open";
        phaseColor = "text-cyan-300 bg-cyan-950/60 border-cyan-800/60";
      } else if (Math.abs(velocityPctPerHr) >= 2.0 && probChange1 > 0) {
        phase = "Steam Move (1)";
        phaseColor = "text-emerald-300 bg-emerald-950/70 border-emerald-700/70";
      } else if (Math.abs(velocityPctPerHr) >= 2.0 && probChange1 < 0) {
        phase = "Steam Move (2)";
        phaseColor = "text-amber-300 bg-amber-950/70 border-amber-700/70";
      } else if (
        idx > 0 &&
        ((prevMetrics.trueProb1 < 50 && metrics.trueProb1 > 50) ||
          (prevMetrics.trueProb1 > 50 && metrics.trueProb1 < 50))
      ) {
        phase = "Favorite Flip";
        phaseColor = "text-purple-300 bg-purple-950/70 border-purple-700/70";
      } else if (Math.abs(probChange1) >= 0.4) {
        phase = probChange1 > 0 ? "Drift Toward 1" : "Drift Toward 2";
        phaseColor = "text-blue-300 bg-blue-950/50 border-blue-800/50";
      }

      return {
        index: idx + 1,
        timestamp: row.t,
        shortLabel,
        timestampMs: hasValidDates && !isNaN(currentTs) ? currentTs : idx * 3600000,
        elapsedHours: Number(elapsedHoursFromOpen.toFixed(3)),
        stepDeltaHours,
        deltaLabel: formatDeltaTime(stepDeltaHours),
        o1: row.o1,
        o2: row.o2,
        rawProb1: Number(metrics.rawProb1.toFixed(2)),
        rawProb2: Number(metrics.rawProb2.toFixed(2)),
        overroundPct: Number(metrics.overroundPct.toFixed(2)),
        trueProb1: Number(metrics.trueProb1.toFixed(2)),
        trueProb2: Number(metrics.trueProb2.toFixed(2)),
        fairOdds1: Number(metrics.fairOdds1.toFixed(3)),
        fairOdds2: Number(metrics.fairOdds2.toFixed(3)),
        probChange1: Number(probChange1.toFixed(2)),
        oddsChange1: Number(oddsChange1.toFixed(3)),
        velocityPctPerHr: Number(velocityPctPerHr.toFixed(2)),
        absVelocity: Math.abs(Number(velocityPctPerHr.toFixed(2))),
        phase,
        phaseColor
      };
    });

    const openStep = steps[0];
    const closeStep = steps[steps.length - 1];

    // Total True Probability Drift
    const totalProbDrift1 = closeStep.trueProb1 - openStep.trueProb1;
    const totalOddsDrift1 = closeStep.o1 - openStep.o1;

    // Favorite Flip Detection
    const openFav =
      openStep.trueProb1 > 50.05 ? "1" : openStep.trueProb2 > 50.05 ? "2" : "Pick'em";
    const closeFav =
      closeStep.trueProb1 > 50.05
        ? "1"
        : closeStep.trueProb2 > 50.05
        ? "2"
        : "Pick'em";
    const favoriteFlipped =
      openFav !== "Pick'em" && closeFav !== "Pick'em" && openFav !== closeFav;

    // Vig Compression (Close Overround - Open Overround)
    const vigChange = closeStep.overroundPct - openStep.overroundPct;

    // Late Window Steam Analysis (Final 60 minutes of recorded movement)
    const finalTsMs = closeStep.timestampMs;
    const oneHourBeforeCloseMs = finalTsMs - 3600 * 1000;
    const baselineStepBefore1h =
      [...steps].reverse().find((s) => s.timestampMs <= oneHourBeforeCloseMs) ||
      openStep;

    const lateWindowDurationHrs = Math.max(
      0.05,
      (closeStep.timestampMs - baselineStepBefore1h.timestampMs) / (1000 * 3600)
    );
    const late1hProbDrift1 = closeStep.trueProb1 - baselineStepBefore1h.trueProb1;
    const lateWindowVelocity = late1hProbDrift1 / lateWindowDurationHrs;

    // Peak Step Velocity
    const peakVelocityStep = steps.reduce(
      (best, cur) => (cur.absVelocity > best.absVelocity ? cur : best),
      steps[0]
    );

    // Consecutive Late Moves Count in same direction
    let lateStreakCount = 0;
    const finalDirection = totalProbDrift1 >= 0 ? 1 : -1;
    for (let i = steps.length - 1; i >= 1; i--) {
      const d = steps[i].probChange1;
      if ((finalDirection > 0 && d > 0) || (finalDirection < 0 && d < 0)) {
        lateStreakCount++;
      } else if (Math.abs(d) > 0.05) {
        break;
      }
    }

    // Machine Learning Engineered Feature Vector
    const mlFeatures = {
      open_odds_1: openStep.o1,
      open_odds_2: openStep.o2,
      close_odds_1: closeStep.o1,
      close_odds_2: closeStep.o2,
      open_true_prob_1: Number((openStep.trueProb1 / 100).toFixed(4)),
      close_true_prob_1: Number((closeStep.trueProb1 / 100).toFixed(4)),
      fair_close_odds_1: Number(closeStep.fairOdds1.toFixed(3)),
      fair_close_odds_2: Number(closeStep.fairOdds2.toFixed(3)),
      total_prob_drift_pct: Number(totalProbDrift1.toFixed(2)),
      late_1h_prob_drift_pct: Number(late1hProbDrift1.toFixed(2)),
      late_window_velocity_pct_hr: Number(lateWindowVelocity.toFixed(2)),
      peak_step_velocity_pct_hr: Number(peakVelocityStep.velocityPctPerHr.toFixed(2)),
      open_overround_pct: openStep.overroundPct,
      close_overround_pct: closeStep.overroundPct,
      vig_compression_pct: Number(vigChange.toFixed(2)),
      favorite_flipped: favoriteFlipped ? 1 : 0,
      reversal_count: reversalCount,
      late_unidirectional_streak: lateStreakCount,
      total_updates_count: steps.length
    };

    return {
      steps,
      openStep,
      closeStep,
      totalProbDrift1,
      totalOddsDrift1,
      openFav,
      closeFav,
      favoriteFlipped,
      vigChange,
      late1hProbDrift1,
      lateWindowVelocity,
      lateWindowDurationHrs,
      baselineStepBefore1h,
      peakVelocityStep,
      reversalCount,
      lateStreakCount,
      mlFeatures
    };
  }, [movesData, vigMethod]);

  // ==========================================
  // CLV & EV CALCULATOR ENGINE
  // ==========================================
  const clvStats = useMemo(() => {
    if (!analysis) return null;
    const { closeStep } = analysis;

    const isSide1 = simSide === "1";
    const trueWinProbPct = isSide1 ? closeStep.trueProb1 : closeStep.trueProb2;
    const trueWinProb = trueWinProbPct / 100;
    const rawCloseOdds = isSide1 ? closeStep.o1 : closeStep.o2;
    const fairCloseOdds = isSide1 ? closeStep.fairOdds1 : closeStep.fairOdds2;

    const entryOdds = Math.max(1.01, Number(simEntryOdds) || 1.89);

    // 1. Raw CLV % (Comparing entry odds to raw bookmaker closing odds)
    const rawClvPct = ((entryOdds / rawCloseOdds) - 1) * 100;

    // 2. Vig-Free True EV % (Comparing entry odds to fair no-vig closing line)
    // EV = (EntryOdds * TrueProb) - 1
    const trueEvPct = (entryOdds * trueWinProb - 1) * 100;
    const expectedProfitDollar = (trueEvPct / 100) * simBankroll;

    // 3. Kelly Criterion Stake %
    // f* = (b*p - q) / b where b = entryOdds - 1
    const b = entryOdds - 1;
    const q = 1 - trueWinProb;
    const fullKellyPct = Math.max(0, ((b * trueWinProb - q) / b) * 100);
    const recommendedKellyPct = fullKellyPct * simKellyFraction;
    const recommendedStakeDollar = (recommendedKellyPct / 100) * simBankroll;

    return {
      trueWinProbPct,
      rawCloseOdds,
      fairCloseOdds,
      entryOdds,
      rawClvPct,
      trueEvPct,
      expectedProfitDollar,
      fullKellyPct,
      recommendedKellyPct,
      recommendedStakeDollar,
      isBeatRawClose: entryOdds > rawCloseOdds,
      isPositiveEv: trueEvPct > 0
    };
  }, [analysis, simSide, simEntryOdds, simBankroll, simKellyFraction]);

  // Copy ML Features helper
  const handleCopyFeatures = (format) => {
    if (!analysis) return;
    const feat = analysis.mlFeatures;
    let text = "";
    if (format === "json") {
      text = JSON.stringify(feat, null, 2);
    } else {
      const headers = Object.keys(feat).join(",");
      const values = Object.values(feat).join(",");
      text = `${headers}\n${values}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedFeatureFormat(format);
    setTimeout(() => setCopiedFeatureFormat(null), 2000);
  };

  if (!analysis) return null;

  const {
    steps,
    openStep,
    closeStep,
    totalProbDrift1,
    favoriteFlipped,
    vigChange,
    late1hProbDrift1,
    lateWindowVelocity,
    lateStreakCount,
    mlFeatures
  } = analysis;

  const steamSideLabel = totalProbDrift1 >= 0 ? label1 : label2;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-16">
      {/* ========================================== */}
      {/* TOP TERMINAL HEADER BAR                    */}
      {/* ========================================== */}
      <header className="border-b border-slate-800/80 bg-slate-900/75 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  QUANTLINE <span className="text-emerald-400 font-mono text-sm">2-WAY</span>
                </h1>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Steam & CLV Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Vig-Removal Probability Modeling, Steam Velocity & Closing Line Value Analyzer
              </p>
            </div>
          </div>

          {/* Preset Selector & JSON Drawer Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="px-2.5 py-1 text-slate-400 font-medium hidden sm:inline">
                Dataset:
              </span>
              <select
                value={activePreset}
                onChange={(e) => {
                  if (e.target.value !== "custom") {
                    handleSelectPreset(e.target.value);
                  }
                }}
                className="bg-slate-900 text-slate-200 font-medium px-2.5 py-1.5 rounded border border-slate-700/80 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="user_steam_flip">
                  1. Late Sharp Steam & Flip (Your JSON)
                </option>
                <option value="pinnacle_sharp_drop">
                  2. Low-Vig Syndicate Steam Run
                </option>
                <option value="whipsaw_buyback">
                  3. Two-Way Resistance & Buyback
                </option>
                {activePreset === "custom" && (
                  <option value="custom">Custom / Edited Market</option>
                )}
              </select>
            </div>

            <button
              onClick={() => setShowDataEditor(!showDataEditor)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                showDataEditor
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{showDataEditor ? "Hide JSON / Editor" : "Edit JSON / Moves"}</span>
              {showDataEditor ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ========================================== */}
        {/* COLLAPSIBLE JSON & DATA EDITOR DRAWER      */}
        {/* ========================================== */}
        {showDataEditor && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  Market JSON Payload & Manual Move Editor
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste any 2-way market JSON object in your format or add hypothetical line moves below.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Side 1 Label:</label>
                  <input
                    type="text"
                    value={label1}
                    onChange={(e) => setLabel1(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white w-36"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Side 2 Label:</label>
                  <input
                    type="text"
                    value={label2}
                    onChange={(e) => setLabel2(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white w-36"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Raw JSON Input */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Raw JSON Input (`data["1"].moves` & `data["2"].moves`)
                  </label>
                  <button
                    onClick={handleApplyJson}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Parse & Apply JSON
                  </button>
                </div>
                <textarea
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  rows={10}
                  spellCheck={false}
                  className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 focus:outline-none focus:border-emerald-500/60"
                />
                {jsonError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}
              </div>

              {/* Right: Interactive Quick Step Appender */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Interactive Step Editor ({movesData.length} Timestamps Loaded)
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-52 overflow-y-auto space-y-1.5">
                  {movesData.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800/80 font-mono"
                    >
                      <span className="text-slate-500 w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        value={m.t}
                        onChange={(e) => {
                          const next = [...movesData];
                          next[idx] = { ...next[idx], t: e.target.value };
                          setMovesData(next);
                        }}
                        className="bg-transparent text-slate-300 border-b border-transparent focus:border-emerald-500 focus:outline-none flex-1"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">1:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={m.o1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val > 1.0) {
                              const next = [...movesData];
                              next[idx] = { ...next[idx], o1: val };
                              setMovesData(next);
                            }
                          }}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-emerald-300"
                        />
                        <span className="text-amber-400 ml-1">2:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={m.o2}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val > 1.0) {
                              const next = [...movesData];
                              next[idx] = { ...next[idx], o2: val };
                              setMovesData(next);
                            }
                          }}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-amber-300"
                        />
                        <button
                          onClick={() => handleDeleteMove(idx)}
                          disabled={movesData.length <= 2}
                          className="text-slate-500 hover:text-rose-400 disabled:opacity-30 ml-1 p-1"
                          title="Remove timestamp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Hypothetical Next Move */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:MM:SS"
                    value={newRowT}
                    onChange={(e) => setNewRowT(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 flex-1 min-w-[150px]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Odds 1"
                    value={newRowO1}
                    onChange={(e) => setNewRowO1(e.target.value)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-emerald-300"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Odds 2"
                    value={newRowO2}
                    onChange={(e) => setNewRowO2(e.target.value)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-amber-300"
                  />
                  <button
                    onClick={handleAddManualMove}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Append Move
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================== */}
        {/* QUANTITATIVE VERDICT & SIGNAL BANNER       */}
        {/* ========================================== */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Market Signal Verdict
                </span>
                {favoriteFlipped && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3" /> Favorite Inversion Detected
                  </span>
                )}
                {Math.abs(lateWindowVelocity) >= 1.5 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> High-Velocity Late Steam
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white">
                Informed Action Steamed{" "}
                <span className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-4">
                  {steamSideLabel}
                </span>{" "}
                ({totalProbDrift1 >= 0 ? "+" : ""}
                {totalProbDrift1.toFixed(2)}% True Probability Shift)
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                {favoriteFlipped
                  ? `${label2} opened as the slight market favorite (${openStep.o2.toFixed(
                      2
                    )} vs ${openStep.o1.toFixed(2)}), but ${lateStreakCount} consecutive late moves inverted the market—closing ${label1} as a ${closeStep.trueProb1.toFixed(
                      2
                    )}% favorite (${closeStep.o1.toFixed(2)}). `
                  : `${steamSideLabel} experienced consistent accumulation from open (${openStep.o1.toFixed(
                      2
                    )}) to close (${closeStep.o1.toFixed(2)}). `}
                Bookmaker overround compressed from{" "}
                <span className="font-mono text-slate-100">{openStep.overroundPct}%</span> to{" "}
                <span className="font-mono text-emerald-300">{closeStep.overroundPct}%</span>,
                confirming higher limits and sharp price discovery near close.
              </p>
            </div>

            {/* Vig Removal Method Selector Pill */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 shrink-0 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-emerald-400" />
                  Vig-Removal Model
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Vig: {closeStep.overroundPct}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {[
                  { id: "multiplicative", label: "Multiplicative" },
                  { id: "additive", label: "Additive" },
                  { id: "power", label: "Power (Log)" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setVigMethod(m.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                      vigMethod === m.id
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 4 EXECUTIVE QUANT KPI CARDS                */}
        {/* ========================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Closing True Probability Split */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium uppercase tracking-wider">Closing True Prob</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {closeStep.trueProb1.toFixed(2)}%
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                  {label1}
                </div>
              </div>
              <div className="text-xs font-mono text-slate-600">VS</div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {closeStep.trueProb2.toFixed(2)}%
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                  {label2}
                </div>
              </div>
            </div>
            {/* Progress Split Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${closeStep.trueProb1}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
              />
              <div
                style={{ width: `${closeStep.trueProb2}%` }}
                className="bg-amber-500 h-full transition-all duration-300"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Open: {openStep.trueProb1.toFixed(2)}%</span>
              <span
                className={
                  totalProbDrift1 >= 0 ? "text-emerald-400" : "text-amber-400"
                }
              >
                {totalProbDrift1 >= 0 ? "+" : ""}
                {totalProbDrift1.toFixed(2)}% Shift
              </span>
            </div>
          </div>

          {/* Card 2: Fair No-Vig Closing Line */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium uppercase tracking-wider">
                Fair No-Vig Close Odds
              </span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="my-3 grid grid-cols-2 gap-2">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400">Side 1 Fair / Raw</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {closeStep.fairOdds1.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ({closeStep.o1.toFixed(2)})
                  </span>
                </div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400">Side 2 Fair / Raw</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {closeStep.fairOdds2.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ({closeStep.o2.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Break-even price required:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                &gt; {closeStep.fairOdds1.toFixed(2)} (Side 1)
              </span>
            </div>
          </div>

          {/* Card 3: Late Window Steam Velocity */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium uppercase tracking-wider">
                Late Steam Velocity
              </span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {lateWindowVelocity >= 0 ? "+" : ""}
                  {lateWindowVelocity.toFixed(2)}%
                </span>
                <span className="text-xs font-mono text-amber-400">/ hour</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Final window ({formatDeltaTime(analysis.lateWindowDurationHrs)}):{" "}
                <span className="font-mono text-slate-200">
                  {analysis.baselineStepBefore1h.o1.toFixed(2)} → {closeStep.o1.toFixed(2)}
                </span>
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Unidirectional Streak:</span>
              <span className="text-emerald-400 font-semibold">
                {lateStreakCount} consecutive moves
              </span>
            </div>
          </div>

          {/* Card 4: Bookmaker Overround (Vig Compression) */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium uppercase tracking-wider">
                Bookmaker Margin (Vig)
              </span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {closeStep.overroundPct.toFixed(2)}%
                </span>
                <span
                  className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    vigChange <= 0
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {vigChange > 0 ? "+" : ""}
                  {vigChange.toFixed(2)}% vs Open
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Open Vig: <span className="font-mono">{openStep.overroundPct}%</span> → Close
                Vig: <span className="font-mono">{closeStep.overroundPct}%</span>
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Market Reversals:</span>
              <span className="text-slate-200">{analysis.reversalCount} flips</span>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* MAIN INTERACTIVE CHART + CLV SIMULATOR     */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLS: MULTI-MODE CHART */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              {/* Chart Control Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setChartMode("odds")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      chartMode === "odds"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Decimal Odds
                  </button>
                  <button
                    onClick={() => setChartMode("prob")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      chartMode === "prob"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Vig-Free True Prob (%)
                  </button>
                  <button
                    onClick={() => setChartMode("vig_velocity")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      chartMode === "vig_velocity"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Vig % & Velocity
                  </button>
                </div>

                {/* X-Axis Scaling & Fair Line Toggles */}
                <div className="flex flex-wrap items-center gap-2">
                  {chartMode === "odds" && (
                    <button
                      onClick={() => setShowFairLines(!showFairLines)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
                        showFairLines
                          ? "bg-cyan-950/60 border-cyan-600/60 text-cyan-300"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {showFairLines ? "✓ Fair No-Vig Dashed" : "+ Show Fair Odds"}
                    </button>
                  )}

                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setTimeScaleMode("step")}
                      className={`px-2.5 py-1 rounded transition ${
                        timeScaleMode === "step"
                          ? "bg-slate-800 text-white font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      Even Steps
                    </button>
                    <button
                      onClick={() => setTimeScaleMode("realtime")}
                      className={`px-2.5 py-1 rounded transition ${
                        timeScaleMode === "realtime"
                          ? "bg-slate-800 text-white font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      Real Time (Hrs)
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Sub-caption */}
              <div className="flex flex-wrap items-center justify-between gap-2 my-3 text-xs text-slate-400">
                <span>
                  {chartMode === "odds" &&
                    "Solid lines show bookmaker decimal odds; dashed lines show true vig-free fair price."}
                  {chartMode === "prob" &&
                    "Vig-removed true win probability (%) across each timestamp update. 50% dashed line shows favorite inversion."}
                  {chartMode === "vig_velocity" &&
                    "Bookmaker overround margin (%) vs instantaneous probability velocity (% shift/hr)."}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {timeScaleMode === "realtime"
                    ? `Total Horizon: ${closeStep.elapsedHours.toFixed(1)} hrs`
                    : `${steps.length} Discrete Line Moves`}
                </span>
              </div>

              {/* Recharts Container */}
              <div className="h-[340px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "odds" ? (
                    <LineChart
                      data={steps}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey={
                          timeScaleMode === "realtime" ? "elapsedHours" : "shortLabel"
                        }
                        type={timeScaleMode === "realtime" ? "number" : "category"}
                        domain={timeScaleMode === "realtime" ? ["dataMin", "dataMax"] : undefined}
                        tickFormatter={(val) =>
                          timeScaleMode === "realtime" ? `${Number(val).toFixed(0)}h` : val
                        }
                        stroke="#64748b"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        stroke="#64748b"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.toFixed(2)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          fontSize: "12px"
                        }}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.timestamp || ""
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                      <Line
                        type="monotone"
                        dataKey="o1"
                        name={`${label1} (Book)`}
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#10b981" }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="o2"
                        name={`${label2} (Book)`}
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#f59e0b" }}
                        activeDot={{ r: 6 }}
                      />
                      {showFairLines && (
                        <>
                          <Line
                            type="monotone"
                            dataKey="fairOdds1"
                            name={`${label1} (Fair No-Vig)`}
                            stroke="#34d399"
                            strokeWidth={1.75}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="fairOdds2"
                            name={`${label2} (Fair No-Vig)`}
                            stroke="#fbbf24"
                            strokeWidth={1.75}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </>
                      )}
                    </LineChart>
                  ) : chartMode === "prob" ? (
                    <LineChart
                      data={steps}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey={
                          timeScaleMode === "realtime" ? "elapsedHours" : "shortLabel"
                        }
                        type={timeScaleMode === "realtime" ? "number" : "category"}
                        domain={timeScaleMode === "realtime" ? ["dataMin", "dataMax"] : undefined}
                        tickFormatter={(val) =>
                          timeScaleMode === "realtime" ? `${Number(val).toFixed(0)}h` : val
                        }
                        stroke="#64748b"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        stroke="#64748b"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${v.toFixed(1)}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          fontSize: "12px"
                        }}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.timestamp || ""
                        }
                        formatter={(val) => [`${val}%`, ""]}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                      <ReferenceLine
                        y={50}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        label={{
                          value: "50% Pick'em Equilibrium",
                          position: "insideTopRight",
                          fill: "#94a3b8",
                          fontSize: 11
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="trueProb1"
                        name={`${label1} True Prob %`}
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#10b981" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="trueProb2"
                        name={`${label2} True Prob %`}
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#f59e0b" }}
                      />
                    </LineChart>
                  ) : (
                    <ComposedChart
                      data={steps}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="shortLabel"
                        stroke="#64748b"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#a855f7"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#38bdf8"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${v}%/h`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          fontSize: "12px"
                        }}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.timestamp || ""
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                      <Bar
                        yAxisId="right"
                        dataKey="velocityPctPerHr"
                        name="Side 1 Velocity (%/hr)"
                        fill="#38bdf8"
                        radius={[4, 4, 0, 0]}
                        barSize={26}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="overroundPct"
                        name="Bookmaker Overround (Vig %)"
                        stroke="#a855f7"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#a855f7" }}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Insight Callout inside Chart Card */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Switch between <strong>Even Steps</strong> and{" "}
                  <strong>Real Time (Hrs)</strong> to see how the 3-day lull contrasts
                  with the vertical 47-minute late steam drop.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: CLOSING LINE VALUE (CLV) & EV SIMULATOR */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    CLV & Expected Value Simulator
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  vs Vig-Free Close
                </span>
              </div>

              {/* Target Outcome Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  1. Select Bet Side
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSimSide("1");
                      setSimEntryOdds(openStep.o1);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      simSide === "1"
                        ? "bg-emerald-950/60 border-emerald-500/70 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{label1}</div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      Fair Close: {closeStep.fairOdds1.toFixed(2)}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSimSide("2");
                      setSimEntryOdds(openStep.o2);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      simSide === "2"
                        ? "bg-amber-950/60 border-amber-500/70 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{label2}</div>
                    <div className="text-[11px] font-mono text-amber-400 mt-0.5">
                      Fair Close: {closeStep.fairOdds2.toFixed(2)}
                    </div>
                  </button>
                </div>
              </div>

              {/* Entry Odds Slider & Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-400 font-medium">
                    2. Your Entry Decimal Odds
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setSimEntryOdds(simSide === "1" ? openStep.o1 : openStep.o2)
                      }
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                    >
                      Use Open ({simSide === "1" ? openStep.o1 : openStep.o2})
                    </button>
                    <input
                      type="number"
                      step="0.01"
                      value={simEntryOdds}
                      onChange={(e) => setSimEntryOdds(e.target.value)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right font-mono font-bold text-emerald-300"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="1.50"
                  max="2.40"
                  step="0.01"
                  value={simEntryOdds}
                  onChange={(e) => setSimEntryOdds(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>1.50</span>
                  <span>
                    Fair Break-Even:{" "}
                    {simSide === "1"
                      ? closeStep.fairOdds1.toFixed(2)
                      : closeStep.fairOdds2.toFixed(2)}
                  </span>
                  <span>2.40</span>
                </div>
              </div>

              {/* Bankroll & Kelly Fraction */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Bankroll / Unit ($)
                  </label>
                  <input
                    type="number"
                    value={simBankroll}
                    onChange={(e) =>
                      setSimBankroll(Math.max(1, Number(e.target.value) || 100))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Kelly Multiplier
                  </label>
                  <select
                    value={simKellyFraction}
                    onChange={(e) => setSimKellyFraction(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  >
                    <option value={0.25}>Quarter Kelly (0.25x)</option>
                    <option value={0.5}>Half Kelly (0.50x)</option>
                    <option value={1}>Full Kelly (1.00x)</option>
                  </select>
                </div>
              </div>

              {/* Simulator Output Box */}
              {clvStats && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-400">
                        True Expected Value (EV)
                      </div>
                      <div
                        className={`text-2xl font-bold font-mono ${
                          clvStats.isPositiveEv ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {clvStats.trueEvPct >= 0 ? "+" : ""}
                        {clvStats.trueEvPct.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400">
                        Raw CLV vs Book Close
                      </div>
                      <div
                        className={`text-lg font-bold font-mono ${
                          clvStats.rawClvPct >= 0 ? "text-cyan-400" : "text-slate-400"
                        }`}
                      >
                        {clvStats.rawClvPct >= 0 ? "+" : ""}
                        {clvStats.rawClvPct.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-slate-400">Expected ROI ($):</div>
                    <div
                      className={`text-right font-semibold ${
                        clvStats.expectedProfitDollar >= 0
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {clvStats.expectedProfitDollar >= 0 ? "+$" : "-$"}
                      {Math.abs(clvStats.expectedProfitDollar).toFixed(2)}
                    </div>
                    <div className="text-slate-400">Recommended Kelly:</div>
                    <div className="text-right text-white font-semibold">
                      {clvStats.recommendedKellyPct.toFixed(2)}% ($
                      {clvStats.recommendedStakeDollar.toFixed(0)})
                    </div>
                  </div>

                  {/* Crucial Vig Trap Explanation Banner */}
                  {clvStats.isBeatRawClose && !clvStats.isPositiveEv && (
                    <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-700/60 text-[11px] text-amber-200 leading-relaxed">
                      <strong className="text-amber-300">Vig Illusion Detected:</strong>{" "}
                      Your <span className="font-mono">{clvStats.entryOdds}</span> entry
                      beats the raw closing line (
                      <span className="font-mono">{clvStats.rawCloseOdds}</span>), but
                      because this bookmaker charges a heavy{" "}
                      <span className="font-mono">{closeStep.overroundPct}%</span> vig, the
                      true no-vig closing price is{" "}
                      <span className="font-mono font-bold">
                        {clvStats.fairCloseOdds.toFixed(2)}
                      </span>
                      . You need odds &gt;{" "}
                      <span className="font-mono font-bold">
                        {clvStats.fairCloseOdds.toFixed(2)}
                      </span>{" "}
                      for +EV.
                    </div>
                  )}

                  {clvStats.isPositiveEv && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-[11px] text-emerald-200 leading-relaxed">
                      <strong className="text-emerald-300">+EV Sharp Entry:</strong> Your
                      price (<span className="font-mono">{clvStats.entryOdds}</span>) beats
                      the vig-free fair closing line (
                      <span className="font-mono">
                        {clvStats.fairCloseOdds.toFixed(2)}
                      </span>
                      ), yielding a long-run mathematical edge.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* STEP-BY-STEP CHRONOLOGICAL BREAKDOWN TABLE */}
        {/* ========================================== */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Chronological Line Movement & Vig-Removal Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Step-by-step decomposition of raw odds, overround vig, true probabilities (
                {vigMethod}), and hourly steam velocity.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {steps.length} Snapshots
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Δ Time</th>
                  <th className="py-3 px-3 text-emerald-400">Odds 1</th>
                  <th className="py-3 px-3 text-amber-400">Odds 2</th>
                  <th className="py-3 px-3">Vig %</th>
                  <th className="py-3 px-3 text-emerald-300">True Prob 1</th>
                  <th className="py-3 px-3 text-amber-300">True Prob 2</th>
                  <th className="py-3 px-3">Fair 1 / 2</th>
                  <th className="py-3 px-3">Velocity (1)</th>
                  <th className="py-3 px-4">Market Phase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {steps.map((s) => (
                  <tr
                    key={s.index}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-slate-500">{s.index}</td>
                    <td className="py-2.5 px-4 text-slate-200 whitespace-nowrap">
                      {s.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {s.deltaLabel}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {s.o1.toFixed(2)}
                      {s.oddsChange1 !== 0 && (
                        <span
                          className={`ml-1 text-[10px] font-normal ${
                            s.oddsChange1 < 0 ? "text-emerald-300" : "text-rose-400"
                          }`}
                        >
                          ({s.oddsChange1 > 0 ? "+" : ""}
                          {s.oddsChange1.toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">
                      {s.o2.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300">
                      {s.overroundPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-emerald-300 font-semibold">
                      {s.trueProb1.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-amber-300">
                      {s.trueProb2.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {s.fairOdds1.toFixed(2)} / {s.fairOdds2.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {s.index === 1 ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        <span
                          className={
                            Math.abs(s.velocityPctPerHr) >= 2.0
                              ? "text-cyan-300 font-bold"
                              : "text-slate-400"
                          }
                        >
                          {s.velocityPctPerHr >= 0 ? "+" : ""}
                          {s.velocityPctPerHr.toFixed(2)}%/h
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${s.phaseColor}`}
                      >
                        {s.phase}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================== */}
        {/* MACHINE LEARNING FEATURE VECTOR EXPORTER   */}
        {/* ========================================== */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Engineered ML Feature Vector (For XGBoost / Logistic Regression Pipelines)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Extracted time-series features ready for historical model training or live outcome classification.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyFeatures("json")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copiedFeatureFormat === "json" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{copiedFeatureFormat === "json" ? "Copied JSON!" : "Copy JSON"}</span>
              </button>
              <button
                onClick={() => handleCopyFeatures("csv")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copiedFeatureFormat === "csv" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{copiedFeatureFormat === "csv" ? "Copied CSV!" : "Copy CSV Row"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {Object.entries(mlFeatures).map(([key, value]) => (
              <div
                key={key}
                className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2.5"
              >
                <div className="text-[10px] font-mono text-slate-400 truncate" title={key}>
                  {key}
                </div>
                <div className="text-sm font-mono font-bold text-emerald-300 mt-1">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}