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
