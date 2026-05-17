function buildStateMapSpec() {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 620,
    height: 470,
    background: null,
    title: {
      text: "International Visitors Concentrate in Gateway States",
      subtitle: "Hover a state to see its top tourism regions",
      anchor: "start",
      fontSize: 22,
      subtitleFontSize: 14,
      fontWeight: "bold",
      color: "#1f2933",
      subtitleColor: "#4b5563"
    },
    projection: {
      type: "conicEqualArea",
      parallels: [-18, -36],
      rotate: [-132, 0, 0],
      center: [0, -28],
      scale: 760,
      translate: [310, 245]
    },
    layer: [
      {
        data: {
          url: "data/LGA_2025_AUST_GDA2020.json",
          format: { type: "topojson", feature: "LGA_2025_AUST_GDA2020" }
        },
        transform: [
          {
            lookup: "properties.STE_NAME21",
            from: {
              data: { url: "data/state_visitors_2025.csv" },
              key: "state_full",
              fields: ["state_code", "international_visitors", "visitor_share", "rank"]
            }
          }
        ],
        params: [
          {
            name: "stateHover",
            select: { type: "point", fields: ["state_code"], on: "pointerover", clear: "pointerout" }
          }
        ],
        mark: { type: "geoshape", stroke: "#fffdf8", strokeWidth: 0.4, cursor: "pointer" },
        encoding: {
          color: {
            field: "state_code",
            type: "nominal",
            title: "State / territory",
            scale: { domain: STATE_DOMAIN, range: STATE_RANGE },
            legend: {
              orient: "bottom",
              direction: "horizontal",
              columns: 4,
              symbolSize: 120,
              titleLimit: 220,
              labelFontSize: 13,
              titleFontSize: 13,
              labelColor: "#1f2933",
              titleColor: "#1f2933"
            }
          },
          opacity: {
            condition: { param: "stateHover", value: 1 },
            value: 0.45
          },
          strokeWidth: {
            condition: { param: "stateHover", value: 1.8 },
            value: 0.4
          },
          tooltip: [
            { field: "properties.STE_NAME21", type: "nominal", title: "State / territory" },
            { field: "international_visitors", type: "quantitative", title: "International visitors", format: ",.0f" },
            { field: "visitor_share", type: "quantitative", title: "Share", format: ".1%" },
            { field: "rank", type: "ordinal", title: "Rank" }
          ]
        }
      },
      {
        data: {
          values: [
            { state: "NSW", pct: "36%", lon: 147.0, lat: -32.3, accent: STATE_RANGE[0] },
            { state: "QLD", pct: "23%", lon: 145.2, lat: -22.5, accent: STATE_RANGE[2] },
            { state: "VIC", pct: "22%", lon: 144.8, lat: -37.2, accent: STATE_RANGE[1] }
          ]
        },
        mark: { type: "circle", size: 2900, color: "#1f2933", opacity: 0.13 },
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude: { field: "lat", type: "quantitative" }
        }
      },
      {
        data: {
          values: [
            { state: "NSW", pct: "36%", lon: 147.0, lat: -32.3, accent: STATE_RANGE[0] },
            { state: "QLD", pct: "23%", lon: 145.2, lat: -22.5, accent: STATE_RANGE[2] },
            { state: "VIC", pct: "22%", lon: 144.8, lat: -37.2, accent: STATE_RANGE[1] }
          ]
        },
        mark: {
          type: "point",
          shape: "circle",
          filled: true,
          fill: "#fffdf8",
          size: 2400,
          strokeWidth: 3,
          opacity: 1
        },
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude: { field: "lat", type: "quantitative" },
          stroke: { field: "accent", type: "nominal", scale: null, legend: null }
        }
      },
      {
        data: {
          values: [
            { state: "NSW", lon: 147.0, lat: -32.3 },
            { state: "QLD", lon: 145.2, lat: -22.5 },
            { state: "VIC", lon: 144.8, lat: -37.2 }
          ]
        },
        mark: {
          type: "text",
          font: "Space Grotesk",
          fontSize: 15,
          fontWeight: 800,
          align: "center",
          baseline: "middle",
          color: "#1f2933",
          dy: -7,
          letterSpacing: 0.5
        },
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude: { field: "lat", type: "quantitative" },
          text: { field: "state" }
        }
      },
      {
        data: {
          values: [
            { pct: "36%", lon: 147.0, lat: -32.3 },
            { pct: "23%", lon: 145.2, lat: -22.5 },
            { pct: "22%", lon: 144.8, lat: -37.2 }
          ]
        },
        mark: {
          type: "text",
          font: "Inter",
          fontSize: 11.5,
          fontWeight: 700,
          align: "center",
          baseline: "middle",
          color: "#5b6472",
          dy: 10
        },
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude: { field: "lat", type: "quantitative" },
          text: { field: "pct" }
        }
      }
    ],
    config: {
      ...BASE_CONFIG,
      title: { ...BASE_CONFIG.title, fontSize: 22, subtitleFontSize: 14 },
      legend: { ...BASE_CONFIG.legend, labelFontSize: 13, titleFontSize: 13 }
    }
  };
}

function buildStateRegionBarSpec(stateCode) {
  const stateName = STATE_NAME_MAP[stateCode] || stateCode;
  const stateColor = STATE_RANGE[STATE_DOMAIN.indexOf(stateCode)] || "#999";
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 280,
    autosize: { type: "fit", contains: "padding" },
    title: {
      text: `Top regions in ${stateName}`,
      subtitle: "International visitors by tourism region",
      anchor: "start",
      fontSize: 15,
      subtitleFontSize: 11,
      fontWeight: "bold",
      color: "#1f2933",
      subtitleColor: "#4b5563"
    },
    data: { url: "data/region_hotspots_2025.csv" },
    transform: [
      { filter: `datum.state_code === '${stateCode}'` },
      { calculate: "toNumber(datum.visitors)", as: "visitors_n" },
      { window: [{ op: "rank", as: "rank" }], sort: [{ field: "visitors_n", order: "descending" }] },
      { filter: "datum.rank <= 5" },
      { calculate: "datum.visitors_n >= 1000000 ? format(datum.visitors_n / 1000000, '.1f') + 'M' : format(datum.visitors_n / 1000, '.0f') + 'k'", as: "label" }
    ],
    layer: [
      {
        mark: { type: "bar", cornerRadiusEnd: 4, color: stateColor, width: { band: 0.5 } },
        encoding: {
          x: { field: "region", type: "nominal", sort: { field: "visitors_n", order: "descending" }, title: null, axis: { labelFontSize: 10, labelLimit: 80, labelAngle: -35 }, scale: { paddingInner: 0.4, paddingOuter: 0.3 } },
          y: { field: "visitors_n", type: "quantitative", title: "Visitors", axis: { format: ".2s", grid: true, gridColor: "#e8e2d7" } },
          tooltip: [
            { field: "region", type: "nominal", title: "Region" },
            { field: "visitors_n", type: "quantitative", title: "Visitors", format: ",.0f" },
            { field: "spend_per_visitor", type: "quantitative", title: "Spend/visitor ($)", format: ",.0f" }
          ]
        }
      },
      {
        mark: { type: "text", dy: -8, fontSize: 10, fontWeight: "bold", color: "#1f2933" },
        encoding: {
          x: { field: "region", type: "nominal", sort: { field: "visitors_n", order: "descending" } },
          y: { field: "visitors_n", type: "quantitative" },
          text: { field: "label" }
        }
      }
    ],
    config: { view: { stroke: null }, scale: { maxBandSize: 60 } }
  };
}

function renderStateMapChart() {
  const container = document.getElementById("state_map_chart");
  if (!container) return;

  container.innerHTML = `
    <div id="state_map_layout" style="display:flex;align-items:flex-start;gap:16px;">
      <div id="state_map_chart_inner" style="flex:1 1 100%;min-width:0;transition:flex 500ms cubic-bezier(.4,0,.2,1);"></div>
      <div id="state_region_panel" style="flex:0 0 0;overflow:hidden;opacity:0;transform:translateX(40px);transition:flex 500ms cubic-bezier(.4,0,.2,1),opacity 400ms ease 80ms,transform 450ms cubic-bezier(.4,0,.2,1) 60ms;display:flex;flex-direction:column;justify-content:center;min-height:380px;">
        <div id="state_region_bar" style="transform:translateY(12px);opacity:0;transition:opacity 350ms ease,transform 350ms cubic-bezier(.4,0,.2,1);"></div>
        <div id="state_region_desc" style="padding:8px 4px 0;max-width:360px;transform:translateY(8px);opacity:0;transition:opacity 300ms ease 150ms,transform 300ms ease 150ms;"></div>
      </div>
    </div>
  `;

  const mapTarget = "#state_map_chart_inner";
  const panel = document.getElementById("state_region_panel");
  const barTarget = document.getElementById("state_region_bar");
  const descTarget = document.getElementById("state_region_desc");
  const mapSpec = addInlineAnnotations(buildStateMapSpec(), "state_map_chart");
  let currentState = null;

  /* pre-render bar charts for each state to avoid lag on hover */
  const barCache = {};
  const allStates = STATE_DOMAIN || [];
  allStates.forEach(sc => {
    const barSpec = buildStateRegionBarSpec(sc);
    barCache[sc] = makeTransparentSpec(barSpec);
  });

  renderAnimatedChart(mapTarget, mapSpec).then(result => {
    if (!result) return;
    const view = result.view;
    let hoverDebounce = null;

    view.addEventListener("pointerover", (event, item) => {
      if (!item || !item.datum) return;
      const sc = item.datum.state_code || (item.datum.datum && item.datum.datum.state_code);
      if (!sc || sc === currentState) return;

      /* debounce rapid hover switches */
      if (hoverDebounce) clearTimeout(hoverDebounce);
      hoverDebounce = setTimeout(() => {
        currentState = sc;

        /* expand panel with slide-in */
        panel.style.flex = "0 0 520px";
        panel.style.opacity = "1";
        panel.style.transform = "translateX(0)";

        const stateName = STATE_NAME_MAP[sc] || sc;

        /* fade out bar + desc */
        barTarget.style.opacity = "0";
        barTarget.style.transform = "translateY(12px)";
        descTarget.style.opacity = "0";
        descTarget.style.transform = "translateY(8px)";

        requestAnimationFrame(() => {
          setTimeout(() => {
            descTarget.innerHTML = `<p style="font-size:12px;color:#5b6472;line-height:1.5;margin:0;">
              <strong style="color:#1f2933;">${stateName}</strong> receives the visitor trips shown above.
              Larger bars indicate higher concentration within the state.
            </p>`;
            descTarget.style.opacity = "1";
            descTarget.style.transform = "translateY(0)";

            const spec = barCache[sc] || makeTransparentSpec(buildStateRegionBarSpec(sc));
            vegaEmbed("#state_region_bar", spec, { actions: false, renderer: "canvas" })
              .then(() => {
                barTarget.style.opacity = "1";
                barTarget.style.transform = "translateY(0)";
              })
              .catch(() => {
                barTarget.style.opacity = "1";
                barTarget.style.transform = "translateY(0)";
              });
          }, 120);
        });
      }, 80);
    });

    /* collapse panel 1.5s after pointer leaves the map */
    const layout = document.getElementById("state_map_layout");
    let leaveTimer = null;
    layout.addEventListener("pointerleave", () => {
      leaveTimer = setTimeout(() => {
        currentState = null;
        panel.style.flex = "0 0 0";
        panel.style.opacity = "0";
        panel.style.transform = "translateX(40px)";
        barTarget.style.opacity = "0";
        barTarget.style.transform = "translateY(12px)";
        descTarget.style.opacity = "0";
        descTarget.style.transform = "translateY(8px)";
      }, 1500);
    });
    layout.addEventListener("pointerenter", () => {
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
    });
  }).catch(() => {
    const t = document.querySelector(mapTarget);
    if (t) t.innerHTML = '<div class="chart-error">Chart could not load.</div>';
  });
}

const stateShareDonutSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 360,
  height: 350,
  title: {
    text: "State Shares of International Visitor Trips",
    subtitle: "The largest gateway states are labelled directly on the chart",
    anchor: "start",
    fontSize: 20,
    subtitleFontSize: 13,
    fontWeight: "bold",
    color: "#1f2933",
    subtitleColor: "#4b5563"
  },
  data: { url: "data/state_visitors_2025.csv" },
  transform: [
    { calculate: "datum.state_code + ' ' + format(datum.visitor_share, '.0%')", as: "outer_label" }
  ],
  layer: [
    {
      mark: {
        type: "arc",
        innerRadius: 78,
        outerRadius: 135,
        stroke: "white",
        strokeWidth: 2
      },
      encoding: {
        theta: { field: "international_visitors", type: "quantitative" },
        color: {
          field: "state_full",
          type: "nominal",
          sort: { field: "rank", order: "ascending" },
          scale: { domain: STATE_FULL_DOMAIN, range: STATE_FULL_RANGE },
          legend: {
            title: "State / Territory",
            orient: "bottom",
            columns: 2,
            labelLimit: 180,
            labelFontSize: 12,
            titleFontSize: 12
          }
        },
        order: { field: "rank", type: "ordinal" },
        tooltip: [
          { field: "state_full", type: "nominal", title: "State" },
          { field: "international_visitors", type: "quantitative", title: "Visitors", format: ",.0f" },
          { field: "visitor_share", type: "quantitative", title: "Share", format: ".1%" }
        ]
      }
    },
    {
      transform: [{ filter: "datum.visitor_share >= 0.08" }],
      mark: {
        type: "text",
        radius: 158,
        fontSize: 11.5,
        fontWeight: "bold",
        align: "center",
        baseline: "middle",
        color: "#1f2933"
      },
      encoding: {
        theta: { field: "international_visitors", type: "quantitative", stack: true },
        order: { field: "rank", type: "ordinal" },
        text: { field: "outer_label" }
      }
    },
    {
      data: { values: [{ x: 180, y: 175, label: "State share" }] },
      mark: {
        type: "text",
        fontSize: 17,
        fontWeight: "bold",
        color: "#1f2933",
        align: "center",
        baseline: "middle"
      },
      encoding: {
        x: { field: "x", type: "quantitative", axis: null },
        y: { field: "y", type: "quantitative", axis: null },
        text: { field: "label" }
      }
    }
  ],
  config: {
    view: { stroke: null },
    axis: { labelFontSize: 12, titleFontSize: 13 },
    legend: { labelFontSize: 12, titleFontSize: 12 }
  }
};

renderStateMapChart();
