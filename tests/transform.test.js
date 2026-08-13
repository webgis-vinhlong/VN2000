import test from "node:test";
import assert from "node:assert/strict";
import proj4 from "proj4";
import { createConverter, projectionDefinition, toDms } from "../assets/js/transform.js";
import { PROVINCES_34 } from "../assets/js/provinces.js";

const converter = createConverter(proj4);

test("có đúng 34 tỉnh, thành và mọi trục đều hợp lệ", () => {
  assert.equal(PROVINCES_34.length, 34);
  assert.equal(new Set(PROVINCES_34.map(({ name }) => name)).size, 34);
  for (const province of PROVINCES_34) {
    assert.ok(province.axes.length >= 1);
    for (const axis of province.axes) assert.doesNotThrow(() => projectionDefinition(axis.meridian));
  }
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
