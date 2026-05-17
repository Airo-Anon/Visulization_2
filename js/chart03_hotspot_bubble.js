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

function renderHotspotBubbleMapChart() {
  const target = document.getElementById("hotspot_bubble_map_chart");
  if (!target) return;
  const spec = addInlineAnnotations(buildHotspotBubbleMapSpec(), "hotspot_bubble_map_chart");
  renderAnimatedChart("#hotspot_bubble_map_chart", spec).catch(() => {
    target.innerHTML = '<div class="chart-error">Chart could not load.</div>';
  });
}

renderHotspotBubbleMapChart();
