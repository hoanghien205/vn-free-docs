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

## 3. Cấu trúc thư mục

```
src/
  assets/styles/main.css   # CSS toàn cục: hiệu ứng reveal, blob, glass, hover
  components/              # AppBar, HeroSection, FreeTools, Solutions, Process,
                           # ContactDonate, AppFooter, SectionTitle, ToolCard,
                           # ToolDetailDialog, SolutionCard, CopyField, ContactForm
  composables/             # useLocale, useCopy, useRevealOnScroll
  data/                    # ← TOÀN BỘ NỘI DUNG NẰM Ở ĐÂY
  plugins/vuetify.js       # cấu hình theme màu & mặc định component
  App.vue, main.js
public/                    # favicon, ảnh OG, ảnh QR mẫu
```

## 4. Sửa nội dung (không cần chạm vào component)

| Muốn đổi gì | Sửa file |
| --- | --- |
| Tên thương hiệu, tên chủ sở hữu, domain, SEO | `src/data/site.js` |
| Danh sách tài liệu/công cụ miễn phí | `src/data/tools.js` |
| Giải pháp cho doanh nghiệp | `src/data/solutions.js` |
| Quy trình làm việc 4 bước | `src/data/process.js` |
| Email, Zalo, Telegram, GitHub, Facebook | `src/data/contact.js` → `contactChannels` |
| Thông tin chuyển khoản & ví crypto | `src/data/contact.js` → `donate` |
| Mọi chuỗi chữ VI/EN trên giao diện | `src/data/i18n.js` |

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
  details: {                      // không bắt buộc — nội dung cho hộp thoại mô tả
    vi: {
      overview: 'Đoạn giới thiệu 2–3 câu về dự án…',
      highlights: ['Điểm nổi bật 1', 'Điểm nổi bật 2', '…'],
      format: 'Excel (.xlsx)',    // 4 ô thông tin nhanh, bỏ trống ô nào cũng được
      version: 'v1.0',
      updated: 'Tháng 9/2026',
      license: 'Miễn phí',
    },
    en: { overview: '…', highlights: ['…'], format: '…', version: '…', updated: '…', license: '…' },
  },
}
```

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
9. **Form liên hệ** — hiện chỉ là demo phía trình duyệt, tin nhắn **không được gửi đi**. Xem mục 7 bên dưới để nối với dịch vụ thật.
10. **`public/robots.txt`** — thay `https://example.com/sitemap.xml` bằng domain thật (và thêm `sitemap.xml` nếu cần).

## 7. Nối form liên hệ với dịch vụ thật

Mở `src/components/ContactForm.vue`, tìm hàm `submit()` và thay phần demo:

```js
// Demo hiện tại
await new Promise((resolve) => setTimeout(resolve, 700))
emit('submitted', { ...form })

// Ví dụ gọi API thật
const res = await fetch('https://formspree.io/f/xxxxxxx', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
})
if (res.ok) emit('submitted', { ...form })
```

Có thể dùng Formspree, Google Apps Script, Telegram Bot API hoặc API riêng của bạn.

## 8. Deploy

### Vercel

1. Đẩy code lên GitHub rồi "Import Project" trên Vercel.
2. Framework preset: **Vite** — Build command `npm run build`, Output directory `dist`.
3. Thêm domain trong **Settings → Domains**.

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

> Trang chỉ có một file HTML duy nhất và điều hướng bằng anchor (`#cong-cu`, `#giai-phap`, `#quy-trinh`, `#lien-he`) nên không cần cấu hình rewrite cho SPA.

## 9. Ghi chú kỹ thuật

- `vite-plugin-vuetify` được bật `autoImport` để chỉ bundle component/stylesheet thực sự dùng (tree-shaking).
- Điều hướng mượt bằng `scroll-behavior: smooth` + `scroll-margin-top` cho vùng anchor.
- App bar dùng `backdrop-filter` để tạo hiệu ứng kính mờ.
- Icon dùng `@mdi/font`, font dùng `@fontsource/be-vietnam-pro` (không phụ thuộc Google Fonts/CDN).
- Form có kiểm tra dữ liệu (họ tên, email, nội dung) và hiển thị snackbar sau khi gửi thành công.
- ESLint 9 (flat config) + Prettier đã cấu hình sẵn trong `eslint.config.js` và `.prettierrc.json`.

## 10. Giấy phép

Code trong dự án này có thể dùng tự do cho mục đích cá nhân. Nội dung văn bản mẫu trong `src/data` là ví dụ, hãy thay bằng nội dung thật của bạn.
