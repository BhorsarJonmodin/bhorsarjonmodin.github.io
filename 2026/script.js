/**
 * ============================================================================
 * MOROCCAN ZELIJ BACKGROUND & SCROLLABLE FLOATING BOXES GENERATOR
 * ============================================================================
 */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
   * 1. DOM REFERENCES & APPLICATION STATE
   * -------------------------------------------------------------------------- */

  // Zelij Canvas
  const canvas = document.getElementById("zelij-canvas");
  const ctx = canvas.getContext("2d");

  // Thin Rectangle and scrolling container
  const blueOffsetRectEl = document.getElementById("moroccan-blue-offset-rect");
  const floatingBoxesContainer = document.getElementById("floating-boxes-container");

  // Zelij tiles colour palette
  const PALETTES = {
    imperialBurgundy: {
      grout: "#3b0764",          // Deep royal amethyst purple joints
      purpleTile: "#6b21a8",     // Luminous Moroccan purple interstitial tiles
      centerStar: "#103778",     // Deep Fez cobalt star body
      innerRosette: "#8b1e3f",   // Rich velvet burgundy inner rosette petals
      petals: "#6e1022",         // Deep imperial burgundy radiating petal rosette
      crossArms: "#f5efe6",      // Warm bone ivory cross arms
      cornerStar: "#5a0b18",     // Dark aged burgundy corner star quarters
      diamonds: "#16697a",       // Moroccan teal strapwork lozenges
      moroccanBlue: "#0f52ba"    // Moroccan cobalt blue for offset rectangle
    },
    crimsonMajorelle: {
      grout: "#4c1d95",          // Deep violet mortar joints
      purpleTile: "#7e22ce",     // Vibrant amethyst purple interstitial tiles
      centerStar: "#154c79",     // Atlas Mediterranean blue
      innerRosette: "#9e1b32",   // Bright ruby-burgundy inner rosette
      petals: "#780f24",         // Royal wine burgundy petal rosettes
      crossArms: "#fbf6ec",      // Crisp parchment white
      cornerStar: "#c9972b",     // Saffron ochre corner stars
      diamonds: "#1d3557",       // Deep indigo diamonds
      moroccanBlue: "#1560bd"    // Vibrant Majorelle blue for offset rectangle
    },
    andalusianGarnet: {
      grout: "#3b0764",          // Deep plum-purple joints
      purpleTile: "#581c87",     // Imperial purple interstitial tiles
      centerStar: "#0f5c44",     // Islamic emerald star body
      innerRosette: "#91172c",   // Claret burgundy inner rosette
      petals: "#660d1e",         // Deep garnet-burgundy petal rosettes
      crossArms: "#f3ede2",      // Carved stucco ivory
      cornerStar: "#7a1426",     // Burgundy-garnet corner stars
      diamonds: "#d49b27",       // Honey amber diamonds
      moroccanBlue: "#0047ab"    // Cobalt Moroccan blue for offset rectangle
    },
    royalMarrakech: {
      grout: "#4a044e",          // Deep Byzantine purple joints
      purpleTile: "#701a75",     // Rich orchid-purple interstitial tiles
      centerStar: "#1b4965",     // Deep slate-azure star
      innerRosette: "#a41623",   // Carmine-burgundy inner rosette
      petals: "#6b0f1a",         // Mulberry burgundy petal rosettes
      crossArms: "#faedcd",      // Warm desert limestone
      cornerStar: "#590d22",     // Dark plum-burgundy corner stars
      diamonds: "#2a6f97",       // Cerulean ceramic diamonds
      moroccanBlue: "#1155cc"    // Luminous Moroccan blue for offset rectangle
    }
  };

  // State object
  const state = {
    paletteKey: "imperialBurgundy",
    rectOffset: 32,              // Inset distance from viewport boundaries in px
    rectThickness: 4.0,          // Line thickness of Moroccan blue rectangle in px
    cellSize: 160,               // Repeating tile cell size in px
    goldLineWidth: 1.0,          // Merged golden outline stroke width in px
    seed: 2048,                  // Glaze variation seed
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    cachedPolygons: []
  };

  /* --------------------------------------------------------------------------
   * 2. GLAZE TONE & COLOR CALCULATION HELPERS
   * -------------------------------------------------------------------------- */

  function pseudoRandom(col, row, polyIndex, seed) {
    let n = col * 374761393 + row * 668265263 + polyIndex * 1442695041 + seed * 982451653;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967296;
  }

  function shadeHexColor(hex, luminanceDelta) {
    const cleanHex = hex.replace("#", "");
    const num = parseInt(cleanHex, 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(255 * luminanceDelta)));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * luminanceDelta)));
    const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * luminanceDelta)));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /* --------------------------------------------------------------------------
   * 3. ZELIJ GEOMETRY CONSTRUCTION
   * -------------------------------------------------------------------------- */

  function buildCellPolygons(cx, cy, S) {
    const polygons = [];
    const half = S * 0.5;

    // 0. Base square cell polygon
    polygons.push({
      role: "purpleTile",
      points: [
        { x: cx - half, y: cy - half },
        { x: cx + half, y: cy - half },
        { x: cx + half, y: cy + half },
        { x: cx - half, y: cy + half }
      ]
    });

    const rInnerHub = S * 0.045;
    const rCoreTip = S * 0.125;
    const rStarValley = S * 0.168;
    const rStarTip = S * 0.285;
    const rPetalMid = S * 0.382;
    const rPetalTip = S * 0.468;

    // 1. Central 8-pointed star base polygon
    const starPoints = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const radius = i % 2 === 0 ? rStarTip : rStarValley;
      starPoints.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
    polygons.push({
      role: "centerStar",
      points: starPoints
    });

    // 2. Inner 8-petal burgundy floral rosette jewel
    for (let i = 0; i < 8; i++) {
      const aCenter = (i * Math.PI) / 4;
      const aLeft = aCenter - Math.PI / 8;
      const aRight = aCenter + Math.PI / 8;

      polygons.push({
        role: "innerRosette",
        points: [
          {
            x: cx + Math.cos(aCenter) * (rInnerHub * 0.45),
            y: cy + Math.sin(aCenter) * (rInnerHub * 0.45)
          },
          {
            x: cx + Math.cos(aLeft) * (rCoreTip * 0.58),
            y: cy + Math.sin(aLeft) * (rCoreTip * 0.58)
          },
          {
            x: cx + Math.cos(aCenter) * rCoreTip,
            y: cy + Math.sin(aCenter) * rCoreTip
          },
          {
            x: cx + Math.cos(aRight) * (rCoreTip * 0.58),
            y: cy + Math.sin(aRight) * (rCoreTip * 0.58)
          }
        ]
      });
    }

    // 3. Outer 8 radiating burgundy petal rosettes ('saft')
    for (let i = 0; i < 8; i++) {
      const aCenter = (i * Math.PI) / 4 + Math.PI / 8;
      const aLeft = (i * Math.PI) / 4;
      const aRight = ((i + 1) * Math.PI) / 4;

      const valleyPt = {
        x: cx + Math.cos(aCenter) * rStarValley,
        y: cy + Math.sin(aCenter) * rStarValley
      };
      const leftStarTip = {
        x: cx + Math.cos(aLeft) * rStarTip,
        y: cy + Math.sin(aLeft) * rStarTip
      };
      const rightStarTip = {
        x: cx + Math.cos(aRight) * rStarTip,
        y: cy + Math.sin(aRight) * rStarTip
      };
      const leftShoulder = {
        x: cx + Math.cos(aCenter - 0.19) * rPetalMid,
        y: cy + Math.sin(aCenter - 0.19) * rPetalMid
      };
      const outerTip = {
        x: cx + Math.cos(aCenter) * rPetalTip,
        y: cy + Math.sin(aCenter) * rPetalTip
      };
      const rightShoulder = {
        x: cx + Math.cos(aCenter + 0.19) * rPetalMid,
        y: cy + Math.sin(aCenter + 0.19) * rPetalMid
      };

      polygons.push({
        role: "petals",
        points: [
          valleyPt,
          leftStarTip,
          leftShoulder,
          outerTip,
          rightShoulder,
          rightStarTip
        ]
      });
    }

    // 4. Interlocking cross arms & strapwork diamonds
    for (let i = 0; i < 8; i++) {
      const aAxis = (i * Math.PI) / 4;
      const aPrev = aAxis - Math.PI / 8;
      const aNext = aAxis + Math.PI / 8;

      const starTip = {
        x: cx + Math.cos(aAxis) * rStarTip,
        y: cy + Math.sin(aAxis) * rStarTip
      };
      const leftShoulder = {
        x: cx + Math.cos(aPrev + 0.19) * rPetalMid,
        y: cy + Math.sin(aPrev + 0.19) * rPetalMid
      };
      const leftPetalTip = {
        x: cx + Math.cos(aPrev) * rPetalTip,
        y: cy + Math.sin(aPrev) * rPetalTip
      };
      const rightShoulder = {
        x: cx + Math.cos(aNext - 0.19) * rPetalMid,
        y: cy + Math.sin(aNext - 0.19) * rPetalMid
      };
      const rightPetalTip = {
        x: cx + Math.cos(aNext) * rPetalTip,
        y: cy + Math.sin(aNext) * rPetalTip
      };

      const reachRadius = i % 2 === 0 ? half : half * Math.SQRT2 * 0.76;
      const outerApex = {
        x: cx + Math.cos(aAxis) * reachRadius,
        y: cy + Math.sin(aAxis) * reachRadius
      };

      polygons.push({
        role: i % 2 === 0 ? "crossArms" : "diamonds",
        points: [
          starTip,
          leftShoulder,
          leftPetalTip,
          outerApex,
          rightPetalTip,
          rightShoulder
        ]
      });
    }

    // 5. Corner burgundy rosette quarters
    const corners = [
      { x: cx - half, y: cy - half, baseAngle: 0 },
      { x: cx + half, y: cy - half, baseAngle: Math.PI * 0.5 },
      { x: cx + half, y: cy + half, baseAngle: Math.PI },
      { x: cx - half, y: cy + half, baseAngle: Math.PI * 1.5 }
    ];

    const cornerReach = S * 0.24;

    corners.forEach((corner) => {
      const a0 = corner.baseAngle;
      const aDiag = corner.baseAngle + Math.PI / 4;
      const a1 = corner.baseAngle + Math.PI / 2;

      polygons.push({
        role: "cornerStar",
        points: [
          { x: corner.x, y: corner.y },
          {
            x: corner.x + Math.cos(a0) * cornerReach,
            y: corner.y + Math.sin(a0) * cornerReach
          },
          {
            x: corner.x + Math.cos(aDiag) * cornerReach,
            y: corner.y + Math.sin(aDiag) * cornerReach
          },
          {
            x: corner.x + Math.cos(a1) * cornerReach,
            y: corner.y + Math.sin(a1) * cornerReach
          }
        ]
      });
    });

    return polygons;
  }

  function computeViewportTessellation() {
    const S = state.cellSize;
    const cols = Math.ceil(state.viewportWidth / S) + 2;
    const rows = Math.ceil(state.viewportHeight / S) + 2;

    const offsetX = (state.viewportWidth - (cols - 2) * S) * 0.5;
    const offsetY = (state.viewportHeight - (rows - 2) * S) * 0.5;

    const allPolygons = [];

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const cx = offsetX + col * S + S * 0.5;
        const cy = offsetY + row * S + S * 0.5;
        const cellPolys = buildCellPolygons(cx, cy, S);

        for (let idx = 0; idx < cellPolys.length; idx++) {
          const poly = cellPolys[idx];
          const rand = pseudoRandom(col + 50, row + 50, idx, state.seed);
          const glazeDelta = (rand - 0.5) * 0.12;

          let sumX = 0;
          let sumY = 0;
          for (let p = 0; p < poly.points.length; p++) {
            sumX += poly.points[p].x;
            sumY += poly.points[p].y;
          }

          allPolygons.push({
            role: poly.role,
            points: poly.points,
            glazeDelta: glazeDelta,
            centerX: sumX / poly.points.length,
            centerY: sumY / poly.points.length
          });
        }
      }
    }

    state.cachedPolygons = allPolygons;
  }

  /* --------------------------------------------------------------------------
   * 4. CANVAS RENDERING
   * -------------------------------------------------------------------------- */

  function tracePolygonPath(targetCtx, points) {
    targetCtx.beginPath();
    targetCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      targetCtx.lineTo(points[i].x, points[i].y);
    }
    targetCtx.closePath();
  }

  function syncMoroccanBlueRectangleStyle() {
    const palette = PALETTES[state.paletteKey] || PALETTES.imperialBurgundy;
    document.documentElement.style.setProperty("--rect-offset", `${state.rectOffset}px`);
    document.documentElement.style.setProperty("--rect-thickness", `${state.rectThickness}px`);
    document.documentElement.style.setProperty("--moroccan-blue", palette.moroccanBlue);
    if (blueOffsetRectEl) {
      blueOffsetRectEl.style.borderColor = palette.moroccanBlue;
    }
  }


  function renderMergedZelijCanvas() {
    const palette = PALETTES[state.paletteKey] || PALETTES.imperialBurgundy;
    const width = state.viewportWidth;
    const height = state.viewportHeight;

    syncMoroccanBlueRectangleStyle();

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // STEP A: Paint the full-viewport royal purple ceramic tile base
    ctx.fillStyle = palette.purpleTile || "#6b21a8";
    ctx.fillRect(0, 0, width, height);

    const polys = state.cachedPolygons;
    const tileRadius = state.cellSize * 0.18;

    // STEP B: Render hand-glazed ceramic tile polygons with radial lighting
    for (let i = 0; i < polys.length; i++) {
      const poly = polys[i];
      const baseHex = palette[poly.role] || palette.crossArms;
      const glazedColor = shadeHexColor(baseHex, poly.glazeDelta);

      tracePolygonPath(ctx, poly.points);

      const isBurgundyRosette = poly.role === "petals" || poly.role === "innerRosette";
      const highlightBoost = isBurgundyRosette ? 0.11 : 0.07;

      const grad = ctx.createRadialGradient(
        poly.centerX - tileRadius * 0.22,
        poly.centerY - tileRadius * 0.22,
        tileRadius * 0.04,
        poly.centerX,
        poly.centerY,
        tileRadius * 1.3
      );
      grad.addColorStop(0, shadeHexColor(baseHex, poly.glazeDelta + highlightBoost));
      grad.addColorStop(0.68, glazedColor);
      grad.addColorStop(1, shadeHexColor(baseHex, poly.glazeDelta - 0.09));

      ctx.fillStyle = grad;
      ctx.fill();

      // Mortar joint bevel
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.strokeStyle = palette.grout;
      ctx.stroke();
    }

    // STEP C: Render Moroccan blue rectangular border on canvas
    const offset = state.rectOffset;
    const thickness = state.rectThickness;
    const rectW = Math.max(0, width - offset * 2);
    const rectH = Math.max(0, height - offset * 2);

    if (rectW > 0 && rectH > 0) {
      ctx.strokeStyle = palette.moroccanBlue;
      ctx.lineWidth = thickness;
      ctx.strokeRect(
        offset + thickness * 0.5,
        offset + thickness * 0.5,
        rectW - thickness,
        rectH - thickness
      );
    }

    // Build a crisp 24k metallic gold linear gradient across the canvas
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0.0, "#b8860b");
    goldGrad.addColorStop(0.25, "#f3e5ab");
    goldGrad.addColorStop(0.5, "#d4af37");
    goldGrad.addColorStop(0.75, "#fff8dc");
    goldGrad.addColorStop(1.0, "#996515");

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = state.goldLineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // 1. Batch trace all tile boundaries in gold
    ctx.beginPath();
    for (let i = 0; i < polys.length; i++) {
      const pts = polys[i].points;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length; j++) {
        ctx.lineTo(pts[j].x, pts[j].y);
      }
      ctx.closePath();
    }
    ctx.stroke();

    // 2. Trace fine inner golden filigree inside burgundy petal rosettes
    ctx.beginPath();
    ctx.lineWidth = Math.max(0.45, state.goldLineWidth * 0.6);
    ctx.globalAlpha = 0.78;
    for (let i = 0; i < polys.length; i++) {
      const poly = polys[i];
      if (poly.role === "petals" || poly.role === "centerStar") {
        const pts = poly.points;
        const insetFactor = 0.8;
        ctx.moveTo(
          poly.centerX + (pts[0].x - poly.centerX) * insetFactor,
          poly.centerY + (pts[0].y - poly.centerY) * insetFactor
        );
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(
            poly.centerX + (pts[j].x - poly.centerX) * insetFactor,
            poly.centerY + (pts[j].y - poly.centerY) * insetFactor
          );
        }
        ctx.closePath();
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 3. Trace outer and inner golden borders of the Moroccan blue offset rectangle
    if (rectW > thickness * 2 && rectH > thickness * 2) {
      ctx.lineWidth = state.goldLineWidth;
      ctx.strokeRect(offset, offset, rectW, rectH);
      ctx.strokeRect(
        offset + thickness,
        offset + thickness,
        rectW - thickness * 2,
        rectH - thickness * 2
      );
    }

    ctx.restore();
  }

  /* --------------------------------------------------------------------------
   * 5. VIEWPORT RESIZING & FLOATING BOX DIMENSION ENFORCEMENT
   * -------------------------------------------------------------------------- */


  function resizeViewport() {
    state.viewportWidth = window.innerWidth;
    state.viewportHeight = window.innerHeight;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(state.viewportWidth * state.dpr);
    canvas.height = Math.floor(state.viewportHeight * state.dpr);

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    computeViewportTessellation();
    renderMergedZelijCanvas();

    enforceFloatingBoxViewportLimits();
  }


  function enforceFloatingBoxViewportLimits() {
    // Viewport boundary limits removed: boxes are not clamped to viewport dimensions
    const boxes = document.querySelectorAll(".zelij-floating-box");
    boxes.forEach((box) => {
      box.style.maxWidth = "none";
      box.style.maxHeight = "none";
    });
  }

  /* --------------------------------------------------------------------------
   * 6. FLOATING BOX INTERACTIVITY & EVENT LISTENERS
   * -------------------------------------------------------------------------- */

  // Helper mapping box theme classes to Bengali metadata descriptions
  const THEME_LABELS = {
    "theme-purple": { translucent: "স্বচ্ছ জাম রঙের থিম (Purple)", opaque: "সলিড জাম রঙের থিম (Purple)" },
    "theme-burgundy": { translucent: "স্বচ্ছ বার্গান্ডি থিম (Burgundy)", opaque: "সলিড বার্গান্ডি থিম (Burgundy)" },
    "theme-blue": { translucent: "স্বচ্ছ মরোক্কান নীল থিম (Blue)", opaque: "সলিড মরোক্কান নীল থিম (Blue)" },
    "theme-ivory": { translucent: "স্বচ্ছ হাতির দাঁতের থিম (Ivory)", opaque: "সলিড হাতির দাঁতের থিম (Ivory)" }
  };

  function updateBoxMeta(box, isOpaque) {
    const metaEl = box.querySelector(".floating-box-meta");
    if (!metaEl) return;
    for (const [themeClass, labels] of Object.entries(THEME_LABELS)) {
      if (box.classList.contains(themeClass)) {
        metaEl.textContent = isOpaque ? labels.opaque : labels.translucent;
        return;
      }
    }
    metaEl.textContent = isOpaque ? "কঠিন মোড (Opaque)" : "স্বচ্ছ মোড (Translucent)";
  }




  // Window resize handler
  window.addEventListener("resize", resizeViewport);

  /* --------------------------------------------------------------------------
   * 7. INITIALIZE ON LOAD
   * -------------------------------------------------------------------------- */
  resizeViewport();
})();
