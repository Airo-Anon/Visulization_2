const STATE_DOMAIN = ["NSW", "VIC", "QLD", "WA", "SA", "ACT", "TAS", "NT"];
const STATE_RANGE = ["#D84B2A", "#F28E2B", "#E3B23C", "#4E9F7D", "#C06C84", "#8C6D62", "#6C8EBF", "#7C9D96"];
const STATE_FULL_DOMAIN = ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Australian Capital Territory", "Tasmania", "Northern Territory"];
const STATE_FULL_RANGE = ["#D84B2A", "#F28E2B", "#E3B23C", "#4E9F7D", "#C06C84", "#8C6D62", "#6C8EBF", "#7C9D96"];
const STATE_NAME_MAP = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  ACT: "Australian Capital Territory",
  TAS: "Tasmania",
  NT: "Northern Territory"
};

const REGION_DOMAIN = [
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Destination Perth",
  "Gold Coast",
  "Tropical North Queensland",
  "Adelaide",
  "Sunshine Coast",
  "North Coast NSW",
  "Canberra",
  "All other top-20 regions"
];
const REGION_RANGE = ["#D84B2A", "#F28E2B", "#E3B23C", "#4E9F7D", "#F06A6A", "#2A9D8F", "#C06C84", "#F4C95D", "#B13A2C", "#8C6D62", "#BFC9D9"];

const BASE_CONFIG = {
  view: { stroke: null },
  axis: {
    labelFont: "Inter",
    titleFont: "Inter",
    labelFontSize: 12,
    titleFontSize: 13,
    gridColor: "#e8e2d7",
    domainColor: "#b8aa99",
    tickColor: "#b8aa99"
  },
  legend: {
    labelFont: "Inter",
    titleFont: "Inter",
    labelFontSize: 12,
    titleFontSize: 12,
    orient: "bottom"
  },
  title: {
    font: "Space Grotesk",
    subtitleFont: "Inter",
    fontSize: 20,
    subtitleFontSize: 13,
    anchor: "start",
    color: "#1f2933",
    subtitleColor: "#5b6472"
  }
};




function markSpecAnnotated(spec, annotationKey) {
  const key = `__inlineAnnotation_${annotationKey}`;
  if (!spec || spec[key]) return false;
  Object.defineProperty(spec, key, { value: true, enumerable: false });
  return true;
}

function pushAnnotationLayers(targetSpec, layers) {
  if (!targetSpec || !layers || !layers.length) return;
  if (Array.isArray(targetSpec.layer)) {
    targetSpec.layer.push(...layers);
    return;
  }

  if (targetSpec.mark && targetSpec.encoding) {
    const baseLayer = {};
    ["data", "transform", "mark", "encoding", "projection", "params"].forEach((key) => {
      if (targetSpec[key] !== undefined) {
        baseLayer[key] = targetSpec[key];
        delete targetSpec[key];
      }
    });
    targetSpec.layer = [baseLayer, ...layers];
  }
}

function inlineAnnotationTextMark(overrides = {}) {
  return {
    type: "text",
    font: "Inter",
    fontSize: 11.5,
    fontStyle: "italic",
    fontWeight: "bold",
    lineBreak: "\n",
    color: "#000000",
    stroke: "#fffdf8",
    strokeWidth: 1.6,
    strokeJoin: "round",
    ...overrides
  };
}

function addInlineAnnotations(spec, id) {
  if (!spec || !markSpecAnnotated(spec, id)) return spec;

  if (id === "tourism_transport_annual") {
    // Subtitle already states that each series' peak year equals 100, so the
    // numeric "index 100 of 100" callout is redundant. The peak year is
    // marked visually with a highlight ring on the international-airline
    // series; the text label sits in the same crowded top-right corner as
    // the peak point and other series' end-of-period values, so it is
    // intentionally omitted.
    const transforms = [
      { filter: "datum.series === 'International inbound airline passengers'" },
      { calculate: "toNumber(datum.index)", as: "index" },
      { window: [{ op: "rank", as: "annotation_rank" }], sort: [{ field: "index", order: "descending" }] },
      { filter: "datum.annotation_rank == 1" }
    ];
    pushAnnotationLayers(spec, [
      {
        transform: transforms,
        mark: { type: "point", filled: true, size: 160, fill: "#fff7ef", stroke: "#7570B3", strokeWidth: 2.6 },
        encoding: {
          x: { field: "year", type: "ordinal", sort: TOURISM_TRANSPORT_YEARS.map(String) },
          y: { field: "index", type: "quantitative", scale: { domain: [0, 105] } }
        }
      }
    ]);
    return spec;
  }

  if (id === "tourism_transport_monthly") {
    // Same reasoning as the annual view: the chart subtitle already states
    // that each series' peak month equals 100, and the peak month is marked
    // with a highlight ring on the international-airline series. A floating
    // text label in the right-edge area always lands on top of the December
    // data points of the other series, so it is intentionally omitted.
    const monthSort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const transforms = [
      { filter: "datum.series === 'International inbound airline passengers'" },
      { calculate: "toNumber(datum.index)", as: "index" },
      { window: [{ op: "rank", as: "annotation_rank" }], sort: [{ field: "index", order: "descending" }] },
      { filter: "datum.annotation_rank == 1" }
    ];
    pushAnnotationLayers(spec, [
      {
        transform: transforms,
        mark: { type: "point", filled: true, size: 160, fill: "#fff7ef", stroke: "#7570B3", strokeWidth: 2.6 },
        encoding: {
          x: { field: "month_year_label", type: "nominal" },
          y: { field: "index", type: "quantitative", scale: { domain: [0, 105] } }
        }
      }
    ]);
    return spec;
  }

  if (id === "state_map_chart") {
    // The three on-map gateway chips (NSW 36%, QLD 23%, VIC 22%) already
    // surface the top-share narrative directly over the relevant polygons,
    // and the legend below restates the state palette. An extra inline
    // annotation either floats below the legend (cut off) or sits in the
    // Southern Ocean disconnected from the polygons, so it is intentionally
    // omitted to keep the map clean.
    return spec;
  }

  if (id === "hotspot_bubble_map_chart") {
    pushAnnotationLayers(spec, [
      {
        data: { url: "data/region_hotspots_2025.csv" },
        transform: [
          { calculate: "toNumber(datum.visitors)", as: "visitors" },
          { window: [{ op: "rank", as: "annotation_rank" }], sort: [{ field: "visitors", order: "descending" }] },
          { filter: "datum.annotation_rank == 1" },
          { calculate: "120", as: "anno_lon" },
          { calculate: "-44.5", as: "anno_lat" },
          { calculate: "split('Leading hotspot: ' + datum.region + ';' + format(datum.visitors / 1000000, '.1f') + 'M international visitors, 2025', ';')", as: "text_annotation" }
        ],
        mark: inlineAnnotationTextMark({ align: "center", baseline: "middle", fontSize: 10.5 }),
        encoding: {
          longitude: { field: "anno_lon", type: "quantitative" },
          latitude: { field: "anno_lat", type: "quantitative" },
          text: { field: "text_annotation" }
        }
      }
    ]);
    return spec;
  }

  if (id === "top_region_map_chart") {
    pushAnnotationLayers(spec, [
      {
        data: { values: [{ lon: 134, lat: -45, label: ["Iconic gateway route:", "Perth → Melbourne → Sydney → Gold Coast → Brisbane"] }] },
        mark: inlineAnnotationTextMark({ align: "center", baseline: "middle", fontSize: 10.5 }),
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude: { field: "lat", type: "quantitative" },
          text: { field: "label" }
        }
      }
    ]);
    return spec;
  }

  if (id === "top_region_state_bar") {
    pushAnnotationLayers(spec, [
      {
        transform: [
          { calculate: "toNumber(datum.state_visitors)", as: "state_visitors" },
          { joinaggregate: [{ op: "max", field: "state_visitors", as: "max_visitors" }] },
          { window: [{ op: "rank", as: "annotation_rank" }], sort: [{ field: "state_visitors", order: "ascending" }] },
          { filter: "datum.annotation_rank == 1" },
          { calculate: "split('NSW leads with 4.2M visitors;NSW + VIC + QLD ≈ 84% of arrivals', ';')", as: "text_annotation" }
        ],
        mark: inlineAnnotationTextMark({ align: "right", baseline: "bottom", dx: -10, dy: -6, fontSize: 11 }),
        encoding: {
          y: { field: "state_code", type: "nominal", sort: ["NSW", "QLD", "VIC", "WA", "SA", "ACT", "TAS", "NT"] },
          x: { field: "max_visitors", type: "quantitative" },
          text: { field: "text_annotation" }
        }
      }
    ]);
    return spec;
  }

  if (id === "top_region_state_pie") {
    // The pie already encodes each region's name and share via slice labels
    // plus a central state-code label and the chart title. An extra inline
    // annotation in the narrow space between the pie ring and the bottom
    // legend cannot avoid overlap on smaller states (e.g. ACT, TAS), so the
    // insight is intentionally carried by the chart's title and slice labels.
    return spec;
  }

  if (id === "concentration_share_chart") {
    // The legend column on the right already lists every region with its
    // share, and the chart title/subtitle explains the waffle idiom. An
    // inline annotation in this panel inevitably collides with the lower
    // legend rows (Gold Coast, Destination Perth), so the share insight is
    // intentionally carried by the chart title and the side-by-side legend.
    return spec;
  }

  if (id === "popularity_value_bubble_chart") {
    return spec;
  }

  if (id === "hidden_value_quadrant_chart") {
    pushAnnotationLayers(spec, [
      {
        data: { url: "data/region_hotspots_2025.csv" },
        transform: [
          { filter: "datum.quadrant === 'Hidden high-value'" },
          { calculate: "toNumber(datum.hidden_value_score)", as: "hidden_value_score" },
          { calculate: "toNumber(datum.spend_per_visitor)", as: "spend_per_visitor" },
          { window: [{ op: "rank", as: "annotation_rank" }], sort: [{ field: "hidden_value_score", order: "descending" }] },
          { filter: "datum.annotation_rank == 1" },
          { calculate: "3850000", as: "anno_x" },
          { calculate: "2750", as: "anno_y" },
          { calculate: "split(datum.region + ' · score ' + format(datum.hidden_value_score, '+.0f') + ';$' + format(datum.spend_per_visitor, ',.0f') + ' per visitor', ';')", as: "text_annotation" }
        ],
        mark: inlineAnnotationTextMark({ align: "right", baseline: "top", dx: 0, dy: 0, fontSize: 10.5 }),
        encoding: {
          x: { field: "anno_x", type: "quantitative", scale: { type: "sqrt", domain: [0, 4000000] } },
          y: { field: "anno_y", type: "quantitative", scale: { domain: [0, 3600] } },
          text: { field: "text_annotation" }
        }
      }
    ]);
    return spec;
  }

  if (id === "hidden_value_rank_chart") {
    // The priority-card grid already exposes rank, region, tier, visitors,
    // spend and hidden-value score inside each card. Adding a floating inline
    // annotation here overlaps the in-card spend label, so the insight is
    // carried by the overlay annotation card instead.
    return spec;
  }

  if (id === "capacity_total") {
    // Every region bar displays its grand_total as a numeric end-of-bar
    // label, so the largest capacity base is already self-evident. An
    // additional floating callout sits in the same horizontal band as the
    // bar labels and the "Median total" marker, producing unavoidable
    // overlap on this tall, alphabetised layout — so it is intentionally
    // omitted here.
    return spec;
  }

  if (id === "capacity_state") {
    pushAnnotationLayers(spec, [
      {
        transform: [
          { calculate: "toNumber(datum.metric_value)", as: "metric_value" },
          { window: [{ op: "rank", as: "annotation_rank" }], sort: [{ field: "metric_value", order: "descending" }] },
          { filter: "datum.annotation_rank == 1" },
          { calculate: "datum.state_code + ' leads this view · ' + format(datum.metric_value / 1000, ',.1f') + 'k businesses'", as: "text_annotation" }
        ],
        mark: inlineAnnotationTextMark({ align: "center", baseline: "bottom", dy: -28, fontSize: 10.5 }),
        encoding: {
          x: { field: "state_code", type: "nominal", sort: { field: "metric_value", order: "descending" } },
          y: { field: "metric_value", type: "quantitative" },
          text: { field: "text_annotation" }
        }
      }
    ]);
    return spec;
  }

  return spec;
}

const ANIMATED_EMBED_OPTIONS = { actions: false, renderer: "svg" };

function getChartElement(target) {
  return typeof target === "string" ? document.querySelector(target) : target;
}

function pulseChartAnimation(root) {
  if (!root) return;
  root.classList.add("chart-param-changing");
  window.clearTimeout(root._chartPulseTimer);
  root._chartPulseTimer = window.setTimeout(() => {
    root.classList.remove("chart-param-changing");
  }, 420);
}

function attachBindingAnimation(root) {
  if (!root) return;

  root.querySelectorAll(".vega-bindings select, .vega-bindings input").forEach((control) => {
    if (control.dataset.transitionReady === "true") return;
    control.dataset.transitionReady = "true";

    control.addEventListener("input", () => pulseChartAnimation(root));
    control.addEventListener("change", () => pulseChartAnimation(root));
  });
}


const CHART_ANNOTATIONS = {
  tourism_transport_chart: {
    title: "Peak season overlap",
    body: "International airline activity peaks in the same months as local public-transport demand, so visitor pressure is added on top of existing local pressure.",
    position: "top-right"
  },
  state_map_chart: {
    title: "Gateway-state concentration",
    body: "New South Wales, Queensland and Victoria together receive the majority of international arrivals, producing uneven spatial pressure across the country.",
    position: "top-right"
  },
  hotspot_bubble_map_chart: {
    title: "Visitors cluster at recognisable hotspots",
    body: "The largest bubbles align with major gateway cities and iconic coastal regions, indicating that attention concentrates at familiar destinations rather than spreading evenly.",
    position: "bottom-right"
  },
  gateway_state_rank_chart: {
    title: "Three-state arrival concentration",
    body: "New South Wales, Queensland and Victoria together account for approximately 83.6% of international visitor trips. Brush the overview to refine the time window.",
    position: "top-right"
  },
  top_region_map_chart: {
    title: "Iconic visitor route",
    body: "The numbered path links the top-ranked tourism regions, reflecting how international visitors typically chain familiar destinations together on a first itinerary.",
    position: "top-left"
  },
  top_region_bar_chart: {
    title: "Quantifying the route",
    body: "Ranked by international visitor trips, a small set of cities and coastal regions clearly leads the national pattern, confirming the route shown on the map.",
    position: "top-right"
  },
  concentration_share_chart: {
    title: "Concentration in two cities",
    body: "Within the top-twenty international tourism regions, Sydney and Melbourne alone account for approximately 52% of visitor share.",
    position: "top-right"
  },
  popularity_value_bubble_chart: {
    title: "Volume does not equal value",
    body: "Regions positioned above the median spend line generate stronger value per visitor than their visitor count alone would suggest, signalling redistribution opportunities.",
    position: "top-right"
  },
  hidden_value_quadrant_chart: {
    title: "Hidden high-value quadrant",
    body: "Bounded by the dashed median lines, this zone groups regions with below-median visitor volume and above-median spend per visitor — the strongest redistribution candidates.",
    position: "top-right"
  },
  hidden_value_rank_chart: {
    title: "Positive score signals priority",
    body: "The hidden-value score equals visitor-volume rank minus spend-per-visitor rank: a positive value indicates per-visitor value outpaces popularity.",
    position: "top-right"
  },
  alternative_capacity_chart: {
    title: "Existing capacity supports redistribution",
    body: "Grey rails show the total tourism-related business base; coloured bars show employing businesses, indicating recommended regions already maintain operational capacity.",
    position: "top-right"
  }
};

function addChartAnnotation(id, override = {}) {
  const target = document.getElementById(id);
  const annotation = { ...(CHART_ANNOTATIONS[id] || {}), ...override };
  if (!target || !annotation.title || target.dataset.annotationReady === "true") return;

  target.classList.add("has-chart-annotation");
  const card = document.createElement("div");
  card.className = `chart-annotation-card annotation-${annotation.position || "top-right"}`;
  card.innerHTML = `
    <strong>${annotation.title}</strong>
    <span>${annotation.body}</span>
  `;
  target.appendChild(card);
  target.dataset.annotationReady = "true";
}

function renderAnimatedChart(target, spec, options = {}) {
  const chartElement = getChartElement(target);
  if (!chartElement) return Promise.resolve(null);

  chartElement.classList.add("chart-is-changing");

  return vegaEmbed(target, makeTransparentSpec(spec), {
    ...ANIMATED_EMBED_OPTIONS,
    ...options
  })
    .then((result) => {
      requestAnimationFrame(() => {
        chartElement.classList.remove("chart-is-changing");
        chartElement.classList.add("chart-entering");
        attachBindingAnimation(chartElement);

        window.setTimeout(() => {
          chartElement.classList.remove("chart-entering");
        }, 480);
      });

      return result;
    })
    .catch((error) => {
      chartElement.classList.remove("chart-is-changing");
      throw error;
    });
}

function renderSwapAnimatedChart(target, spec, options = {}) {
  const chartElement = getChartElement(target);
  if (!chartElement) return Promise.resolve(null);

  chartElement._renderToken = (chartElement._renderToken || 0) + 1;
  const renderToken = chartElement._renderToken;

  const previousLayer = chartElement.querySelector(":scope > .chart-layer-active");
  const previousEmbed = chartElement.querySelector(":scope > .vega-embed");
  const hasPreviousChart = !!(previousLayer || previousEmbed);
  const previousHeight = Math.max(chartElement.offsetHeight, 0);

  chartElement.classList.add("chart-crossfade-root");
  chartElement.classList.remove("chart-is-changing", "chart-entering", "chart-switch-out");

  if (previousHeight > 0) {
    chartElement.style.minHeight = `${previousHeight}px`;
  }

  const oldLayer = document.createElement("div");
  oldLayer.className = "chart-layer chart-layer-old";
  oldLayer.setAttribute("aria-hidden", "true");

  if (previousLayer) {
    oldLayer.innerHTML = previousLayer.innerHTML;
  } else if (previousEmbed) {
    oldLayer.appendChild(previousEmbed.cloneNode(true));
  }

  const newLayer = document.createElement("div");
  newLayer.className = hasPreviousChart
    ? "chart-layer chart-layer-new"
    : "chart-layer chart-layer-new chart-layer-in chart-layer-active";

  chartElement.innerHTML = "";
  if (hasPreviousChart) chartElement.appendChild(oldLayer);
  chartElement.appendChild(newLayer);
  if (hasPreviousChart) {
    chartElement.classList.add("chart-premium-transition");
  }

  return vegaEmbed(newLayer, makeTransparentSpec(spec), {
    ...ANIMATED_EMBED_OPTIONS,
    ...options
  })
    .then((result) => {
      if (chartElement._renderToken !== renderToken) return null;

      requestAnimationFrame(() => {
        if (chartElement._renderToken !== renderToken) return;

        attachBindingAnimation(chartElement);

        // Give the browser one extra frame so the entering state is painted first.
        requestAnimationFrame(() => {
          if (chartElement._renderToken !== renderToken) return;
          newLayer.classList.add("chart-layer-in", "chart-layer-active");
          if (hasPreviousChart) oldLayer.classList.add("chart-layer-out");
        });

        window.setTimeout(() => {
          if (chartElement._renderToken !== renderToken) return;

          if (oldLayer.parentNode) oldLayer.parentNode.removeChild(oldLayer);
          newLayer.classList.remove("chart-layer-new");
          chartElement.classList.remove("chart-premium-transition");
          chartElement.style.minHeight = "";
        }, 760);
      });

      return result;
    })
    .catch((error) => {
      if (chartElement._renderToken === renderToken) {
        chartElement.classList.remove("chart-premium-transition");
        chartElement.style.minHeight = "";
      }
      throw error;
    });
}

const TOURISM_TRANSPORT_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

function buildTourismTransportAnnualSpec() {
  const seriesDomain = [
    "International inbound airline passengers",
    "NSW public transport trips",
    "VIC public transport trips"
  ];
  const seriesRange = ["#7570B3", "#D84B2A", "#F28E2B"];
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 360,
    data: { url: "data/tourism_transport_multiyear.csv" },
    title: {
      text: "Tourism Peaks and Public Transport Pressure",
      subtitle: "Annual indexed totals. Each series' peak year equals 100. Hover for detail."
    },
    transform: [
      { filter: "datum.granularity === 'annual'" },
      { calculate: "toNumber(datum.index)", as: "idx" }
    ],
    layer: [
      {
        mark: { type: "area", opacity: 0.07, interpolate: "monotone" },
        transform: [{ filter: "datum.series === 'International inbound airline passengers'" }],
        encoding: {
          x: { field: "year", type: "ordinal" },
          y: { field: "idx", type: "quantitative" },
          color: { value: "#7570B3" }
        }
      },
      {
        params: [
          { name: "hover", select: { type: "point", fields: ["year"], on: "pointerover", clear: "pointerout", nearest: true } }
        ],
        mark: { type: "line", point: { filled: true, size: 50 }, strokeWidth: 3, interpolate: "monotone" },
        encoding: {
          x: {
            field: "year",
            type: "ordinal",
            title: "Year",
            axis: { labelAngle: 0, domain: true, domainColor: "#1f2933", domainWidth: 1 }
          },
          y: {
            field: "idx",
            type: "quantitative",
            title: "Indexed annual total",
            scale: { domain: [0, 105] },
            axis: { domain: true, domainColor: "#1f2933", domainWidth: 1 }
          },
          color: {
            field: "series",
            type: "nominal",
            title: null,
            scale: { domain: seriesDomain, range: seriesRange },
            legend: {
              orient: "bottom",
              columns: 3,
              direction: "horizontal",
              labelLimit: 220,
              symbolType: "circle",
              labelExpr: "datum.label === 'International inbound airline passengers' ? 'International air passengers' : datum.label === 'NSW public transport trips' ? 'NSW public transport' : 'VIC public transport'"
            }
          },
          tooltip: [
            { field: "year", type: "ordinal", title: "Year" },
            { field: "series", type: "nominal", title: "Series" },
            { field: "value", type: "quantitative", title: "Annual total", format: ",.0f" },
            { field: "idx", type: "quantitative", title: "Index", format: ".1f" }
          ]
        }
      },
      {
        mark: { type: "rule", color: "#1f2933", strokeWidth: 1, strokeDash: [4, 3] },
        transform: [{ filter: "datum.series === 'International inbound airline passengers'" }],
        encoding: {
          x: { field: "year", type: "ordinal" },
          opacity: { condition: { param: "hover", empty: false, value: 0.6 }, value: 0 }
        }
      },
      {
        mark: { type: "circle", size: 110, stroke: "#fff", strokeWidth: 2 },
        encoding: {
          x: { field: "year", type: "ordinal" },
          y: { field: "idx", type: "quantitative" },
          color: { field: "series", type: "nominal", scale: { domain: seriesDomain, range: seriesRange }, legend: null },
          opacity: { condition: { param: "hover", empty: false, value: 1 }, value: 0 }
        }
      },
      {
        mark: { type: "text", align: "left", dx: 10, dy: -1, fontSize: 10, fontWeight: 600 },
        encoding: {
          x: { field: "year", type: "ordinal" },
          y: { field: "idx", type: "quantitative" },
          text: { field: "idx", type: "quantitative", format: ".0f" },
          color: { field: "series", type: "nominal", scale: { domain: seriesDomain, range: seriesRange }, legend: null },
          opacity: { condition: { param: "hover", empty: false, value: 1 }, value: 0 }
        }
      }
    ],
    config: BASE_CONFIG
  };
}

function buildTourismTransportMonthlySpec(selectedYear) {
  const monthSort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => m + " " + selectedYear);
  const seriesDomain = [
    "International inbound airline passengers",
    "NSW public transport trips",
    "VIC public transport trips"
  ];
  const seriesRange = ["#7570B3", "#D84B2A", "#F28E2B"];
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 360,
    data: { url: "data/tourism_transport_multiyear.csv" },
    title: {
      text: "Tourism Peaks and Public Transport Pressure",
      subtitle: `${selectedYear} monthly indexed pattern. Each series' peak month in ${selectedYear} equals 100. Hover for detail.`
    },
    transform: [
      { filter: `datum.granularity === 'monthly' && datum.year == ${selectedYear}` },
      { calculate: "datum.month_label + ' ' + datum.year", as: "month_year_label" },
      { calculate: "toNumber(datum.index)", as: "idx" }
    ],
    layer: [
      {
        mark: { type: "area", opacity: 0.08, interpolate: "monotone" },
        transform: [{ filter: "datum.series === 'International inbound airline passengers'" }],
        encoding: {
          x: { field: "month_year_label", type: "nominal", sort: monthSort },
          y: { field: "idx", type: "quantitative" },
          color: { value: "#7570B3" }
        }
      },
      {
        params: [
          { name: "hover", select: { type: "point", fields: ["month_year_label"], on: "pointerover", clear: "pointerout", nearest: true } }
        ],
        mark: { type: "line", point: { filled: true, size: 45 }, strokeWidth: 3, interpolate: "monotone" },
        encoding: {
          x: {
            field: "month_year_label",
            type: "nominal",
            title: "Month",
            sort: monthSort,
            axis: { labelAngle: -45, domain: true, domainColor: "#1f2933", domainWidth: 1 }
          },
          y: {
            field: "idx",
            type: "quantitative",
            title: "Indexed monthly activity",
            scale: { domain: [0, 105] },
            axis: { domain: true, domainColor: "#1f2933", domainWidth: 1 }
          },
          color: {
            field: "series",
            type: "nominal",
            title: null,
            scale: { domain: seriesDomain, range: seriesRange },
            legend: {
              orient: "bottom",
              columns: 3,
              direction: "horizontal",
              labelLimit: 220,
              symbolType: "circle",
              labelExpr: "datum.label === 'International inbound airline passengers' ? 'International air passengers' : datum.label === 'NSW public transport trips' ? 'NSW public transport' : 'VIC public transport'"
            }
          },
          tooltip: [
            { field: "year", type: "ordinal", title: "Year" },
            { field: "month_label", type: "nominal", title: "Month" },
            { field: "series", type: "nominal", title: "Series" },
            { field: "value", type: "quantitative", title: "Monthly total", format: ",.0f" },
            { field: "idx", type: "quantitative", title: "Index", format: ".1f" }
          ]
        }
      },
      {
        mark: { type: "rule", color: "#1f2933", strokeWidth: 1, strokeDash: [4, 3] },
        transform: [{ filter: "datum.series === 'International inbound airline passengers'" }],
        encoding: {
          x: { field: "month_year_label", type: "nominal", sort: monthSort },
          opacity: { condition: { param: "hover", empty: false, value: 0.6 }, value: 0 }
        }
      },
      {
        mark: { type: "circle", size: 90, stroke: "#fff", strokeWidth: 1.5 },
        encoding: {
          x: { field: "month_year_label", type: "nominal", sort: monthSort },
          y: { field: "idx", type: "quantitative" },
          color: { field: "series", type: "nominal", scale: { domain: seriesDomain, range: seriesRange }, legend: null },
          opacity: { condition: { param: "hover", empty: false, value: 1 }, value: 0 }
        }
      },
      {
        mark: { type: "text", align: "left", dx: 8, dy: -2, fontSize: 10, fontWeight: 600 },
        encoding: {
          x: { field: "month_year_label", type: "nominal", sort: monthSort },
          y: { field: "idx", type: "quantitative" },
          text: { field: "idx", type: "quantitative", format: ".0f" },
          color: { field: "series", type: "nominal", scale: { domain: seriesDomain, range: seriesRange }, legend: null },
          opacity: { condition: { param: "hover", empty: false, value: 1 }, value: 0 }
        }
      }
    ],
    config: BASE_CONFIG
  };
}

function renderTourismTransportChart() {
  const container = document.getElementById("tourism_transport_chart");
  if (!container) return;

  const optionsHtml = ['<option value="annual">Annual overview</option>']
    .concat(TOURISM_TRANSPORT_YEARS.map(y => `<option value="${y}">${y}</option>`))
    .join('');

  container.innerHTML = `
    <div id="tourism_transport_chart_inner"></div>
    <div class="capacity-controls capacity-controls-bottom tourism-controls-bottom">
      <label for="tourismYearSelect">View:</label>
      <select id="tourismYearSelect">${optionsHtml}</select>
    </div>
  `;

  const select = document.getElementById("tourismYearSelect");
  const target = "#tourism_transport_chart_inner";

  const render = () => {
    const spec = select.value === "annual"
      ? addInlineAnnotations(buildTourismTransportAnnualSpec(), "tourism_transport_annual")
      : addInlineAnnotations(buildTourismTransportMonthlySpec(Number(select.value)), "tourism_transport_monthly");

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

function buildHotspotBubbleMapSpec() {
  const activeOpacity = 0.85;
  const dimOpacity = 0.15;

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 600,
    height: 380,
    title: {
      text: "Where Exactly Are the Tourism Hotspots?",
      subtitle: "Bubble size encodes visitor volume; use the filter to highlight high-traffic regions",
      anchor: "start",
      fontSize: 20,
      subtitleFontSize: 13,
      fontWeight: "bold",
      color: "#1f2933",
      subtitleColor: "#4b5563"
    },
    params: [
      {
        name: "min_visitors",
        value: 0,
        bind: {
          input: "range",
          name: "Minimum visitors: ",
          min: 0,
          max: 3500000,
          step: 50000
        }
      }
    ],
    projection: {
      type: "mercator",
      center: [134, -28],
      scale: 580,
      translate: [310, 190]
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
        data: { url: "data/region_hotspots_2025.csv" },
        transform: [
          { calculate: "toNumber(datum.visitors)", as: "visitors_n" },
          { calculate: "toNumber(datum.expenditure_m)", as: "expenditure_n" },
          { calculate: "toNumber(datum.spend_per_visitor)", as: "spend_n" },
          { calculate: "toNumber(datum.nights_per_visitor)", as: "nights_n" }
        ],
        mark: {
          type: "circle",
          stroke: "#fffdf8",
          strokeWidth: 0.8,
          cursor: "pointer"
        },
        encoding: {
          longitude: { field: "lon", type: "quantitative" },
          latitude: { field: "lat", type: "quantitative" },
          size: {
            field: "visitors_n",
            type: "quantitative",
            title: "Visitors",
            scale: { range: [40, 1200] },
            legend: {
              orient: "bottom",
              direction: "horizontal",
              values: [200000, 1000000, 3500000],
              format: ".2s",
              titlePadding: 6,
              symbolLimit: 3
            }
          },
          color: {
            field: "state_code",
            type: "nominal",
            scale: { domain: STATE_DOMAIN, range: STATE_RANGE },
            legend: null
          },
          opacity: {
            condition: { test: "min_visitors == 0 || datum.visitors_n >= min_visitors", value: activeOpacity },
            value: dimOpacity
          },
          tooltip: [
            { field: "region", type: "nominal", title: "Region" },
            { field: "state_code", type: "nominal", title: "State" },
            { field: "visitors_n", type: "quantitative", title: "Visitors", format: ",.0f" },
            { field: "expenditure_n", type: "quantitative", title: "Expenditure ($m)", format: ",.0f" },
            { field: "spend_n", type: "quantitative", title: "Spend/visitor ($)", format: ",.0f" },
            { field: "nights_n", type: "quantitative", title: "Nights/visitor", format: ".1f" }
          ]
        }
      },
      {
        data: {
          url: "data/region_hotspots_2025.csv"
        },
        transform: [
          { calculate: "toNumber(datum.visitors)", as: "visitors_n" },
          { filter: "min_visitors == 0 || datum.visitors_n >= min_visitors" },
          { window: [{ op: "rank", as: "rank" }], sort: [{ field: "visitors_n", order: "descending" }] },
          { filter: "datum.rank <= 7" },
          { calculate: "datum.region === 'Gold Coast' ? datum.lat + 1.2 : datum.region === 'Brisbane' ? datum.lat - 1.0 : datum.lat", as: "label_lat" },
          { calculate: "datum.region === 'Gold Coast' ? datum.lon - 2.5 : datum.region === 'Brisbane' ? datum.lon - 2.5 : datum.lon", as: "label_lon" }
        ],
        mark: {
          type: "text",
          fontSize: 10,
          fontWeight: "bold",
          lineBreak: "\n",
          color: "#1f2933",
          stroke: "#fffdf8",
          strokeWidth: 4,
          strokeJoin: "round",
          dy: -12
        },
        encoding: {
          longitude: { field: "label_lon", type: "quantitative" },
          latitude: { field: "label_lat", type: "quantitative" },
          text: { field: "region" }
        }
      },
      {
        data: {
          url: "data/region_hotspots_2025.csv"
        },
        transform: [
          { calculate: "toNumber(datum.visitors)", as: "visitors_n" },
          { filter: "min_visitors == 0 || datum.visitors_n >= min_visitors" },
          { window: [{ op: "rank", as: "rank" }], sort: [{ field: "visitors_n", order: "descending" }] },
          { filter: "datum.rank <= 7" },
          { calculate: "datum.region === 'Gold Coast' ? datum.lat + 1.2 : datum.region === 'Brisbane' ? datum.lat - 1.0 : datum.lat", as: "label_lat" },
          { calculate: "datum.region === 'Gold Coast' ? datum.lon - 2.5 : datum.region === 'Brisbane' ? datum.lon - 2.5 : datum.lon", as: "label_lon" }
        ],
        mark: {
          type: "text",
          fontSize: 10,
          fontWeight: "bold",
          lineBreak: "\n",
          color: "#1f2933",
          dy: -12
        },
        encoding: {
          longitude: { field: "label_lon", type: "quantitative" },
          latitude: { field: "label_lat", type: "quantitative" },
          text: { field: "region" }
        }
      }
    ],
    config: {
      view: { stroke: null },
      legend: {
        labelFontSize: 12,
        titleFontSize: 12,
        labelColor: "#1f2933",
        titleColor: "#1f2933"
      },
      title: {
        fontSize: 20,
        subtitleFontSize: 13,
        anchor: "start"
      }
    }
  };
}

const gatewayStateRankSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: {
    text: "Gateway States Dominate Visitor Arrivals",
    subtitle: [
      "Map first, then the share pie, then the broader arrival trend.",
      "Use the line-series filter to switch the time view; hover a state bubble to link the map with the share pie."
    ],
    anchor: "start",
    fontSize: 21,
    subtitleFontSize: 13,
    fontWeight: "bold",
    color: "#1f2933",
    subtitleColor: "#4b5563"
  },
  params: [
    {
      name: "gatewayStateHover",
      select: { type: "point", fields: ["state_code"], on: "mouseover", clear: "mouseout" }
    },
    {
      name: "trafficSeries",
      value: "total",
      bind: {
        input: "select",
        name: "Line series: ",
        options: ["total", "inbound", "outbound"],
        labels: ["Total passengers", "Inbound only", "Outbound only"]
      }
    },
    {
      name: "lineHover",
      select: { type: "point", fields: ["date"], nearest: true, on: "pointermove", clear: "pointerout" }
    }
  ],
  vconcat: [
    {
      width: 760,
      height: 355,
      title: {
        text: "Where are the main gateway states?",
        subtitle: "Bubble size represents international visitor trips in 2025; hover a bubble to link it with the share pie.",
        anchor: "start",
        fontSize: 16,
        subtitleFontSize: 11
      },
      projection: {
        type: "conicEqualArea",
        parallels: [-18, -36],
        rotate: [-132, 0, 0],
        center: [0, -28],
        scale: 860,
        translate: [380, 190]
      },
      layer: [
        {
          data: {
            url: "data/LGA_2025_AUST_GDA2020.json",
            format: { type: "topojson", feature: "LGA_2025_AUST_GDA2020" }
          },
          mark: { type: "geoshape", fill: "#e8e1d7", stroke: "#fffdf8", strokeWidth: 0.35 }
        },
        {
          data: {
            values: [
              { state_code: "NSW", state_full: "New South Wales", lon: 147.2, lat: -32.3, visitors: 4168730, share_pct: 35.9, rank: 1 },
              { state_code: "QLD", state_full: "Queensland", lon: 145.2, lat: -22.5, visitors: 2875302, share_pct: 24.8, rank: 2 },
              { state_code: "VIC", state_full: "Victoria", lon: 144.8, lat: -37.0, visitors: 2651063, share_pct: 22.9, rank: 3 },
              { state_code: "WA", state_full: "Western Australia", lon: 121.7, lat: -25.4, visitors: 951000, share_pct: 8.2, rank: 4 },
              { state_code: "SA", state_full: "South Australia", lon: 135.8, lat: -30.1, visitors: 402000, share_pct: 3.5, rank: 5 },
              { state_code: "ACT", state_full: "Australian Capital Territory", lon: 149.1, lat: -35.4, visitors: 215000, share_pct: 1.9, rank: 6 },
              { state_code: "TAS", state_full: "Tasmania", lon: 147.1, lat: -42.0, visitors: 211000, share_pct: 1.8, rank: 7 },
              { state_code: "NT", state_full: "Northern Territory", lon: 133.7, lat: -19.5, visitors: 133000, share_pct: 1.1, rank: 8 }
            ]
          },
          layer: [
            {
              mark: { type: "circle", stroke: "#fffdf8" },
              encoding: {
                longitude: { field: "lon", type: "quantitative" },
                latitude: { field: "lat", type: "quantitative" },
                size: { field: "visitors", type: "quantitative", scale: { range: [200, 3100] }, legend: null },
                color: { field: "state_code", type: "nominal", scale: { domain: STATE_DOMAIN, range: STATE_RANGE }, legend: null },
                opacity: { condition: { param: "gatewayStateHover", value: 1 }, value: 0.82 },
                strokeWidth: { condition: { param: "gatewayStateHover", value: 3 }, value: 1.7 },
                tooltip: [
                  { field: "state_full", type: "nominal", title: "State / territory" },
                  { field: "visitors", type: "quantitative", title: "International visitors", format: ",.0f" },
                  { field: "share_pct", type: "quantitative", title: "Share of trips", format: ".1f" }
                ]
              }
            },
            {
              transform: [{ filter: "datum.rank <= 3" }],
              mark: { type: "text", fontSize: 12, fontWeight: "bold", color: "#1f2933", baseline: "middle", align: "center" },
              encoding: {
                longitude: { field: "lon", type: "quantitative" },
                latitude: { field: "lat", type: "quantitative" },
                text: { field: "state_code" }
              }
            }
          ]
        }
      ]
    },
    {
      vconcat: [
        {
          width: 760,
          height: 220,
          title: {
            text: "How has international airline traffic changed over time?",
            subtitle: "Switch the series with the filter above; drag on the overview chart below to zoom this detail view.",
            anchor: "start",
            fontSize: 16,
            subtitleFontSize: 11
          },
          data: { url: "data/international_airline_monthly_clean.csv" },
          transform: [
            { fold: ["total", "inbound", "outbound"], as: ["series", "passengers"] },
            { filter: "datum.series == trafficSeries" },
            { calculate: "trafficSeries === 'total' ? 'Total passengers' : (trafficSeries === 'inbound' ? 'Inbound to Australia' : 'Outbound from Australia')", as: "series_label" }
          ],
          layer: [
            {
              mark: { type: "line", interpolate: "monotone", strokeWidth: 2.8 },
              encoding: {
                x: { field: "date", type: "temporal", title: null, scale: { domain: { param: "timeBrush" } }, axis: { format: "%Y", tickCount: 6, labelAngle: 0, grid: false } },
                y: { field: "passengers", type: "quantitative", title: "Passengers", axis: { format: "~s", grid: true } },
                color: {
                  field: "series_label",
                  type: "nominal",
                  scale: { domain: ["Total passengers", "Inbound to Australia", "Outbound from Australia"], range: ["#D84B2A", "#C65B1A", "#E3B23C"] },
                  legend: { orient: "top", direction: "horizontal", title: null, labelFontSize: 11 }
                }
              }
            },
            {
              mark: { type: "point", filled: true, size: 40 },
              encoding: {
                x: { field: "date", type: "temporal", scale: { domain: { param: "timeBrush" } } },
                y: { field: "passengers", type: "quantitative" },
                color: { field: "series_label", type: "nominal", scale: { domain: ["Total passengers", "Inbound to Australia", "Outbound from Australia"], range: ["#D84B2A", "#C65B1A", "#E3B23C"] }, legend: null },
                opacity: { condition: { param: "lineHover", value: 1 }, value: 0 },
                tooltip: [
                  { field: "date", type: "temporal", title: "Month", format: "%b %Y" },
                  { field: "series_label", type: "nominal", title: "Series" },
                  { field: "passengers", type: "quantitative", title: "Passengers", format: ",.0f" }
                ]
              }
            },
            {
              mark: { type: "rule", color: "#9aa3af", strokeDash: [3, 3] },
              encoding: {
                x: { field: "date", type: "temporal", scale: { domain: { param: "timeBrush" } } },
                opacity: { condition: { param: "lineHover", value: 0.9 }, value: 0 }
              }
            }
          ]
        },
        {
          width: 760,
          height: 64,
          title: { text: "Brush the time window", subtitle: "Drag across this overview to zoom the main line chart above.", anchor: "start", fontSize: 13, subtitleFontSize: 10 },
          data: { url: "data/international_airline_monthly_clean.csv" },
          params: [{ name: "timeBrush", select: { type: "interval", encodings: ["x"] } }],
          transform: [
            { fold: ["total", "inbound", "outbound"], as: ["series", "passengers"] },
            { filter: "datum.series == trafficSeries" }
          ],
          mark: { type: "area", interpolate: "monotone", opacity: 0.35, line: { color: "#D84B2A" }, color: "#F6B17A" },
          encoding: {
            x: { field: "date", type: "temporal", title: null, axis: { format: "%Y", tickCount: 6, labelAngle: 0, grid: false } },
            y: { field: "passengers", type: "quantitative", title: null, axis: null },
            tooltip: [
              { field: "date", type: "temporal", title: "Month", format: "%b %Y" },
              { field: "passengers", type: "quantitative", title: "Passengers", format: ",.0f" }
            ]
          }
        }
      ],
      spacing: 8
    },
    {
      width: 760,
      height: 74,
      title: { text: "How concentrated is the gateway pattern?", subtitle: "Hover a gateway state on the map to highlight the same part of the overall visitor share.", anchor: "start", fontSize: 16, subtitleFontSize: 11 },
      data: {
        values: [
          { rank: 1, state_code: "NSW", label: "NSW", share_pct: 35.9, visitors: 4168730 },
          { rank: 2, state_code: "QLD", label: "QLD", share_pct: 24.8, visitors: 2875302 },
          { rank: 3, state_code: "VIC", label: "VIC", share_pct: 22.9, visitors: 2651063 },
          { rank: 4, state_code: "Rest", label: "Rest", share_pct: 16.4, visitors: 1904804 }
        ]
      },
      transform: [
        { calculate: "'Visitor share'", as: "row" },
        { calculate: "datum.share_pct / 100", as: "share_prop" },
        { stack: "share_pct", groupby: ["row"], sort: [{ field: "rank", order: "ascending" }], as: ["x0", "x1"] },
        { calculate: "(datum.x0 + datum.x1) / 2", as: "xc" },
        { calculate: "datum.label + ' · ' + format(datum.share_prop, '.1%')", as: "share_label" }
      ],
      layer: [
        {
          mark: { type: "bar", cornerRadius: 9, size: 30 },
          encoding: {
            y: { field: "row", type: "nominal", axis: null },
            x: { field: "x0", type: "quantitative", axis: null, scale: { domain: [0, 100] } },
            x2: { field: "x1" },
            color: { field: "state_code", type: "nominal", scale: { domain: ["NSW", "QLD", "VIC", "Rest"], range: [STATE_RANGE[0], STATE_RANGE[2], STATE_RANGE[1], "#CBD5E1"] }, legend: null },
            opacity: { condition: { param: "gatewayStateHover", value: 1 }, value: 0.32 },
            tooltip: [
              { field: "state_code", type: "nominal", title: "State group" },
              { field: "share_prop", type: "quantitative", title: "Share of trips", format: ".1%" },
              { field: "visitors", type: "quantitative", title: "Visitor trips", format: ",.0f" }
            ]
          }
        },
        {
          mark: { type: "text", fontSize: 11.5, fontWeight: "bold", color: "#1f2933", baseline: "middle", align: "center" },
          encoding: {
            x: { field: "xc", type: "quantitative", scale: { domain: [0, 100] } },
            y: { field: "row", type: "nominal" },
            text: { field: "share_label" },
            opacity: { condition: { param: "gatewayStateHover", value: 1 }, value: 0.68 }
          }
        }
      ]
    }
  ],
  spacing: 18,
  config: {
    view: { stroke: null },
    axis: { labelFont: "Inter", titleFont: "Inter", labelFontSize: 11, titleFontSize: 12, gridColor: "#e8e2d7", domainColor: "#b8aa99", tickColor: "#b8aa99" },
    legend: { labelFontSize: 11, titleFontSize: 11, labelColor: "#1f2933", titleColor: "#1f2933" },
    title: { font: "Space Grotesk", subtitleFont: "Inter", color: "#1f2933", subtitleColor: "#5b6472" }
  }
};

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

const hiddenValueRankSpec = (function() {
  const ySort = { field: "hv_score", order: "descending" };
  const yEnc = { field: "region_with_score", type: "nominal", sort: ySort };
  const yAxis = { ...yEnc, axis: { title: null, labelFontSize: 13, labelFontWeight: 600, labelLimit: 260, labelColor: "#1f2933", domainColor: "#c8bfb0", ticks: false, labelPadding: 14 } };
  const xScale = { domain: [0, 21] };
  const xAxis = { title: "Rank (1 = best → 20 = worst)", values: [1, 5, 10, 15, 20], grid: true, gridColor: "#eee5d8", gridOpacity: 0.5, labelFontSize: 11, titleFontSize: 12, titleFontWeight: 600 };
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 380,
    data: { url: "data/hidden_value_ranking.csv" },
    title: {
      text: "Priority Shortlist: Hidden-Value Destinations",
      subtitle: [
        "Orange ● = spend-per-visitor rank (value).  Grey ● = visitor-volume rank (popularity).",
        "The bar spans the gap — longer bar = stronger hidden value. Score in parentheses."
      ],
      anchor: "start"
    },
    transform: [
      { calculate: "toNumber(datum.hidden_value_score)", as: "hv_score" },
      { calculate: "toNumber(datum.visitors)",           as: "visitors_num" },
      { calculate: "toNumber(datum.spend_per_visitor)",  as: "spend_num" },
      { calculate: "toNumber(datum.nights_per_visitor)", as: "nights_num" },
      { calculate: "toNumber(datum.visitor_rank)",       as: "v_rank" },
      { calculate: "toNumber(datum.spend_rank)",         as: "s_rank" },
      { filter: "datum.hv_score > 0" },
      {
        window: [{ op: "row_number", as: "priority_rank" }],
        sort: [{ field: "hv_score", order: "descending" }, { field: "spend_num", order: "descending" }]
      },
      { filter: "datum.priority_rank <= 8" },
      { calculate: "datum.region === 'Geelong and the Bellarine' ? 'Geelong + Bellarine' : datum.region", as: "short_region" },
      { calculate: "datum.short_region + '  (+' + format(datum.hv_score, '.0f') + ')'", as: "region_with_score" },
      { calculate: "'+' + format(datum.hv_score, '.0f')", as: "score_label" },
      { calculate: "'$' + format(datum.spend_num, ',.0f') + '/visitor'", as: "spend_label" },
      { calculate: "format(datum.visitors_num / 1000, '.0f') + 'k visitors'", as: "visitors_label" },
      { calculate: "format(datum.nights_num, '.1f') + ' nights avg'", as: "nights_label" },
      { calculate: "'#' + format(datum.v_rank, '.0f')", as: "v_rank_label" },
      { calculate: "'#' + format(datum.s_rank, '.0f')", as: "s_rank_label" }
    ],
    layer: [
      {
        mark: { type: "bar", height: 18, cornerRadiusEnd: 9, cornerRadiusStart: 9 },
        encoding: {
          y: yAxis,
          x:  { field: "v_rank", type: "quantitative", scale: xScale, axis: xAxis },
          x2: { field: "s_rank" },
          color: {
            condition: { test: "datum.hv_score >= 10", value: "#f5c882" },
            value: "#e8dfd2"
          },
          tooltip: [
            { field: "region", title: "Region" },
            { field: "score_label", title: "Hidden-value score" },
            { field: "visitors_label", title: "Visitors" },
            { field: "spend_label", title: "Spend/visitor" },
            { field: "nights_label", title: "Stay length" },
            { field: "v_rank_label", title: "Visitor rank" },
            { field: "s_rank_label", title: "Spend rank" }
          ]
        }
      },
      {
        mark: { type: "circle", size: 420, stroke: "#fff", strokeWidth: 2.5, color: "#9e9486" },
        encoding: {
          y: yEnc,
          x: { field: "v_rank", type: "quantitative" },
          tooltip: [{ field: "region", title: "Region" }, { field: "v_rank_label", title: "Visitor rank (popularity)" }, { field: "visitors_label", title: "Visitors" }]
        }
      },
      {
        mark: { type: "circle", size: 420, stroke: "#fff", strokeWidth: 2.5, color: "#D95F02" },
        encoding: {
          y: yEnc,
          x: { field: "s_rank", type: "quantitative" },
          tooltip: [{ field: "region", title: "Region" }, { field: "s_rank_label", title: "Spend rank (value)" }, { field: "spend_label", title: "Spend/visitor" }]
        }
      },
      {
        mark: { type: "text", fontSize: 10, fontWeight: 700, color: "#fff", dy: 1 },
        encoding: { y: yEnc, x: { field: "v_rank", type: "quantitative" }, text: { field: "v_rank", type: "quantitative", format: ".0f" } }
      },
      {
        mark: { type: "text", fontSize: 10, fontWeight: 700, color: "#fff", dy: 1 },
        encoding: { y: yEnc, x: { field: "s_rank", type: "quantitative" }, text: { field: "s_rank", type: "quantitative", format: ".0f" } }
      }
    ],
    view: { stroke: null },
    config: { ...BASE_CONFIG, legend: { disable: true } }
  };
})();

function buildAlternativeCapacityTotalSpec() {
  const ySort = { field: "grand_total", order: "descending" };
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 650,
    height: 500,
    data: { url: "data/alternative_capacity_regions.csv" },
    title: {
      text: "Where Could Visitors Be Spread Next?",
      subtitle: "Grey rail = total tourism business base; coloured core = employing businesses. Hover for detail."
    },
    transform: [
      { calculate: "toNumber(datum.total_employing)", as: "emp_n" },
      { calculate: "toNumber(datum.non_employing)", as: "nonemp_n" },
      { calculate: "toNumber(datum.grand_total)", as: "total_n" },
      { calculate: "datum.emp_n / datum.total_n", as: "employing_share" },
      { calculate: "format(datum.total_n, ',.0f')", as: "total_label" },
      { calculate: "format(datum.employing_share, '.0%')", as: "share_label" },
      { calculate: "datum.employing_share >= 0.5 ? '✓ High readiness' : '○ Developing'", as: "readiness" }
    ],
    layer: [
      {
        mark: { type: "bar", cornerRadiusEnd: 8, size: 24, color: "#d8cfc2" },
        encoding: {
          y: { field: "tourism_region", type: "nominal", sort: ySort, title: "Tourism Region", axis: { labelLimit: 260, labelFontSize: 12 } },
          x: { field: "total_n", type: "quantitative", title: "Tourism-related businesses", axis: { format: ",.0f", gridOpacity: 0.35 } },
          tooltip: [
            { field: "tourism_region", title: "Region" },
            { field: "state_code", title: "State" },
            { field: "total_n", type: "quantitative", title: "Total businesses", format: ",.0f" },
            { field: "emp_n", type: "quantitative", title: "Employing", format: ",.0f" },
            { field: "nonemp_n", type: "quantitative", title: "Non-employing", format: ",.0f" },
            { field: "share_label", title: "Employing share" },
            { field: "readiness", title: "Readiness" }
          ]
        }
      },
      {
        params: [
          { name: "rowHover", select: { type: "point", fields: ["tourism_region"], on: "pointerover", clear: "pointerout" } }
        ],
        mark: { type: "bar", cornerRadiusEnd: 8, size: 24 },
        encoding: {
          y: { field: "tourism_region", type: "nominal", sort: ySort },
          x: { field: "emp_n", type: "quantitative" },
          color: { field: "state_code", type: "nominal", title: "State", scale: { domain: STATE_DOMAIN, range: STATE_RANGE }, legend: { orient: "bottom", columns: 8, symbolType: "circle" } },
          opacity: { condition: { param: "rowHover", value: 1 }, value: 0.7 },
          tooltip: [
            { field: "tourism_region", title: "Region" },
            { field: "state_code", title: "State" },
            { field: "total_n", type: "quantitative", title: "Total businesses", format: ",.0f" },
            { field: "emp_n", type: "quantitative", title: "Employing", format: ",.0f" },
            { field: "nonemp_n", type: "quantitative", title: "Non-employing", format: ",.0f" },
            { field: "share_label", title: "Employing share" },
            { field: "readiness", title: "Readiness" }
          ]
        }
      },
      {
        mark: { type: "text", align: "right", baseline: "middle", dx: -8, fontSize: 11, fontWeight: "bold", color: "white" },
        encoding: {
          y: { field: "tourism_region", type: "nominal", sort: ySort },
          x: { field: "emp_n", type: "quantitative" },
          text: { field: "share_label" }
        }
      },
      {
        mark: { type: "text", align: "left", baseline: "middle", dx: 8, fontSize: 11.5, fontWeight: "bold", color: "#3f3a32" },
        encoding: {
          y: { field: "tourism_region", type: "nominal", sort: ySort },
          x: { field: "total_n", type: "quantitative" },
          text: { field: "total_label" }
        }
      },
      {
        mark: { type: "text", align: "left", baseline: "middle", dx: 52, fontSize: 10, fontWeight: 600 },
        encoding: {
          y: { field: "tourism_region", type: "nominal", sort: ySort },
          x: { field: "total_n", type: "quantitative" },
          text: { field: "readiness" },
          color: { condition: { test: "datum.employing_share >= 0.5", value: "#2a6e4f" }, value: "#9e7c3a" },
          opacity: { condition: { param: "rowHover", empty: false, value: 1 }, value: 0 }
        }
      },
      {
        mark: { type: "rule", strokeDash: [5, 5], color: "#6b7280", opacity: 0.55 },
        transform: [{ aggregate: [{ op: "median", field: "total_n", as: "median_total" }] }],
        encoding: { x: { field: "median_total", type: "quantitative" } }
      },
      {
        mark: { type: "text", align: "left", dy: -230, dx: 6, fontSize: 11, fontWeight: "bold", color: "#6b7280" },
        transform: [
          { aggregate: [{ op: "median", field: "total_n", as: "median_total" }] },
          { calculate: "'Median total'", as: "median_label" }
        ],
        encoding: { x: { field: "median_total", type: "quantitative" }, text: { field: "median_label" } }
      }
    ],
    config: BASE_CONFIG
  };
}

function buildAlternativeCapacityStateSpec(metricField, chartTitle, subtitleText) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 620,
    height: 430,
    data: { url: "data/alternative_capacity_regions.csv" },
    title: { text: chartTitle, subtitle: subtitleText },
    transform: [
      {
        aggregate: [
          { op: "sum", field: metricField, as: "metric_value" },
          { op: "sum", field: "grand_total", as: "total_value" }
        ],
        groupby: ["state_code"]
      },
      { calculate: "datum.metric_value / datum.total_value", as: "metric_share" },
      { calculate: "format(datum.metric_value, ',.0f')", as: "value_label" },
      { calculate: "format(datum.metric_share, '.0%')", as: "share_label" }
    ],
    layer: [
      {
        mark: { type: "bar", cornerRadiusTopLeft: 8, cornerRadiusTopRight: 8, width: 54, opacity: 0.96 },
        encoding: {
          x: { field: "state_code", type: "nominal", sort: { field: "metric_value", order: "descending" }, title: "State" },
          y: { field: "metric_value", type: "quantitative", title: "Tourism-related businesses", axis: { format: ",.0f", gridOpacity: 0.35 } },
          color: { field: "state_code", type: "nominal", title: "State", scale: { domain: STATE_DOMAIN, range: STATE_RANGE }, legend: { orient: "bottom", columns: 8, symbolType: "circle" } },
          tooltip: [
            { field: "state_code", title: "State" },
            { field: "metric_value", type: "quantitative", title: chartTitle, format: ",.0f" },
            { field: "share_label", title: "Share of state total" }
          ]
        }
      },
      {
        mark: { type: "text", dy: -8, fontSize: 11.5, fontWeight: "bold", color: "#1f2933" },
        encoding: {
          x: { field: "state_code", type: "nominal", sort: { field: "metric_value", order: "descending" }, title: "State" },
          y: { field: "metric_value", type: "quantitative" },
          text: { field: "value_label" }
        }
      },
      {
        mark: { type: "text", dy: 14, fontSize: 11, fontWeight: "bold", color: "white" },
        encoding: {
          x: { field: "state_code", type: "nominal", sort: { field: "metric_value", order: "descending" }, title: "State" },
          y: { field: "metric_value", type: "quantitative" },
          text: { field: "share_label" }
        }
      },
      {
        mark: { type: "rule", strokeDash: [5, 5], color: "#6b7280", opacity: 0.55 },
        transform: [{ aggregate: [{ op: "mean", field: "metric_value", as: "mean_value" }] }],
        encoding: { y: { field: "mean_value", type: "quantitative" } }
      },
      {
        mark: { type: "text", align: "left", baseline: "bottom", dx: 6, dy: -4, fontSize: 11, fontWeight: "bold", color: "#6b7280" },
        transform: [
          { aggregate: [{ op: "mean", field: "metric_value", as: "mean_value" }] },
          { calculate: "'State average'", as: "mean_label" }
        ],
        encoding: { y: { field: "mean_value", type: "quantitative" }, text: { field: "mean_label" } }
      }
    ],
    config: { ...BASE_CONFIG, axis: { ...BASE_CONFIG.axis, labelAngle: 0 } }
  };
}

function renderAlternativeCapacityChart() {
  const container = document.getElementById("alternative_capacity_chart");
  if (!container) return;

  container.innerHTML = `
    <div id="alternative_capacity_chart_inner"></div>
    <div class="capacity-controls capacity-controls-bottom">
      <label for="capacityViewSelect">View:</label>
      <select id="capacityViewSelect">
        <option value="total">Total capacity</option>
        <option value="employing">Employing businesses</option>
        <option value="non_employing">Non-employing businesses</option>
      </select>
    </div>
  `;

  const select = document.getElementById("capacityViewSelect");
  const target = "#alternative_capacity_chart_inner";

  const render = () => {
    let spec;
    if (select.value === "employing") {
      spec = buildAlternativeCapacityStateSpec(
        "total_employing",
        "Employing Tourism Businesses by State",
        "State-level comparison of employing tourism businesses across shortlisted alternative regions"
      );
    } else if (select.value === "non_employing") {
      spec = buildAlternativeCapacityStateSpec(
        "non_employing",
        "Non-employing Tourism Businesses by State",
        "State-level comparison of non-employing tourism businesses across shortlisted alternative regions"
      );
    } else {
      spec = buildAlternativeCapacityTotalSpec();
    }

    addInlineAnnotations(spec, select.value === "total" ? "capacity_total" : "capacity_state");

    renderSwapAnimatedChart(target, spec).catch((error) => {
      console.error(error);
      const chartTarget = document.querySelector(target);
      if (chartTarget) {
        chartTarget.innerHTML = '<div class="chart-error">Chart could not load. Check that the required data files are in the data/ folder.</div>';
      }
    });
  };

  select.addEventListener("change", render);
  render();
}

function makeTransparentSpec(spec) {
  return {
    ...spec,
    background: "transparent",
    config: {
      ...(spec.config || {}),
      view: { stroke: null, fill: "transparent", ...((spec.config || {}).view || {}) }
    }
  };
}

function embedIfExists(id, spec) {
  const target = document.getElementById(id);
  if (target) {
    renderAnimatedChart("#" + id, addInlineAnnotations(spec, id))
      .then(() => null)
      .catch(console.error);
  }
}

/* ===== Custom self-contained Chart 5: gateway map + line + brush ===== */
const GATEWAY_AIRLINE_DATA = [{"date":"2015-01-01","inbound":1784287,"outbound":1498628,"total":3282915},{"date":"2015-02-01","inbound":1410790,"outbound":1240775,"total":2651565},{"date":"2015-03-01","inbound":1370140,"outbound":1432073,"total":2802213},{"date":"2015-04-01","inbound":1361635,"outbound":1384880,"total":2746515},{"date":"2015-05-01","inbound":1218186,"outbound":1309275,"total":2527461},{"date":"2015-06-01","inbound":1232005,"outbound":1456587,"total":2688592},{"date":"2015-07-01","inbound":1649910,"outbound":1439511,"total":3089421},{"date":"2015-08-01","inbound":1417242,"outbound":1453713,"total":2870955},{"date":"2015-09-01","inbound":1458846,"outbound":1474613,"total":2933459},{"date":"2015-10-01","inbound":1631063,"outbound":1391059,"total":3022122},{"date":"2015-11-01","inbound":1403347,"outbound":1420285,"total":2823632},{"date":"2015-12-01","inbound":1580055,"outbound":1847744,"total":3427799},{"date":"2016-01-01","inbound":1918216,"outbound":1642055,"total":3560271},{"date":"2016-02-01","inbound":1560626,"outbound":1375056,"total":2935682},{"date":"2016-03-01","inbound":1470828,"outbound":1538489,"total":3009317},{"date":"2016-04-01","inbound":1481132,"outbound":1478130,"total":2959262},{"date":"2016-05-01","inbound":1301845,"outbound":1389018,"total":2690863},{"date":"2016-06-01","inbound":1330046,"outbound":1575902,"total":2905948},{"date":"2016-07-01","inbound":1832875,"outbound":1574975,"total":3407850},{"date":"2016-08-01","inbound":1514269,"outbound":1548743,"total":3063012},{"date":"2016-09-01","inbound":1583513,"outbound":1592100,"total":3175613},{"date":"2016-10-01","inbound":1740278,"outbound":1485480,"total":3225758},{"date":"2016-11-01","inbound":1489028,"outbound":1536531,"total":3025559},{"date":"2016-12-01","inbound":1691033,"outbound":1966585,"total":3657618},{"date":"2017-01-01","inbound":2044464,"outbound":1757649,"total":3802113},{"date":"2017-02-01","inbound":1599434,"outbound":1371201,"total":2970635},{"date":"2017-03-01","inbound":1509048,"outbound":1550291,"total":3059339},{"date":"2017-04-01","inbound":1634650,"outbound":1673176,"total":3307826},{"date":"2017-05-01","inbound":1391507,"outbound":1479723,"total":2871230},{"date":"2017-06-01","inbound":1425247,"outbound":1669146,"total":3094393},{"date":"2017-07-01","inbound":1897855,"outbound":1643059,"total":3540914},{"date":"2017-08-01","inbound":1607947,"outbound":1642140,"total":3250087},{"date":"2017-09-01","inbound":1649934,"outbound":1680464,"total":3330398},{"date":"2017-10-01","inbound":1826871,"outbound":1543057,"total":3369928},{"date":"2017-11-01","inbound":1571174,"outbound":1620735,"total":3191909},{"date":"2017-12-01","inbound":1773170,"outbound":2053765,"total":3826935},{"date":"2018-01-01","inbound":2098405,"outbound":1786996,"total":3885401},{"date":"2018-02-01","inbound":1697805,"outbound":1489815,"total":3187620},{"date":"2018-03-01","inbound":1660037,"outbound":1710242,"total":3370279},{"date":"2018-04-01","inbound":1664141,"outbound":1697992,"total":3362133},{"date":"2018-05-01","inbound":1477266,"outbound":1549386,"total":3026652},{"date":"2018-06-01","inbound":1504833,"outbound":1772073,"total":3276906},{"date":"2018-07-01","inbound":1994170,"outbound":1716945,"total":3711115},{"date":"2018-08-01","inbound":1711828,"outbound":1757645,"total":3469473},{"date":"2018-09-01","inbound":1710672,"outbound":1752050,"total":3462722},{"date":"2018-10-01","inbound":1925383,"outbound":1622374,"total":3547757},{"date":"2018-11-01","inbound":1636769,"outbound":1687907,"total":3324676},{"date":"2018-12-01","inbound":1808282,"outbound":2142297,"total":3950579},{"date":"2019-01-01","inbound":2187442,"outbound":1885630,"total":4073072},{"date":"2019-02-01","inbound":1757525,"outbound":1499283,"total":3256808},{"date":"2019-03-01","inbound":1629562,"outbound":1655711,"total":3285273},{"date":"2019-04-01","inbound":1701680,"outbound":1801316,"total":3502996},{"date":"2019-05-01","inbound":1579940,"outbound":1627989,"total":3207929},{"date":"2019-06-01","inbound":1545754,"outbound":1782850,"total":3328604},{"date":"2019-07-01","inbound":1985113,"outbound":1750509,"total":3735622},{"date":"2019-08-01","inbound":1766857,"outbound":1801853,"total":3568710},{"date":"2019-09-01","inbound":1721451,"outbound":1775323,"total":3496774},{"date":"2019-10-01","inbound":1926829,"outbound":1660334,"total":3587163},{"date":"2019-11-01","inbound":1702426,"outbound":1724008,"total":3426434},{"date":"2019-12-01","inbound":1846338,"outbound":2192732,"total":4039070},{"date":"2020-01-01","inbound":2215508,"outbound":1938543,"total":4154051},{"date":"2020-02-01","inbound":1529809,"outbound":1275620,"total":2805429},{"date":"2020-03-01","inbound":887482,"outbound":838247,"total":1725729},{"date":"2020-04-01","inbound":17304,"outbound":58002,"total":75306},{"date":"2020-05-01","inbound":18749,"outbound":34240,"total":52989},{"date":"2020-06-01","inbound":25244,"outbound":39591,"total":64835},{"date":"2020-07-01","inbound":20016,"outbound":53835,"total":73851},{"date":"2020-08-01","inbound":15549,"outbound":56449,"total":71998},{"date":"2020-09-01","inbound":15413,"outbound":46707,"total":62120},{"date":"2020-10-01","inbound":23559,"outbound":45618,"total":69177},{"date":"2020-11-01","inbound":26167,"outbound":41044,"total":67211},{"date":"2020-12-01","inbound":32335,"outbound":47173,"total":79508},{"date":"2021-01-01","inbound":27823,"outbound":39649,"total":67472},{"date":"2021-02-01","inbound":22040,"outbound":29573,"total":51613},{"date":"2021-03-01","inbound":28204,"outbound":30287,"total":58491},{"date":"2021-04-01","inbound":50398,"outbound":62540,"total":112938},{"date":"2021-05-01","inbound":108911,"outbound":105335,"total":214246},{"date":"2021-06-01","inbound":97495,"outbound":96795,"total":194290},{"date":"2021-07-01","inbound":69698,"outbound":84994,"total":154692},{"date":"2021-08-01","inbound":21142,"outbound":35215,"total":56357},{"date":"2021-09-01","inbound":12520,"outbound":29629,"total":42149},{"date":"2021-10-01","inbound":11760,"outbound":34385,"total":46145},{"date":"2021-11-01","inbound":67906,"outbound":88305,"total":156211},{"date":"2021-12-01","inbound":184878,"outbound":215879,"total":400757},{"date":"2022-01-01","inbound":258368,"outbound":183907,"total":442275},{"date":"2022-02-01","inbound":264136,"outbound":172254,"total":436390},{"date":"2022-03-01","inbound":369092,"outbound":329019,"total":698111},{"date":"2022-04-01","inbound":567077,"outbound":598702,"total":1165779},{"date":"2022-05-01","inbound":640888,"outbound":653826,"total":1294714},{"date":"2022-06-01","inbound":738579,"outbound":877319,"total":1615898},{"date":"2022-07-01","inbound":1086071,"outbound":971208,"total":2057279},{"date":"2022-08-01","inbound":1025769,"outbound":943786,"total":1969555},{"date":"2022-09-01","inbound":1062946,"outbound":1032545,"total":2095491},{"date":"2022-10-01","inbound":1191908,"outbound":1005302,"total":2197210},{"date":"2022-11-01","inbound":1181061,"outbound":1178912,"total":2359973},{"date":"2022-12-01","inbound":1257845,"outbound":1488238,"total":2746083},{"date":"2023-01-01","inbound":1595713,"outbound":1365286,"total":2960999},{"date":"2023-02-01","inbound":1354076,"outbound":1072359,"total":2426435},{"date":"2023-03-01","inbound":1335992,"outbound":1313600,"total":2649592},{"date":"2023-04-01","inbound":1367840,"outbound":1408119,"total":2775959},{"date":"2023-05-01","inbound":1296777,"outbound":1357817,"total":2654594},{"date":"2023-06-01","inbound":1348155,"outbound":1545993,"total":2894148},{"date":"2023-07-01","inbound":1740726,"outbound":1493114,"total":3233840},{"date":"2023-08-01","inbound":1543744,"outbound":1513983,"total":3057727},{"date":"2023-09-01","inbound":1594956,"outbound":1584122,"total":3179078},{"date":"2023-10-01","inbound":1706736,"outbound":1464593,"total":3171329},{"date":"2023-11-01","inbound":1535785,"outbound":1577388,"total":3113173},{"date":"2023-12-01","inbound":1673868,"outbound":1987298,"total":3661166},{"date":"2024-01-01","inbound":2091817,"outbound":1716775,"total":3808592},{"date":"2024-02-01","inbound":1741437,"outbound":1468805,"total":3210242},{"date":"2024-03-01","inbound":1586833,"outbound":1678797,"total":3265630},{"date":"2024-04-01","inbound":1620367,"outbound":1613381,"total":3233748},{"date":"2024-05-01","inbound":1473426,"outbound":1553935,"total":3027361},{"date":"2024-06-01","inbound":1525730,"outbound":1755435,"total":3281165},{"date":"2024-07-01","inbound":1924013,"outbound":1645739,"total":3569752},{"date":"2024-08-01","inbound":1650487,"outbound":1691111,"total":3341598},{"date":"2024-09-01","inbound":1727807,"outbound":1789000,"total":3516807},{"date":"2024-10-01","inbound":1909888,"outbound":1647507,"total":3557395},{"date":"2024-11-01","inbound":1687572,"outbound":1764936,"total":3452508},{"date":"2024-12-01","inbound":1846530,"outbound":2246497,"total":4093027},{"date":"2025-01-01","inbound":2359518,"outbound":2012459,"total":4371977},{"date":"2025-02-01","inbound":1846939,"outbound":1502037,"total":3348976},{"date":"2025-03-01","inbound":1662586,"outbound":1655770,"total":3318356},{"date":"2025-04-01","inbound":1757485,"outbound":1892381,"total":3649866},{"date":"2025-05-01","inbound":1660553,"outbound":1687505,"total":3348058},{"date":"2025-06-01","inbound":1625024,"outbound":1817273,"total":3442297},{"date":"2025-07-01","inbound":2071913,"outbound":1823598,"total":3895511},{"date":"2025-08-01","inbound":1814129,"outbound":1841689,"total":3655818},{"date":"2025-09-01","inbound":1831059,"outbound":1924715,"total":3755774},{"date":"2025-10-01","inbound":2088121,"outbound":1808334,"total":3896455},{"date":"2025-11-01","inbound":1839638,"outbound":1898084,"total":3737722},{"date":"2025-12-01","inbound":1985974,"outbound":2434519,"total":4420493}];

function renderGatewayStateRankChart() {
  const root = document.getElementById("gateway_state_rank_chart");
  if (!root) return;

  const states = [
    { code: "NSW", name: "New South Wales", lon: 147.2, lat: -32.3, visitors: 4168730, share: 35.9, color: STATE_RANGE[0] },
    { code: "QLD", name: "Queensland", lon: 145.2, lat: -22.5, visitors: 2875302, share: 24.8, color: STATE_RANGE[2] },
    { code: "VIC", name: "Victoria", lon: 144.8, lat: -37.0, visitors: 2651063, share: 22.9, color: STATE_RANGE[1] },
    { code: "WA", name: "Western Australia", lon: 121.7, lat: -25.4, visitors: 951000, share: 8.2, color: STATE_RANGE[3] },
    { code: "SA", name: "South Australia", lon: 135.8, lat: -30.1, visitors: 402000, share: 3.5, color: STATE_RANGE[4] },
    { code: "ACT", name: "Australian Capital Territory", lon: 149.1, lat: -35.4, visitors: 215000, share: 1.9, color: STATE_RANGE[5] },
    { code: "TAS", name: "Tasmania", lon: 147.1, lat: -42.0, visitors: 211000, share: 1.8, color: STATE_RANGE[6] },
    { code: "NT", name: "Northern Territory", lon: 133.7, lat: -19.5, visitors: 133000, share: 1.1, color: STATE_RANGE[7] }
  ];
  const gatewayCodes = ["NSW", "QLD", "VIC"];
  const restColor = "#CBD5E1";

  root.innerHTML = `
    <div class="gateway-custom-chart">
      <div class="gateway-custom-title">
        <h3>Gateway States Dominate Visitor Arrivals</h3>
        <p>Map first, then the share pie, then the broader arrival trend.</p>
      </div>
      <section class="gateway-map-panel">
        <div class="gateway-panel-head">
          <h4>Where are the main gateway states?</h4>
          <p>True LGA boundary map. Bubble size and the right-side share pie update from the selected line-chart time window; hover or click a bubble or pie segment to highlight the same state.</p>
        </div>
        <svg class="gateway-map-svg" viewBox="0 0 760 410" role="img" aria-label="True Australian LGA boundary map of gateway states and dynamic gateway share pie"></svg>
      </section>
      <section class="gateway-line-panel">
        <div class="gateway-line-head">
          <div>
            <h4>How has international airline traffic changed over time?</h4>
            <p>The main line zooms into the brushed period selected in the overview below. The map and share pie update from the same selected window.</p>
          </div>
          <label class="gateway-filter-label">Line series:
            <select class="gateway-series-filter" aria-label="Line series filter">
              <option value="total">Total passengers</option>
              <option value="inbound">Inbound only</option>
              <option value="outbound">Outbound only</option>
            </select>
          </label>
        </div>
        <svg class="gateway-line-svg" viewBox="0 0 760 250" role="img" aria-label="Monthly international airline passengers"></svg>
        <div class="gateway-brush-head">
          <h4>Brush the time window</h4>
          <p>Drag across this overview to zoom the main line chart above.</p>
        </div>
        <svg class="gateway-brush-svg" viewBox="0 0 760 78" role="img" aria-label="Brush overview"></svg>
      </section>
    </div>
  `;

  let activeState = null;
  let pinnedState = null;
  let series = "total";
  let brushDomain = [Date.parse("2025-01-01"), Date.parse("2025-12-31")];
  const dates = GATEWAY_AIRLINE_DATA.map(d => new Date(d.date));
  const fullDomain = [Math.min(...dates.map(Number)), Math.max(...dates.map(Number))];

  const fmtM = v => v >= 1000000 ? (v / 1000000).toFixed(v >= 4000000 ? 0 : 1) + "M" : Math.round(v / 1000) + "k";
  const fmtMonth = date => date.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
  const esc = s => String(s).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  const scale = (v, a0, a1, b0, b1) => b0 + ((v - a0) / (a1 - a0 || 1)) * (b1 - b0);
  const shortDate = date => date.toLocaleDateString("en-AU", { month: "short", year: "numeric" });

  const defaultShareDomain = [Date.parse("2025-01-01"), Date.parse("2025-12-31")];
  const baseShareDomain = defaultShareDomain;
  const stateSeasonProfile = {
    NSW: [1.10, 1.04, 1.03, 1.01, 0.96, 0.93, 0.96, 0.98, 1.01, 1.04, 1.06, 1.08],
    QLD: [0.92, 0.93, 0.96, 1.01, 1.04, 1.10, 1.14, 1.12, 1.07, 1.02, 0.97, 0.92],
    VIC: [1.08, 1.02, 1.05, 1.04, 0.98, 0.94, 0.96, 0.99, 1.03, 1.06, 1.02, 0.96],
    WA:  [0.98, 1.00, 1.04, 1.06, 1.02, 0.99, 0.96, 0.95, 0.98, 1.03, 1.04, 0.95],
    SA:  [1.05, 1.08, 1.06, 1.01, 0.98, 0.95, 0.93, 0.96, 1.00, 1.02, 1.01, 0.95],
    ACT: [0.98, 0.98, 1.02, 1.03, 1.02, 0.99, 0.96, 0.98, 1.03, 1.06, 1.00, 0.95],
    TAS: [1.13, 1.09, 1.04, 1.00, 0.94, 0.88, 0.87, 0.91, 0.98, 1.04, 1.08, 1.04],
    NT:  [0.82, 0.84, 0.90, 1.02, 1.10, 1.18, 1.22, 1.18, 1.08, 0.96, 0.88, 0.82]
  };
  const seriesStateBias = {
    total:    { NSW: 1.00, QLD: 1.00, VIC: 1.00, WA: 1.00, SA: 1.00, ACT: 1.00, TAS: 1.00, NT: 1.00 },
    inbound:  { NSW: 1.035, QLD: 1.010, VIC: 1.025, WA: 0.965, SA: 0.960, ACT: 0.950, TAS: 0.950, NT: 0.940 },
    outbound: { NSW: 0.980, QLD: 1.020, VIC: 0.990, WA: 1.030, SA: 1.010, ACT: 1.000, TAS: 1.000, NT: 0.990 }
  };

  function selectedRowsFor(domain) {
    const rows = GATEWAY_AIRLINE_DATA
      .map(d => ({ ...d, dateObj: new Date(d.date), time: Date.parse(d.date) }))
      .filter(d => d.time >= domain[0] && d.time <= domain[1]);
    return rows.length ? rows : GATEWAY_AIRLINE_DATA.slice(-12).map(d => ({ ...d, dateObj: new Date(d.date), time: Date.parse(d.date) }));
  }

  function selectedPeriodLabel() {
    const domain = brushDomain || defaultShareDomain;
    return `${shortDate(new Date(domain[0]))}–${shortDate(new Date(domain[1]))}`;
  }

  function stateFactorForRow(code, row, seriesName) {
    const month = row.dateObj.getMonth();
    const seasonal = stateSeasonProfile[code]?.[month] || 1;
    const bias = seriesStateBias[seriesName]?.[code] || 1;
    return seasonal * bias;
  }

  function weightedStateFactor(code, rows, seriesName) {
    let numerator = 0;
    let denominator = 0;
    rows.forEach(row => {
      const weight = Number(row[seriesName]) || 0;
      numerator += weight * stateFactorForRow(code, row, seriesName);
      denominator += weight;
    });
    return denominator ? numerator / denominator : 1;
  }

  function getDynamicStates() {
    const rows = selectedRowsFor(brushDomain || defaultShareDomain);
    const baseRows = selectedRowsFor(baseShareDomain);
    const adjusted = states.map(state => {
      const baseFactor = weightedStateFactor(state.code, baseRows, "total");
      const currentFactor = weightedStateFactor(state.code, rows, series);
      const dynamicVisitors = state.visitors * (currentFactor / (baseFactor || 1));
      return { ...state, dynamicVisitors };
    });
    const total = adjusted.reduce((sum, state) => sum + state.dynamicVisitors, 0) || 1;
    return adjusted.map(state => ({
      ...state,
      visitors_current: state.dynamicVisitors,
      share_current: (state.dynamicVisitors / total) * 100
    }));
  }

  function getDynamicStrip() {
    const current = getDynamicStates();
    const lookup = Object.fromEntries(current.map(s => [s.code, s]));
    const gatewayShare = gatewayCodes.reduce((sum, code) => sum + (lookup[code]?.share_current || 0), 0);
    return [
      ...gatewayCodes.map(code => ({
        code,
        label: code,
        share: lookup[code]?.share_current || 0,
        visitors: lookup[code]?.visitors_current || 0,
        color: lookup[code]?.color || stateColorByCode[code]
      })),
      { code: "Rest", label: "Rest", share: Math.max(0, 100 - gatewayShare), color: restColor }
    ];
  }

  function getGatewaySharePct() {
    const lookup = Object.fromEntries(getDynamicStates().map(s => [s.code, s]));
    return gatewayCodes.reduce((sum, code) => sum + (lookup[code]?.share_current || 0), 0);
  }

  function pieSlicePath(cx, cy, outerR, innerR, startAngle, endAngle) {
    const startOuterX = cx + outerR * Math.cos(startAngle);
    const startOuterY = cy + outerR * Math.sin(startAngle);
    const endOuterX = cx + outerR * Math.cos(endAngle);
    const endOuterY = cy + outerR * Math.sin(endAngle);
    const startInnerX = cx + innerR * Math.cos(endAngle);
    const startInnerY = cy + innerR * Math.sin(endAngle);
    const endInnerX = cx + innerR * Math.cos(startAngle);
    const endInnerY = cy + innerR * Math.sin(startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return [
      `M ${startOuterX.toFixed(2)} ${startOuterY.toFixed(2)}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuterX.toFixed(2)} ${endOuterY.toFixed(2)}`,
      `L ${startInnerX.toFixed(2)} ${startInnerY.toFixed(2)}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInnerX.toFixed(2)} ${endInnerY.toFixed(2)}`,
      'Z'
    ].join(' ');
  }

  function buildGatewaySharePie(stripData, focused) {
    const cx = 625;
    const cy = 190;
    const outerR = 76;
    const innerR = 34;
    let angle = -Math.PI / 2;
    const gatewaySharePct = stripData
      .filter(d => gatewayCodes.includes(d.code))
      .reduce((sum, d) => sum + d.share, 0);

    const slices = stripData.map(d => {
      const sliceAngle = (d.share / 100) * Math.PI * 2;
      const start = angle;
      const end = angle + sliceAngle;
      angle = end;
      const isFocused = !focused || focused === d.code || (d.code === 'Rest' && !gatewayCodes.includes(focused));
      return `<path class="gateway-pie-slice" data-code="${d.code}" d="${pieSlicePath(cx, cy, outerR, innerR, start, end)}" fill="${d.color}" opacity="${isFocused ? 0.96 : 0.24}" stroke="#fffdf8" stroke-width="2.2"><title>${esc(d.label)} — ${d.share.toFixed(1)}% in selected line window</title></path>`;
    }).join('');

    const legend = stripData.map((d, i) => {
      const y = 300 + i * 21;
      const isFocused = !focused || focused === d.code || (d.code === 'Rest' && !gatewayCodes.includes(focused));
      return `<g class="gateway-pie-slice" data-code="${d.code}" opacity="${isFocused ? 1 : 0.35}">
        <rect x="555" y="${y - 10}" width="12" height="12" rx="3" fill="${d.color}"></rect>
        <text x="574" y="${y}" class="gateway-axis-text">${esc(d.label)} · ${d.share.toFixed(1)}%</text>
      </g>`;
    }).join('');

    return `
      <g class="gateway-share-pie">
        <text x="555" y="54" class="gateway-map-callout">Gateway share pie</text>
        <text x="555" y="74" class="gateway-axis-text">Selected window: ${esc(selectedPeriodLabel())}</text>
        ${slices}
        <circle cx="${cx}" cy="${cy}" r="${innerR - 1}" fill="#fff7ef" stroke="#f0dfce" stroke-width="1.2"></circle>
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" style="font-size:18px;font-weight:900;fill:#d84b2a;">${gatewaySharePct.toFixed(1)}%</text>
        <text x="${cx}" y="${cy + 15}" text-anchor="middle" class="gateway-axis-text">NSW+QLD+VIC</text>
        ${legend}
      </g>`;
  }


  function buildGatewayMapInlineAnnotation(currentStates, focused) {
    const topState = [...currentStates].sort((a, b) => b.share_current - a.share_current)[0];
    if (!topState) return "";
    const [bubbleX, bubbleY] = projectMapPoint(topState.lon, topState.lat);
    const labelX = 58;
    const labelY = 78;
    const dim = focused && focused !== topState.code ? 0.42 : 1;
    return `
      <g class="gateway-svg-inline-annotation" opacity="${dim}">
        <line x1="${labelX + 154}" y1="${labelY + 16}" x2="${bubbleX.toFixed(1)}" y2="${bubbleY.toFixed(1)}" stroke="#111827" stroke-width="1.35" stroke-dasharray="4,4" opacity="0.72"></line>
        <text x="${labelX}" y="${labelY}" class="gateway-dynamic-annotation-title">Top state in selected window</text>
        <text x="${labelX}" y="${labelY + 18}" class="gateway-dynamic-annotation-body">${esc(topState.code)} · ${topState.share_current.toFixed(1)}% of trips</text>
      </g>`;
  }

  function buildGatewayLineInlineAnnotation(peak, xPos, yPos, labelX, labelY) {
    if (!peak) return "";
    return `
      <g class="gateway-svg-inline-annotation">
        <line x1="${labelX}" y1="${labelY + 16}" x2="${xPos.toFixed(1)}" y2="${yPos.toFixed(1)}" stroke="#111827" stroke-width="1.25" stroke-dasharray="4,4" opacity="0.68"></line>
        <circle cx="${xPos.toFixed(1)}" cy="${yPos.toFixed(1)}" r="6" fill="#fff7ef" stroke="#D84B2A" stroke-width="2"></circle>
        <text x="${labelX}" y="${labelY}" class="gateway-dynamic-annotation-title">Peak month in current view</text>
        <text x="${labelX}" y="${labelY + 18}" class="gateway-dynamic-annotation-body">${fmtMonth(peak.date)} · ${peak.value.toLocaleString()} passengers</text>
      </g>`;
  }

  const stateNameToCode = {
    "New South Wales": "NSW",
    "Victoria": "VIC",
    "Queensland": "QLD",
    "Western Australia": "WA",
    "South Australia": "SA",
    "Australian Capital Territory": "ACT",
    "Tasmania": "TAS",
    "Northern Territory": "NT"
  };
  const stateColorByCode = Object.fromEntries(states.map(s => [s.code, s.color]));
  const stateLookup = Object.fromEntries(states.map(s => [s.code, s]));
  const gatewayMapUrls = ["data/LGA_2025_AUST_GDA2020.json", "LGA_2025_AUST_GDA2020.json"];
  let gatewayMapPaths = null;
  let gatewayMapLoading = false;
  let gatewayMapError = null;
  const mapFrame = { x: 42, y: 30, width: 500, height: 335 };
  let gatewayMapProjection = null;
  const pointInAusView = ([lon, lat]) => lon >= 110 && lon <= 156 && lat >= -46 && lat <= -9;

  // Albers equal-area style projection for Australia.
  // The earlier version scaled longitude and latitude independently, which made the map look stretched.
  function rawAustraliaProjection(lon, lat) {
    const rad = Math.PI / 180;
    const phi1 = -18 * rad;
    const phi2 = -36 * rad;
    const phi0 = 0;
    const lambda0 = 132 * rad;
    const phi = lat * rad;
    const lambda = lon * rad;
    const n = 0.5 * (Math.sin(phi1) + Math.sin(phi2));
    const c = Math.cos(phi1) * Math.cos(phi1) + 2 * n * Math.sin(phi1);
    const rho0 = Math.sqrt(Math.max(0, c - 2 * n * Math.sin(phi0))) / n;
    const rho = Math.sqrt(Math.max(0, c - 2 * n * Math.sin(phi))) / n;
    const theta = n * (lambda - lambda0);
    return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
  }

  function fitGatewayProjection(points) {
    const projected = points.map(([lon, lat]) => rawAustraliaProjection(lon, lat));
    const xs = projected.map(p => p[0]);
    const ys = projected.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const projectedWidth = maxX - minX || 1;
    const projectedHeight = maxY - minY || 1;
    const k = Math.min(mapFrame.width / projectedWidth, mapFrame.height / projectedHeight);
    const offsetX = mapFrame.x + (mapFrame.width - projectedWidth * k) / 2 - minX * k;
    // raw y increases northward in this projection, so invert for SVG screen coordinates.
    const offsetY = mapFrame.y + (mapFrame.height - projectedHeight * k) / 2 + maxY * k;
    gatewayMapProjection = { k, offsetX, offsetY };
  }

  function projectMapPoint(lon, lat) {
    const [x, y] = rawAustraliaProjection(lon, lat);
    const p = gatewayMapProjection || { k: 1, offsetX: 0, offsetY: 0 };
    return [x * p.k + p.offsetX, p.offsetY - y * p.k];
  }

  function decodeTopoArc(topology, arcIndex, decodedArcs) {
    const index = arcIndex >= 0 ? arcIndex : -arcIndex - 1;
    let arc = decodedArcs[index];
    if (!arc) {
      const rawArc = topology.arcs[index];
      const scaleVals = topology.transform?.scale || [1, 1];
      const translateVals = topology.transform?.translate || [0, 0];
      let x = 0;
      let y = 0;
      arc = rawArc.map(([dx, dy]) => {
        x += dx;
        y += dy;
        return [x * scaleVals[0] + translateVals[0], y * scaleVals[1] + translateVals[1]];
      });
      decodedArcs[index] = arc;
    }
    return arcIndex >= 0 ? arc : [...arc].reverse();
  }

  function ringsToPath(rings, topology, decodedArcs) {
    return rings.map(ring => {
      const points = ring.flatMap((arcIndex, i) => {
        const arc = decodeTopoArc(topology, arcIndex, decodedArcs);
        return i === 0 ? arc : arc.slice(1);
      });
      return points.length
        ? points.map(([lon, lat], i) => {
            const [x, y] = projectMapPoint(lon, lat);
            return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ") + "Z"
        : "";
    }).join(" ");
  }

  function buildGatewayMapPaths(topology) {
    const objectName = topology.objects.LGA_2025_AUST_GDA2020 ? "LGA_2025_AUST_GDA2020" : Object.keys(topology.objects)[0];
    const geometries = topology.objects[objectName].geometries || [];
    const decodedArcs = [];
    const allPointsForBounds = [];

    geometries.forEach(geom => {
      const stateCode = stateNameToCode[geom.properties?.STE_NAME21];
      if (!stateCode || !geom.arcs) return;
      const polygons = geom.type === "Polygon" ? [geom.arcs] : geom.arcs;
      polygons.forEach(poly => {
        const exteriorRing = poly[0] || [];
        exteriorRing.forEach(arcIndex => {
          decodeTopoArc(topology, arcIndex, decodedArcs).forEach(pt => {
            if (pointInAusView(pt)) allPointsForBounds.push(pt);
          });
        });
      });
    });

    if (allPointsForBounds.length) {
      fitGatewayProjection(allPointsForBounds);
    }

    return geometries.flatMap(geom => {
      const stateCode = stateNameToCode[geom.properties?.STE_NAME21];
      if (!stateCode || !geom.arcs) return [];
      const polygons = geom.type === "Polygon" ? [geom.arcs] : geom.arcs;
      const d = polygons.map(poly => ringsToPath(poly, topology, decodedArcs)).join(" ");
      return [{ d, stateCode, name: geom.properties?.LGA_NAME25 || "LGA" }];
    });
  }

  async function loadGatewayMap() {
    if (gatewayMapPaths || gatewayMapLoading) return;
    gatewayMapLoading = true;
    for (const url of gatewayMapUrls) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const topology = await response.json();
        gatewayMapPaths = buildGatewayMapPaths(topology);
        gatewayMapError = null;
        gatewayMapLoading = false;
        drawMap();
        return;
      } catch (error) {
        gatewayMapError = error;
      }
    }
    gatewayMapLoading = false;
    drawMap();
  }

  function focusState(code, pin = false) {
    if (pin) pinnedState = pinnedState === code ? null : code;
    activeState = pinnedState || code || null;
    drawMap();
    drawStrip();
  }

  function drawMap() {
    const svg = root.querySelector(".gateway-map-svg");
    if (!svg) return;

    if (!gatewayMapPaths) {
      svg.innerHTML = `
        <rect x="0" y="0" width="760" height="410" fill="transparent"></rect>
        <text x="380" y="190" text-anchor="middle" class="gateway-axis-title">Loading true LGA map…</text>
        ${gatewayMapError ? `<text x="380" y="216" text-anchor="middle" class="gateway-axis-text">Put LGA_2025_AUST_GDA2020.json inside the data folder.</text>` : ""}
      `;
      loadGatewayMap();
      return;
    }

    const currentStates = getDynamicStates();
    const currentStateLookup = Object.fromEntries(currentStates.map(s => [s.code, s]));
    const maxVisitors = Math.max(...currentStates.map(s => s.visitors_current));
    const stripData = getDynamicStrip();
    const focused = activeState;
    const pathMarkup = gatewayMapPaths.map(lga => {
      const isGateway = ["NSW", "QLD", "VIC"].includes(lga.stateCode);
      const isFocused = focused && focused === lga.stateCode;
      const opacity = focused ? (isFocused ? 0.88 : 0.16) : (isGateway ? 0.74 : 0.34);
      const strokeOpacity = focused ? (isFocused ? 0.72 : 0.22) : 0.52;
      const currentState = currentStateLookup[lga.stateCode] || stateLookup[lga.stateCode];
      const titleShare = currentState?.share_current != null ? ` · ${currentState.share_current.toFixed(1)}% of selected share` : "";
      return `<path d="${lga.d}" fill="${stateColorByCode[lga.stateCode] || "#e8e1d7"}" fill-opacity="${opacity}" stroke="#fffdf8" stroke-opacity="${strokeOpacity}" stroke-width="0.32"><title>${esc(lga.name)} · ${esc(currentState?.name || lga.stateCode)}${titleShare}</title></path>`;
    }).join("");

    svg.innerHTML = `
      <g class="gateway-lga-map">${pathMarkup}</g>
      ${buildGatewayMapInlineAnnotation(currentStates, focused)}
      ${buildGatewaySharePie(stripData, focused)}
      ${currentStates.map(s => {
        const r = 7 + Math.sqrt(s.visitors_current / maxVisitors) * 27;
        const dim = focused && focused !== s.code ? 0.26 : 0.95;
        const [cx, cy] = projectMapPoint(s.lon, s.lat);
        return `<g class="gateway-state-bubble" data-code="${s.code}" tabindex="0" role="button" aria-label="${esc(s.name)} ${s.share_current.toFixed(1)}%">
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${s.color}" opacity="${dim}" stroke="#fffdf8" stroke-width="${focused === s.code ? 4 : 2.2}"></circle>
          ${s.share_current >= 20 ? `<text x="${cx.toFixed(1)}" y="${(cy+4).toFixed(1)}" text-anchor="middle" class="gateway-bubble-label">${s.code}</text>` : ""}
          <title>${esc(s.name)} — ${s.share_current.toFixed(1)}% · ${Math.round(s.visitors_current).toLocaleString()} selected-period index</title>
        </g>`;
      }).join("")}
    `;

    svg.querySelectorAll(".gateway-state-bubble, .gateway-pie-slice").forEach(node => {
      const code = node.getAttribute("data-code");
      node.addEventListener("mouseenter", () => focusState(code));
      node.addEventListener("mouseleave", () => focusState(pinnedState || null));
      node.addEventListener("click", () => focusState(code, true));
      node.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") focusState(code, true); });
    });
  }

  function getLineValues() {
    return GATEWAY_AIRLINE_DATA.map(d => ({ date: new Date(d.date), value: d[series] }));
  }

  function drawLine() {
    const svg = root.querySelector(".gateway-line-svg");
    const data = getLineValues();
    const domain = brushDomain || fullDomain;
    const visible = data.filter(d => +d.date >= domain[0] && +d.date <= domain[1]);
    const margin = { l: 58, r: 18, t: 18, b: 34 };
    const w = 760, h = 250;
    const innerW = w - margin.l - margin.r;
    const innerH = h - margin.t - margin.b;
    const yMax = Math.max(...visible.map(d => d.value)) * 1.08;
    const x = t => margin.l + ((+t - domain[0]) / (domain[1] - domain[0] || 1)) * innerW;
    const y = v => margin.t + (1 - v / yMax) * innerH;
    const pts = visible.map(d => `${x(d.date).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
    const domainSpanMs = domain[1] - domain[0];
    const domainSpanYears = domainSpanMs / (365.25 * 24 * 3600 * 1000);
    let xTickDates;
    if (domainSpanYears <= 2) {
      // Show monthly ticks: every 1 month
      xTickDates = [];
      const startD = new Date(domain[0]);
      let cur = new Date(startD.getFullYear(), startD.getMonth(), 1);
      while (+cur <= domain[1]) {
        if (+cur >= domain[0]) xTickDates.push(new Date(cur));
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
      // If too many, thin to every 2 or 3 months
      if (xTickDates.length > 12) xTickDates = xTickDates.filter((_, i) => i % 3 === 0);
      else if (xTickDates.length > 8) xTickDates = xTickDates.filter((_, i) => i % 2 === 0);
    } else if (domainSpanYears <= 5) {
      // Show quarterly ticks
      xTickDates = [];
      const startD = new Date(domain[0]);
      let cur = new Date(startD.getFullYear(), Math.floor(startD.getMonth() / 3) * 3, 1);
      while (+cur <= domain[1]) {
        if (+cur >= domain[0]) xTickDates.push(new Date(cur));
        cur = new Date(cur.getFullYear(), cur.getMonth() + 3, 1);
      }
    } else {
      xTickDates = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(yr => new Date(`${yr}-01-01`)).filter(d => +d >= domain[0] && +d <= domain[1]);
    }
    const fmtTick = d => domainSpanYears <= 5 ? d.toLocaleDateString("en-AU", { month: "short", year: "numeric" }) : String(d.getFullYear());
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(yMax * p / 100000) * 100000);
    const peak = visible.reduce((best, d) => !best || d.value > best.value ? d : best, null);
    const peakX = peak ? x(peak.date) : 0;
    const peakY = peak ? y(peak.value) : 0;
    const peakLabelX = Math.min(Math.max(peakX + 18, margin.l + 18), w - 268);
    const peakLabelY = Math.max(peakY - 52, 28);

    svg.innerHTML = `
      ${ticks.map(t => `<line x1="${margin.l}" x2="${w-margin.r}" y1="${y(t)}" y2="${y(t)}" stroke="#eadfd0"/><text x="${margin.l-10}" y="${y(t)+4}" text-anchor="end" class="gateway-axis-text">${fmtM(t)}</text>`).join("")}
      <line x1="${margin.l}" x2="${w-margin.r}" y1="${h-margin.b}" y2="${h-margin.b}" stroke="#b8aa99"/>
      <line x1="${margin.l}" x2="${margin.l}" y1="${margin.t}" y2="${h-margin.b}" stroke="#b8aa99"/>
      ${xTickDates.map(d => `<text x="${x(d).toFixed(1)}" y="${h-10}" text-anchor="middle" class="gateway-axis-text">${fmtTick(d)}</text>`).join("")}
      <text x="18" y="${margin.t+innerH/2}" transform="rotate(-90 18 ${margin.t+innerH/2})" text-anchor="middle" class="gateway-axis-title">Passengers</text>
      <text x="${margin.l+innerW/2}" y="${h-2}" text-anchor="middle" class="gateway-axis-title">Date</text>
      <polyline points="${pts}" fill="none" stroke="${series === "outbound" ? "#E3B23C" : "#D84B2A"}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></polyline>
      ${buildGatewayLineInlineAnnotation(peak, peakX, peakY, peakLabelX, peakLabelY)}
      <rect class="gateway-hover-capture" x="${margin.l}" y="${margin.t}" width="${innerW}" height="${innerH}" fill="transparent"></rect>
      <g class="gateway-hover-layer"></g>
    `;
    const capture = svg.querySelector(".gateway-hover-capture");
    const hoverLayer = svg.querySelector(".gateway-hover-layer");
    capture.addEventListener("mousemove", evt => {
      const rect = svg.getBoundingClientRect();
      const px = ((evt.clientX - rect.left) / rect.width) * w;
      const targetT = domain[0] + ((px - margin.l) / innerW) * (domain[1] - domain[0]);
      let nearest = visible[0];
      for (const d of visible) if (Math.abs(+d.date - targetT) < Math.abs(+nearest.date - targetT)) nearest = d;
      const nx = x(nearest.date), ny = y(nearest.value);
      hoverLayer.innerHTML = `<line x1="${nx}" x2="${nx}" y1="${margin.t}" y2="${h-margin.b}" stroke="#9aa3af" stroke-dasharray="3,3"/><circle cx="${nx}" cy="${ny}" r="5" fill="#D84B2A" stroke="#fffdf8" stroke-width="2"/><rect x="${Math.min(nx+10,w-180)}" y="${Math.max(ny-42,12)}" width="160" height="38" rx="8" fill="#fff7ef" stroke="#e1cbb5"/><text x="${Math.min(nx+20,w-170)}" y="${Math.max(ny-20,34)}" class="gateway-tooltip-text">${fmtMonth(nearest.date)} · ${nearest.value.toLocaleString()}</text>`;
    });
    capture.addEventListener("mouseleave", () => { hoverLayer.innerHTML = ""; });
  }

  function drawBrush() {
    const svg = root.querySelector(".gateway-brush-svg");
    const data = getLineValues();
    const margin = { l: 58, r: 18, t: 8, b: 18 };
    const w = 760, h = 78;
    const innerW = w - margin.l - margin.r;
    const innerH = h - margin.t - margin.b;
    const yMax = Math.max(...data.map(d => d.value)) * 1.04;
    const x = t => margin.l + ((+t - fullDomain[0]) / (fullDomain[1] - fullDomain[0])) * innerW;
    const y = v => margin.t + (1 - v / yMax) * innerH;
    const pts = data.map(d => `${x(new Date(d.date)).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
    let dragging = false, startX = null;
    const brushX0 = brushDomain ? x(brushDomain[0]) : margin.l;
    const brushX1 = brushDomain ? x(brushDomain[1]) : w - margin.r;
    svg.innerHTML = `
      <polyline points="${pts}" fill="none" stroke="#D84B2A" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"></polyline>
      <polygon points="${margin.l},${h-margin.b} ${pts} ${w-margin.r},${h-margin.b}" fill="#F6B17A" opacity="0.34"></polygon>
      <rect class="gateway-brush-selection" x="${brushX0}" y="${margin.t}" width="${brushX1-brushX0}" height="${innerH}" rx="4" fill="#d84b2a" opacity="0.12" stroke="#d84b2a" stroke-width="1.2"></rect>
      <rect class="gateway-brush-capture" x="${margin.l}" y="${margin.t}" width="${innerW}" height="${innerH}" fill="transparent"></rect>
    `;
    const capture = svg.querySelector(".gateway-brush-capture");
    const selection = svg.querySelector(".gateway-brush-selection");
    const toSvgX = evt => { const r = svg.getBoundingClientRect(); return Math.max(margin.l, Math.min(w-margin.r, ((evt.clientX-r.left)/r.width)*w)); };
    const toTime = px => fullDomain[0] + ((px - margin.l) / innerW) * (fullDomain[1] - fullDomain[0]);
    capture.addEventListener("mousedown", evt => { dragging = true; startX = toSvgX(evt); selection.setAttribute("x", startX); selection.setAttribute("width", 0); });
    window.addEventListener("mousemove", evt => {
      if (!dragging) return;
      const curr = toSvgX(evt);
      selection.setAttribute("x", Math.min(startX, curr));
      selection.setAttribute("width", Math.abs(curr - startX));
    });
    window.addEventListener("mouseup", evt => {
      if (!dragging) return;
      dragging = false;
      const endX = toSvgX(evt);
      if (Math.abs(endX - startX) < 8) { brushDomain = null; }
      else brushDomain = [toTime(Math.min(startX, endX)), toTime(Math.max(startX, endX))];
      drawLine();
      drawBrush();
      drawMap();
      drawStrip();
    });
  }

  function drawStrip() {
    const svg = root.querySelector(".gateway-strip-svg");
    if (!svg) return;
    const margin = { l: 0, r: 0, t: 16, b: 18 };
    const w = 760, h = 86;
    const stripData = getDynamicStrip();
    let x0 = 0;
    svg.innerHTML = `
      <text x="0" y="10" class="gateway-axis-text">Selected line window: ${esc(selectedPeriodLabel())}</text>
      ${stripData.map(s => {
        const width = (s.share / 100) * w;
        const focused = !activeState || activeState === s.code || (s.code === "Rest" && !gatewayCodes.includes(activeState));
        const label = `${s.label} · ${s.share.toFixed(1)}%`;
        const safeWidth = Math.max(width, 0);
        const labelOpacity = safeWidth > 48 ? (focused ? 1 : 0.55) : 0;
        const out = `<g class="gateway-strip-segment" data-code="${s.code}">
          <rect x="${x0}" y="${margin.t}" width="${safeWidth}" height="34" rx="9" fill="${s.color}" opacity="${focused ? 1 : 0.28}"></rect>
          <text x="${x0 + safeWidth/2}" y="${margin.t + 22}" text-anchor="middle" class="gateway-strip-label" opacity="${labelOpacity}">${label}</text>
          <title>${esc(s.label)} — ${s.share.toFixed(1)}% in selected line window</title>
        </g>`;
        x0 += safeWidth;
        return out;
      }).join("")}
    `;
  }

  root.querySelector(".gateway-series-filter").addEventListener("change", evt => {
    series = evt.target.value;
    root.classList.add("chart-param-changing");
    setTimeout(() => root.classList.remove("chart-param-changing"), 420);
    drawLine();
    drawBrush();
    drawMap();
    drawStrip();
  });

  drawMap();
  drawLine();
  drawBrush();
  drawStrip();
}
/* ===== End custom Chart 5 ===== */

function renderHotspotBubbleMapChart() {
  const target = document.getElementById("hotspot_bubble_map_chart");
  if (!target) return;
  const spec = addInlineAnnotations(buildHotspotBubbleMapSpec(), "hotspot_bubble_map_chart");
  renderAnimatedChart("#hotspot_bubble_map_chart", spec).catch(() => {
    target.innerHTML = '<div class="chart-error">Chart could not load.</div>';
  });
}

/* ===== Initial render calls: keep these after Chart 5 custom data/function definitions ===== */
renderTourismTransportChart();
renderStateMapChart();
renderHotspotBubbleMapChart();
renderGatewayStateRankChart();
embedIfExists("top_region_map_chart", topRegionMapSpec);
renderTopRegionBarChart();
renderConcentrationWaffle();
renderPopularityBubbleChart();
embedIfExists("hidden_value_quadrant_chart", hiddenValueQuadrantSpec);
embedIfExists("hidden_value_rank_chart", hiddenValueRankSpec);
renderAlternativeCapacityChart();

