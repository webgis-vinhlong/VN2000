export const ELLIPSOID = Object.freeze({ a: 6378137, inverseFlattening: 298.257223563 });

export const HELMERT = Object.freeze({
  dx: -191.90441429,
  dy: -39.30318279,
  dz: -111.45032835,
  rx: -0.00928836,
  ry: 0.01975479,
  rz: -0.00427372,
  scalePpm: 0.252906278,
});

// Bộ tham số công bố/Excel dùng quy ước coordinate-frame (EPSG:9607).
// PROJ4 +towgs84 dùng position-vector (EPSG:9606), vì vậy phải đổi dấu 3 góc.
export const PROJ_HELMERT = Object.freeze({
  ...HELMERT,
  rx: -HELMERT.rx,
  ry: -HELMERT.ry,
  rz: -HELMERT.rz,
});

export const PROJECTION = Object.freeze({
  latitudeOfOrigin: 0,
  scaleFactor: 0.9999,
  falseEasting: 500000,
  falseNorthing: 0,
});

export function projectionDefinition(centralMeridian) {
  if (!Number.isFinite(centralMeridian) || centralMeridian < 100 || centralMeridian > 112) {
    throw new RangeError("Kinh tuyến trục phải nằm trong khoảng 100°–112° Đông.");
  }
  const h = PROJ_HELMERT;
  return `+proj=tmerc +lat_0=0 +lon_0=${centralMeridian} +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=${h.dx},${h.dy},${h.dz},${h.rx},${h.ry},${h.rz},${h.scalePpm} +units=m +no_defs +type=crs`;
}

export function createConverter(proj4) {
  if (typeof proj4 !== "function") throw new TypeError("Thiếu thư viện PROJ4.");

  function vn2000ToWgs84({ x, y }, centralMeridian) {
    validateProjected(x, y);
    const [lon, lat] = proj4(projectionDefinition(centralMeridian), "EPSG:4326", [y, x]);
    validateGeographic(lat, lon);
    return { lat, lon, x, y, centralMeridian };
  }

  function wgs84ToVn2000({ lat, lon }, centralMeridian) {
    validateGeographic(lat, lon);
    const [easting, northing] = proj4("EPSG:4326", projectionDefinition(centralMeridian), [lon, lat]);
    if (!Number.isFinite(easting) || !Number.isFinite(northing)) {
      throw new RangeError("Không thể chiếu tọa độ đã nhập.");
    }
    return { x: northing, y: easting, lat, lon, centralMeridian };
  }

  return { vn2000ToWgs84, wgs84ToVn2000 };
}

export function validateProjected(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError("X và Y phải là số hữu hạn.");
  if (x < 0 || x > 3_000_000 || y < 100_000 || y > 900_000) {
    throw new RangeError("X/Y nằm ngoài miền kiểm tra thông thường của Việt Nam.");
  }
}

export function validateGeographic(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new TypeError("Vĩ độ và kinh độ phải là số hữu hạn.");
  if (lat < 7 || lat > 24.5 || lon < 100 || lon > 112) {
    throw new RangeError("Tọa độ nằm ngoài phạm vi kiểm tra mở rộng của Việt Nam.");
  }
}

export function toDms(value, positive, negative) {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  return `${degrees}° ${String(minutes).padStart(2, "0")}′ ${seconds.toFixed(3).padStart(6, "0")}″ ${value >= 0 ? positive : negative}`;
}

export function parseLocaleNumber(raw) {
  if (typeof raw === "number") return raw;
  const value = String(raw ?? "").trim().replace(/\s/g, "");
  if (!value) return Number.NaN;
  const normalized = value.includes(",") && !value.includes(".") ? value.replace(",", ".") : value;
  return Number(normalized);
}
