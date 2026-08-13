export const TT24 = Object.freeze({
  number: "24/2025/TT-BNNMT",
  issuedOn: "2025-06-20",
  effectiveOn: "2025-07-01",
  scope: "Kinh tuyến trục của bản đồ hành chính cấp tỉnh",
  officialUrl: "https://vanban.chinhphu.vn/?docid=214096&pageid=27160",
  gazetteUrl: "https://congbao.chinhphu.vn/van-ban/thong-tu-so-24-2025-tt-bnnmt-45474/57513.htm",
});

const PROVINCE_DEFINITIONS = [
  { name: "Hà Nội", officialMeridian: 105, legacyAxes: [{ meridian: 105, areas: "Hà Nội" }] },
  { name: "Cao Bằng", officialMeridian: 105.75, legacyAxes: [{ meridian: 105.75, areas: "Cao Bằng" }] },
  { name: "Tuyên Quang", officialMeridian: 106, legacyAxes: [
    { meridian: 106, areas: "Tuyên Quang (cũ)" }, { meridian: 105.5, areas: "Hà Giang (cũ)" },
  ] },
  { name: "Điện Biên", officialMeridian: 103, legacyAxes: [{ meridian: 103, areas: "Điện Biên" }] },
  { name: "Lai Châu", officialMeridian: 104.75, legacyAxes: [{ meridian: 103, areas: "Dữ liệu theo danh mục 63 tỉnh trước đây" }] },
  { name: "Sơn La", officialMeridian: 104, legacyAxes: [{ meridian: 104, areas: "Sơn La" }] },
  { name: "Lào Cai", officialMeridian: 104.75, legacyAxes: [{ meridian: 104.75, areas: "Lào Cai và Yên Bái (cũ)" }] },
  { name: "Thái Nguyên", officialMeridian: 106.5, legacyAxes: [{ meridian: 106.5, areas: "Thái Nguyên và Bắc Kạn (cũ)" }] },
  { name: "Lạng Sơn", officialMeridian: 107.25, legacyAxes: [{ meridian: 107.25, areas: "Lạng Sơn" }] },
  { name: "Quảng Ninh", officialMeridian: 107.75, legacyAxes: [{ meridian: 107.75, areas: "Quảng Ninh" }] },
  { name: "Bắc Ninh", officialMeridian: 107, legacyAxes: [
    { meridian: 105.5, areas: "Bắc Ninh (cũ)" }, { meridian: 107, areas: "Bắc Giang (cũ)" },
  ] },
  { name: "Phú Thọ", officialMeridian: 104.75, legacyAxes: [
    { meridian: 104.75, areas: "Phú Thọ (cũ)" }, { meridian: 105, areas: "Vĩnh Phúc (cũ)" }, { meridian: 106, areas: "Hòa Bình (cũ)" },
  ] },
  { name: "Hải Phòng", officialMeridian: 105.75, legacyAxes: [
    { meridian: 105.75, areas: "Hải Phòng (cũ)" }, { meridian: 105.5, areas: "Hải Dương (cũ)" },
  ] },
  { name: "Hưng Yên", officialMeridian: 105.5, legacyAxes: [{ meridian: 105.5, areas: "Hưng Yên và Thái Bình (cũ)" }] },
  { name: "Ninh Bình", officialMeridian: 105, legacyAxes: [
    { meridian: 105, areas: "Ninh Bình (cũ)" }, { meridian: 105.5, areas: "Hà Nam và Nam Định (cũ)" },
  ] },
  { name: "Thanh Hóa", officialMeridian: 105, legacyAxes: [{ meridian: 105, areas: "Thanh Hóa" }] },
  { name: "Nghệ An", officialMeridian: 104.75, legacyAxes: [{ meridian: 104.75, areas: "Nghệ An" }] },
  { name: "Hà Tĩnh", officialMeridian: 105.5, legacyAxes: [{ meridian: 105.5, areas: "Hà Tĩnh" }] },
  { name: "Quảng Trị", officialMeridian: 106, legacyAxes: [
    { meridian: 106.25, areas: "Quảng Trị (cũ)" }, { meridian: 106, areas: "Quảng Bình (cũ)" },
  ] },
  { name: "Huế", officialMeridian: 107, legacyAxes: [{ meridian: 107, areas: "Thừa Thiên Huế (cũ)" }] },
  { name: "Đà Nẵng", officialMeridian: 107.75, legacyAxes: [{ meridian: 107.75, areas: "Đà Nẵng và Quảng Nam (cũ)" }] },
  { name: "Quảng Ngãi", officialMeridian: 108, legacyAxes: [
    { meridian: 108, areas: "Quảng Ngãi (cũ)" }, { meridian: 107.5, areas: "Kon Tum (cũ)" },
  ] },
  { name: "Gia Lai", officialMeridian: 108.25, legacyAxes: [
    { meridian: 108.5, areas: "Gia Lai (cũ)" }, { meridian: 108.25, areas: "Bình Định (cũ)" },
  ] },
  { name: "Đắk Lắk", officialMeridian: 108.5, legacyAxes: [{ meridian: 108.5, areas: "Đắk Lắk và Phú Yên (cũ)" }] },
  { name: "Khánh Hòa", officialMeridian: 108.25, legacyAxes: [{ meridian: 108.25, areas: "Khánh Hòa và Ninh Thuận (cũ)" }] },
  { name: "Lâm Đồng", officialMeridian: 107.75, legacyAxes: [
    { meridian: 107.75, areas: "Lâm Đồng (cũ)" }, { meridian: 108.5, areas: "Đắk Nông và Bình Thuận (cũ)" },
  ] },
  { name: "Đồng Nai", officialMeridian: 107.75, legacyAxes: [
    { meridian: 107.75, areas: "Đồng Nai (cũ)" }, { meridian: 106.25, areas: "Bình Phước (cũ)" },
  ] },
  { name: "Thành phố Hồ Chí Minh", shortName: "TP. Hồ Chí Minh", officialMeridian: 105.75, legacyAxes: [
    { meridian: 105.75, areas: "TP.HCM và Bình Dương (cũ)" }, { meridian: 107.75, areas: "Bà Rịa – Vũng Tàu (cũ)" },
  ] },
  { name: "Tây Ninh", officialMeridian: 105.75, legacyAxes: [
    { meridian: 105.5, areas: "Tây Ninh (cũ)" }, { meridian: 105.75, areas: "Long An (cũ)" },
  ] },
  { name: "Đồng Tháp", officialMeridian: 105, legacyAxes: [
    { meridian: 105, areas: "Đồng Tháp (cũ)" }, { meridian: 105.75, areas: "Tiền Giang (cũ)" },
  ] },
  { name: "Vĩnh Long", officialMeridian: 105.5, legacyAxes: [
    { meridian: 105.5, areas: "Vĩnh Long và Trà Vinh (cũ)" }, { meridian: 105.75, areas: "Bến Tre (cũ)" },
  ] },
  { name: "Cần Thơ", officialName: "Thành phố Cần Thơ", officialMeridian: 105, legacyAxes: [
    { meridian: 105, areas: "Cần Thơ và Hậu Giang (cũ)" }, { meridian: 105.5, areas: "Sóc Trăng (cũ)" },
  ] },
  { name: "An Giang", officialMeridian: 104.75, legacyAxes: [
    { meridian: 104.75, areas: "An Giang (cũ)" }, { meridian: 104.5, areas: "Kiên Giang (cũ)" },
  ] },
  { name: "Cà Mau", officialMeridian: 104.5, legacyAxes: [
    { meridian: 104.5, areas: "Cà Mau (cũ)" }, { meridian: 105, areas: "Bạc Liêu (cũ)" },
  ] },
];

function buildAxes(province) {
  const matching = province.legacyAxes.filter(({ meridian }) => meridian === province.officialMeridian);
  const inherited = matching.map(({ areas }) => areas).join("; ");
  const official = {
    meridian: province.officialMeridian,
    kind: "official",
    areas: inherited ? `Hiện hành theo TT24; cùng trục với: ${inherited}` : "Hiện hành theo TT24/2025/TT-BNNMT",
  };
  const legacy = province.legacyAxes
    .filter(({ meridian }) => meridian !== province.officialMeridian)
    .map((axis) => ({ ...axis, kind: "legacy", areas: `Dữ liệu kế thừa: ${axis.areas}` }));
  return [official, ...legacy];
}

export const PROVINCES_34 = PROVINCE_DEFINITIONS.map((province) => ({ ...province, axes: buildAxes(province) }));

export function formatMeridian(value) {
  const degrees = Math.trunc(value);
  const minutes = Math.round((value - degrees) * 60);
  return `${degrees}°${String(minutes).padStart(2, "0")}′`;
}
