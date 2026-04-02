// Configuration OSD Constants and helpers
// Used to define module minimums, groupings, and layout formatting

export const OSD_CONFIG = {
  // Config for A1 (as seen in official certificate images)
  A1: {
    schriftlich: {
      label: "Schriftliche Prüfung",
      min: 38,
      max: 75,
      // We list the expected module codes and their specific rules
      modules: {
        LESE: { label: "Lesen", min: 6, max: 30 },
        HORE: { label: "Hören", min: 6, max: 30 },
        SCHR1: { label: "Schreiben 1", min: 0, max: 5 },
        SCHR2: { label: "Schreiben 2", min: 4, max: 10 },
        // If DB has one combined "Schreiben" for A1
        SCHR: { label: "Schreiben", min: 4, max: 15 },
      }
    },
    muendlich: {
      label: "Mündliche Prüfung",
      min: 12,
      max: 25,
      modules: {
        SPRE: { label: "Sprechen", min: 12, max: 25 }
      }
    },
    total: { min: 50, max: 100 }
  },
  
  // Generic Fallback configuration for other levels (e.g. B1, B2)
  // Usually B1/B2 have 4 standalone modules each on 100 points, min 60.
  // We define it generally.
  DEFAULT: {
    schriftlich: {
      label: "Schriftliche Prüfung",
      min: 0, // Fallbacks
      max: 0,
      modules: {
        LESE: { label: "Lesen", min: 60, max: 100 },
        HORE: { label: "Hören", min: 60, max: 100 },
        SCHR: { label: "Schreiben", min: 60, max: 100 },
      }
    },
    muendlich: {
      label: "Mündliche Prüfung",
      min: 0,
      max: 0,
      modules: {
        SPRE: { label: "Sprechen", min: 60, max: 100 }
      }
    },
    total: { min: 60, max: 100 } // Or whatever fallback
  }
};

/**
 * Helper to process flat module scores from the DB into structured ÖSD groups
 * returns: { schriftlich: { modules: [], total, max, min, passed }, muendlich: {...}, total, passed }
 */
export function formatOSDResults(level, dbModuleScores) {
  const config = OSD_CONFIG[level] || OSD_CONFIG.DEFAULT;

  const grouped = {
    schriftlich: {
      label: config.schriftlich.label,
      modules: [],
      score: 0,
      max: 0,
    },
    muendlich: {
      label: config.muendlich.label,
      modules: [],
      score: 0,
      max: 0,
    },
  };

  // Sort modules into groups
  dbModuleScores.forEach(ms => {
    // Normalise code (e.g., 'LESE', 'HORE_A1', etc).
    const code = ms.moduleCode.toUpperCase();
    
    // Check where it belongs
    if (code.includes("SPRE")) {
      const rule = config.muendlich.modules[code] || config.muendlich.modules.SPRE || { label: ms.moduleName, min: 0, max: ms.maxScore };
      grouped.muendlich.modules.push({ ...ms, minScore: rule.min, osdLabel: rule.label });
      grouped.muendlich.score += ms.score;
      grouped.muendlich.max += ms.maxScore;
    } else {
      // Everything else typically goes to Written (Lesen, Hören, Schreiben)
      let rule = config.schriftlich.modules[code];
      if (!rule) {
        if (code.includes("LES")) rule = config.schriftlich.modules.LESE;
        else if (code.includes("HOR")) rule = config.schriftlich.modules.HORE;
        else if (code.includes("SCH")) rule = config.schriftlich.modules.SCHR;
        else rule = { label: ms.moduleName, min: 0, max: ms.maxScore };
      }
      
      grouped.schriftlich.modules.push({ ...ms, minScore: rule.min, osdLabel: rule.label });
      grouped.schriftlich.score += ms.score;
      grouped.schriftlich.max += ms.maxScore;
    }
  });

  // Calculate Bestanden/Nicht bestanden
  // For A1, the total written must be >= 38
  const reqMinSchrift = config.schriftlich.min > 0 ? config.schriftlich.min : (grouped.schriftlich.max * 0.6); // Fallback to 60%
  grouped.schriftlich.min = reqMinSchrift;
  grouped.schriftlich.passed = grouped.schriftlich.score >= reqMinSchrift && grouped.schriftlich.modules.length > 0;

  const reqMinMuendlich = config.muendlich.min > 0 ? config.muendlich.min : (grouped.muendlich.max * 0.6);
  grouped.muendlich.min = reqMinMuendlich;
  grouped.muendlich.passed = grouped.muendlich.score >= reqMinMuendlich && grouped.muendlich.modules.length > 0;

  // Global Total
  const totalScore = grouped.schriftlich.score + grouped.muendlich.score;
  const totalMax = grouped.schriftlich.max + grouped.muendlich.max;
  
  // Specific OSD total rule check (e.g. A1 requires both passed)
  const isGlobalPassed = grouped.schriftlich.passed && grouped.muendlich.passed;

  return {
    schriftlich: grouped.schriftlich,
    muendlich: grouped.muendlich,
    total: {
      score: totalScore,
      max: totalMax,
      min: config.total.min,
      passed: isGlobalPassed
    }
  };
}
