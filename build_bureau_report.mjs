import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/minsu/Documents/Codex/2026-05-28/h5-1-2-sn-imei1-imei2/outputs";
const workbook = Workbook.create();

const dashboard = workbook.worksheets.add("领导看板");
const daily = workbook.worksheets.add("每日汇总明细");
const fields = workbook.worksheets.add("字段口径说明");

const rows = [
  ["2026-06-03", "济南市", 18, 126, 126, 0, 14, 9, 23, 71, 3, 7, 6, 1023400, 102340, 921060, 7, 5, 2, "iPhone 15 Pro Max", "正常"],
  ["2026-06-02", "济南市", 17, 118, 116, 2, 11, 8, 19, 73, 4, 5, 5, 948800, 94880, 853920, 6, 4, 2, "iPhone 15", "2 单待补充凭证"],
  ["2026-06-01", "济南市", 16, 97, 97, 0, 8, 6, 15, 68, 1, 3, 4, 788600, 78860, 709740, 5, 3, 2, "iPhone 15 Pro", "正常"],
  ["2026-05-31", "济南市", 15, 82, 82, 0, 6, 5, 12, 60, 0, 2, 3, 651200, 65120, 586080, 4, 3, 1, "iPhone 14", "正常"],
  ["2026-05-30", "济南市", 14, 76, 75, 1, 5, 4, 9, 61, 1, 1, 2, 603100, 60310, 542790, 4, 2, 2, "iPhone 15 Plus", "1 单支付中"],
];

const headers = [
  "统计日期",
  "行政区划",
  "参与门店数",
  "今日核销台数",
  "有效核销台数",
  "待支付台数",
  "待上传凭证台数",
  "待审核台数",
  "已驳回台数",
  "已通过台数",
  "退货退款台数",
  "涉及品牌数",
  "涉及机型数",
  "定价金额合计",
  "补贴金额合计",
  "实收金额合计",
  "开票订单数",
  "已回传发票数",
  "待回传发票数",
  "核销最多机型",
  "备注",
];

dashboard.showGridLines = false;
daily.showGridLines = false;
fields.showGridLines = false;

dashboard.getRange("A1:H1").merge();
dashboard.getRange("A1").values = [["商务局手机核销日报"]];
dashboard.getRange("A2:H2").merge();
dashboard.getRange("A2").values = [["统计口径：今日创建且未作废的有效核销单，按自然日汇总。"]];

dashboard.getRange("A4:B4").values = [["统计日期", rows[0][0]]];
dashboard.getRange("D4:E4").values = [["行政区划", rows[0][1]]];

dashboard.getRange("A6:H8").values = [
  ["今日核销台数", rows[0][3], "有效核销台数", rows[0][4], "已通过台数", rows[0][9], "已驳回台数", rows[0][8]],
  ["待支付台数", rows[0][5], "待上传凭证台数", rows[0][6], "待审核台数", rows[0][7], "参与门店数", rows[0][2]],
  ["补贴金额合计", rows[0][14], "实收金额合计", rows[0][15], "退货退款台数", rows[0][10], "已回传发票数", rows[0][17]],
];

dashboard.getRange("A11:H11").values = [["近 5 日核销趋势", null, null, null, null, null, null, null]];
dashboard.getRange("A12:D17").values = [
  ["统计日期", "今日核销台数", "已通过台数", "补贴金额合计"],
  ...rows.map((r) => [r[0], r[3], r[9], r[14]]),
];

daily.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
daily.getRangeByIndexes(1, 0, rows.length, headers.length).values = rows;

fields.getRange("A1:D1").values = [["字段名称", "建议类型", "展示给领导的含义", "口径说明"]];
fields.getRange("A2:D22").values = [
  ["统计日期", "日期", "日报对应日期", "按自然日 00:00:00 至 23:59:59 统计"],
  ["行政区划", "文本", "数据所属地区", "可按市、区县或街道扩展"],
  ["参与门店数", "整数", "当日发生核销的门店数量", "同一门店多单只计 1 家"],
  ["今日核销台数", "整数", "当日创建的有效核销单总台数", "包含待支付、待上传、待审核、已驳回、已通过"],
  ["有效核销台数", "整数", "剔除待支付后的有效业务台数", "用于衡量已进入补贴履约链路的台数"],
  ["待支付台数", "整数", "已创建但未完成付款的台数", "不计入有效补贴金额确认"],
  ["待上传凭证台数", "整数", "已支付但未上传凭证的台数", "提醒门店补充资料"],
  ["待审核台数", "整数", "凭证已上传等待人工审核的台数", "表示审核工作量"],
  ["已驳回台数", "整数", "审核未通过需门店修改凭证的台数", "可作为异常率观察指标"],
  ["已通过台数", "整数", "审核通过并完成核销的台数", "可作为最终完成量"],
  ["退货退款台数", "整数", "7 天无理由退货退款台数", "用于后续冲减或风险观察"],
  ["涉及品牌数", "整数", "当日涉及的手机品牌数量", "按品牌去重"],
  ["涉及机型数", "整数", "当日涉及的手机型号数量", "按商品名称或型号去重"],
  ["定价金额合计", "金额", "参与核销手机的定价总额", "按系统拉取的定价汇总"],
  ["补贴金额合计", "金额", "政府/活动补贴总额", "当前规则为定价金额 10%"],
  ["实收金额合计", "金额", "顾客实际支付总额", "定价金额合计 - 补贴金额合计"],
  ["开票订单数", "整数", "需开票的订单数量", "按已通过订单统计"],
  ["已回传发票数", "整数", "已回传到员工端的发票数", "后台开票完成并回传"],
  ["待回传发票数", "整数", "已通过但发票未回传数量", "用于跟踪后台开票进度"],
  ["核销最多机型", "文本", "当日核销量最高的机型", "用于领导快速判断主力销售机型"],
  ["备注", "文本", "异常或补充说明", "例如待补资料、支付中、系统异常等"],
];

function styleTitle(sheet) {
  sheet.getRange("A1:H1").format = {
    fill: "#0F172A",
    font: { bold: true, color: "#FFFFFF", size: 18 },
  };
  sheet.getRange("A2:H2").format = {
    fill: "#EAF3FF",
    font: { color: "#1D4ED8", italic: true },
  };
}

styleTitle(dashboard);

dashboard.getRange("A6:H8").format = {
  fill: "#FFFFFF",
  borders: { preset: "all", style: "thin", color: "#D9E2EF" },
};
dashboard.getRange("B6:B8").format.font = { bold: true, color: "#1677FF", size: 16 };
dashboard.getRange("D6:D8").format.font = { bold: true, color: "#1677FF", size: 16 };
dashboard.getRange("F6:F8").format.font = { bold: true, color: "#16A34A", size: 16 };
dashboard.getRange("H6:H8").format.font = { bold: true, color: "#E11D48", size: 16 };
dashboard.getRange("A12:D12").format = { fill: "#1677FF", font: { bold: true, color: "#FFFFFF" } };
dashboard.getRange("A12:D17").format.borders = { preset: "all", style: "thin", color: "#D9E2EF" };
dashboard.getRange("D13:D17").format.numberFormat = "¥#,##0";

daily.getRangeByIndexes(0, 0, 1, headers.length).format = {
  fill: "#1677FF",
  font: { bold: true, color: "#FFFFFF" },
};
daily.getRangeByIndexes(0, 0, rows.length + 1, headers.length).format.borders = {
  preset: "all",
  style: "thin",
  color: "#D9E2EF",
};
daily.getRange("N2:P6").format.numberFormat = "¥#,##0";

fields.getRange("A1:D1").format = { fill: "#0F172A", font: { bold: true, color: "#FFFFFF" } };
fields.getRange("A1:D22").format.borders = { preset: "all", style: "thin", color: "#D9E2EF" };
fields.getRange("A2:D22").format.wrapText = true;

for (const sheet of [dashboard, daily, fields]) {
  sheet.freezePanes.freezeRows(1);
  sheet.getUsedRange().format.autofitColumns();
  sheet.getUsedRange().format.autofitRows();
}

const chart = dashboard.charts.add("line", dashboard.getRange("A12:B17"));
chart.title = "近 5 日核销台数趋势";
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis" };
chart.setPosition("F11", "M24");

await fs.mkdir(outputDir, { recursive: true });

await workbook.inspect({
  kind: "table",
  range: "领导看板!A1:H17",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
});

await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});

await workbook.render({ sheetName: "领导看板", autoCrop: "all", scale: 1, format: "png" });
await workbook.render({ sheetName: "每日汇总明细", autoCrop: "all", scale: 1, format: "png" });
await workbook.render({ sheetName: "字段口径说明", autoCrop: "all", scale: 1, format: "png" });

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(`${outputDir}/商务局手机核销日报.xlsx`);
