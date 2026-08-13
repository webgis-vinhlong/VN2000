import test from "node:test";
import assert from "node:assert/strict";
import proj4 from "proj4";
import { createConverter, projectionDefinition, toDms } from "../assets/js/transform.js";
import { PROVINCES_34, TT24 } from "../assets/js/provinces.js";

const converter = createConverter(proj4);

const TT24_MERIDIANS = new Map(Object.entries({
  "An Giang": 104.75, "Bắc Ninh": 107, "Cà Mau": 104.5, "Cao Bằng": 105.75,
  "Đắk Lắk": 108.5, "Điện Biên": 103, "Đồng Nai": 107.75, "Đồng Tháp": 105,
  "Gia Lai": 108.25, "Hà Tĩnh": 105.5, "Hưng Yên": 105.5, "Khánh Hòa": 108.25,
  "Lai Châu": 104.75, "Lạng Sơn": 107.25, "Lào Cai": 104.75, "Lâm Đồng": 107.75,
  "Nghệ An": 104.75, "Ninh Bình": 105, "Phú Thọ": 104.75, "Quảng Ngãi": 108,
  "Quảng Ninh": 107.75, "Quảng Trị": 106, "Sơn La": 104, "Tây Ninh": 105.75,
  "Thái Nguyên": 106.5, "Thanh Hóa": 105, "Cần Thơ": 105, "Đà Nẵng": 107.75,
  "Hà Nội": 105, "Hải Phòng": 105.75, "Thành phố Hồ Chí Minh": 105.75,
  "Huế": 107, "Tuyên Quang": 106, "Vĩnh Long": 105.5,
}));

test("đối sánh đúng đủ 34 kinh tuyến hiện hành trong phụ lục TT24", () => {
  assert.equal(PROVINCES_34.length, 34);
  assert.equal(new Set(PROVINCES_34.map(({ name }) => name)).size, 34);
  assert.equal(TT24.effectiveOn, "2025-07-01");
  for (const province of PROVINCES_34) {
    assert.equal(province.officialMeridian, TT24_MERIDIANS.get(province.name), province.name);
    assert.equal(province.axes[0].kind, "official", province.name);
    assert.equal(province.axes[0].meridian, province.officialMeridian, province.name);
    assert.ok(province.axes.length >= 1);
    for (const axis of province.axes) assert.doesNotThrow(() => projectionDefinition(axis.meridian));
  }
});

test("các trục sửa đáng chú ý không bị dữ liệu kế thừa ghi đè", () => {
  const byName = new Map(PROVINCES_34.map((province) => [province.name, province]));
  assert.equal(byName.get("Bắc Ninh").axes[0].meridian, 107);
  assert.equal(byName.get("Gia Lai").axes[0].meridian, 108.25);
  assert.equal(byName.get("Lai Châu").axes[0].meridian, 104.75);
  assert.equal(byName.get("Quảng Trị").axes[0].meridian, 106);
  assert.equal(byName.get("Tây Ninh").axes[0].meridian, 105.75);
  assert.ok(byName.get("Lai Châu").axes.some(({ kind, meridian }) => kind === "legacy" && meridian === 103));
});

test("mẫu Ninh Thuận trong workbook cho kết quả EPSG/PROJ", () => {
  assert.match(projectionDefinition(108.25), /,0\.00928836,-0\.01975479,0\.00427372,0\.252906278/);
  const result = converter.vn2000ToWgs84({ x: 1_255_172.51, y: 568_262.924 }, 108.25);
  assert.ok(Math.abs(result.lat - 11.349358) < 0.000002);
  assert.ok(Math.abs(result.lon - 108.877201) < 0.000002);
});

test("chuyển đổi hai chiều ổn định ở mức milimét", () => {
  const source = { lat: 10.776889, lon: 106.700806 };
  const projected = converter.wgs84ToVn2000(source, 105.75);
  const restored = converter.vn2000ToWgs84(projected, 105.75);
  assert.ok(Math.abs(restored.lat - source.lat) < 1e-9);
  assert.ok(Math.abs(restored.lon - source.lon) < 1e-9);
});

test("định dạng DMS giữ đúng bán cầu", () => {
  assert.match(toDms(21.0285, "B", "N"), /21° 01′/);
  assert.match(toDms(105.8542, "Đ", "T"), /105° 51′/);
});
