const popularityValueBubbleSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 470,
  data: { url: "data/region_hotspots_2025.csv" },
  params: [
    {
      name: "focus_state",
      value: "All",
      bind: {
        input: "select",
        name: "Focus state: ",
        options: ["All", "NSW", "VIC", "QLD", "WA", "SA", "ACT", "TAS", "NT"]
      }
    },
  ],
  title: {
    text: "Popularity Does Not Always Equal Value",
    subtitle: ["X-axis shows international visitors; Y-axis shows spend per visitor.", "Bubble area = total expenditure. Position shows volume vs per-visitor spend."]
  },
  transform: [
    {
      calculate:
        "datum.region === 'Sydney' || datum.region === 'Melbourne' ? 'Major gateway' : 'Other top-20 region'",
      as: "story_group"
    },
    {
      calculate:
        "focus_state === 'All' || datum.state_code === focus_state ? 'Selected focus' : 'Outside focus'",
      as: "focus_group"
    },
    {
      calculate:
        "focus_state === 'All' || datum.state_code === focus_state ? 0.9 : 0.16",
      as: "focus_opacity"
    },
    {
      calculate:
        "focus_state === 'All' || datum.state_code === focus_state ? 2.1 : 0.7",
      as: "focus_stroke"
    },
    {
      calculate:
        "focus_state !== 'All' && datum.state_code === focus_state && datum.region !== 'Sydney' && datum.region !== 'Melbourne' ? 'Selected state region' : datum.region === 'Sydney' || datum.region === 'Melbourne' ? 'Major gateway' : 'Other top-20 region'",
      as: "display_group"
    }
  ],
  layer: [
    {
      data: { values: [{ ax: 0, ay: 0 }, { ax: 4000000, ay: 3600 }] },
      mark: { type: "point", opacity: 0, size: 0 },
      encoding: {
        x: {
          field: "ax",
          type: "quantitative",
          title: "International visitors (sqrt scale)",
          scale: { type: "sqrt", domain: [0, 4000000] },
          axis: {
            values: [0, 50000, 100000, 250000, 500000, 1000000, 2000000, 4000000],
            labelExpr: "datum.value == 0 ? '0' : datum.value >= 1000000 ? format(datum.value/1000000, '.1f') + 'M' : format(datum.value/1000, '.0f') + 'k'",
            labelAngle: 0,
            grid: true,
            titleFontSize: 13,
            titleFontWeight: 700,
            titlePadding: 14,
            labelFontSize: 11,
            labelColor: "#1f2933",
            domainColor: "#b8aa99",
            tickColor: "#b8aa99"
          }
        },
        y: {
          field: "ay",
          type: "quantitative",
          title: "Spend per visitor ($)",
          scale: { domain: [0, 3600] },
          axis: {
            values: [0, 800, 1600, 2400, 3200],
            format: "$,.0f",
            grid: true,
            titleFontSize: 13,
            titleFontWeight: 700,
            titlePadding: 14,
            labelFontSize: 11,
            labelColor: "#1f2933",
            domainColor: "#b8aa99",
            tickColor: "#b8aa99"
          }
        }
      }
    },
    {
      data: {
        values: [
          { x0: 0, x1: 4000000, y0: 1860, y1: 3600 }
        ]
      },
      mark: {
        type: "rect",
        color: "#fff0e2",
        opacity: 0.48
      },
      encoding: {
        x: { field: "x0", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        x2: { field: "x1" },
        y: { field: "y0", type: "quantitative", scale: { domain: [0, 3600] } },
        y2: { field: "y1" }
      }
    },
    {
      data: { values: [{ median_spend: 1860 }] },
      mark: { type: "rule", strokeDash: [5, 5], color: "#7d8794", strokeWidth: 1.1, opacity: 0.75 },
      encoding: {
        y: {
          field: "median_spend",
          type: "quantitative",
          scale: { domain: [0, 3600] }
        }
      }
    },
    {
      mark: {
        type: "circle",
        stroke: "#fffdf8",
        cursor: "pointer"
      },
      params: [
        { name: "hover", select: { type: "point", on: "pointerover", clear: "pointerout", fields: ["region"] } }
      ],
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        size: {
          field: "expenditure_m",
          type: "quantitative",
          scale: { type: "sqrt", range: [80, 2200] },
          legend: null
        },
        color: {
          field: "display_group",
          type: "nominal",
          legend: {
            title: null,
            orient: "bottom",
            direction: "horizontal"
          },
          scale: {
            domain: ["Major gateway", "Selected state region", "Other top-20 region"],
            range: ["#D95F02", "#5A84C9", "#CFC6BA"]
          }
        },
        opacity: {
          condition: { param: "hover", value: 1 },
          field: "focus_opacity",
          type: "quantitative",
          legend: null
        },
        strokeWidth: {
          condition: { param: "hover", value: 2.5 },
          field: "focus_stroke",
          type: "quantitative",
          legend: null
        },
        tooltip: [
          { field: "region", title: "Region" },
          { field: "state_code", title: "State" },
          { field: "story_group", title: "Group" },
          { field: "visitors", type: "quantitative", title: "International visitors", format: ",.0f" },
          { field: "spend_per_visitor", type: "quantitative", title: "Spend per visitor", format: "$,.0f" },
          { field: "expenditure_m", type: "quantitative", title: "Total expenditure ($m)", format: ",.0f" },
          { field: "nights_per_visitor", type: "quantitative", title: "Nights per visitor", format: ".1f" }
        ]
      }
    },
    {
      data: {
        values: [
          { region: "Sydney", dx: -10, dy: -12, align: "right", baseline: "bottom" },
          { region: "Melbourne", dx: 8, dy: 12, align: "left", baseline: "top" },
          { region: "Mallee", dx: 10, dy: -12, align: "left", baseline: "bottom" },
          { region: "Queensland Country", dx: 10, dy: -16, align: "left", baseline: "bottom" },
          { region: "Central NSW", dx: -10, dy: 14, align: "right", baseline: "top" },
          { region: "Darwin", dx: 10, dy: 14, align: "left", baseline: "top" }
        ]
      },
      mark: {
        type: "text",
        fontSize: 11,
        fontWeight: "bold",
        color: "#1f2933"
      },
      transform: [
        {
          lookup: "region",
          from: {
            data: { url: "data/region_hotspots_2025.csv" },
            key: "region",
            fields: ["visitors", "spend_per_visitor", "state_code"]
          }
        },
        {
          filter: "focus_state === 'All' || datum.state_code === focus_state || datum.region === 'Sydney' || datum.region === 'Melbourne'"
        }
      ],
      encoding: {
        x: {
          field: "visitors",
          type: "quantitative",
          scale: { type: "sqrt", domain: [0, 4000000] }
        },
        y: {
          field: "spend_per_visitor",
          type: "quantitative",
          scale: { domain: [0, 3600] }
        },
        text: { field: "region" },
        dx: { field: "dx" },
        dy: { field: "dy" },
        align: { field: "align" },
        baseline: { field: "baseline" }
      }
    },
    {
      data: {
        values: [
          { x: 3850000, y: 1860, label: "median spend" },
          { x: 1350000, y: 3370, label: "above-median visitor value" }
        ]
      },
      mark: {
        type: "text",
        fontSize: 11,
        fontWeight: "bold",
        color: "#8f5a33",
        align: "right",
        baseline: "bottom"
      },
      encoding: {
        x: { field: "x", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "y", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "label" }
      }
    }
  ],
  view: { stroke: null },
  config: {
    ...BASE_CONFIG,
    axis: {
      ...BASE_CONFIG.axis,
      domainColor: "#9b8f81",
      tickColor: "#9b8f81",
      labelColor: "#1f2933",
      titleColor: "#1f2933",
      gridColor: "#e6ddcf",
      gridOpacity: 0.58
    },
    legend: {
      ...BASE_CONFIG.legend,
      labelFontSize: 12,
      titleFontSize: 12
    }
  }
};

function renderPopularityBubbleChart() {
  const container = document.getElementById("popularity_value_bubble_chart");
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:0;">
      <div id="popularity_bubble_inner" style="flex:1 1 100%;min-width:0;transition:flex 500ms cubic-bezier(.4,0,.2,1);"></div>
      <div id="popularity_detail_panel" style="flex:0 0 0;overflow:hidden;opacity:0;transform:translateX(30px);transition:flex 500ms cubic-bezier(.4,0,.2,1),opacity 400ms ease 60ms,transform 400ms cubic-bezier(.4,0,.2,1) 40ms;display:flex;align-items:center;"></div>
    </div>
  `;

  const spec = addInlineAnnotations(popularityValueBubbleSpec, "popularity_value_bubble_chart");
  const panel = document.getElementById("popularity_detail_panel");
  let activeRegion = null;

  renderAnimatedChart("#popularity_bubble_inner", spec).then(result => {
    if (!result) return;
    const view = result.view;

    view.addEventListener("click", (event, item) => {
      if (!item || !item.datum || !item.datum.region) {
        hidePanel();
        return;
      }
      const d = item.datum;
      if (activeRegion === d.region) { hidePanel(); return; }
      activeRegion = d.region;
      showPanel(d);
    });
  });

  function showPanel(d) {
    const visitors = d.visitors >= 1000000
      ? (d.visitors / 1000000).toFixed(1) + "M"
      : Math.round(d.visitors / 1000) + "k";
    const spend = "$" + Math.round(d.spend_per_visitor).toLocaleString();
    const nights = Number(d.nights_per_visitor).toFixed(1);
    const expend = "$" + Number(d.expenditure_m).toFixed(0) + "M";
    const isGateway = d.region === "Sydney" || d.region === "Melbourne";
    const tagColor = isGateway ? "#D95F02" : "#5A84C9";
    const tagLabel = isGateway ? "Gateway" : d.state_code;
    const spendRatio = Math.min(d.spend_per_visitor / 3200, 1);
    const nightsRatio = Math.min(d.nights_per_visitor / 65, 1);
    const visitRatio = Math.min(d.visitors / 4000000, 1);

    panel.innerHTML = `
      <div style="background:#fffdf8;border-radius:14px;padding:20px 18px;min-width:220px;max-width:260px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border:1px solid #e8e2d7;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#1f2933;">${d.region}</span>
          <span style="background:${tagColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;">${tagLabel}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr;gap:10px;font-family:'Inter',sans-serif;">
          ${metricRow("Visitors", visitors, visitRatio, "#7570B3")}
          ${metricRow("Spend/visitor", spend, spendRatio, "#D95F02")}
          ${metricRow("Nights/visitor", nights, nightsRatio, "#F28E2B")}
          ${metricRow("Total expenditure", expend, d.expenditure_m / 14000, "#2a6e4f")}
        </div>
        <div style="margin-top:14px;font-size:11px;color:#6b7280;line-height:1.4;">
          ${d.spend_per_visitor > 1860
            ? "Above-median spend per visitor — a high-value destination."
            : "Below-median spend per visitor — volume-driven destination."}
        </div>
      </div>
    `;

    const mapInner = document.getElementById("popularity_bubble_inner");
    mapInner.style.flex = "1 1 62%";
    panel.style.flex = "0 0 280px";
    panel.style.opacity = "1";
    panel.style.transform = "translateX(0)";
  }

  function metricRow(label, value, ratio, color) {
    const barW = Math.max(ratio * 100, 4);
    return `<div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
        <span style="color:#6b7280;font-weight:500;">${label}</span>
        <span style="color:#1f2933;font-weight:700;">${value}</span>
      </div>
      <div style="height:6px;background:#ebe3d7;border-radius:3px;overflow:hidden;">
        <div style="width:${barW}%;height:100%;background:${color};border-radius:3px;transition:width 400ms ease;"></div>
      </div>
    </div>`;
  }

  function hidePanel() {
    activeRegion = null;
    const mapInner = document.getElementById("popularity_bubble_inner");
    mapInner.style.flex = "1 1 100%";
    panel.style.flex = "0 0 0";
    panel.style.opacity = "0";
    panel.style.transform = "translateX(30px)";
  }
}

renderPopularityBubbleChart();
