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

renderAlternativeCapacityChart();
