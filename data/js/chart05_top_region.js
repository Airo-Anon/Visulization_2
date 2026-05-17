const topRegionMapSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 620,
  height: 400,
  title: {
    text: "Where are the main hotspots?",
    subtitle: "Illustrative visitor flow across the most recognisable tourism corridor",
    anchor: "start",
    fontSize: 16,
    subtitleFontSize: 12,
    fontWeight: "bold",
    color: "#1f2933",
    subtitleColor: "#4b5563"
  },
  projection: {
    type: "mercator",
    center: [134, -28],
    scale: 540,
    translate: [310, 210]
  },
  layer: [
    {
      data: {
        url: "data/LGA_2025_AUST_GDA2020.json",
        format: { type: "topojson", feature: "LGA_2025_AUST_GDA2020" }
      },
      mark: {
        type: "geoshape",
        fill: "#e8e1d7",
        stroke: "#f8f6f1",
        strokeWidth: 0.35
      }
    },
    {
      data: {
        values: [
          { segment: "1→2", pt_order: 1, lon: 115.8605, lat: -31.9505 },
          { segment: "1→2", pt_order: 2, lon: 129.0, lat: -34.1 },
          { segment: "1→2", pt_order: 3, lon: 144.9631, lat: -37.8136 },

          { segment: "2→3", pt_order: 1, lon: 144.9631, lat: -37.8136 },
          { segment: "2→3", pt_order: 2, lon: 148.1, lat: -36.4 },
          { segment: "2→3", pt_order: 3, lon: 151.2093, lat: -33.8688 },

          { segment: "3→4", pt_order: 1, lon: 151.2093, lat: -33.8688 },
          { segment: "3→4", pt_order: 2, lon: 152.0, lat: -30.6 },
          { segment: "3→4", pt_order: 3, lon: 153.4000, lat: -28.0167 },

          { segment: "4→5", pt_order: 1, lon: 153.4000, lat: -28.0167 },
          { segment: "4→5", pt_order: 2, lon: 153.28, lat: -27.72 },
          { segment: "4→5", pt_order: 3, lon: 153.0251, lat: -27.4698 }
        ]
      },
      mark: {
        type: "line",
        stroke: "#d95f02",
        strokeWidth: 4,
        strokeCap: "round",
        strokeJoin: "round",
        opacity: 0.95
      },
      encoding: {
        longitude: { field: "lon", type: "quantitative" },
        latitude: { field: "lat", type: "quantitative" },
        detail: { field: "segment" },
        order: { field: "pt_order", type: "quantitative" }
      }
    },
    {
      data: {
        values: [
          { segment: "1→2", label_lon: 129.4, label_lat: -36.3 },
          { segment: "2→3", label_lon: 148.0, label_lat: -37.4 },
          { segment: "3→4", label_lon: 151.4, label_lat: -30.8 },
          { segment: "4→5", label_lon: 152.35, label_lat: -27.15 }
        ]
      },
      layer: [
        {
          mark: {
            type: "text",
            fontSize: 9.5,
            fontWeight: "bold",
            color: "#fffdf8",
            stroke: "#fffdf8",
            strokeWidth: 4,
            strokeJoin: "round"
          },
          encoding: {
            longitude: { field: "label_lon", type: "quantitative" },
            latitude: { field: "label_lat", type: "quantitative" },
            text: { field: "segment" }
          }
        },
        {
          mark: {
            type: "text",
            fontSize: 9.5,
            fontWeight: "bold",
            color: "#d95f02"
          },
          encoding: {
            longitude: { field: "label_lon", type: "quantitative" },
            latitude: { field: "label_lat", type: "quantitative" },
            text: { field: "segment" }
          }
        }
      ]
    },
    {
      data: {
        values: [
          { step: "1", region: "Perth", lon: 115.8605, lat: -31.9505, color: REGION_RANGE[3] },
          { step: "2", region: "Melbourne", lon: 144.9631, lat: -37.8136, color: REGION_RANGE[1] },
          { step: "3", region: "Sydney", lon: 151.2093, lat: -33.8688, color: REGION_RANGE[0] },
          { step: "4", region: "Gold Coast", lon: 153.4000, lat: -28.0167, color: REGION_RANGE[4] },
          { step: "5", region: "Brisbane", lon: 153.0251, lat: -27.4698, color: REGION_RANGE[2] }
        ]
      },
      mark: {
        type: "circle",
        size: 210,
        opacity: 1,
        stroke: "#ffffff",
        strokeWidth: 2.2
      },
      encoding: {
        longitude: { field: "lon", type: "quantitative" },
        latitude: { field: "lat", type: "quantitative" },
        color: { field: "color", type: "nominal", scale: null, legend: null },
        tooltip: [
          { field: "step", title: "Route step" },
          { field: "region", title: "Destination" }
        ]
      }
    },
    {
      data: {
        values: [
          { step: "1", lon: 115.8605, lat: -31.9505 },
          { step: "2", lon: 144.9631, lat: -37.8136 },
          { step: "3", lon: 151.2093, lat: -33.8688 },
          { step: "4", lon: 153.4000, lat: -28.0167 },
          { step: "5", lon: 153.0251, lat: -27.4698 }
        ]
      },
      mark: {
        type: "text",
        fontSize: 10.5,
        fontWeight: "bold",
        color: "#ffffff",
        align: "center",
        baseline: "middle"
      },
      encoding: {
        longitude: { field: "lon", type: "quantitative" },
        latitude: { field: "lat", type: "quantitative" },
        text: { field: "step" }
      }
    },
    {
      data: {
        values: [
          { label: "Perth", lon: 115.8605, lat: -31.9505, label_lon: 116.95, label_lat: -31.5, align: "left", baseline: "bottom" },
          { label: "Melbourne", lon: 144.9631, lat: -37.8136, label_lon: 145.95, label_lat: -38.55, align: "left", baseline: "top" },
          { label: "Sydney", lon: 151.2093, lat: -33.8688, label_lon: 152.25, label_lat: -33.95, align: "left", baseline: "middle" },
          { label: "Brisbane +\nGold Coast", lon: 153.22, lat: -27.75, label_lon: 155.05, label_lat: -26.85, align: "left", baseline: "middle" }
        ]
      },
      layer: [
        {
          mark: {
            type: "line",
            stroke: "#8b7d6b",
            strokeWidth: 1,
            opacity: 0.85
          },
          transform: [
            { fold: ["start", "end"], as: ["point_type", "point_value"] },
            {
              calculate: "datum.point_type === 'start' ? datum.lon : datum.label_lon",
              as: "line_lon"
            },
            {
              calculate: "datum.point_type === 'start' ? datum.lat : datum.label_lat",
              as: "line_lat"
            },
            {
              calculate: "datum.point_type === 'start' ? 0 : 1",
              as: "line_order"
            }
          ],
          encoding: {
            longitude: { field: "line_lon", type: "quantitative" },
            latitude: { field: "line_lat", type: "quantitative" },
            detail: { field: "label" },
            order: { field: "line_order", type: "quantitative" }
          }
        },
        {
          mark: {
            type: "text",
            fontSize: 10,
            fontWeight: "bold",
            lineBreak: "\n",
            color: "#fffdf8",
            stroke: "#fffdf8",
            strokeWidth: 5,
            strokeJoin: "round"
          },
          encoding: {
            longitude: { field: "label_lon", type: "quantitative" },
            latitude: { field: "label_lat", type: "quantitative" },
            text: { field: "label" },
            align: { field: "align" },
            baseline: { field: "baseline" }
          }
        },
        {
          mark: {
            type: "text",
            fontSize: 10,
            fontWeight: "bold",
            lineBreak: "\n",
            color: "#1f2933"
          },
          encoding: {
            longitude: { field: "label_lon", type: "quantitative" },
            latitude: { field: "label_lat", type: "quantitative" },
            text: { field: "label" },
            align: { field: "align" },
            baseline: { field: "baseline" }
          }
        }
      ]
    }
  ],
  config: {
    view: { stroke: null },
    legend: { labelFontSize: 11, titleFontSize: 11 }
  }
};

function buildTopRegionStateBarSpec() {
  return {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 620,
    "height": 300,
    "title": {
      "text": "How much bigger are they?",
      "subtitle": "International visitor trips aggregated by state",
      "anchor": "start",
      "fontSize": 16,
      "subtitleFontSize": 12,
      "fontWeight": "bold",
      "color": "#1f2933",
      "subtitleColor": "#4b5563"
    },
    "data": { "url": "data/region_hotspots_2025.csv" },
    "transform": [
      {
        "aggregate": [{ "op": "sum", "field": "visitors", "as": "state_visitors" }],
        "groupby": ["state_code"]
      },
      {
        "window": [{ "op": "rank", "as": "sort_rank" }],
        "sort": [{ "field": "state_visitors", "order": "descending" }]
      },
      {
        "calculate": "datum.state_visitors >= 1000000 ? format(datum.state_visitors / 1000000, '.1f') + 'M' : format(datum.state_visitors / 1000, '.0f') + 'k'",
        "as": "value_label"
      }
    ],
    "layer": [
      {
        "mark": { "type": "bar", "cornerRadiusEnd": 5 },
        "encoding": {
          "y": {
            "field": "state_code",
            "type": "nominal",
            "sort": ["NSW", "QLD", "VIC", "WA", "SA", "ACT", "TAS", "NT"],
            "title": "State",
            "axis": { "labelFontSize": 12 }
          },
          "x": {
            "field": "state_visitors",
            "type": "quantitative",
            "title": "International visitors",
            "axis": { "format": ".2s", "grid": true }
          },
          "color": {
            "field": "state_code",
            "type": "nominal",
            "title": null,
            "scale": { "domain": STATE_DOMAIN, "range": STATE_RANGE },
            "legend": null
          },
          "tooltip": [
            { "field": "state_code", "type": "nominal", "title": "State" },
            { "field": "state_visitors", "type": "quantitative", "title": "Visitors", "format": ",.0f" }
          ]
        }
      },
      {
        "mark": {
          "type": "text",
          "align": "left",
          "baseline": "middle",
          "dx": 6,
          "fontSize": 10.5,
          "fontWeight": "bold",
          "color": "#000000"
        },
        "encoding": {
          "y": { "field": "state_code", "type": "nominal", "sort": ["NSW", "QLD", "VIC", "WA", "SA", "ACT", "TAS", "NT"] },
          "x": { "field": "state_visitors", "type": "quantitative" },
          "text": { "field": "value_label" }
        }
      }
    ],
    "config": {
      "view": { "stroke": null },
      "axis": {
        "labelFontSize": 12,
        "titleFontSize": 12,
        "gridColor": "#e5e7eb",
        "domainColor": "#9ca3af",
        "tickColor": "#9ca3af"
      }
    }
  };
}

function buildTopRegionStatePieSpec(stateCode) {
  const stateFullName = STATE_NAME_MAP[stateCode] || stateCode;
  return {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 430,
    "height": 360,
    "autosize": { "type": "pad", "contains": "padding" },
    "title": {
      "text": `${stateFullName} hotspot breakdown`,
      "subtitle": `Regional share of international visitor trips within ${stateFullName}`,
      "anchor": "middle",
      "fontSize": 16,
      "subtitleFontSize": 12,
      "fontWeight": "bold",
      "color": "#1f2933",
      "subtitleColor": "#4b5563",
      "offset": 12
    },
    "data": { "url": "data/region_hotspots_2025.csv" },
    "transform": [
      { "filter": `datum.state_code === '${stateCode}'` },
      { "joinaggregate": [{ "op": "sum", "field": "visitors", "as": "state_total" }] },
      { "calculate": "datum.visitors / datum.state_total", "as": "share" },
      { "calculate": "format(datum.share, '.1%')", "as": "share_label" },
      { "calculate": "datum.region + ' ' + format(datum.share, '.0%')", "as": "label_text" }
    ],
    "layer": [
      {
        "mark": {
          "type": "arc",
          "innerRadius": 72,
          "outerRadius": 135,
          "stroke": "#fffdf8",
          "strokeWidth": 2
        },
        "encoding": {
          "theta": { "field": "visitors", "type": "quantitative" },
          "color": {
            "field": "region",
            "type": "nominal",
            "title": "Region",
            "legend": { "orient": "bottom", "columns": 2, "labelLimit": 180, "symbolType": "circle" }
          },
          "tooltip": [
            { "field": "region", "type": "nominal", "title": "Region" },
            { "field": "visitors", "type": "quantitative", "title": "Visitors", "format": ",.0f" },
            { "field": "share", "type": "quantitative", "title": "Share", "format": ".1%" }
          ]
        }
      },
      {
        "transform": [{ "filter": "datum.share >= 0.1" }],
        "mark": {
          "type": "text",
          "radius": 156,
          "fontSize": 11,
          "fontWeight": "bold",
          "align": "center",
          "baseline": "middle",
          "color": "#1f2933"
        },
        "encoding": {
          "theta": { "field": "visitors", "type": "quantitative", "stack": true },
          "text": { "field": "label_text" }
        }
      },
      {
        "data": { "values": [{ "label": stateCode }] },
        "mark": {
          "type": "text",
          "fontSize": 18,
          "fontWeight": "bold",
          "align": "center",
          "baseline": "middle",
          "color": "#1f2933"
        },
        "encoding": {
          "x": { "value": 215 },
          "y": { "value": 168 },
          "text": { "field": "label" }
        }
      }
    ],
    "config": {
      "view": { "stroke": null },
      "legend": { "labelFontSize": 11, "titleFontSize": 11 }
    }
  };
}

async function getRouteStateOptions() {
  try {
    const res = await fetch("data/region_hotspots_2025.csv");
    const csv = await res.text();
    const lines = csv.trim().split("\n").map(line => line.replace(/\r$/, ""));
    if (lines.length < 2) return [];
    const header = lines[0].split(",");
    const stateIdx = header.indexOf("state_code");
    const regionIdx = header.indexOf("region");
    if (stateIdx === -1 || regionIdx === -1) return [];
    const stateRegions = {};
    for (const line of lines.slice(1)) {
      const cols = line.split(",");
      const state = (cols[stateIdx] || "").trim();
      const region = (cols[regionIdx] || "").trim();
      if (!state || !region) continue;
      if (!stateRegions[state]) stateRegions[state] = new Set();
      stateRegions[state].add(region);
    }
    return STATE_DOMAIN.filter(s => stateRegions[s] && stateRegions[s].size > 1);
  } catch (e) {
    return ["NSW", "VIC", "QLD", "WA"];
  }
}

async function renderTopRegionBarChart() {
  const container = document.getElementById("top_region_bar_chart");
  if (!container) return;

  const stateOptions = await getRouteStateOptions();
  const optionHtml = ['<option value="All">All states</option>']
    .concat(stateOptions.map(s => `<option value="${s}">${s}</option>`))
    .join("");

  container.innerHTML = `
    <div id="top_region_bar_chart_inner"></div>
    <div class="capacity-controls capacity-controls-bottom top-region-controls-bottom">
      <label for="topRegionStateSelect">State:</label>
      <select id="topRegionStateSelect">${optionHtml}</select>
    </div>
  `;

  const select = document.getElementById("topRegionStateSelect");
  const target = "#top_region_bar_chart_inner";

  const render = () => {
    const spec = select.value === "All"
      ? addInlineAnnotations(buildTopRegionStateBarSpec(), "top_region_state_bar")
      : addInlineAnnotations(buildTopRegionStatePieSpec(select.value), "top_region_state_pie");

    renderSwapAnimatedChart(target, spec).catch(() => {
      const chartTarget = document.querySelector(target);
      if (chartTarget) {
        chartTarget.innerHTML = '<div class="chart-error">Chart could not load. Check that the required data files are in the data/ folder.</div>';
      }
    });
  };

  select.addEventListener("change", render);
  render();
}

embedIfExists("top_region_map_chart", topRegionMapSpec);
renderTopRegionBarChart();
