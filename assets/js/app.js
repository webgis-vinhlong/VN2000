import { PROVINCES_34, formatMeridian } from "./provinces.js";
import { createConverter, parseLocaleNumber, projectionDefinition, toDms } from "./transform.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  form: $("#single-form"),
  province: $("#province"),
  axis: $("#axis"),
  meridian: $("#meridian-display"),
  parameterMeridian: $("#parameter-meridian"),
  first: $("#first-coordinate"),
  second: $("#second-coordinate"),
  firstLabel: $("#first-label"),
  secondLabel: $("#second-label"),
  firstHelp: $("#first-help"),
  secondHelp: $("#second-help"),
  singleError: $("#single-error"),
  emptyResult: $("#empty-result"),
  resultContent: $("#result-content"),
  resultBadge: $("#result-badge"),
  resultProvince: $("#result-province"),
  resultTitle: $("#result-title"),
  resultOneLabel: $("#result-one-label"),
  resultTwoLabel: $("#result-two-label"),
  resultOne: $("#result-one"),
  resultTwo: $("#result-two"),
  resultOneDms: $("#result-one-dms"),
  resultTwoDms: $("#result-two-dms"),
  resultAxis: $("#result-axis"),
  mapPlaceholder: $("#map-placeholder"),
  mapCoordinate: $("#map-coordinate"),
  batchInput: $("#batch-input"),
  batchCount: $("#batch-count"),
  batchFormat: $("#batch-format"),
  batchHead: $("#batch-head"),
  batchBody: $("#batch-body"),
  batchError: $("#batch-error"),
  downloadCsv: $("#download-csv"),
  traceSteps: $("#trace-steps"),
  axisSearch: $("#axis-search"),
  axisTableBody: $("#axes-table-body"),
  axisTableCount: $("#axis-table-count"),
  toast: $("#toast"),
};

const state = {
  direction: "vn-to-wgs",
  converter: null,
  lastResult: null,
  batchRows: [],
  map: null,
  mapLayers: [],
};

function initialize() {
  populateProvinces();
  renderAxisTable(PROVINCES_34);
  bindEvents();
  updateBatchCount();
  window.addEventListener("load", () => {
    if (typeof window.proj4 === "function") state.converter = createConverter(window.proj4);
    else elements.singleError.textContent = "Không nạp được thư viện tính toán PROJ4. Hãy kiểm tra kết nối mạng rồi tải lại trang.";
    initializeMap();
  }, { once: true });
}

function populateProvinces() {
  elements.province.replaceChildren(...PROVINCES_34.map((province, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = province.shortName || province.name;
    return option;
  }));
  elements.province.value = String(PROVINCES_34.findIndex(({ name }) => name === "Khánh Hòa"));
  populateAxes();
}

function populateAxes() {
  const province = selectedProvince();
  elements.axis.replaceChildren(...province.axes.map((axis, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${axis.kind === "official" ? "[TT24 · hiện hành]" : "[Dữ liệu cũ]"} ${formatMeridian(axis.meridian)} — ${axis.areas}`;
    return option;
  }));
  updateAxisDisplay();
}

function selectedProvince() {
  return PROVINCES_34[Number(elements.province.value)] || PROVINCES_34[0];
}

function selectedAxis() {
  return selectedProvince().axes[Number(elements.axis.value)] || selectedProvince().axes[0];
}

function updateAxisDisplay() {
  const axis = selectedAxis();
  elements.meridian.textContent = `${formatMeridian(axis.meridian)} (${formatNumber(axis.meridian, 2)}°)`;
  elements.parameterMeridian.textContent = `${formatMeridian(axis.meridian)} — ${axis.areas}`;
  const notice = $("#axis-notice");
  notice.classList.toggle("notice-official", axis.kind === "official");
  notice.classList.toggle("notice-warning", axis.kind !== "official");
  notice.innerHTML = axis.kind === "official"
    ? '<span aria-hidden="true">✓</span><p><strong>Trục hiện hành theo Thông tư 24/2025/TT-BNNMT.</strong> Phạm vi pháp lý của phụ lục là bản đồ hành chính cấp tỉnh; hồ sơ địa chính cũ vẫn phải theo metadata gốc.</p>'
    : '<span aria-hidden="true">!</span><p><strong>Bạn đang dùng trục dữ liệu kế thừa, không phải trục TT24 hiện hành.</strong> Chỉ dùng khi hồ sơ hoặc metadata gốc xác nhận đúng kinh tuyến này.</p>';
}

function bindEvents() {
  elements.province.addEventListener("change", () => { populateAxes(); clearResult(); });
  elements.axis.addEventListener("change", () => { updateAxisDisplay(); clearResult(); });
  elements.form.addEventListener("submit", convertSingle);
  $$(".direction-tab").forEach((button) => button.addEventListener("click", () => setDirection(button.dataset.direction)));
  $("#copy-result").addEventListener("click", copyResult);
  $("#show-map").addEventListener("click", () => {
    if (!state.lastResult) return;
    showPointsOnMap([state.lastResult]);
    $("#map").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  elements.batchInput.addEventListener("input", updateBatchCount);
  $("#load-sample").addEventListener("click", loadBatchSample);
  $("#convert-batch").addEventListener("click", convertBatch);
  elements.downloadCsv.addEventListener("click", downloadCsv);
  elements.axisSearch.addEventListener("input", filterAxes);
}

function setDirection(direction) {
  if (state.direction === direction) return;
  state.direction = direction;
  $$(".direction-tab").forEach((button) => {
    const active = button.dataset.direction === direction;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  const toWgs = direction === "vn-to-wgs";
  elements.firstLabel.innerHTML = toWgs ? "X — Northing (m) <b>*</b>" : "Vĩ độ / Latitude (°) <b>*</b>";
  elements.secondLabel.innerHTML = toWgs ? "Y — Easting (m) <b>*</b>" : "Kinh độ / Longitude (°) <b>*</b>";
  elements.firstHelp.textContent = toWgs ? "Khoảng cách theo hướng Bắc, thường có 7 chữ số" : "Độ thập phân; phạm vi kiểm tra 7°–24,5°B";
  elements.secondHelp.textContent = toWgs ? "Khoảng cách hướng Đông đã cộng 500.000 m" : "Độ thập phân; phạm vi kiểm tra 100°–112°Đ";
  elements.batchFormat.textContent = toWgs ? "Định dạng: mã điểm; X; Y" : "Định dạng: mã điểm; vĩ độ; kinh độ";
  elements.first.value = toWgs ? "1255172.510" : "11.349358";
  elements.second.value = toWgs ? "568262.924" : "108.877201";
  elements.batchInput.value = "";
  updateBatchCount();
  clearResult();
  renderBatchRows([]);
}

function convertSingle(event) {
  event.preventDefault();
  elements.singleError.textContent = "";
  try {
    ensureConverter();
    const first = parseLocaleNumber(elements.first.value);
    const second = parseLocaleNumber(elements.second.value);
    const axis = selectedAxis();
    const result = state.direction === "vn-to-wgs"
      ? state.converter.vn2000ToWgs84({ x: first, y: second }, axis.meridian)
      : state.converter.wgs84ToVn2000({ lat: first, lon: second }, axis.meridian);
    state.lastResult = { ...result, id: "Điểm đang chọn", ok: true };
    renderResult(result);
    renderTrace(result);
    showPointsOnMap([state.lastResult]);
  } catch (error) {
    elements.singleError.textContent = error.message || "Không thể chuyển đổi tọa độ.";
  }
}

function renderResult(result) {
  const toWgs = state.direction === "vn-to-wgs";
  elements.emptyResult.hidden = true;
  elements.resultContent.hidden = false;
  elements.resultBadge.textContent = "Đã chuyển đổi";
  elements.resultBadge.classList.add("is-ready");
  elements.resultProvince.textContent = `${selectedProvince().shortName || selectedProvince().name} · ${selectedAxis().kind === "official" ? "TT24 hiện hành" : "Dữ liệu kế thừa"}`;
  elements.resultTitle.textContent = toWgs ? "WGS84 / EPSG:4326" : `VN-2000 / TM-3 ${formatMeridian(result.centralMeridian)}`;
  elements.resultOneLabel.textContent = toWgs ? "Vĩ độ / Latitude" : "X / Northing";
  elements.resultTwoLabel.textContent = toWgs ? "Kinh độ / Longitude" : "Y / Easting";
  elements.resultOne.textContent = toWgs ? `${formatNumber(result.lat, 8)}°` : `${formatNumber(result.x, 3)} m`;
  elements.resultTwo.textContent = toWgs ? `${formatNumber(result.lon, 8)}°` : `${formatNumber(result.y, 3)} m`;
  elements.resultOneDms.textContent = toWgs ? toDms(result.lat, "B", "N") : "X là northing trong quy ước địa chính Việt Nam";
  elements.resultTwoDms.textContent = toWgs ? toDms(result.lon, "Đ", "T") : "Y là easting, gồm false easting 500.000 m";
  elements.resultAxis.textContent = `λ₀ ${formatMeridian(result.centralMeridian)}`;
  elements.mapCoordinate.textContent = `${formatNumber(result.lat, 6)}° · ${formatNumber(result.lon, 6)}°`;
}

function clearResult() {
  state.lastResult = null;
  elements.emptyResult.hidden = false;
  elements.resultContent.hidden = true;
  elements.resultBadge.textContent = "Chờ dữ liệu";
  elements.resultBadge.classList.remove("is-ready");
  elements.singleError.textContent = "";
}

async function copyResult() {
  if (!state.lastResult) return;
  const result = state.lastResult;
  const text = state.direction === "vn-to-wgs"
    ? `Vĩ độ: ${result.lat.toFixed(8)}\nKinh độ: ${result.lon.toFixed(8)}\nKinh tuyến trục: ${formatMeridian(result.centralMeridian)}`
    : `X (Northing): ${result.x.toFixed(3)} m\nY (Easting): ${result.y.toFixed(3)} m\nKinh tuyến trục: ${formatMeridian(result.centralMeridian)}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Đã sao chép kết quả.");
  } catch {
    showToast("Trình duyệt không cho phép sao chép tự động.");
  }
}

function renderTrace(result) {
  const axis = selectedAxis();
  const noDatum = projectionDefinition(axis.meridian).replace(/\+towgs84=[^\s]+\s?/, "");
  let steps;
  if (state.direction === "vn-to-wgs") {
    const [vnLon, vnLat] = window.proj4(noDatum, "EPSG:4326", [result.y, result.x]);
    steps = [
      `Nhận X = ${result.x.toFixed(3)} m (northing), Y = ${result.y.toFixed(3)} m (easting).`,
      `Chuẩn hóa TM-3: E′ = Y − 500.000 = ${(result.y - 500000).toFixed(3)} m; N′ = X.`,
      `Chiếu nghịch tại λ₀ = ${formatMeridian(axis.meridian)} → φVN = ${vnLat.toFixed(9)}°, λVN = ${vnLon.toFixed(9)}°.`,
      `Địa lý → địa tâm; áp dụng Helmert 7 tham số VN-2000 → WGS84.`,
      `Kết quả: φ = ${result.lat.toFixed(9)}°, λ = ${result.lon.toFixed(9)}° (WGS84).`,
    ];
  } else {
    const geographicVn = projectionDefinition(axis.meridian).replace(/\+proj=tmerc[^+]+/, "+proj=longlat ").replace(/\+lat_0=[^\s]+\s|\+lon_0=[^\s]+\s|\+k=[^\s]+\s|\+x_0=[^\s]+\s|\+y_0=[^\s]+\s|\+units=m\s/g, "");
    const [vnLon, vnLat] = window.proj4("EPSG:4326", geographicVn, [result.lon, result.lat]);
    steps = [
      `Nhận φ = ${result.lat.toFixed(9)}°, λ = ${result.lon.toFixed(9)}° (WGS84).`,
      `Địa lý → địa tâm; áp dụng Helmert nghịch WGS84 → VN-2000.`,
      `Tọa độ địa lý VN-2000: φVN = ${vnLat.toFixed(9)}°, λVN = ${vnLon.toFixed(9)}°.`,
      `Chiếu thuận TM-3 tại λ₀ = ${formatMeridian(axis.meridian)}, k₀ = 0,9999, E₀ = 500.000 m.`,
      `Kết quả: X = ${result.x.toFixed(3)} m; Y = ${result.y.toFixed(3)} m.`,
    ];
  }
  elements.traceSteps.replaceChildren(...steps.map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }));
}

function updateBatchCount() {
  const count = elements.batchInput.value.split(/\r?\n/).filter((line) => line.trim()).length;
  elements.batchCount.textContent = `${count} dòng dữ liệu`;
}

function loadBatchSample() {
  elements.batchInput.value = state.direction === "vn-to-wgs"
    ? "M01; 1255172.510; 568262.924\nM02; 1255310.120; 568410.500\nM03; 1254980.750; 568005.300"
    : "M01; 11.349358; 108.877201\nM02; 11.350594; 108.878556\nM03; 11.347620; 108.874830";
  updateBatchCount();
}

function convertBatch() {
  elements.batchError.textContent = "";
  try {
    ensureConverter();
    const rawLines = elements.batchInput.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const lines = rawLines.filter((line, index) => !(index === 0 && isHeaderLine(line)));
    if (!lines.length) throw new Error("Hãy dán ít nhất một dòng tọa độ.");
    const axis = selectedAxis();
    state.batchRows = lines.map((line, index) => convertBatchLine(line, index, axis.meridian));
    renderBatchRows(state.batchRows);
    elements.downloadCsv.disabled = !state.batchRows.length;
    const good = state.batchRows.filter(({ ok }) => ok);
    if (good.length) showPointsOnMap(good);
    const failed = state.batchRows.length - good.length;
    if (failed) elements.batchError.textContent = `${failed} dòng không hợp lệ; xem trạng thái trong bảng.`;
  } catch (error) {
    elements.batchError.textContent = error.message || "Không thể chuyển đổi dữ liệu hàng loạt.";
  }
}

function convertBatchLine(line, index, centralMeridian) {
  const tokens = splitLine(line);
  const id = tokens.length >= 3 ? tokens[0] || `P${index + 1}` : `P${index + 1}`;
  const values = tokens.length >= 3 ? tokens.slice(-2) : tokens;
  if (values.length !== 2) return { id, ok: false, error: "Cần đúng hai giá trị tọa độ" };
  const first = parseLocaleNumber(values[0]);
  const second = parseLocaleNumber(values[1]);
  try {
    const result = state.direction === "vn-to-wgs"
      ? state.converter.vn2000ToWgs84({ x: first, y: second }, centralMeridian)
      : state.converter.wgs84ToVn2000({ lat: first, lon: second }, centralMeridian);
    return { id, ok: true, ...result };
  } catch (error) {
    return { id, ok: false, error: error.message };
  }
}

function splitLine(line) {
  if (line.includes("\t")) return line.split("\t").map((value) => value.trim());
  if (line.includes(";")) return line.split(";").map((value) => value.trim());
  if (line.includes(",")) return line.split(",").map((value) => value.trim());
  return line.split(/\s+/).map((value) => value.trim());
}

function isHeaderLine(line) {
  const tokens = splitLine(line).map((value) => normalize(value));
  const hasProjectedHeader = tokens.includes("x") && tokens.includes("y");
  const hasGeographicHeader = tokens.some((value) => ["lat", "latitude", "vi do", "vido"].includes(value))
    && tokens.some((value) => ["lon", "lng", "longitude", "kinh do", "kinhdo"].includes(value));
  return hasProjectedHeader || hasGeographicHeader;
}

function renderBatchRows(rows) {
  const toWgs = state.direction === "vn-to-wgs";
  elements.batchHead.innerHTML = toWgs
    ? "<tr><th>Mã</th><th>Vĩ độ</th><th>Kinh độ</th><th>Trạng thái</th></tr>"
    : "<tr><th>Mã</th><th>X / Northing</th><th>Y / Easting</th><th>Trạng thái</th></tr>";
  if (!rows.length) {
    elements.batchBody.innerHTML = '<tr class="table-empty"><td colspan="4">Chưa có dữ liệu chuyển đổi</td></tr>';
    elements.downloadCsv.disabled = true;
    return;
  }
  elements.batchBody.replaceChildren(...rows.map((row) => {
    const tr = document.createElement("tr");
    const values = row.ok
      ? [row.id, toWgs ? row.lat.toFixed(8) : row.x.toFixed(3), toWgs ? row.lon.toFixed(8) : row.y.toFixed(3), "Hợp lệ"]
      : [row.id, "—", "—", row.error];
    values.forEach((value, index) => {
      const td = document.createElement("td");
      td.textContent = value;
      if (index === 3) td.className = row.ok ? "status-ok" : "status-error";
      tr.append(td);
    });
    return tr;
  }));
}

function downloadCsv() {
  if (!state.batchRows.length) return;
  const toWgs = state.direction === "vn-to-wgs";
  const header = toWgs ? ["ma_diem", "vi_do", "kinh_do", "trang_thai"] : ["ma_diem", "x_northing_m", "y_easting_m", "trang_thai"];
  const rows = state.batchRows.map((row) => row.ok
    ? [row.id, toWgs ? row.lat.toFixed(9) : row.x.toFixed(3), toWgs ? row.lon.toFixed(9) : row.y.toFixed(3), "hop_le"]
    : [row.id, "", "", row.error]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `vn2000-${state.direction}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function initializeMap() {
  try {
    if (!window.Vietflex?.vietflexMap) throw new Error("Không nạp được Vietflex Map.");
    state.map = window.Vietflex.vietflexMap("map", {
      useLegacyGoogleTiles: false,
      zoomControl: false,
      attributionControl: false,
    });
    state.map.setView([16.2, 106.4], 5);
    new window.Vietflex.ZoomControl({ position: "topleft" }).addTo(state.map);
    new window.Vietflex.AttributionControl({ position: "bottomright" }).addTo(state.map);
    elements.mapPlaceholder.hidden = true;
    const marker = new window.Vietflex.Marker([21.0285, 105.8542]).bindPopup("Hà Nội · Điểm mặc định").addTo(state.map);
    state.mapLayers.push(marker);
    setTimeout(() => state.map.invalidateSize?.(), 100);
  } catch (error) {
    elements.mapPlaceholder.hidden = false;
    elements.mapPlaceholder.innerHTML = `<span>${error.message} Công cụ chuyển đổi vẫn hoạt động bình thường.</span>`;
  }
}

function showPointsOnMap(rows) {
  if (!state.map || !window.Vietflex) return;
  clearMapLayers();
  const coordinates = [];
  rows.filter(({ ok }) => ok).forEach((row) => {
    coordinates.push([row.lat, row.lon]);
    const marker = new window.Vietflex.Marker([row.lat, row.lon])
      .bindPopup(`<strong>${escapeHtml(row.id || "Điểm")}</strong><br>${row.lat.toFixed(7)}°, ${row.lon.toFixed(7)}°`)
      .addTo(state.map);
    state.mapLayers.push(marker);
  });
  if (coordinates.length === 1) state.map.setView(coordinates[0], 16);
  if (coordinates.length > 1) {
    try {
      const line = new window.Vietflex.Polyline(coordinates, { color: "#0b5d4b", weight: 3, opacity: .8 }).addTo(state.map);
      state.mapLayers.push(line);
    } catch { /* Marker display is sufficient when Polyline is unavailable. */ }
    state.map.fitBounds(coordinates, { padding: [34, 34] });
  }
  const first = rows.find(({ ok }) => ok);
  if (first) elements.mapCoordinate.textContent = `${formatNumber(first.lat, 6)}° · ${formatNumber(first.lon, 6)}°`;
}

function clearMapLayers() {
  state.mapLayers.forEach((layer) => {
    try { layer.remove?.(); }
    catch { try { state.map.removeLayer(layer); } catch { /* no-op */ } }
  });
  state.mapLayers = [];
}

function renderAxisTable(provinces) {
  elements.axisTableBody.replaceChildren(...provinces.map((province) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = province.shortName || province.name;
    const official = document.createElement("td");
    const officialPill = document.createElement("span");
    officialPill.className = "axis-pill axis-pill-official";
    officialPill.textContent = formatMeridian(province.officialMeridian);
    official.append(officialPill);
    const legacy = document.createElement("td");
    const alternatives = province.legacyAxes.filter(({ meridian }) => meridian !== province.officialMeridian);
    if (!alternatives.length) legacy.textContent = "Không có trục khác trong danh mục đối sánh";
    alternatives.forEach(({ meridian, areas }) => {
      const line = document.createElement("div");
      const pill = document.createElement("span");
      pill.className = "axis-pill";
      pill.textContent = formatMeridian(meridian);
      line.append(pill, document.createTextNode(areas));
      legacy.append(line);
    });
    row.append(name, official, legacy);
    return row;
  }));
  elements.axisTableCount.textContent = `${provinces.length} tỉnh, thành`;
}

function filterAxes() {
  const query = normalize(elements.axisSearch.value);
  const filtered = PROVINCES_34.filter((province) => normalize([
    province.name,
    province.shortName,
    ...province.axes.flatMap(({ meridian, areas }) => [areas, formatMeridian(meridian), meridian]),
  ].join(" ")).includes(query));
  renderAxisTable(filtered);
}

function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replaceAll("đ", "d");
}

function formatNumber(value, digits) {
  return new Intl.NumberFormat("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function ensureConverter() {
  if (!state.converter) {
    if (typeof window.proj4 !== "function") throw new Error("Thư viện tính toán chưa sẵn sàng. Hãy tải lại trang.");
    state.converter = createConverter(window.proj4);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2400);
}

initialize();
