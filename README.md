# VN2000 Coordinate Lab

Ứng dụng web tĩnh, mã nguồn mở để chuyển đổi hai chiều **VN-2000 ↔ WGS84**, hỗ trợ 34 tỉnh/thành hiện hành của Việt Nam, tọa độ `X, Y`, nhập hàng loạt và kiểm tra trực quan trên Vietflex Map. Kinh tuyến mặc định được đối sánh với Phụ lục Thông tư 24/2025/TT-BNNMT; trục của dữ liệu cũ được giữ thành lựa chọn riêng.

> Phát triển bởi **Long Ngo** · Giấy phép [MIT](LICENSE)

## Điểm khác biệt

- Danh mục đúng **34 đơn vị hành chính cấp tỉnh** sau Nghị quyết 202/2025/QH15.
- Mặc định đúng một trục hiện hành cho mỗi tỉnh theo Phụ lục Thông tư 24/2025/TT-BNNMT.
- Không làm mất khả năng đọc hồ sơ cũ: các kinh tuyến khác của địa bàn trước sắp xếp được ghi rõ là **dữ liệu kế thừa**.
- Quy ước nhập rõ ràng: **X = Northing**, **Y = Easting**; khi gọi PROJ4, ứng dụng tự đổi sang thứ tự `[Easting, Northing]`.
- Hai chiều VN-2000 → WGS84 và WGS84 → VN-2000.
- Nhập nhiều điểm từ Excel/CSV; xuất CSV UTF-8 có BOM.
- Bản đồ Vietflex dùng cấu hình `useLegacyGoogleTiles: false`.
- Mọi phép tính chạy trong trình duyệt, không có API thu thập tọa độ.
- Hiển thị nhật ký tính, tham số chiếu và cơ sở toán học.

## Cách dùng

1. Chọn tỉnh/thành hiện hành.
2. Giữ lựa chọn **TT24 · hiện hành** cho bản đồ hành chính cấp tỉnh hoặc chọn **Dữ liệu cũ** khi hồ sơ/metadata gốc xác nhận một trục khác.
3. Chọn chiều chuyển đổi.
4. Nhập một điểm hoặc dán nhiều dòng theo một trong các mẫu:

```text
M01; 1255172.510; 568262.924
M02; 1255310.120; 568410.500
```

hoặc:

```text
M01; 11.349358; 108.877201
M02; 11.350594; 108.878556
```

Ứng dụng chấp nhận dấu phân cách tab, chấm phẩy, phẩy hoặc khoảng trắng. Nếu dùng dấu phẩy làm phần thập phân, nên phân cách cột bằng tab hoặc dấu chấm phẩy.

## Chạy cục bộ

```bash
npm install
npm test
npm run serve
```

Mở `http://localhost:8080`.

Ứng dụng không cần bước build. `proj4@2.21.0` và Vietflex Map được ghim phiên bản trên jsDelivr trong `index.html`; gói npm `proj4` chỉ phục vụ kiểm thử cùng thuật toán.

## Cơ sở phép chuyển đổi

Chuỗi xử lý VN-2000 → WGS84:

1. Chiếu nghịch Transverse Mercator 3° từ `Y/Easting, X/Northing` sang vĩ độ/kinh độ VN-2000.
2. Đổi tọa độ trắc địa sang địa tâm trên elipsoid WGS84 (`a = 6.378.137 m`, `1/f = 298,257223563`).
3. Áp dụng Helmert 7 tham số từ datum VN-2000 sang WGS84.
4. Đổi địa tâm về vĩ độ/kinh độ WGS84.

Chiều ngược dùng các phép biến đổi nghịch đảo theo thứ tự ngược lại.

Định nghĩa TM-3 được tạo động:

```text
+proj=tmerc +lat_0=0 +lon_0=<kinh-tuyen-truc>
+k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84
+towgs84=-191.90441429,-39.30318279,-111.45032835,
          0.00928836,-0.01975479,0.00427372,0.252906278
+units=m +no_defs +type=crs
```

Ba góc quay công bố trong bộ tham số và các workbook tham chiếu là `−0,00928836; +0,01975479; −0,00427372` theo quy ước **coordinate-frame** (EPSG:9607). `+towgs84` của PROJ4 dùng **position-vector** (EPSG:9606), nên mã nguồn đổi dấu ba góc thành `+; −; +`. Hai quy ước cho cùng kết quả khi chuyển đổi dấu đúng; nếu chép nguyên dấu sẽ tạo sai khác khoảng 0,5 m ở điểm kiểm thử.

## 34 tỉnh/thành: trục hiện hành và dữ liệu trước sắp xếp

Tên tỉnh hiện hành và thành phần trước sắp xếp được lấy theo Nghị quyết 202/2025/QH15. Phụ lục Thông tư 24/2025/TT-BNNMT quy định một kinh tuyến trục cho **bản đồ hành chính cấp tỉnh** của từng đơn vị, có hiệu lực từ 01/07/2025. Điều 16 của Thông tư đồng thời quy định chuyển tiếp cho hạng mục, sản phẩm đã được kiểm tra chất lượng trước thời điểm hiệu lực.

Vì kinh tuyến trục còn là thuộc tính của hệ tọa độ đã dùng để tạo dữ liệu, tên tỉnh mới không tự động tái chiếu hồ sơ cũ. Ứng dụng áp dụng nguyên tắc:

- lựa chọn đầu tiên luôn là trục hiện hành TT24;
- trục khác chỉ xuất hiện dưới nhãn **Dữ liệu kế thừa**;
- hồ sơ kỹ thuật/metadata gốc luôn có ưu tiên cao hơn lựa chọn mặc định của giao diện.

Ví dụ, TP. Hồ Chí Minh có trục hiện hành `105°45′` theo TT24; ứng dụng vẫn cho chọn `107°45′` đối với dữ liệu kế thừa từ Bà Rịa–Vũng Tàu khi metadata gốc yêu cầu.

### Các mặc định đã sửa sau đối sánh TT24

| Tỉnh/thành | Mặc định từ danh mục dữ liệu cũ | Trục hiện hành TT24 |
|---|---:|---:|
| Bắc Ninh | 105°30′ | **107°00′** |
| Gia Lai | 108°30′ | **108°15′** |
| Lai Châu | 103°00′ | **104°45′** |
| Quảng Trị | 106°15′ | **106°00′** |
| Tây Ninh | 105°30′ | **105°45′** |

## Kiểm thử

Bộ kiểm thử hiện có:

- đối sánh đủ 34 tỉnh/thành và 34 kinh tuyến hiện hành với phụ lục TT24;
- xác nhận trục hiện hành luôn là lựa chọn đầu tiên, không bị trục kế thừa ghi đè;
- đối chiếu điểm mẫu Ninh Thuận từ workbook tham chiếu;
- kiểm tra chuyển đổi khứ hồi hai chiều;
- kiểm tra định dạng độ–phút–giây.

```bash
npm test
```

## Giới hạn sử dụng

Đây là công cụ giáo dục và hỗ trợ kiểm tra. Phụ lục TT24 có phạm vi là kinh tuyến trục của **bản đồ hành chính cấp tỉnh**, không phải tuyên bố tự động thay trục của mọi bản đồ địa chính và hồ sơ lịch sử. Kết quả có thể sai nếu nhầm trục, nhầm thứ tự X/Y, dùng múi 6°/UTM thay vì TM-3, hoặc dữ liệu gốc dùng bộ tham số cục bộ. Không dùng kết quả làm căn cứ pháp lý để xác định ranh giới thửa đất nếu chưa được đơn vị đo đạc có thẩm quyền kiểm tra.

## Tài liệu tham khảo

- EPSG Geodetic Parameter Dataset. (2025). *VN-2000 / TM-3 108-30 (EPSG:9218).* https://epsg.io/9218
- Bộ Nông nghiệp và Môi trường. (2025). *Thông tư 24/2025/TT-BNNMT — Phụ lục quy định về kinh tuyến trục của bản đồ hành chính cấp tỉnh.* https://vanban.chinhphu.vn/?docid=214096&pageid=27160
- Công báo Chính phủ. (2025). *Thông tư 24/2025/TT-BNNMT, Công báo số 937 + 938.* https://congbao.chinhphu.vn/van-ban/thong-tu-so-24-2025-tt-bnnmt-45474/57513.htm
- PROJ contributors. (2026). *Transformation pipelines.* https://proj.org/en/stable/tutorials/EUREF2019/exercises/pipelines.html
- PROJ contributors. (2026). *Helmert transform: Coordinate-frame and position-vector conventions.* https://proj.org/en/stable/operations/transformations/helmert.html
- Quốc hội. (2025). *Nghị quyết 202/2025/QH15 về sắp xếp đơn vị hành chính cấp tỉnh.* https://quochoi.vn/content/tintuc/Lists/News/Attachments/94532/NQ%20202%20%281%29.pdf
- Thủ tướng Chính phủ. (2000). *Quyết định 83/2000/QĐ-TTg về sử dụng Hệ quy chiếu và Hệ tọa độ quốc gia Việt Nam.* https://vanban.chinhphu.vn/?docid=7812&pageid=27160

## Cấu trúc mã nguồn

```text
.
├── index.html
├── assets/
│   ├── css/app.css
│   └── js/
│       ├── app.js
│       ├── provinces.js
│       └── transform.js
├── tests/transform.test.js
├── .github/workflows/pages.yml
├── CITATION.cff
└── LICENSE
```

## Đóng góp

Issue và pull request được hoan nghênh. Khi đề xuất sửa kinh tuyến trục hoặc tham số, vui lòng đính kèm nguồn pháp lý/metadata có thể kiểm chứng và một cặp tọa độ kiểm thử.
