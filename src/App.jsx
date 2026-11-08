import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  ComposedChart
} from "recharts";
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
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Sliders,
  Info,
  Award,
  Layers,
  Lock,
  Bookmark,
  FolderOpen,
  Edit3
} from "lucide-react";

// ==========================================
// LOCAL STORAGE KEYS & STARTER DATASETS
// ==========================================
const STORAGE_KEY_DATASETS = "odds_analyzer_datasets_v2";
const STORAGE_KEY_SELECTED_ID = "odds_analyzer_selected_id_v2";

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

const SYNDICATE_CRUSH_JSON = {
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
};

const PUBLIC_TRAP_RLM_JSON = {
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
};

// ==========================================
// QUANTITATIVE MATH & PARSING HELPERS
// ==========================================
function parseTimestampMs(tStr, fallbackIndex) {
  if (!tStr) return fallbackIndex * 3600 * 1000;
  const iso = String(tStr).trim().replace(" ", "T");
  const parsed = Date.parse(iso);
  if (!isNaN(parsed)) return parsed;
  const direct = Date.parse(tStr);
  return !isNaN(direct) ? direct : fallbackIndex * 3600 * 1000;
}

function formatShortTime(tStr) {
  if (!tStr) return "";
  const parts = String(tStr).trim().split(" ");
  if (parts.length === 2) {
    const datePart = parts[0].slice(5); // MM-DD
    const timePart = parts[1].slice(0, 5); // HH:MM
    return `${datePart} ${timePart}`;
  }
  return String(tStr).slice(0, 14);
}

/**
 * Parses and aligns a 2-way JSON payload into synchronized movement rows
 */
function parseAndAlignMarketJson(jsonString) {
  const parsed = JSON.parse(jsonString);
  const root = parsed.data ? parsed.data : parsed;
  const m1 = root["1"]?.moves || root.outcome1?.moves;
  const m2 = root["2"]?.moves || root.outcome2?.moves;

  if (!Array.isArray(m1) || !Array.isArray(m2) || m1.length === 0 || m2.length === 0) {
    throw new Error(
      'Invalid JSON format: Expected data["1"].moves and data["2"].moves arrays with { t, y } objects.'
    );
  }

  // Merge timestamps or index-align if lengths match
  const allTimestamps = Array.from(
    new Set([...m1.map((x) => x.t), ...m2.map((x) => x.t)])
  ).sort((a, b) => parseTimestampMs(a, 0) - parseTimestampMs(b, 0));

  let last1 = parseFloat(m1[0].y);
  let last2 = parseFloat(m2[0].y);
  const map1 = new Map(m1.map((x) => [x.t, parseFloat(x.y)]));
  const map2 = new Map(m2.map((x) => [x.t, parseFloat(x.y)]));

  const merged = allTimestamps.map((t) => {
    if (map1.has(t) && !isNaN(map1.get(t))) last1 = map1.get(t);
    if (map2.has(t) && !isNaN(map2.get(t))) last2 = map2.get(t);
    return {
      t,
      o1: last1,
      o2: last2
    };
  });

  const valid = merged.filter(
    (r) => !isNaN(r.o1) && !isNaN(r.o2) && r.o1 > 1.0 && r.o2 > 1.0
  );

  if (valid.length < 2) {
    throw new Error("Need at least 2 valid odds movement rows with decimal odds > 1.00.");
  }

  return {
    moves: valid,
    generatedAt: parsed?.generated_at || "Custom Timestamp"
  };
}

function buildStarterDatasets() {
  const d1 = parseAndAlignMarketJson(JSON.stringify(USER_EXAMPLE_JSON));
  const d2 = parseAndAlignMarketJson(JSON.stringify(SYNDICATE_CRUSH_JSON));
  const d3 = parseAndAlignMarketJson(JSON.stringify(PUBLIC_TRAP_RLM_JSON));

  return [
    {
      id: "ds_user_nov2026",
      name: "User Dataset: Nov 2026 Late Steam & Flip",
      desc: "3 days of equilibrium followed by a 47-min late steam rush that flips the favorite and compresses vig.",
      label1: "Outcome 1 (Home)",
      label2: "Outcome 2 (Away)",
      generatedAt: d1.generatedAt,
      rawJsonText: JSON.stringify(USER_EXAMPLE_JSON, null, 2),
      movesData: d1.moves
    },
    {
      id: "ds_syndicate_crush",
      name: "Syndicate Early Opener Crush",
      desc: "High-liquidity exchange/sharp book profile (~2.5% margin) with heavy one-way syndicate accumulation.",
      label1: "Team Alpha",
      label2: "Team Bravo",
      generatedAt: d2.generatedAt,
      rawJsonText: JSON.stringify(SYNDICATE_CRUSH_JSON, null, 2),
      movesData: d2.moves
    },
    {
      id: "ds_public_trap_rlm",
      name: "Public Trap / Reverse Line Movement",
      desc: "Early move on Outcome 1 hits a resistance ceiling at 1.72, triggering sharp buyback on Outcome 2 before kickoff.",
      label1: "Fighter A",
      label2: "Fighter B",
      generatedAt: d3.generatedAt,
      rawJsonText: JSON.stringify(PUBLIC_TRAP_RLM_JSON, null, 2),
      movesData: d3.moves
    }
  ];
}

/**
 * Computes Vig-Free True Probabilities for a 2-way market
 * Supports:
 * - 'multiplicative' (Proportional normalization)
 * - 'additive' (Equal margin subtraction)
 * - 'power' (Logarithmic / Equal Return exponent k where o1^(-k) + o2^(-k) = 1)
 * - 'shin' (Shin's insider trading adjustment)
 */
function calculateDeVig(o1, o2, method = "multiplicative") {
  const safeO1 = Math.max(1.01, Number(o1) || 1.85);
  const safeO2 = Math.max(1.01, Number(o2) || 1.85);

  const raw1 = 1 / safeO1;
  const raw2 = 1 / safeO2;
  const bookSum = raw1 + raw2;
  const overroundPct = (bookSum - 1) * 100;

  let p1 = raw1 / bookSum;
  let p2 = raw2 / bookSum;

  if (method === "additive") {
    const excess = bookSum - 1;
    p1 = Math.min(0.99, Math.max(0.01, raw1 - excess / 2));
    p2 = 1 - p1;
  } else if (method === "power") {
    let low = 0.05;
    let high = 5.0;
    for (let i = 0; i < 30; i++) {
      const mid = (low + high) / 2;
      const sumPow = Math.pow(raw1, mid) + Math.pow(raw2, mid);
      if (sumPow > 1) {
        low = mid;
      } else {
        high = mid;
      }
    }
    const k = (low + high) / 2;
    p1 = Math.pow(raw1, k);
    p2 = 1 - p1;
  } else if (method === "shin") {
    // Closed-form 2-outcome Shin's method approximation
    const z = Math.max(0, (bookSum - 1) / (bookSum + 1));
    const s1 =
      (Math.sqrt(z * z + 4 * (1 - z) * ((raw1 * raw1) / bookSum)) - z) /
      (2 * (1 - z));
    const s2 =
      (Math.sqrt(z * z + 4 * (1 - z) * ((raw2 * raw2) / bookSum)) - z) /
      (2 * (1 - z));
    const sTotal = s1 + s2;
    p1 = sTotal > 0 ? s1 / sTotal : raw1 / bookSum;
    p2 = 1 - p1;
  }

  return {
    rawProb1: raw1 * 100,
    rawProb2: raw2 * 100,
    overroundPct,
    trueProb1: p1 * 100,
    trueProb2: p2 * 100,
    fairOdds1: 1 / p1,
    fairOdds2: 1 / p2
  };
}

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // 1. Unified Datasets Array State (persisted in localStorage under odds_analyzer_datasets_v2)
  const [datasets, setDatasets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATASETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].movesData?.length >= 2) {
          return parsed;
        }
      }
    } catch (e) {
      // Fallback to starter datasets
    }
    return buildStarterDatasets();
  });

  // 2. Selected Dataset ID State (Never switches to a generic "custom" placeholder)
  const [selectedDatasetId, setSelectedDatasetId] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_SELECTED_ID);
      if (savedId) return savedId;
    } catch (e) {}
    return "ds_user_nov2026";
  });

  // Resolve currently active dataset object
  const activeDataset = useMemo(() => {
    return datasets.find((d) => d.id === selectedDatasetId) || datasets[0];
  }, [datasets, selectedDatasetId]);

  // Raw JSON Editor Textarea State & Status Banners
  const [rawJsonText, setRawJsonText] = useState(() => activeDataset.rawJsonText);
  const [newDatasetName, setNewDatasetName] = useState("");
  const [isRenamingInline, setIsRenamingInline] = useState(false);
  const [jsonError, setJsonError] = useState(null);
  const [parseConfirmation, setParseConfirmation] = useState(null);

  // Quantitative Configuration State
  const [vigMethod, setVigMethod] = useState("multiplicative"); // 'multiplicative' | 'additive' | 'power' | 'shin'
  const [chartMode, setChartMode] = useState("odds"); // 'odds' | 'prob' | 'vig_velocity'
  const [timeScaleMode, setTimeScaleMode] = useState("step"); // 'step' | 'realtime'
  const [showFairLines, setShowFairLines] = useState(true);
  const [showDataEditor, setShowDataEditor] = useState(false);

  // CLV & EV Simulator State
  const [simSide, setSimSide] = useState("1"); // '1' | '2'
  const [simEntryOdds, setSimEntryOdds] = useState(
    () => activeDataset.movesData?.[0]?.o1 || 1.89
  );
  const [simBankroll, setSimBankroll] = useState(1000);
  const [simKellyFraction, setSimKellyFraction] = useState(0.5); // 0.25, 0.5, 1.0
  const [copiedFeatureFormat, setCopiedFeatureFormat] = useState(null);

  // New Row State for manual step appending
  const [newRowT, setNewRowT] = useState("2026-11-07 21:10:00");
  const [newRowO1, setNewRowO1] = useState("1.78");
  const [newRowO2, setNewRowO2] = useState("2.02");

  // Helper to persist datasets and selected ID to localStorage
  const persistDatasetsToStorage = (nextDatasets, nextSelectedId = selectedDatasetId) => {
    try {
      localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(nextDatasets));
      localStorage.setItem(STORAGE_KEY_SELECTED_ID, nextSelectedId);
    } catch (e) {
      // Ignore storage quota errors
    }
  };

  // Helper to update the currently active dataset IN-PLACE without changing selectedDatasetId
  const updateActiveDatasetInPlace = (partialUpdates) => {
    const nextDatasets = datasets.map((ds) =>
      ds.id === activeDataset.id ? { ...ds, ...partialUpdates } : ds
    );
    setDatasets(nextDatasets);
    persistDatasetsToStorage(nextDatasets, activeDataset.id);
  };

  // Switch Dataset from Dropdown
  const handleSelectDataset = (nextId) => {
    const target = datasets.find((d) => d.id === nextId);
    if (!target) return;

    setSelectedDatasetId(target.id);
    setRawJsonText(target.rawJsonText);
    setJsonError(null);
    setParseConfirmation(null);

    if (target.movesData && target.movesData.length > 0) {
      setSimEntryOdds(
        simSide === "1" ? target.movesData[0].o1 : target.movesData[0].o2
      );
    }
    try {
      localStorage.setItem(STORAGE_KEY_SELECTED_ID, target.id);
    } catch (e) {}
  };

  // 1. Parse & Apply JSON (Update Current Dataset In-Place — NEVER switches dropdown ID)
  const handleParseAndUpdateCurrent = () => {
    try {
      const { moves, generatedAt } = parseAndAlignMarketJson(rawJsonText);
      const firstMove = moves[0];
      const lastMove = moves[moves.length - 1];

      updateActiveDatasetInPlace({
        movesData: moves,
        rawJsonText,
        generatedAt
      });

      // Automatically sync CLV simulator entryOdds to the new dataset's opening odds
      setSimEntryOdds(simSide === "1" ? firstMove.o1 : firstMove.o2);
      setJsonError(null);
      setParseConfirmation({
        mode: "Updated Current Dataset In-Place",
        datasetName: activeDataset.name,
        generatedAt,
        stepsCount: moves.length,
        open1: firstMove.o1,
        close1: lastMove.o1,
        open2: firstMove.o2,
        close2: lastMove.o2
      });
    } catch (err) {
      setParseConfirmation(null);
      setJsonError(err.message);
    }
  };

  // 2. Parse & Save as New Dataset (Creates new item in dropdown and selects it cleanly)
  const handleParseAndSaveAsNew = () => {
    try {
      const { moves, generatedAt } = parseAndAlignMarketJson(rawJsonText);
      const firstMove = moves[0];
      const lastMove = moves[moves.length - 1];

      const customTitle =
        newDatasetName.trim() ||
        `Market ${generatedAt} (${firstMove.o1.toFixed(2)} → ${lastMove.o1.toFixed(2)})`;

      const newId = `ds_${Date.now()}`;
      const newEntry = {
        id: newId,
        name: customTitle,
        desc: `Custom parsed 2-way market (${moves.length} movement steps).`,
        label1: activeDataset.label1,
        label2: activeDataset.label2,
        generatedAt,
        rawJsonText,
        movesData: moves
      };

      const nextDatasets = [newEntry, ...datasets];
      setDatasets(nextDatasets);
      setSelectedDatasetId(newId);
      setNewDatasetName("");
      persistDatasetsToStorage(nextDatasets, newId);

      // Sync CLV simulator entryOdds to new opening odds
      setSimEntryOdds(simSide === "1" ? firstMove.o1 : firstMove.o2);
      setJsonError(null);
      setParseConfirmation({
        mode: "Saved & Selected New Dataset",
        datasetName: customTitle,
        generatedAt,
        stepsCount: moves.length,
        open1: firstMove.o1,
        close1: lastMove.o1,
        open2: firstMove.o2,
        close2: lastMove.o2
      });
    } catch (err) {
      setParseConfirmation(null);
      setJsonError(err.message);
    }
  };

  // Delete a dataset (if more than 1 exists)
  const handleDeleteDataset = (idToDelete) => {
    if (datasets.length <= 1) return;
    const nextDatasets = datasets.filter((d) => d.id !== idToDelete);
    const nextSelected =
      idToDelete === activeDataset.id ? nextDatasets[0].id : activeDataset.id;
    setDatasets(nextDatasets);
    setSelectedDatasetId(nextSelected);
    const nextActiveObj =
      nextDatasets.find((d) => d.id === nextSelected) || nextDatasets[0];
    setRawJsonText(nextActiveObj.rawJsonText);
    persistDatasetsToStorage(nextDatasets, nextSelected);
  };

  // Reset all datasets back to the 3 factory starter presets
  const handleRestoreDefaultDatasets = () => {
    const defaults = buildStarterDatasets();
    setDatasets(defaults);
    setSelectedDatasetId(defaults[0].id);
    setRawJsonText(defaults[0].rawJsonText);
    setSimEntryOdds(defaults[0].movesData[0].o1);
    setJsonError(null);
    setParseConfirmation(null);
    persistDatasetsToStorage(defaults, defaults[0].id);
  };

  // Add manual move step to active dataset in-place
  const handleAddManualMove = () => {
    const o1 = parseFloat(newRowO1);
    const o2 = parseFloat(newRowO2);
    if (isNaN(o1) || isNaN(o2) || o1 <= 1.01 || o2 <= 1.01) return;
    const updatedMoves = [
      ...activeDataset.movesData,
      {
        t: newRowT.trim() || `Step ${activeDataset.movesData.length + 1}`,
        o1,
        o2
      }
    ];
    updateActiveDatasetInPlace({ movesData: updatedMoves });
  };

  const handleDeleteMove = (idx) => {
    if (activeDataset.movesData.length <= 2) return;
    const updatedMoves = activeDataset.movesData.filter((_, i) => i !== idx);
    updateActiveDatasetInPlace({ movesData: updatedMoves });
  };

  const movesData = activeDataset.movesData;
  const label1 = activeDataset.label1;
  const label2 = activeDataset.label2;

  // ==========================================
  // CORE QUANTITATIVE ENGINE (useMemo)
  // ==========================================
  const analysis = useMemo(() => {
    const sorted = [...movesData]
      .map((item, idx) => ({
        ...item,
        ms: parseTimestampMs(item.t, idx)
      }))
      .sort((a, b) => a.ms - b.ms);

    const startMs = sorted[0]?.ms || 0;

    let reversalCount1 = 0;
    let prevDirection1 = 0;

    const timeline = sorted.map((row, idx) => {
      const devig = calculateDeVig(row.o1, row.o2, vigMethod);
      const elapsedHours = Math.max(0, (row.ms - startMs) / (1000 * 3600));

      let deltaProb1 = 0;
      let dtHours = 0;
      let velocityProb1PerHr = 0;
      let phaseTag = idx === 0 ? "Market Open" : "Consolidation";

      if (idx > 0) {
        const prev = sorted[idx - 1];
        const prevDevig = calculateDeVig(prev.o1, prev.o2, vigMethod);
        deltaProb1 = devig.trueProb1 - prevDevig.trueProb1;
        dtHours = Math.max(0.005, (row.ms - prev.ms) / (1000 * 3600));
        velocityProb1PerHr = deltaProb1 / dtHours;

        const dir = Math.abs(deltaProb1) < 0.05 ? 0 : deltaProb1 > 0 ? 1 : -1;
        if (dir !== 0 && prevDirection1 !== 0 && dir !== prevDirection1) {
          reversalCount1 += 1;
        }
        if (dir !== 0) prevDirection1 = dir;

        // Classify phase tag
        const prevFav = prev.o1 < prev.o2 ? 1 : prev.o2 < prev.o1 ? 2 : 0;
        const currFav = row.o1 < row.o2 ? 1 : row.o2 < row.o1 ? 2 : 0;

        if (prevFav !== 0 && currFav !== 0 && prevFav !== currFav) {
          phaseTag = "Favorite Flip";
        } else if (Math.abs(velocityProb1PerHr) >= 1.5 && Math.abs(deltaProb1) >= 0.4) {
          phaseTag = deltaProb1 > 0 ? "Steam Move (1)" : "Steam Move (2)";
        } else if (devig.overroundPct - prevDevig.overroundPct <= -0.8) {
          phaseTag = "Limit / Vig Drop";
        } else if (Math.abs(deltaProb1) >= 0.6) {
          phaseTag = deltaProb1 > 0 ? "Drift Toward 1" : "Drift Toward 2";
        }
      }

      if (idx === sorted.length - 1 && sorted.length > 1) {
        if (!phaseTag.includes("Steam") && !phaseTag.includes("Flip")) {
          phaseTag = "Closing Line";
        }
      }

      return {
        step: idx + 1,
        timestamp: row.t,
        shortTime: formatShortTime(row.t),
        ms: row.ms,
        elapsedHours: Number(elapsedHours.toFixed(2)),
        odds1: Number(row.o1.toFixed(3)),
        odds2: Number(row.o2.toFixed(3)),
        fairOdds1: Number(devig.fairOdds1.toFixed(3)),
        fairOdds2: Number(devig.fairOdds2.toFixed(3)),
        rawProb1: Number(devig.rawProb1.toFixed(2)),
        rawProb2: Number(devig.rawProb2.toFixed(2)),
        trueProb1: Number(devig.trueProb1.toFixed(2)),
        trueProb2: Number(devig.trueProb2.toFixed(2)),
        overroundPct: Number(devig.overroundPct.toFixed(2)),
        deltaProb1: Number(deltaProb1.toFixed(2)),
        dtHours: Number(dtHours.toFixed(3)),
        velocityProb1PerHr: Number(velocityProb1PerHr.toFixed(2)),
        absVelocity: Number(Math.abs(velocityProb1PerHr).toFixed(2)),
        phaseTag
      };
    });

    const openSnap = timeline[0];
    const closeSnap = timeline[timeline.length - 1];
    const totalDurationHours = Math.max(0.01, closeSnap.elapsedHours - openSnap.elapsedHours);

    // Late window analysis (final 90 minutes before close, or last 3 steps)
    const lateCutoffMs = closeSnap.ms - 90 * 60 * 1000;
    const lateSteps = timeline.filter((s) => s.ms >= lateCutoffMs);
    const lateStartSnap =
      lateSteps.length >= 2
        ? lateSteps[0]
        : timeline[Math.max(0, timeline.length - 3)];

    const lateDriftProb1 = closeSnap.trueProb1 - lateStartSnap.trueProb1;
    const lateWindowHours = Math.max(
      0.05,
      (closeSnap.ms - lateStartSnap.ms) / (1000 * 3600)
    );
    const lateVelocity1 = lateDriftProb1 / lateWindowHours;

    // Favorite flip check
    const openFav = openSnap.odds1 < openSnap.odds2 ? 1 : openSnap.odds2 < openSnap.odds1 ? 2 : 0;
    const closeFav = closeSnap.odds1 < closeSnap.odds2 ? 1 : closeSnap.odds2 < closeSnap.odds1 ? 2 : 0;
    const favoriteFlipped = openFav !== 0 && closeFav !== 0 && openFav !== closeFav;

    // Total drift & vig compression
    const totalProbDrift1 = closeSnap.trueProb1 - openSnap.trueProb1;
    const vigCompression = closeSnap.overroundPct - openSnap.overroundPct; // negative means vig tightened

    // Peak velocity step
    const peakVelocityStep = timeline.reduce(
      (best, cur) => (cur.absVelocity > (best?.absVelocity || 0) ? cur : best),
      timeline[0]
    );

    // Steam intensity index (0 - 100 score combining drift, late velocity, flip, and vig drop)
    const driftScore = Math.min(40, Math.abs(totalProbDrift1) * 6.5);
    const velScore = Math.min(35, Math.abs(lateVelocity1) * 8);
    const flipBonus = favoriteFlipped ? 15 : 0;
    const vigBonus = vigCompression < -0.5 ? Math.min(10, Math.abs(vigCompression) * 4) : 0;
    const steamIndex = Math.round(
      Math.min(100, driftScore + velScore + flipBonus + vigBonus)
    );

    const sharpSide = totalProbDrift1 >= 0 ? 1 : 2;
    const sharpSideLabel = sharpSide === 1 ? label1 : label2;

    // Market Classification Headline
    let classification = "Balanced Two-Way Market";
    if (favoriteFlipped && Math.abs(lateVelocity1) > 1.0) {
      classification = `Late Steam Favorite Inversion → ${sharpSideLabel}`;
    } else if (reversalCount1 >= 2 && Math.abs(totalProbDrift1) < 2.5) {
      classification = `Reverse Line Movement (Buyback Resistance)`;
    } else if (Math.abs(totalProbDrift1) >= 4.0) {
      classification = `Sustained Syndicate Accumulation → ${sharpSideLabel}`;
    } else if (Math.abs(lateVelocity1) >= 1.5) {
      classification = `Late Informed Steam Spike → ${sharpSideLabel}`;
    }

    // Machine Learning Feature Vector
    const mlFeatures = {
      open_odds_1: openSnap.odds1,
      open_odds_2: openSnap.odds2,
      close_odds_1: closeSnap.odds1,
      close_odds_2: closeSnap.odds2,
      open_true_prob_1_pct: openSnap.trueProb1,
      close_true_prob_1_pct: closeSnap.trueProb1,
      fair_closing_odds_1: closeSnap.fairOdds1,
      fair_closing_odds_2: closeSnap.fairOdds2,
      total_prob_drift_1_pct: Number(totalProbDrift1.toFixed(2)),
      late_window_drift_1_pct: Number(lateDriftProb1.toFixed(2)),
      late_window_velocity_pct_hr: Number(lateVelocity1.toFixed(2)),
      peak_step_velocity_pct_hr: peakVelocityStep.velocityProb1PerHr,
      open_overround_vig_pct: openSnap.overroundPct,
      close_overround_vig_pct: closeSnap.overroundPct,
      vig_compression_pct: Number(vigCompression.toFixed(2)),
      favorite_flipped: favoriteFlipped ? 1 : 0,
      reversal_count: reversalCount1,
      total_market_duration_hrs: Number(totalDurationHours.toFixed(2)),
      steam_confidence_score: steamIndex
    };

    return {
      timeline,
      openSnap,
      closeSnap,
      totalProbDrift1,
      lateDriftProb1,
      lateVelocity1,
      favoriteFlipped,
      vigCompression,
      reversalCount1,
      peakVelocityStep,
      steamIndex,
      sharpSide,
      sharpSideLabel,
      classification,
      mlFeatures
    };
  }, [movesData, vigMethod, label1, label2]);

  // ==========================================
  // CLV & EXPECTED VALUE SIMULATOR (useMemo)
  // ==========================================
  const clvSim = useMemo(() => {
    const closeSnap = analysis.closeSnap;
    const isSide1 = simSide === "1";

    const openBookOdds = isSide1 ? analysis.openSnap.odds1 : analysis.openSnap.odds2;
    const closeBookOdds = isSide1 ? closeSnap.odds1 : closeSnap.odds2;
    const closeFairOdds = isSide1 ? closeSnap.fairOdds1 : closeSnap.fairOdds2;
    const closeTrueProb = (isSide1 ? closeSnap.trueProb1 : closeSnap.trueProb2) / 100;

    const userOdds = Math.max(1.01, Number(simEntryOdds) || 1.85);

    // Beat raw book closing price vs beat true no-vig closing line
    const nominalSpreadPct = ((userOdds / closeBookOdds) - 1) * 100;
    const trueClvEvPct = (userOdds * closeTrueProb - 1) * 100;

    // Kelly Criterion: f* = (b*p - q) / b where b = userOdds - 1
    const b = userOdds - 1;
    const q = 1 - closeTrueProb;
    const fullKelly = b > 0 ? Math.max(0, (b * closeTrueProb - q) / b) : 0;
    const recommendedPct = fullKelly * simKellyFraction * 100;
    const recommendedStake = (simBankroll * recommendedPct) / 100;

    const isVigIllusion = userOdds > closeBookOdds && userOdds < closeFairOdds;

    return {
      openBookOdds,
      closeBookOdds,
      closeFairOdds,
      closeTrueProbPct: closeTrueProb * 100,
      userOdds,
      nominalSpreadPct,
      trueClvEvPct,
      recommendedPct,
      recommendedStake,
      isVigIllusion
    };
  }, [analysis, simSide, simEntryOdds, simBankroll, simKellyFraction]);

  // Copy ML features helper
  const handleCopyFeatures = (format) => {
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

  const handleDownloadCsv = () => {
    const headers = [
      "step",
      "timestamp",
      "elapsed_hours",
      "odds_1",
      "odds_2",
      "fair_odds_1",
      "fair_odds_2",
      "true_prob_1_pct",
      "true_prob_2_pct",
      "overround_vig_pct",
      "delta_prob_1_pct",
      "velocity_prob_1_per_hr",
      "phase"
    ];
    const rows = analysis.timeline.map((r) =>
      [
        r.step,
        `"${r.timestamp}"`,
        r.elapsedHours,
        r.odds1,
        r.odds2,
        r.fairOdds1,
        r.fairOdds2,
        r.trueProb1,
        r.trueProb2,
        r.overroundPct,
        r.deltaProb1,
        r.velocityProb1PerHr,
        `"${r.phaseTag}"`
      ].join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `2way_odds_analysis_${vigMethod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

          {/* Unified Dataset Selector, Inline Rename & JSON Drawer Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs gap-1.5">
              <span className="px-2 py-1 text-slate-400 font-medium hidden sm:inline">
                Active Dataset:
              </span>

              {isRenamingInline ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={activeDataset.name}
                    onChange={(e) =>
                      updateActiveDatasetInPlace({ name: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsRenamingInline(false);
                    }}
                    autoFocus
                    className="bg-slate-900 text-emerald-300 font-semibold px-2.5 py-1 rounded border border-emerald-500/70 focus:outline-none w-64"
                  />
                  <button
                    onClick={() => setIsRenamingInline(false)}
                    className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                    title="Finish renaming"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <select
                    value={activeDataset.id}
                    onChange={(e) => handleSelectDataset(e.target.value)}
                    className="bg-slate-900 text-slate-100 font-medium px-2.5 py-1.5 rounded border border-slate-700/80 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[270px] sm:max-w-[330px] truncate"
                  >
                    {datasets.map((ds) => (
                      <option key={ds.id} value={ds.id}>
                        {ds.name} ({ds.movesData.length} steps)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsRenamingInline(true)}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 transition"
                    title="Rename active dataset inline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
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
              <span>{showDataEditor ? "Hide JSON / Editor" : "Paste / Edit JSON"}</span>
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
        {/* EMERALD PARSE CONFIRMATION BANNER          */}
        {/* ========================================== */}
        {parseConfirmation && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-emerald-200 uppercase tracking-wider font-mono">
                    {parseConfirmation.mode}:
                  </span>
                  <span className="font-bold text-white">
                    {parseConfirmation.datasetName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    generated_at: {parseConfirmation.generatedAt}
                  </span>
                </div>
                <p className="text-emerald-100/90 font-mono">
                  {parseConfirmation.stepsCount} movement steps active • {label1}:{" "}
                  <strong>{parseConfirmation.open1.toFixed(2)}</strong> →{" "}
                  <strong>{parseConfirmation.close1.toFixed(2)}</strong> | {label2}:{" "}
                  <strong>{parseConfirmation.open2.toFixed(2)}</strong> →{" "}
                  <strong>{parseConfirmation.close2.toFixed(2)}</strong> (CLV Simulator synced to{" "}
                  {simSide === "1"
                    ? parseConfirmation.open1.toFixed(2)
                    : parseConfirmation.open2.toFixed(2)}
                  )
                </p>
              </div>
            </div>
            <button
              onClick={() => setParseConfirmation(null)}
              className="text-xs font-mono text-emerald-300 hover:text-white px-2.5 py-1 rounded bg-emerald-900/50 border border-emerald-700/50"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* COLLAPSIBLE JSON & DATA EDITOR DRAWER      */}
        {/* ========================================== */}
        {showDataEditor && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  Market JSON Payload & In-Place Dataset Editor
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Editing dataset:{" "}
                  <strong className="text-emerald-300">{activeDataset.name}</strong>. Clicking{" "}
                  <strong>Parse & Apply JSON (Update Current)</strong> updates this dataset in-place without switching your dropdown selection.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Dataset Name:</label>
                  <input
                    type="text"
                    value={activeDataset.name}
                    onChange={(e) =>
                      updateActiveDatasetInPlace({ name: e.target.value })
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-emerald-300 font-semibold w-56"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Side 1:</label>
                  <input
                    type="text"
                    value={label1}
                    onChange={(e) =>
                      updateActiveDatasetInPlace({ label1: e.target.value })
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Side 2:</label>
                  <input
                    type="text"
                    value={label2}
                    onChange={(e) =>
                      updateActiveDatasetInPlace({ label2: e.target.value })
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white w-32"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Raw JSON Input */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Raw JSON Input (`data["1"].moves` & `data["2"].moves`)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRawJsonText("");
                        setJsonError(null);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Clear Textbox
                    </button>
                    <button
                      onClick={handleParseAndUpdateCurrent}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Parse & Apply JSON (Update Current)
                    </button>
                  </div>
                </div>

                <textarea
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  placeholder='Paste {"generated_at":..., "data":{"1":{"moves":[...]}, "2":{"moves":[...]}}} here...'
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

                {/* Second Action: Parse & Save as a Brand-New Dataset in Dropdown */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                      Or Save JSON as a New Dataset in Dropdown ({datasets.length} total)
                    </span>
                    <button
                      onClick={handleRestoreDefaultDatasets}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Reset Defaults
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="New dataset name (e.g., Arsenal vs Chelsea Late Steam)"
                      value={newDatasetName}
                      onChange={(e) => setNewDatasetName(e.target.value)}
                      className="flex-1 min-w-[180px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleParseAndSaveAsNew}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Parse & Save as New Dataset
                    </button>
                  </div>

                  {/* Manage Existing Datasets List */}
                  <div className="max-h-32 overflow-y-auto space-y-1 pt-1">
                    {datasets.map((ds) => {
                      const isCurrent = ds.id === activeDataset.id;
                      return (
                        <div
                          key={ds.id}
                          className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${
                            isCurrent
                              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                              : "bg-slate-900/90 border-slate-800 text-slate-300"
                          }`}
                        >
                          <button
                            onClick={() => handleSelectDataset(ds.id)}
                            className="text-left font-medium truncate flex-1 flex items-center gap-1.5 hover:text-white"
                          >
                            <FolderOpen
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isCurrent ? "text-emerald-400" : "text-slate-500"
                              }`}
                            />
                            <span className="truncate">{ds.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({ds.movesData.length} steps)
                            </span>
                          </button>
                          {datasets.length > 1 && (
                            <button
                              onClick={() => handleDeleteDataset(ds.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Delete dataset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Interactive Quick Step Appender */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Interactive Step Editor ({movesData.length} Timestamps in "{activeDataset.name}")
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-60 overflow-y-auto space-y-1.5">
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
                          updateActiveDatasetInPlace({ movesData: next });
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
                              updateActiveDatasetInPlace({ movesData: next });
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
                              updateActiveDatasetInPlace({ movesData: next });
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
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Zap className="w-3.5 h-3.5" />
                  {analysis.classification}
                </span>
                {analysis.favoriteFlipped && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <RefreshCw className="w-3 h-3" />
                    Favorite Flipped
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  {activeDataset.name} ({movesData.length} moves)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                {activeDataset.desc}{" "}
                <span className="text-slate-400">
                  Closing vig-free probability assigns{" "}
                  <strong className="text-emerald-300 font-mono">
                    {analysis.closeSnap.trueProb1.toFixed(2)}%
                  </strong>{" "}
                  (Fair Odds{" "}
                  <strong className="text-emerald-300 font-mono">
                    {analysis.closeSnap.fairOdds1.toFixed(2)}
                  </strong>
                  ) to {label1} vs{" "}
                  <strong className="text-amber-300 font-mono">
                    {analysis.closeSnap.trueProb2.toFixed(2)}%
                  </strong>{" "}
                  (Fair Odds{" "}
                  <strong className="text-amber-300 font-mono">
                    {analysis.closeSnap.fairOdds2.toFixed(2)}
                  </strong>
                  ) to {label2}.
                </span>
              </p>
            </div>

            {/* Steam Confidence Gauge */}
            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/90 rounded-xl px-4 py-3 shrink-0">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Steam Signal Strength
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {analysis.steamIndex}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 100</span>
                </div>
              </div>
              <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.steamIndex}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 4 SUMMARY KPI CARDS                        */}
        {/* ========================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: True Probability Shift */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Vig-Free True Prob ({label1})</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {analysis.closeSnap.trueProb1.toFixed(2)}%
              </span>
              <span
                className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                  analysis.totalProbDrift1 >= 0
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {analysis.totalProbDrift1 >= 0 ? "+" : ""}
                {analysis.totalProbDrift1.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 pt-2">
              <span>Open: {analysis.openSnap.trueProb1.toFixed(2)}%</span>
              <span>Fair Close: {analysis.closeSnap.fairOdds1.toFixed(2)}</span>
            </div>
          </div>

          {/* Card 2: Late Steam Velocity */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Late Steam Velocity (ΔP/Δt)</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {analysis.lateVelocity1 >= 0 ? "+" : ""}
                {analysis.lateVelocity1.toFixed(2)}%
              </span>
              <span className="text-xs font-mono text-slate-400">/ hour</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 pt-2">
              <span>Late ΔP: {analysis.lateDriftProb1 >= 0 ? "+" : ""}{analysis.lateDriftProb1.toFixed(2)}%</span>
              <span>Peak: {analysis.peakVelocityStep.velocityProb1PerHr}%/h</span>
            </div>
          </div>

          {/* Card 3: Overround / Vig Compression */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Bookmaker Margin (Overround)</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {analysis.closeSnap.overroundPct.toFixed(2)}%
              </span>
              <span
                className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                  analysis.vigCompression <= 0
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {analysis.vigCompression > 0 ? "+" : ""}
                {analysis.vigCompression.toFixed(2)}%
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 pt-2">
              <span>Open Vig: {analysis.openSnap.overroundPct.toFixed(2)}%</span>
              <span>{analysis.vigCompression < -0.5 ? "Limits Raised" : "Stable Vig"}</span>
            </div>
          </div>

          {/* Card 4: Market Structure & Reversals */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Book Close vs No-Vig Fair</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="my-2 flex items-baseline gap-2 font-mono">
              <span className="text-xl font-bold text-emerald-400">
                {analysis.closeSnap.odds1.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">vs</span>
              <span className="text-xl font-bold text-amber-400">
                {analysis.closeSnap.odds2.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 pt-2">
              <span>Fair: {analysis.closeSnap.fairOdds1.toFixed(2)} / {analysis.closeSnap.fairOdds2.toFixed(2)}</span>
              <span>Reversals: {analysis.reversalCount1}</span>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* MAIN CHART + CLV SIMULATOR GRID            */}
        {/* ========================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Multi-Mode Interactive Chart */}
          <div className="lg:col-span-8 bg-slate-900/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            {/* Chart Control Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setChartMode("odds")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    chartMode === "odds"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Decimal Odds
                </button>
                <button
                  onClick={() => setChartMode("prob")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    chartMode === "prob"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Vig-Free True Prob (%)
                </button>
                <button
                  onClick={() => setChartMode("vig_velocity")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    chartMode === "vig_velocity"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Vig % & Steam Velocity
                </button>
              </div>

              {/* Right Controls: De-Vig Method & X-Axis Time Mode */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                  <span className="text-slate-400 mr-1.5">De-Vig:</span>
                  <select
                    value={vigMethod}
                    onChange={(e) => setVigMethod(e.target.value)}
                    className="bg-transparent text-emerald-300 font-mono font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="multiplicative" className="bg-slate-900">
                      Multiplicative
                    </option>
                    <option value="shin" className="bg-slate-900">
                      Shin's Method
                    </option>
                    <option value="power" className="bg-slate-900">
                      Power (Log)
                    </option>
                    <option value="additive" className="bg-slate-900">
                      Additive
                    </option>
                  </select>
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setTimeScaleMode("step")}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${
                      timeScaleMode === "step"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Even Steps
                  </button>
                  <button
                    onClick={() => setTimeScaleMode("realtime")}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${
                      timeScaleMode === "realtime"
                        ? "bg-slate-800 text-cyan-300"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Real Time (Hrs)
                  </button>
                </div>

                {chartMode === "odds" && (
                  <button
                    onClick={() => setShowFairLines(!showFairLines)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition ${
                      showFairLines
                        ? "bg-slate-800 border-slate-600 text-slate-200"
                        : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}
                  >
                    {showFairLines ? "Fair Odds: ON" : "Fair Odds: OFF"}
                  </button>
                )}
              </div>
            </div>

            {/* Recharts Visualization Container */}
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "odds" ? (
                  <LineChart
                    data={analysis.timeline}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey={timeScaleMode === "realtime" ? "elapsedHours" : "shortTime"}
                      type={timeScaleMode === "realtime" ? "number" : "category"}
                      domain={timeScaleMode === "realtime" ? ["dataMin", "dataMax"] : undefined}
                      tickFormatter={(v) =>
                        timeScaleMode === "realtime" ? `${Number(v).toFixed(1)}h` : v
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
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                      labelFormatter={(lbl, payload) => {
                        const row = payload?.[0]?.payload;
                        return row
                          ? `Step #${row.step} • ${row.timestamp} (${row.phaseTag})`
                          : lbl;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Line
                      type="monotone"
                      dataKey="odds1"
                      name={`${label1} (Book)`}
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10b981" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="odds2"
                      name={`${label2} (Book)`}
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#f59e0b" }}
                      activeDot={{ r: 6 }}
                    />
                    {showFairLines && (
                      <Line
                        type="monotone"
                        dataKey="fairOdds1"
                        name={`${label1} (No-Vig Fair)`}
                        stroke="#34d399"
                        strokeWidth={1.75}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                    {showFairLines && (
                      <Line
                        type="monotone"
                        dataKey="fairOdds2"
                        name={`${label2} (No-Vig Fair)`}
                        stroke="#fbbf24"
                        strokeWidth={1.75}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                ) : chartMode === "prob" ? (
                  <LineChart
                    data={analysis.timeline}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey={timeScaleMode === "realtime" ? "elapsedHours" : "shortTime"}
                      type={timeScaleMode === "realtime" ? "number" : "category"}
                      domain={timeScaleMode === "realtime" ? ["dataMin", "dataMax"] : undefined}
                      tickFormatter={(v) =>
                        timeScaleMode === "realtime" ? `${Number(v).toFixed(1)}h` : v
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
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                      labelFormatter={(lbl, payload) => {
                        const row = payload?.[0]?.payload;
                        return row
                          ? `Step #${row.step} • ${row.timestamp} (${row.phaseTag})`
                          : lbl;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <ReferenceLine
                      y={50}
                      stroke="#64748b"
                      strokeDasharray="4 4"
                      label={{
                        value: "50% Pick'em Threshold",
                        fill: "#94a3b8",
                        fontSize: 11,
                        position: "insideTopRight"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="trueProb1"
                      name={`${label1} True Prob (%)`}
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10b981" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="trueProb2"
                      name={`${label2} True Prob (%)`}
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#f59e0b" }}
                    />
                  </LineChart>
                ) : (
                  <ComposedChart
                    data={analysis.timeline}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="shortTime"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#38bdf8"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v.toFixed(1)}%`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#a855f7"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v.toFixed(1)}%/h`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar
                      yAxisId="right"
                      dataKey="velocityProb1PerHr"
                      name={`${label1} Velocity (%/hr)`}
                      fill="#a855f7"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="overroundPct"
                      name="Bookmaker Overround Vig (%)"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#38bdf8" }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Chart Footer Insight */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  {timeScaleMode === "realtime"
                    ? "Real-Time X-Axis reveals how 65+ hours of early drift compare against the sudden 47-minute late steam drop."
                    : "Switch X-Axis to 'Real Time (Hrs)' to see the exact temporal compression of the late steam move."}
                </span>
              </div>
              <span className="font-mono text-slate-300">
                De-Vig Model: <strong className="text-emerald-400 uppercase">{vigMethod}</strong>
              </span>
            </div>
          </div>

          {/* Right 4 Cols: Closing Line Value (CLV) & EV Simulator */}
          <div className="lg:col-span-4 bg-slate-900/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">
                    CLV & Vig Illusion Simulator
                  </h2>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Kelly Sizing
                </span>
              </div>

              {/* Outcome Side Selector */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  1. Select Your Bet Side
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSimSide("1");
                      setSimEntryOdds(analysis.openSnap.odds1);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex flex-col items-center ${
                      simSide === "1"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{label1}</span>
                    <span className="font-mono text-[11px] opacity-80">
                      Open {analysis.openSnap.odds1.toFixed(2)} → Close {analysis.closeSnap.odds1.toFixed(2)}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSimSide("2");
                      setSimEntryOdds(analysis.openSnap.odds2);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex flex-col items-center ${
                      simSide === "2"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{label2}</span>
                    <span className="font-mono text-[11px] opacity-80">
                      Open {analysis.openSnap.odds2.toFixed(2)} → Close {analysis.closeSnap.odds2.toFixed(2)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Entry Odds Slider & Quick-Select Buttons */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">2. Your Entry Decimal Odds</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">
                    {Number(simEntryOdds).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.50"
                  max="2.35"
                  step="0.01"
                  value={simEntryOdds}
                  onChange={(e) => setSimEntryOdds(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    onClick={() => setSimEntryOdds(clvSim.openBookOdds)}
                    className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    Open ({clvSim.openBookOdds.toFixed(2)})
                  </button>
                  <button
                    onClick={() => setSimEntryOdds(Number(clvSim.closeFairOdds.toFixed(2)))}
                    className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-300"
                  >
                    Fair Break-Even ({clvSim.closeFairOdds.toFixed(2)})
                  </button>
                  <button
                    onClick={() => setSimEntryOdds(clvSim.closeBookOdds)}
                    className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    Close ({clvSim.closeBookOdds.toFixed(2)})
                  </button>
                </div>
              </div>

              {/* Results Box */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Book Closing Odds:</span>
                  <span className="font-mono font-semibold text-white">
                    {clvSim.closeBookOdds.toFixed(2)}{" "}
                    <span className="text-slate-500">
                      ({clvSim.nominalSpreadPct >= 0 ? "+" : ""}
                      {clvSim.nominalSpreadPct.toFixed(2)}% nominal)
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Vig-Free Fair Closing Odds:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {clvSim.closeFairOdds.toFixed(3)} ({clvSim.closeTrueProbPct.toFixed(2)}%)
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-200">
                    True Expected Value (EV%):
                  </span>
                  <span
                    className={`text-base font-bold font-mono px-2 py-0.5 rounded ${
                      clvSim.trueClvEvPct > 0
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {clvSim.trueClvEvPct >= 0 ? "+" : ""}
                    {clvSim.trueClvEvPct.toFixed(2)}%
                  </span>
                </div>

                {/* Vig Illusion Alert */}
                {clvSim.isVigIllusion && (
                  <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Vig Illusion Detected:</strong> Your entry ({clvSim.userOdds.toFixed(2)}) beat the raw book close ({clvSim.closeBookOdds.toFixed(2)}), but because of the {analysis.closeSnap.overroundPct.toFixed(2)}% bookmaker vig, the true fair close is{" "}
                      <strong>{clvSim.closeFairOdds.toFixed(2)}</strong>. You need &gt;{" "}
                      {clvSim.closeFairOdds.toFixed(2)} for positive EV.
                    </div>
                  </div>
                )}
              </div>

              {/* Kelly Bankroll Calculator */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Bankroll ($) & Kelly Multiplier:</span>
                  <div className="flex items-center gap-1">
                    {[0.25, 0.5, 1].map((k) => (
                      <button
                        key={k}
                        onClick={() => setSimKellyFraction(k)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          simKellyFraction === k
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 text-slate-400"
                        }`}
                      >
                        {k}x
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="number"
                    value={simBankroll}
                    onChange={(e) => setSimBankroll(Math.max(0, Number(e.target.value)))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                  />
                  <div className="text-right font-mono">
                    <div className="text-[11px] text-slate-400">Optimal Stake</div>
                    <div className="text-sm font-bold text-emerald-400">
                      ${clvSim.recommendedStake.toFixed(2)}{" "}
                      <span className="text-[11px] text-slate-400">
                        ({clvSim.recommendedPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* STEP-BY-STEP ODDS MOVEMENT LEDGER TABLE    */}
        {/* ========================================== */}
        <section className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Chronological Movement Ledger & Velocity Breakdown
              </h2>
              <p className="text-xs text-slate-400">
                Inspect every timestamp transition, bookmaker overround compression, and hourly probability velocity.
              </p>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Ledger CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Book Odds (1 / 2)</th>
                  <th className="py-2.5 px-3">Vig %</th>
                  <th className="py-2.5 px-3">True Prob (1 / 2)</th>
                  <th className="py-2.5 px-3">No-Vig Fair (1 / 2)</th>
                  <th className="py-2.5 px-3">Step ΔP₁</th>
                  <th className="py-2.5 px-3">Velocity (ΔP₁/hr)</th>
                  <th className="py-2.5 px-3">Market Phase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analysis.timeline.map((row) => {
                  const isSteam = row.phaseTag.includes("Steam") || row.phaseTag.includes("Flip");
                  return (
                    <tr
                      key={row.step}
                      className={`hover:bg-slate-800/40 transition ${
                        isSteam ? "bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-500">{row.step}</td>
                      <td className="py-2.5 px-3 text-slate-200 whitespace-nowrap">
                        {row.timestamp}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-400 font-bold">
                          {row.odds1.toFixed(2)}
                        </span>{" "}
                        <span className="text-slate-600">/</span>{" "}
                        <span className="text-amber-400 font-bold">
                          {row.odds2.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">
                        {row.overroundPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-300">
                          {row.trueProb1.toFixed(2)}%
                        </span>{" "}
                        <span className="text-slate-600">/</span>{" "}
                        <span className="text-amber-300">
                          {row.trueProb2.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {row.fairOdds1.toFixed(2)} / {row.fairOdds2.toFixed(2)}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          row.deltaProb1 > 0
                            ? "text-emerald-400"
                            : row.deltaProb1 < 0
                            ? "text-rose-400"
                            : "text-slate-500"
                        }`}
                      >
                        {row.deltaProb1 > 0 ? "+" : ""}
                        {row.deltaProb1.toFixed(2)}%
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          Math.abs(row.velocityProb1PerHr) >= 1.5
                            ? "text-purple-300"
                            : "text-slate-400"
                        }`}
                      >
                        {row.velocityProb1PerHr > 0 ? "+" : ""}
                        {row.velocityProb1PerHr.toFixed(2)}%/h
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                            row.phaseTag.includes("Flip")
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : row.phaseTag.includes("Steam")
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : row.phaseTag.includes("Vig")
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {row.phaseTag}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================== */}
        {/* ML FEATURE VECTOR EXTRACTOR PANEL          */}
        {/* ========================================== */}
        <section className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Engineered Machine Learning Feature Vector (XGBoost / LightGBM Ready)
              </h2>
              <p className="text-xs text-slate-400">
                19 extracted quantitative features summarizing probability drift, steam velocity, vig compression, and market reversals.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyFeatures("json")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                {copiedFeatureFormat === "json" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedFeatureFormat === "json" ? "Copied JSON!" : "Copy JSON"}</span>
              </button>
              <button
                onClick={() => handleCopyFeatures("csv")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                {copiedFeatureFormat === "csv" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedFeatureFormat === "csv" ? "Copied CSV Row!" : "Copy CSV Row"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Object.entries(analysis.mlFeatures).map(([key, val]) => (
              <div
                key={key}
                className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono text-slate-400 truncate" title={key}>
                  {key}
                </span>
                <span className="text-sm font-mono font-bold text-emerald-300 mt-1">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}