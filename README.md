# VN Free Docs

Trang web cá nhân một trang (one-page) giới thiệu **VN Free Docs** — nơi chia sẻ tài liệu, mẫu Excel và công cụ miễn phí cho người Việt, kèm phần giới thiệu giải pháp công nghệ cho doanh nghiệp nhỏ và vừa.

- **Công nghệ:** Vue 3 (`<script setup>`, JavaScript thuần, không TypeScript) + Vuetify 3 + Vite
- **Ngôn ngữ:** tiếng Việt mặc định, có nút chuyển VI/EN
- **Giao diện:** sáng/tối (light/dark) theo theme Vuetify, có nút bật/tắt trên app bar
- **Không cần backend:** form liên hệ chỉ chạy ở phía trình duyệt (có kiểm tra dữ liệu + snackbar báo thành công)

---

## 1. Yêu cầu môi trường

- Node.js **18+** (khuyến nghị 20 hoặc 22)
- npm 9+

## 2. Chạy dự án

```bash
npm install     # cài phụ thuộc
npm run dev     # chạy dev server tại http://localhost:5173
```

Các lệnh khác:

```bash
npm run build     # build production vào thư mục dist/
npm run preview   # xem thử bản build
npm run lint      # kiểm tra & tự sửa lỗi ESLint
npm run format    # định dạng code bằng Prettier
```

Muốn lưu tin nhắn vào MongoDB thật, mở thêm một terminal và chạy backend:

```bash
cd server
npm install
npm run dev:memory   # thử nhanh, không cần Atlas (in sẵn địa chỉ API + ADMIN_TOKEN)
# hoặc: cp .env.example .env → điền MONGODB_URI → npm start
```

Chi tiết ở **mục 8**.

## 3. Cấu trúc thư mục

```
src/
  assets/styles/main.css   # CSS toàn cục: hiệu ứng reveal, blob, glass, hover
  components/              # AppBar, HeroSection, FreeTools, Solutions, Process,
                           # ContactDonate, AppFooter, SectionTitle, ToolCard,
                           # ToolDetailDialog, SolutionCard, CopyField, ContactForm,
                           # InboxAdmin, MessageDetailDialog
  composables/             # useLocale, useCopy, useRevealOnScroll, useMessages, useDateFormat
  data/                    # ← TOÀN BỘ NỘI DUNG NẰM Ở ĐÂY
  plugins/vuetify.js       # cấu hình theme màu & mặc định component
  App.vue, main.js
public/                    # favicon, ảnh OG, ảnh QR mẫu
server/                    # backend Express + MongoDB (npm workspace, xem mục 8)
api/index.js               # serverless function cho Vercel, bọc server/src
vercel.json                # cấu hình deploy web + API trên Vercel (mục 9)
```

## 4. Sửa nội dung (không cần chạm vào component)

| Muốn đổi gì                                               | Sửa file                                  |
| --------------------------------------------------------- | ----------------------------------------- |
| Tên thương hiệu, tên chủ sở hữu, domain, SEO              | `src/data/site.js`                        |
| Danh sách tài liệu/công cụ miễn phí                       | `src/data/tools.js`                       |
| Giải pháp cho doanh nghiệp                                | `src/data/solutions.js`                   |
| Quy trình làm việc 4 bước                                 | `src/data/process.js`                     |
| Email, Zalo, Telegram, GitHub, Facebook                   | `src/data/contact.js` → `contactChannels` |
| Thông tin chuyển khoản & ví crypto                        | `src/data/contact.js` → `donate`          |
| Kênh nhận tin nhắn, Google Sheet, mật khẩu trang quản trị | `src/data/inbox.js`                       |
| Mọi chuỗi chữ VI/EN trên giao diện                        | `src/data/i18n.js`                        |

### Thêm một công cụ mới

Mở `src/data/tools.js`, copy một object có sẵn và sửa lại:

```js
{
  id: 'ten-khong-dau',            // duy nhất
  icon: 'mdi-file-star-outline',  // tên icon Material Design Icons
  category: 'excel',              // 'docs' | 'excel' | 'other'
  tag: 'free',                    // 'free' | 'openSource' | 'updated'
  status: 'available',            // 'available' | 'inProgress' | 'planned'
  accent: 'blue',                 // blue | cyan | violet | emerald | amber | rose
  link: 'https://link-that-cua-ban', // TODO: thay link thật
  vi: { name: '…', description: '…' },
  en: { name: '…', description: '…' },
  gallery: [                      // không bắt buộc — ảnh chụp màn hình thật, hiện ở mục “Giao diện thực tế”
    {
      src: '/images/ten-cong-cu/01-tong-quan.jpg', // ảnh đặt trong public/images/…
      span: 'full',               // tuỳ chọn: để ảnh chiếm trọn một hàng
      caption: { vi: 'Chú thích ngắn…', en: 'Short caption…' },
    },
  ],
  details: {                      // không bắt buộc — nội dung cho hộp thoại mô tả
    vi: {
      overview: 'Đoạn giới thiệu 2–3 câu về dự án…',
      highlights: ['Điểm nổi bật 1', 'Điểm nổi bật 2', '…'],
      features: [                 // lưới thẻ tính năng chi tiết (bỏ trống nếu chưa cần)
        { icon: 'mdi-format-bold', title: 'Tên tính năng', text: 'Mô tả 1–2 câu.' },
      ],
      formats: {                  // bảng định dạng xuất & nhập (tuỳ chọn)
        note: 'Câu dẫn cho phần xuất tài liệu…',
        items: [{ icon: 'mdi-file-pdf-box', label: 'PDF (.pdf)', text: 'Dùng để…' }],
        importNote: 'Nhập lại từ…',
      },
      shortcuts: [{ keys: '⌘S', action: 'Lưu tài liệu' }], // tuỳ chọn
      note: 'Ghi chú thêm: nền tảng, lưu ý khi cài đặt…',  // tuỳ chọn
      format: 'Excel (.xlsx)',    // 4 ô thông tin nhanh, bỏ trống ô nào cũng được
      platform: 'Windows · macOS · Linux', // thay cho `format` khi app chạy trên nhiều hệ điều hành
      version: 'v1.0',
      updated: 'Tháng 9/2026',
      license: 'Miễn phí',
    },
    en: { overview: '…', highlights: ['…'], features: [], format: '…', version: '…', updated: '…', license: '…' },
  },
}
```

Các trường `gallery`, `features`, `formats`, `shortcuts`, `note` đều là **tuỳ chọn**: chỉ công cụ nào có dữ liệu mới hiện thêm mục tương ứng trong hộp thoại, và hộp thoại tự nới rộng (980px) khi có ảnh chụp.

`status` quyết định nhãn trên thẻ và nút hành động:

- `available` — đã có: nút “Tải / mở công cụ” mở **hộp thoại mô tả dự án** (`ToolDetailDialog`), trong đó có nút tải gắn `link`. Khi `link` còn là `#` thì nút đó được coi là link mẫu và chỉ hiện thông báo nhắc thay link thật.
- `inProgress` — đang làm: nút đổi thành “Nhận thông báo khi có”, mở cùng hộp thoại mô tả nhưng thay nút tải bằng ghi chú “đang hoàn thiện” và nút dẫn về mục Liên hệ.
- `planned` — nằm trong kế hoạch, xử lý giống `inProgress`.

Nội dung vài chữ trong hộp thoại (tiêu đề mục, nhãn ô thông tin, ghi chú link mẫu…) nằm ở `tools.detail` trong `src/data/i18n.js`; phần mô tả từng dự án nằm ở `details.vi` / `details.en` trong `src/data/tools.js`.

Hiện chỉ nhóm **Văn bản** (soạn thảo văn bản) và **Excel** (trang tính) là `available`; nhóm **Công cụ khác** để `inProgress` hoặc `planned` cho tới khi làm xong.

### Thêm một giải pháp mới

Mở `src/data/solutions.js`, copy một object và sửa `vi`/`en`, `points` (3–4 gạch đầu dòng) và `ctaTarget` (thường là `'#lien-he'`).

> Bộ lọc danh mục nằm ở `toolCategories` trong `src/data/tools.js`. Nếu thêm danh mục mới, hãy thêm nhãn tương ứng vào `tools.categories` trong `src/data/i18n.js`.

## 5. Đổi màu thương hiệu & giao diện

Mở `src/plugins/vuetify.js`:

```js
light: {
  colors: {
    primary: '#2B5CFF',   // màu chính
    secondary: '#7B5CFF', // màu phụ
    accent: '#12C8C0',    // màu nhấn
    surface: '#FFFFFF',   // nền card
    background: '#F4F7FF' // nền trang
    // …
  }
}
```

- Theme tối nằm ngay bên dưới trong cùng file (`dark.colors`).
- Gradient (nút, chữ gradient, icon tile) định nghĩa ở `--vnf-gradient` trong `src/assets/styles/main.css` và `src/data/accents.js`.
- Đổi font: thay gói `@fontsource/...` được import trong `src/main.js` và cập nhật `font-family` trong `main.css`. Font đang dùng là **Be Vietnam Pro** (hiển thị tốt dấu tiếng Việt).
- Bật/tắt hiệu ứng xuất hiện khi cuộn: directive `v-reveal` trong `src/composables/useRevealOnScroll.js`. Hiệu ứng tự tắt khi người dùng bật "giảm chuyển động" trong hệ điều hành.

## 6. ⚠️ Danh sách placeholder cần thay trước khi deploy

1. **Tên & thông tin cá nhân** — `src/data/site.js`: `owner.name`, `brand.*`, `domain`, `url`. Đồng thời cập nhật `<title>`, `meta description`, thẻ Open Graph và `<link rel="canonical">` trong `index.html`.
2. **Link tài liệu thật** — `src/data/tools.js`: mọi trường `link: '#'` (Google Drive, GitHub, trang tải…).
3. **Kênh liên hệ** — `src/data/contact.js` → `contactChannels`: email, số Zalo, Telegram, GitHub, Facebook.
4. **Thông tin chuyển khoản** — `src/data/contact.js` → `donate.bank`: ngân hàng, số tài khoản, chủ tài khoản, chi nhánh.
5. **Ảnh QR thật** — thay `public/images/qr-placeholder.svg` bằng ảnh QR của bạn, rồi cập nhật `donate.bank.qr` (ví dụ `/images/qr-techcombank.png`).
6. **Ví crypto** — `src/data/contact.js` → `donate.crypto`: mạng và địa chỉ ví thật.
7. **Ảnh chia sẻ mạng xã hội** — `public/og-image.svg` đang là ảnh SVG minh hoạ. Hãy xuất một ảnh **PNG 1200×630** rồi trỏ `og:image` trong `index.html` tới ảnh đó.
8. **Favicon** — `public/favicon.svg`.
9. **Kênh nhận tin nhắn** — mặc định tin nhắn gửi về backend Express + MongoDB trong `server/`. Hãy chạy backend đó (mục 8) và nhập địa chỉ API vào trang quản trị, hoặc đổi `transport` trong `src/data/inbox.js` sang Google Sheet / Web3Forms / Formspree / Telegram (mục 7).
10. **`public/robots.txt`** — thay `https://example.com/sitemap.xml` bằng domain thật (và thêm `sitemap.xml` nếu cần).

## 7. Hộp thư & góp ý khách hàng

### 7.1 Cách hoạt động

Mọi tin nhắn gửi từ form liên hệ đều đi qua hai bước:

1. **Lưu vào hộp thư nội bộ** (localStorage) — luôn thành công, kể cả khi kênh gửi bên dưới gặp lỗi.
2. **Gửi tới kênh lưu trữ thật** bạn cấu hình trong `src/data/inbox.js` — mặc định là backend Express + MongoDB (`transport: 'api'`, xem mục 8).

> Chưa chạy backend? Không sao. Khi chưa nhập địa chỉ API, tin nhắn tự động được lưu ở trình duyệt và khách vẫn thấy thông báo gửi thành công bình thường.

Trang quản trị: mở **`/#/hop-thu`** (cũng có link nhỏ “Hộp thư” ở chân trang). Mỗi tin nhắn có link riêng dạng `#/hop-thu/<id>` để bookmark hoặc gửi cho người khác.

Trang quản trị cho phép: xem thống kê, tìm kiếm, lọc theo trạng thái / loại nội dung, sắp xếp, đánh dấu sao, ghi chú nội bộ, đổi trạng thái (**Chưa đọc → Đã đọc → Đã trả lời → Lưu trữ**), trả lời nhanh bằng email (mở sẵn nội dung), xuất/nhập JSON (sao lưu) và xuất CSV để mở bằng Excel.

> Trang này là lớp quản trị nhẹ chạy hoàn toàn ở trình duyệt. Nếu bạn cần bảo mật thật, hãy dùng `admin.passcode` như một lớp chắn tạm và đặt trang sau một dịch vụ xác thực (Cloudflare Access, Vercel Password Protection…).

### 7.2 Chọn kênh nhận tin (`src/data/inbox.js`)

| `transport`          | Cần điền                               | Phù hợp khi                                                                                    |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `'api'` _(mặc định)_ | địa chỉ backend (mục 8)                | **Khuyến nghị** — backend Express + MongoDB trong `server/`, dữ liệu nằm trong Atlas của bạn.  |
| `'local'`            | –                                      | Muốn chạy ngay, không cần tài khoản. Tin chỉ nằm trong trình duyệt đang mở.                    |
| `'custom'`           | `custom.endpoint`                      | Google Apps Script + Google Sheet (miễn phí, dữ liệu thuộc về bạn — xem 7.3).                  |
| `'web3forms'`        | `web3forms.accessKey`                  | Muốn nhận email mỗi khi có tin, cài đặt trong 2 phút ([web3forms.com](https://web3forms.com)). |
| `'formspree'`        | `formspree.endpoint`                   | Đã có sẵn form Formspree.                                                                      |
| `'telegram'`         | `telegram.botToken`, `telegram.chatId` | Muốn nhận thông báo tức thì qua Telegram.                                                      |

Ví dụ:

```js
export const inboxConfig = {
  transport: 'web3forms',
  web3forms: { accessKey: 'dán-key-của-bạn-ở-đây', subject: 'Tin nhắn mới từ website' },
  // …
}
```

### 7.3 Giải pháp miễn phí: Google Sheet làm nơi lưu trữ

1. Tạo một Google Sheet mới, đặt tên trang tính là **`Inbox`**.
2. Vào **Tiện ích mở rộng → Apps Script**, dán đoạn mã sau rồi lưu:

```js
const SHEET_NAME = 'Inbox'
const TOKEN = 'doi-chuoi-nay-thanh-bi-mat-cua-ban'

const HEADERS = [
  'id',
  'createdAt',
  'type',
  'status',
  'starred',
  'name',
  'email',
  'phone',
  'message',
  'note',
]

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.appendRow(HEADERS)
  }
  return sheet
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents)

  // Cập nhật trạng thái / ghi chú từ trang quản trị
  if (body.action === 'update') {
    if (body.token !== TOKEN) return json_({ ok: false })
    const sheet = sheet_()
    const rows = sheet.getDataRange().getValues()
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) !== String(body.id)) continue
      Object.entries(body.patch || {}).forEach(([key, value]) => {
        const col = HEADERS.indexOf(key)
        if (col >= 0) sheet.getRange(i + 1, col + 1).setValue(value)
      })
      break
    }
    return json_({ ok: true })
  }

  // Tin nhắn mới từ form liên hệ
  sheet_().appendRow([
    body.id || Utilities.getUuid(),
    body.createdAt || new Date().toISOString(),
    body.type || 'other',
    'new',
    false,
    body.name || '',
    body.email || '',
    body.phone || '',
    body.message || '',
    '',
  ])
  return json_({ ok: true })
}

function doGet(e) {
  if (e.parameter.token !== TOKEN) return json_({ ok: false, messages: [] })
  const rows = sheet_().getDataRange().getValues()
  const headers = rows.shift()
  const messages = rows
    .filter((row) => row[0])
    .map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])))
  return json_({ ok: true, messages })
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
```

3. **Triển khai → Tuỳ chỉnh triển khai mới → Ứng dụng web**: _Thực thi với tư cách_ = **Tôi**, _Ai có quyền truy cập_ = **Bất kỳ ai**. Lấy URL `/exec`.
4. Điền vào `src/data/inbox.js`:

```js
transport: 'custom',
custom: { endpoint: 'https://script.google.com/macros/s/AKfy…/exec' },
remote: { enabled: true, endpoint: 'https://script.google.com/macros/s/AKfy…/exec', token: 'doi-chuoi-nay-thanh-bi-mat-cua-ban' },
```

Như vậy tin nhắn vừa được lưu vào Sheet, vừa hiện trong trang quản trị của website và đổi trạng thái được ghi ngược lại Sheet.

### 7.4 Vài tuỳ chọn khác trong `src/data/inbox.js`

- `admin.passcode` — mật khẩu mở trang quản trị (để trống = mở tự do). Chỉ là lớp chắn nhẹ.
- `seedDemo` — `true` để nạp vài tin nhắn mẫu khi hộp thư còn trống (giúp xem trước giao diện). Trong trang quản trị có nút **Xoá tin nhắn mẫu**.
- `maxMessages` — số tin nhắn tối đa giữ trong localStorage (mặc định 500).
- `remote.readOnly` — bật nếu chỉ muốn xem dữ liệu từ Google Sheet mà không cho sửa.

## 8. Backend Express + MongoDB (`server/`)

Phần này là nơi lưu tin nhắn thật: mỗi tin khách gửi được ghi vào MongoDB Atlas, và trang quản trị đọc/sửa/xoá trực tiếp trên đó.

### 8.1 Cài đặt & chạy

```bash
npm install                          # ở thư mục gốc — npm workspaces cài luôn backend
cp server/.env.example server/.env   # rồi mở file điền mật khẩu MongoDB
npm run api                          # chạy API; hoặc npm run api:dev (tự reload khi sửa code)
```

Chạy song song hai terminal để vừa xem web vừa có API:

```bash
npm run dev     # web  → http://localhost:5173
npm run api     # API  → http://localhost:4000  (Vite tự proxy /api → cổng này)
```

`server/` là một **npm workspace**, nên dependency của nó (express, mongodb, cors) được cài chung ở `package.json` gốc — không cần `npm install` riêng trong `server/`.

`server/.env` tối thiểu cần:

```ini
MONGODB_URI=mongodb+srv://hackernovirus_db_user:<PASSWORD>@web-vn-docs.2yvpi2n.mongodb.net/?retryWrites=true&w=majority&appName=web-vn-docs
MONGODB_DB=vnfreedocs
ADMIN_TOKEN=chuoi-bi-mat-dai-it-nhat-32-ky-tu
CORS_ORIGINS=https://vnfreedocs.vn,http://localhost:5173
```

- `<PASSWORD>` là mật khẩu của user `hackernovirus_db_user` trên Atlas. Nếu mật khẩu chứa ký tự đặc biệt (`@ : / ? # [ ] %`) thì phải URL-encode.
- Quên `ADMIN_TOKEN` cũng không sao: server tự sinh một khoá và in ra console khi khởi động (nên đặt cố định trong `.env` cho gọn).
- Vào **Atlas → Network Access** thêm IP của máy chủ chạy backend (khi deploy lên Render/Fly/Railway thường cần `0.0.0.0/0` hoặc IP tĩnh của dịch vụ).
- **Muốn thử mà không cần Atlas:** chạy `npm run api:memory` — backend dùng MongoDB in-memory và in sẵn địa chỉ API + token. Tắt là mất dữ liệu, chỉ dùng để thử.

### 8.2 Nối frontend với backend

Chạy `npm run dev` ở thư mục gốc, mở `/#/hop-thu` → bấm **Cấu hình backend** → dán địa chỉ API (`http://localhost:4000` khi chạy máy) và `ADMIN_TOKEN` → **Kiểm tra kết nối** → **Lưu & tải tin nhắn**. Cấu hình được lưu trong trình duyệt nên không phải build lại.

Muốn đặt sẵn cho mọi người dùng, chọn một trong hai cách:

```js
// src/data/inbox.js
api: { baseUrl: 'https://api.vnfreedocs.vn' },
```

hoặc tạo file `.env.local` ở thư mục gốc:

```ini
VITE_API_BASE_URL=https://api.vnfreedocs.vn
```

### 8.3 API

| Method   | Đường dẫn             | Quyền           | Việc                                  |
| -------- | --------------------- | --------------- | ------------------------------------- |
| `GET`    | `/api/health`         | công khai       | Kiểm tra server + kết nối database    |
| `POST`   | `/api/messages`       | công khai       | Khách gửi tin nhắn/góp ý              |
| `GET`    | `/api/messages`       | `x-admin-token` | Danh sách (lọc, tìm kiếm, phân trang) |
| `GET`    | `/api/messages/stats` | `x-admin-token` | Số liệu tổng quan                     |
| `GET`    | `/api/messages/:id`   | `x-admin-token` | Chi tiết một tin nhắn                 |
| `PATCH`  | `/api/messages/:id`   | `x-admin-token` | Đổi trạng thái / ghim sao / ghi chú   |
| `DELETE` | `/api/messages/:id`   | `x-admin-token` | Xoá tin nhắn                          |

```bash
# Gửi thử một tin
curl -X POST http://localhost:4000/api/messages \
  -H 'Content-Type: application/json' \
  -d '{"name":"Nguyễn Văn A","email":"a@congty.vn","message":"Cần tư vấn lưu trữ nội bộ cho 15 máy."}'

# Đọc danh sách (cần khoá quản trị)
curl http://localhost:4000/api/messages -H "x-admin-token: $ADMIN_TOKEN"
```

### 8.4 Bảo mật & chống spam (đã có sẵn)

- `x-admin-token` bắt buộc cho mọi thao tác đọc/sửa/xoá, so sánh bằng `timingSafeEqual`.
- Giới hạn tần suất gửi tin theo IP (`PUBLIC_RATE_LIMIT_MAX`, mặc định 8 tin / 10 phút) + honeypot `botcheck`.
- `express.json({ limit: '32kb' })`, whitelist field, kiểm tra độ dài và định dạng email.
- Header bảo vệ cơ bản (`nosniff`, `X-Frame-Options: DENY`, `no-store`…), CORS theo `CORS_ORIGINS`.
- `Cache-Control: no-store` cho mọi phản hồi API.

> Lưu ý: khoá quản trị nằm trong trình duyệt của bạn (localStorage) nên chỉ an toàn ở mức “khoá cửa”. Muốn chắc hơn, hãy đặt backend sau Cloudflare Access hoặc chỉ cho phép IP của bạn gọi các API quản trị.

### 8.5 Deploy backend

Backend là một tiến trình Node bình thường, chạy được trên Render, Railway, Fly.io, VPS…

```bash
# ví dụ trên VPS
cd server && npm install --omit=dev
PORT=4000 ADMIN_TOKEN=... MONGODB_URI=... node src/index.js
```

Nhớ: đặt `CORS_ORIGINS=https://vnfreedocs.vn` thay vì `*`, và nên chạy sau Nginx/Caddy để có HTTPS.

### 8.6 Test

```bash
cd server && npm test
```

Bộ test dùng MongoDB in-memory thật và kiểm tra đủ luồng: tạo tin, validate, honeypot, hạn mức gửi, khoá quản trị, CORS, tìm kiếm, đổi trạng thái, thống kê, xoá, lỗi 404/400.

## 9. Deploy

### Vercel — một project chạy cả web lẫn backend

Repo đã cấu hình sẵn để Vercel deploy **web tĩnh + API Express** trong cùng một project:

- `vercel.json` khai báo framework Vite, output `dist/`, và rewrite mọi request `/api/*` về serverless function **[`api/index.js`](api/index.js)** — file này bọc Express app trong `server/src`.
- Nhờ vậy web gọi API ngay trên domain của chính nó: **không cần CORS, không cần nhập địa chỉ backend** (trang quản trị tự nhận ra chỉ cần khoá `ADMIN_TOKEN`).
- `server/` là npm workspace nên Vercel cài dependency từ `package.json` gốc, không cần cấu hình Root Directory.

Các bước:

1. Đẩy code lên GitHub → trên Vercel bấm **Add New → Project** → chọn repo (để nguyên Root Directory).
2. Vercel tự đọc `vercel.json`. Kiểm tra lại: Framework **Vite**, Build `npm run build`, Output `dist`.
3. Vào **Settings → Environment Variables**, thêm cho cả Production / Preview / Development:

| Tên            | Giá trị                                                |
| -------------- | ------------------------------------------------------ |
| `MONGODB_URI`  | chuỗi kết nối Atlas (đã thay `<PASSWORD>`)             |
| `MONGODB_DB`   | `vnfreedocs`                                           |
| `ADMIN_TOKEN`  | chuỗi bí mật ≥ 32 ký tự (`openssl rand -hex 32`)       |
| `CORS_ORIGINS` | `*` (hoặc domain chính, ví dụ `https://vnfreedocs.vn`) |

4. Bấm **Deploy**, sau đó mở `https://<domain>/api/health` — phải thấy JSON có `"db":"connected"`.
5. Vào **Atlas → Network Access** thêm `0.0.0.0/0` (Vercel dùng IP động và thay đổi liên tục).
6. Mở `https://<domain>/#/hop-thu` → **Cấu hình backend**: giữ bật **Gọi API cùng tên miền với website**, dán `ADMIN_TOKEN` → **Kiểm tra kết nối** → **Lưu & tải tin nhắn**.

Từ giờ mỗi lần push lên GitHub, Vercel tự build và deploy lại **cả web lẫn API**.

Ghi chú:

- Đổi `ADMIN_TOKEN` trên Vercel thì phải nhập lại khoá mới trong trang quản trị.
- Muốn API nhanh hơn cho người Việt: **Settings → Functions → Region → Singapore (sin1)**.
- Không muốn dùng backend nữa? Xoá `vercel.json` là web vẫn deploy bình thường; khi đó tin nhắn tự lưu ở trình duyệt và bạn có thể chuyển `transport` sang Google Sheet/Web3Forms (mục 7).
- Deploy bằng CLI nếu thích:

  ```bash
  npm i -g vercel
  vercel          # tạo bản preview
  vercel --prod   # đẩy lên production
  ```

### Thêm IP Access cho MongoDB Atlas (sau khi deploy)

Atlas mặc định **chặn mọi IP không nằm trong danh sách cho phép**, nên backend vừa deploy xong thường gặp lỗi:

```
Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

Điểm cần biết trước: serverless function của Vercel **dùng IP ra (egress) động**, đổi theo từng lần chạy — không có dải IP cố định để bạn thêm vào Atlas. Vì vậy có hai hướng:

**Cách 1 — Cho phép mọi IP (cách chuẩn cho serverless, làm 30 giây)**

1. Đăng nhập [cloud.mongodb.com](https://cloud.mongodb.com) → chọn project chứa cluster `web-vn-docs`.
2. Menu trái: **Security → Network Access** (một số giao diện hiển thị là **Project → Network Access**).
3. Chọn tab **IP Access List** → bấm **+ Add IP Address**.
4. Bấm **Allow Access from Anywhere** — Atlas tự điền `0.0.0.0/0` (và `::/0` cho IPv6). Ô mô tả ghi ví dụ `Vercel serverless (dynamic IP)`.
5. Bấm **Confirm**. Trạng thái chuyển từ _Pending_ sang _Active_, thường dưới 1 phút.
6. Quay lại `https://<domain>/api/health` — phải thấy `"db":"connected"`. Không cần deploy lại; hàm sẽ tự thử kết nối ở request tiếp theo (nếu vẫn lỗi thì redeploy cho chắc).

> `0.0.0.0/0` **không** có nghĩa là ai cũng đọc được dữ liệu: vẫn phải có đúng tên user + mật khẩu, và API quản trị vẫn yêu cầu `ADMIN_TOKEN`. Để chắc hơn, xem mục _Bù trừ rủi ro_ bên dưới.

**Cách 2 — Chỉ cho phép IP cố định (khi cần siết chặt)**

| Hướng                    | Cách làm                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| IP tĩnh của Vercel       | Vercel có gói **Static IPs / Secure Compute** (thường thuộc gói trả phí) cấp IP ra cố định — thêm đúng các IP đó vào Atlas.                           |
| Proxy trung gian         | Cho function gọi qua một proxy có IP cố định (QuotaGuard Static, Cloudflare Worker + Tunnel…) rồi whitelist IP của proxy.                             |
| Tách backend khỏi Vercel | Chạy API trên VPS/Render/Fly có IP tĩnh, whitelist IP đó, rồi đặt `VITE_API_BASE_URL` (hoặc nhập địa chỉ API trong trang quản trị) trỏ về backend đó. |

**Bù trừ rủi ro khi để `0.0.0.0/0`**

- Dùng mật khẩu dài, riêng biệt cho user `hackernovirus_db_user`; không tái sử dụng ở nơi khác.
- Tạo user Atlas riêng chỉ có quyền `readWrite` trên database `vnfreedocs` (đừng dùng `atlasAdmin`).
- Bật **Atlas → Alerts** để nhận cảnh báo bất thường, và bật xoay vòng mật khẩu định kỳ.
- Vercel đã có sẵn lớp chặn spam (`PUBLIC_RATE_LIMIT_MAX`, honeypot) và khoá `ADMIN_TOKEN` cho các API đọc/sửa/xoá.

**Kiểm tra & xử lý sự cố**

- Xem log function: Vercel → **Deployments → (bản mới nhất) → Functions → api/index.js**, hoặc `vercel logs <domain>`. Tìm các dòng bắt đầu bằng `[db]` hoặc `[api] Không kết nối được database:` — đó là lý do thật.
- Mở `https://<domain>/api/health` khi đang lỗi: JSON trả về có `"db":"unavailable"` kèm `"reason"` (thông báo gốc của driver MongoDB), đủ để biết là do IP hay do sai mật khẩu.
- Kiểm tra IP mạng của bạn đã được phép chưa bằng chính `mongosh` (nó sẽ hỏi mật khẩu):

  ```bash
  mongosh "mongodb+srv://web-vn-docs.2yvpi2n.mongodb.net/" --apiVersion 1 --username hackernovirus_db_user
  ```

  Kết nối được từ máy bạn nhưng API trên Vercel thì không → gần như chắc chắn là IP Access List.

- Lưu ý: dịch vụ Atlas **không** quản lý danh sách IP qua `mongosh` — phải làm trong giao diện web, Atlas CLI hoặc Admin API:

  ```bash
  curl -X POST "https://cloud.mongodb.com/api/atlas/v1.0/groups/<GROUP_ID>/accessList" \
    -u "<PUBLIC_KEY>:<PRIVATE_KEY>" \
    -H 'Content-Type: application/json' \
    -d '[{"ipAddress":"0.0.0.0/0","comment":"Vercel serverless"}]'
  ```

  (Atlas CLI thì dùng nhóm lệnh `atlas accessLists`; chạy `atlas accessLists create --help` để xem cú pháp theo phiên bản CLI của bạn.)

- Nếu `/api/health` trả `503` kèm `"db":"unavailable"` và trong log là lỗi xác thực (`bad auth`) thì không phải IP mà là sai mật khẩu trong `MONGODB_URI` — nhớ URL-encode các ký tự `@ : / ? # [ ] %`.

### Netlify

1. "Add new site → Import an existing project", chọn repo.
2. Build command `npm run build`, Publish directory `dist`.
3. Hoặc tạo file `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

### GitHub Pages

1. Nếu trang nằm ở `https://<user>.github.io/<repo>/`, mở `vite.config.js` và đổi `base: '/'` thành `base: '/<repo>/'`.
2. Build tĩnh: `npm run build`.
3. Đưa thư mục `dist` lên nhánh `gh-pages` (dùng `gh-pages`, GitHub Actions, hoặc `git subtree push --prefix dist origin gh-pages`).
4. Vào **Settings → Pages** chọn nhánh `gh-pages` và thư mục `/root`.

> Trang chỉ có một file HTML duy nhất và điều hướng bằng anchor (`#cong-cu`, `#giai-phap`, `#quy-trinh`, `#lien-he`) cùng hash `#/hop-thu` cho trang quản trị, nên không cần cấu hình rewrite cho SPA.

## 10. Ghi chú kỹ thuật

- `vite-plugin-vuetify` được bật `autoImport` để chỉ bundle component/stylesheet thực sự dùng (tree-shaking).
- Điều hướng mượt bằng `scroll-behavior: smooth` + `scroll-margin-top` cho vùng anchor.
- App bar dùng `backdrop-filter` để tạo hiệu ứng kính mờ.
- Icon dùng `@mdi/font`, font dùng `@fontsource/be-vietnam-pro` (không phụ thuộc Google Fonts/CDN).
- Form liên hệ kiểm tra dữ liệu (họ tên, email, nội dung), lưu tin nhắn vào hộp thư rồi mới gửi tới kênh thông báo; snackbar báo rõ tin đã gửi đi hay chỉ được lưu lại.
- Trang quản trị hộp thư dùng định tuyến hash (`#/hop-thu`, `#/hop-thu/<id>`) nên không cần vue-router và vẫn deploy tĩnh được.
- Backend `server/` viết bằng Express 5 + MongoDB driver chính thức, không dùng ODM; kết nối có retry và tự tạo index khi khởi động.
- Frontend và backend chỉ nói chuyện qua JSON API, nên có thể deploy tách riêng (ví dụ web trên Vercel, API trên Render).
- Trên Vercel, `api/index.js` chạy như serverless function: kết nối MongoDB được giữ ở phạm vi module để tái sử dụng giữa các lần gọi (tránh mở connection mới cho mỗi request).
- `npm run api:test` chạy 21 test, bao gồm test riêng cho entrypoint `api/index.js` mà Vercel sử dụng.
- ESLint 9 (flat config) + Prettier đã cấu hình sẵn trong `eslint.config.js` và `.prettierrc.json`.

## 11. Giấy phép

Code trong dự án này có thể dùng tự do cho mục đích cá nhân. Nội dung văn bản mẫu trong `src/data` là ví dụ, hãy thay bằng nội dung thật của bạn.
