const hiddenValueQuadrantSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 540,
  title: {
    text: "Opportunity Map · Hidden High-Value Destinations",
    subtitle: [
      "The green target zone marks regions with lower visitor volume but above-median per-visitor spend.",
      "Bubble size encodes nights per visitor — longer stays signal stronger engagement."
    ]
  },
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
      data: { values: [{ x0: 0, x1: 212925, y0: 0, y1: 1860 }] },
      mark: { type: "rect", color: "#f1ede5", opacity: 0.55 },
      encoding: {
        x: { field: "x0", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        x2: { field: "x1" },
        y: { field: "y0", type: "quantitative", scale: { domain: [0, 3600] } },
        y2: { field: "y1" }
      }
    },
    {
      data: { values: [{ x0: 212925, x1: 4000000, y0: 0, y1: 1860 }] },
      mark: { type: "rect", color: "#ebe5f2", opacity: 0.55 },
      encoding: {
        x: { field: "x0", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        x2: { field: "x1" },
        y: { field: "y0", type: "quantitative", scale: { domain: [0, 3600] } },
        y2: { field: "y1" }
      }
    },
    {
      data: { values: [{ x0: 212925, x1: 4000000, y0: 1860, y1: 3600 }] },
      mark: { type: "rect", color: "#fff0e2", opacity: 0.55 },
      encoding: {
        x: { field: "x0", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        x2: { field: "x1" },
        y: { field: "y0", type: "quantitative", scale: { domain: [0, 3600] } },
        y2: { field: "y1" }
      }
    },
    {
      data: { values: [{ x0: 0, x1: 212925, y0: 1860, y1: 3600 }] },
      mark: {
        type: "rect",
        color: "#daedde",
        opacity: 0.92,
        stroke: "#7CB59E",
        strokeWidth: 1.8,
        strokeDash: [6, 4]
      },
      encoding: {
        x: { field: "x0", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        x2: { field: "x1" },
        y: { field: "y0", type: "quantitative", scale: { domain: [0, 3600] } },
        y2: { field: "y1" }
      }
    },
    {
      data: {
        values: [
          { label: "TARGET ZONE", x: 5000, y: 3520, color: "#2f7d64" },
          { label: "Gateway regions", x: 1500000, y: 3380, color: "#8f5a33" },
          { label: "Lower priority", x: 42000, y: 360, color: "#8c8173" },
          { label: "Popular, lower value", x: 1250000, y: 360, color: "#6c6aa8" }
        ]
      },
      mark: {
        type: "text",
        align: "left",
        baseline: "middle",
        font: "Inter",
        fontSize: 12,
        fontWeight: "bold",
        opacity: 0.78
      },
      encoding: {
        x: { field: "x", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "y", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "label" },
        color: { field: "color", type: "nominal", scale: null, legend: null }
      }
    },
    {
      data: { values: [{ median_visitors: 212925 }] },
      mark: { type: "rule", strokeDash: [5, 5], color: "#7d8794", strokeWidth: 1.2, opacity: 0.72 },
      encoding: {
        x: {
          field: "median_visitors",
          type: "quantitative",
          scale: { type: "sqrt", domain: [0, 4000000] }
        }
      }
    },
    {
      data: { values: [{ median_spend: 1860 }] },
      mark: { type: "rule", strokeDash: [5, 5], color: "#7d8794", strokeWidth: 1.2, opacity: 0.72 },
      encoding: {
        y: {
          field: "median_spend",
          type: "quantitative",
          scale: { domain: [0, 3600] }
        }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.quadrant !== 'Hidden high-value'" }],
      mark: { type: "circle", opacity: 0.72, stroke: "#fffdf8", strokeWidth: 1.4 },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        size: {
          field: "nights_per_visitor",
          type: "quantitative",
          title: "Nights per visitor",
          scale: { range: [60, 700] },
          legend: {
            orient: "bottom-right",
            offset: 4,
            symbolType: "circle",
            labelFontSize: 10,
            titleFontSize: 11,
            symbolStrokeColor: "#fffdf8",
            symbolFillColor: "#bdb7ac",
            values: [10, 20, 35]
          }
        },
        color: {
          field: "quadrant",
          type: "nominal",
          legend: null,
          scale: {
            domain: ["Hidden high-value", "Mass gateway", "Popular lower-value", "Lower priority"],
            range: ["#1B9E77", "#D95F02", "#7570B3", "#CFC6BA"]
          }
        },
        tooltip: [
          { field: "region", title: "Region" },
          { field: "state_code", title: "State" },
          { field: "quadrant", title: "Quadrant" },
          { field: "visitors", type: "quantitative", title: "Visitors", format: ",.0f" },
          { field: "spend_per_visitor", type: "quantitative", title: "Spend per visitor", format: "$,.0f" },
          { field: "nights_per_visitor", type: "quantitative", title: "Nights per visitor", format: ".1f" }
        ]
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.quadrant === 'Hidden high-value'" }],
      mark: { type: "circle", fill: "#1B9E77", opacity: 0.18, stroke: null },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        size: {
          field: "nights_per_visitor",
          type: "quantitative",
          scale: { range: [320, 1800] },
          legend: null
        }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.quadrant === 'Hidden high-value'" }],
      mark: { type: "circle", fill: "#1B9E77", opacity: 0.98, stroke: "#fffdf8", strokeWidth: 2.8 },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        size: {
          field: "nights_per_visitor",
          type: "quantitative",
          scale: { range: [140, 900] },
          legend: null
        },
        tooltip: [
          { field: "region", title: "Region" },
          { field: "state_code", title: "State" },
          { field: "visitors", type: "quantitative", title: "Visitors", format: ",.0f" },
          { field: "spend_per_visitor", type: "quantitative", title: "Spend per visitor", format: "$,.0f" },
          { field: "nights_per_visitor", type: "quantitative", title: "Nights per visitor", format: ".1f" },
          { field: "hidden_value_score", type: "quantitative", title: "Hidden-value score", format: "+.0f" }
        ]
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [
        { filter: "datum.quadrant === 'Hidden high-value'" },
        { calculate: "toNumber(datum.hidden_value_score)", as: "hidden_value_score" },
        { window: [{ op: "rank", as: "pick_rank" }], sort: [{ field: "hidden_value_score", order: "descending" }] },
        { filter: "datum.pick_rank == 1" }
      ],
      mark: {
        type: "point",
        shape: "diamond",
        size: 1500,
        filled: false,
        stroke: "#C9A227",
        strokeWidth: 2.2,
        opacity: 0.95
      },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [
        { filter: "datum.quadrant === 'Hidden high-value'" },
        { calculate: "toNumber(datum.hidden_value_score)", as: "hidden_value_score" },
        { window: [{ op: "rank", as: "pick_rank" }], sort: [{ field: "hidden_value_score", order: "descending" }] },
        { filter: "datum.pick_rank == 1" }
      ],
      mark: {
        type: "text",
        dy: -38,
        align: "center",
        baseline: "middle",
        font: "Inter",
        fontSize: 9.5,
        fontWeight: 800,
        color: "#A07E0E"
      },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { value: "★  TOP PICK  ★" }
      }
    },
    {
      data: { values: [{ x: 212925, y: 3550, label: "median visitor volume" }] },
      mark: { type: "text", dx: 8, dy: 0, align: "left", baseline: "top", fontSize: 11, color: "#6b7280" },
      encoding: {
        x: { field: "x", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "y", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "label" }
      }
    },
    {
      data: { values: [{ x: 3850000, y: 1860, label: "median spend" }] },
      mark: { type: "text", dx: -8, dy: -8, align: "right", baseline: "bottom", fontSize: 11, color: "#6b7280" },
      encoding: {
        x: { field: "x", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "y", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "label" }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.region === 'Mallee'" }],
      mark: { type: "text", dx: 12, dy: -10, align: "left", baseline: "bottom", fontSize: 12, fontWeight: "bold", color: "#1f2933" },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "region" }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.region === 'Queensland Country'" }],
      mark: { type: "text", dx: 10, dy: -20, align: "left", baseline: "bottom", fontSize: 11, fontWeight: "bold", color: "#1f2933" },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "region" }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.region === 'Central NSW'" }],
      mark: { type: "text", dx: -12, dy: 16, align: "right", baseline: "top", fontSize: 11, fontWeight: "bold", color: "#1f2933" },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "region" }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.region === 'Darwin'" }],
      mark: { type: "text", dx: 12, dy: 14, align: "left", baseline: "top", fontSize: 11, fontWeight: "bold", color: "#1f2933" },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "region" }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.region === 'Sydney'" }],
      mark: {
        type: "text",
        dx: -8,
        dy: -10,
        align: "right",
        baseline: "bottom",
        fontSize: 11,
        fontWeight: "bold",
        color: "#1f2933"
      },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "region" }
      }
    },
    {
      data: { url: "data/region_hotspots_2025.csv" },
      transform: [{ filter: "datum.region === 'Melbourne'" }],
      mark: {
        type: "text",
        dx: 8,
        dy: 12,
        align: "left",
        baseline: "top",
        fontSize: 11,
        fontWeight: "bold",
        color: "#1f2933"
      },
      encoding: {
        x: { field: "visitors", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
        y: { field: "spend_per_visitor", type: "quantitative", scale: { domain: [0, 3600] } },
        text: { field: "region" }
      }
    }
  ],
  view: { stroke: null },
  config: {
    ...BASE_CONFIG,
    axis: {
      ...BASE_CONFIG.axis,
      gridColor: "#e6ddcf",
      gridOpacity: 0.55
    }
  }
};

embedIfExists("hidden_value_quadrant_chart", hiddenValueQuadrantSpec);
