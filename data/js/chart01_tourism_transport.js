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

renderTourismTransportChart();
