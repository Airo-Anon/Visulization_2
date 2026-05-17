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

renderGatewayStateRankChart();
