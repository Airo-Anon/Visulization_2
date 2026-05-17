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

embedIfExists("hidden_value_rank_chart", hiddenValueRankSpec);
