const waffleGrid = [
  ["Brisbane","Brisbane","Brisbane","Brisbane","Brisbane","Brisbane","Brisbane","Brisbane","Brisbane","Brisbane"],
  ["Brisbane","Destination Perth","Destination Perth","Destination Perth","Destination Perth","Destination Perth","Destination Perth","Destination Perth","Gold Coast","Gold Coast"],
  ["Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Gold Coast","Gold Coast","Gold Coast"],
  ["Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne"],
  ["All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","Melbourne","Melbourne","Melbourne","Melbourne","Melbourne"],
  ["All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions"],
  ["All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions","All other top-20 regions"],
  ["Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney"],
  ["Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney"],
  ["Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney","Sydney"]
];

const groupShareMap = {
  Sydney: "30%",
  "All other top-20 regions": "25%",
  Melbourne: "22%",
  Brisbane: "11%",
  "Destination Perth": "7%",
  "Gold Coast": "5%"
};

const waffleData = [];
waffleGrid.forEach((rowArr, rowIndex) => {
  rowArr.forEach((group, colIndex) => {
    waffleData.push({ group, pct_label: groupShareMap[group], row: rowIndex, col: colIndex });
  });
});

const waffleSummaryData = [
  { group: "Sydney", share: "30%", order: 1 },
  { group: "All other top-20 regions", share: "25%", order: 2 },
  { group: "Melbourne", share: "22%", order: 3 },
  { group: "Brisbane", share: "11%", order: 4 },
  { group: "Destination Perth", share: "7%", order: 5 },
  { group: "Gold Coast", share: "5%", order: 6 }
];

const WAFFLE_DOMAIN = ["Sydney", "All other top-20 regions", "Melbourne", "Brisbane", "Destination Perth", "Gold Coast"];
const WAFFLE_RANGE = [REGION_RANGE[0], REGION_RANGE[10], REGION_RANGE[1], REGION_RANGE[2], REGION_RANGE[3], REGION_RANGE[4]];

/* ── advanced interactive waffle chart (chart 06) ── */
function renderConcentrationWaffle() {
  const container = document.getElementById("concentration_share_chart");
  if (!container) return;

  const CELL = 42, GAP = 4, COLS = 10, ROWS = 10, R = 6;
  const gridW = COLS * (CELL + GAP) - GAP;
  const gridH = ROWS * (CELL + GAP) - GAP;
  const colorMap = {};
  WAFFLE_DOMAIN.forEach((g, i) => { colorMap[g] = WAFFLE_RANGE[i]; });
  const shareNum = { Sydney: 30, Melbourne: 22, Brisbane: 11, "Destination Perth": 7, "Gold Coast": 5, "All other top-20 regions": 25 };
  const insightMap = {
    Sydney: "Nearly 1 in 3 visitors head to Sydney — the single largest pressure point.",
    Melbourne: "Melbourne adds another 22%, meaning over half of all visitors go to just two cities.",
    "All other top-20 regions": "The remaining 14 regions together still attract fewer visitors than Sydney alone.",
    Brisbane: "Brisbane acts as a gateway to Queensland but captures only 11% of attention.",
    "Destination Perth": "Perth receives 7% despite being Australia's fourth-largest city.",
    "Gold Coast": "Gold Coast draws just 5%, suggesting room to absorb more demand."
  };

  /* build HTML */
  container.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "display:flex;align-items:flex-start;gap:36px;flex-wrap:wrap;justify-content:center;";

  /* left: waffle SVG */
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${gridW} ${gridH}`);
  svg.setAttribute("width", gridW);
  svg.setAttribute("height", gridH);
  svg.style.cssText = "display:block;max-width:100%;";

  const cells = [];
  waffleData.forEach(d => {
    const x = d.col * (CELL + GAP);
    const y = d.row * (CELL + GAP);
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x); rect.setAttribute("y", y);
    rect.setAttribute("width", CELL); rect.setAttribute("height", CELL);
    rect.setAttribute("rx", R); rect.setAttribute("ry", R);
    rect.setAttribute("fill", colorMap[d.group]);
    rect.style.cssText = "transition:opacity 250ms ease,transform 200ms ease;transform-origin:" + (x + CELL/2) + "px " + (y + CELL/2) + "px;";
    rect.dataset.group = d.group;
    svg.appendChild(rect);
    cells.push({ el: rect, group: d.group });
  });

  /* annotation overlay using foreignObject for word-wrapped insight */
  const annoG = document.createElementNS(svgNS, "g");
  annoG.setAttribute("pointer-events", "none");
  annoG.style.cssText = "opacity:0;transition:opacity 220ms ease;";

  const annoBg = document.createElementNS(svgNS, "rect");
  annoBg.setAttribute("rx", 10); annoBg.setAttribute("ry", 10);
  annoBg.setAttribute("fill", "rgba(31,41,51,0.92)");
  annoG.appendChild(annoBg);

  const annoFO = document.createElementNS(svgNS, "foreignObject");
  const annoDiv = document.createElement("div");
  annoDiv.style.cssText = "padding:10px 14px;color:#fff;font-family:Inter,system-ui,sans-serif;box-sizing:border-box;";
  annoFO.appendChild(annoDiv);
  annoG.appendChild(annoFO);

  svg.appendChild(annoG);

  /* compute center of each group's cells for annotation placement */
  const orderedGroups = ["Sydney", "Melbourne", "All other top-20 regions", "Brisbane", "Destination Perth", "Gold Coast"];
  const groupCenters = {};
  orderedGroups.forEach(g => {
    const gc = waffleData.filter(d => d.group === g);
    const cx = gc.reduce((s, d) => s + d.col * (CELL + GAP) + CELL / 2, 0) / gc.length;
    const cy = gc.reduce((s, d) => s + d.row * (CELL + GAP) + CELL / 2, 0) / gc.length;
    groupCenters[g] = { cx, cy, count: gc.length };
  });

  function showAnnotation(group) {
    if (!group) { annoG.style.opacity = "0"; annoG.style.visibility = "hidden"; annoDiv.innerHTML = ""; return; }
    const c = groupCenters[group];
    const boxW = 230, boxH = 110;
    let bx = Math.max(4, Math.min(c.cx - boxW / 2, gridW - boxW - 4));
    let by = Math.max(4, Math.min(c.cy - boxH / 2, gridH - boxH - 4));
    annoBg.setAttribute("x", bx); annoBg.setAttribute("y", by);
    annoBg.setAttribute("width", boxW); annoBg.setAttribute("height", boxH);
    annoFO.setAttribute("x", bx); annoFO.setAttribute("y", by);
    annoFO.setAttribute("width", boxW); annoFO.setAttribute("height", boxH);
    annoDiv.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;">
        <span style="font-size:28px;font-weight:800;line-height:1;">${shareNum[group]}%</span>
        <span style="font-size:13px;font-weight:600;opacity:0.85;">${group}</span>
      </div>
      <div style="font-size:11.5px;line-height:1.45;color:rgba(255,255,255,0.82);">${insightMap[group]}</div>
    `;
    annoG.style.visibility = "visible";
    annoG.style.opacity = "1";
  }

  wrapper.appendChild(svg);

  /* right: legend cards */
  const legend = document.createElement("div");
  legend.style.cssText = "display:flex;flex-direction:column;gap:8px;min-width:200px;padding-top:4px;";

  const cards = {};
  orderedGroups.forEach(g => {
    const card = document.createElement("div");
    card.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;cursor:pointer;transition:background 200ms ease,box-shadow 200ms ease,transform 180ms ease;background:transparent;";
    const swatch = document.createElement("div");
    swatch.style.cssText = `width:18px;height:18px;border-radius:4px;background:${colorMap[g]};flex-shrink:0;transition:transform 200ms ease;`;
    const info = document.createElement("div");
    info.style.cssText = "display:flex;flex-direction:column;gap:1px;";
    const name = document.createElement("span");
    name.style.cssText = "font-size:13px;font-weight:600;color:#1f2933;line-height:1.3;";
    name.textContent = g;
    const pct = document.createElement("span");
    pct.style.cssText = "font-size:22px;font-weight:800;color:" + colorMap[g] + ";line-height:1.1;transition:opacity 200ms ease;";
    pct.textContent = shareNum[g] + "%";
    info.appendChild(name);
    info.appendChild(pct);
    card.appendChild(swatch);
    card.appendChild(info);
    legend.appendChild(card);
    cards[g] = { card, swatch, pct };
  });
  wrapper.appendChild(legend);
  container.appendChild(wrapper);

  /* interaction: hover highlight */
  let activeGroup = null;
  function highlight(group) {
    if (group === activeGroup) return;
    activeGroup = group;
    showAnnotation(group);
    cells.forEach(c => {
      if (group && c.group !== group) {
        c.el.style.opacity = "0.18";
        c.el.style.transform = "scale(0.92)";
      } else {
        c.el.style.opacity = "1";
        c.el.style.transform = group === c.group ? "scale(1.06)" : "scale(1)";
      }
    });
    orderedGroups.forEach(g => {
      const cd = cards[g];
      if (group && g === group) {
        cd.card.style.background = "rgba(0,0,0,0.04)";
        cd.card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        cd.card.style.transform = "translateX(4px)";
        cd.swatch.style.transform = "scale(1.2)";
      } else {
        cd.card.style.background = "transparent";
        cd.card.style.boxShadow = "none";
        cd.card.style.transform = "translateX(0)";
        cd.swatch.style.transform = "scale(1)";
        cd.pct.style.opacity = group ? "0.35" : "1";
      }
      if (!group) cd.pct.style.opacity = "1";
    });
  }

  /* attach events to SVG cells */
  svg.addEventListener("pointerover", e => {
    const g = e.target.dataset && e.target.dataset.group;
    if (g) highlight(g);
  });
  svg.addEventListener("pointerleave", () => highlight(null));

  /* attach events to legend cards */
  orderedGroups.forEach(g => {
    cards[g].card.addEventListener("pointerenter", () => highlight(g));
    cards[g].card.addEventListener("pointerleave", () => highlight(null));
  });
}

renderConcentrationWaffle();
