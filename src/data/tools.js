/**
 * Danh sách tài liệu & công cụ miễn phí.
 *
 * Thêm một mục mới: copy một object bên dưới và sửa lại.
 *  - category: 'docs' | 'excel' | 'other'  (dùng cho bộ lọc)
 *  - tag: 'free' | 'openSource' | 'updated' (nhãn hiển thị, chữ nằm trong i18n.js)
 *  - status: 'available' | 'inProgress' | 'planned'
 *      available  → đã có, bấm là tải/mở được (chữ & màu nằm trong i18n.js + ToolCard.vue)
 *      inProgress → đang làm, hiện chưa tải được
 *      planned    → nằm trong kế hoạch, chưa bắt đầu
 *  - accent: 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' (màu icon)
 *  - logo: (không bắt buộc) đường dẫn ảnh glyph trắng trong /public, ví dụ
 *      /images/logo-sheet-white.png (bản gốc nhiều màu nằm cạnh, không dùng ở thẻ).
 *      Có logo thì thẻ công cụ hiển thị ảnh này thay cho icon MDI ở trên;
 *      ảnh nằm giữa ô gradient màu của thẻ nên cần nền trong suốt.
 *  - link: TODO thay bằng link thật (Google Drive, GitHub, trang tải…)
 *  - gallery: (không bắt buộc) ảnh chụp màn hình thật của công cụ, mỗi mục gồm:
 *      src → đường dẫn ảnh trong /public
 *      caption → { vi, en } chú thích ngắn hiển thị dưới ảnh
 *      span: 'full' → ảnh chiếm trọn một hàng trong thư viện ảnh
 *  - details: (không bắt buộc) nội dung dài cho hộp thoại mô tả dự án, gồm:
 *      overview   → đoạn giới thiệu 2–3 câu
 *      highlights → 4 gạch đầu dòng nêu điểm nổi bật
 *      features   → [{ icon, title, text }] thẻ tính năng chi tiết (2–3 cột)
 *      formats    → { note, items: [{ icon, label, text }], importNote } định dạng xuất/nhập
 *      shortcuts  → [{ keys, action }] bảng phím tắt thường dùng
 *      note       → ghi chú thêm (nền tảng, lưu ý khi cài đặt…)
 *      format / version / updated / license → thông tin nhanh (bỏ trống ô nào cũng được)
 *    Hộp thoại mở ra khi người dùng bấm nút “Tải / mở công cụ” trên thẻ.
 */
export const tools = [
  {
    id: 'excel-ke-toan',
    icon: 'mdi-microsoft-excel',
    logo: '/images/logo-sheet-white.png',
    category: 'excel',
    tag: 'free',
    status: 'available',
    accent: 'emerald',
    link: '#',
    vi: {
      name: 'Phần mềm bảng tính kế toán',
      description: 'Sổ thu chi, công nợ, báo cáo lãi lỗ — công thức có sẵn, chỉ cần nhập số liệu.',
    },
    en: {
      name: 'Vietnam Sheets software',
      description:
        'Cash book, receivables/payables and P&L reports with formulas ready to fill in.',
    },
    details: {
      vi: {
        overview:
          'Bộ bảng tính Excel chạy hoàn toàn trên máy bạn: sổ thu chi, công nợ khách hàng và nhà cung cấp, báo cáo lãi lỗ theo tháng/quý. Công thức, danh mục và định dạng đã dựng sẵn nên bạn chỉ cần nhập số liệu.',
        highlights: [
          'Sổ thu chi, công nợ và báo cáo lãi lỗ liên kết tự động',
          'Danh mục tài khoản & đối tượng theo dõi có sẵn',
          'Xem báo cáo tháng, quý, năm bằng một cú nhấp',
          'Chạy offline, không cần cài thêm phần mềm',
        ],
        format: 'Excel (.xlsx)',
        version: 'v1.2',
        updated: 'Tháng 9/2026',
        license: 'Miễn phí, dùng được cho doanh nghiệp',
      },
      en: {
        overview:
          'An Excel workbook that runs entirely on your machine: cash book, customer and supplier balances, monthly and quarterly P&L. Formulas, categories and formatting are pre-built, so you only type in the numbers.',
        highlights: [
          'Cash book, receivables/payables and P&L linked automatically',
          'Chart of accounts and contact lists included',
          'Monthly, quarterly and yearly reports in one click',
          'Works offline, no extra software needed',
        ],
        format: 'Excel (.xlsx)',
        version: 'v1.2',
        updated: 'September 2026',
        license: 'Free, business use allowed',
      },
    },
  },
  {
    id: 'van-ban-hanh-chinh',
    icon: 'mdi-file-document-outline',
    logo: '/images/docs-logo-white.png',
    category: 'docs',
    tag: 'free',
    status: 'available',
    accent: 'blue',
    link: 'https://www.vnfreedocs.xyz/',
    // Ảnh chụp màn hình thật của ứng dụng (bộ tư liệu quảng bá) — hiển thị ở mục “Giao diện thực tế”.
    gallery: [
      {
        src: '/images/soan-thao/01-tong-quan.jpg',
        span: 'full',
        caption: {
          vi: 'Trang A4 thật, thanh công cụ đầy đủ, số từ và số trang.',
          en: 'A true A4 page, the full toolbar, word and page counts.',
        },
      },
      {
        src: '/images/soan-thao/03-menu-lenh-slash.jpg',
        caption: {
          vi: 'Gõ “/” ở dòng trống để chèn bảng, hình ảnh, danh sách…',
          en: 'Type “/” on an empty line to insert tables, images, lists…',
        },
      },
      {
        src: '/images/soan-thao/04-bang-bieu.jpg',
        caption: {
          vi: 'Bảng biểu chỉnh trực tiếp: thêm/xoá hàng cột, gộp ô, tô nền.',
          en: 'Tables edited in place: add or remove rows and columns, merge cells, fill colour.',
        },
      },
      {
        src: '/images/soan-thao/07-thiet-lap-trang.jpg',
        caption: {
          vi: 'Khổ giấy, lề, đầu trang – chân trang và xem trước bản in.',
          en: 'Paper size, margins, header and footer with a live page preview.',
        },
      },
      {
        src: '/images/soan-thao/08-xuat-tai-lieu.jpg',
        caption: {
          vi: 'Xuất tài liệu: Word, PDF, HTML, JSON hoặc văn bản thuần.',
          en: 'Export to Word, PDF, HTML, JSON or plain text.',
        },
      },
      {
        src: '/images/soan-thao/12-che-do-toi.jpg',
        caption: {
          vi: 'Chế độ tối dịu mắt, trang giấy vẫn trắng như bản in.',
          en: 'Dark mode for the interface, pages stay print-white.',
        },
      },
    ],
    vi: {
      name: 'Phần mềm soạn thảo văn bản',
      description:
        'Trình soạn thảo miễn phí cho người Việt: gõ tiếng Việt mượt, in chuẩn A4, xuất Word/PDF, dữ liệu lưu ngay trên máy.',
    },
    en: {
      name: 'Free document editor',
      description:
        'A free Vietnamese-first word processor: smooth typing, true A4 layout, Word/PDF export, files kept on your own machine.',
    },
    details: {
      vi: {
        overview:
          'VN Free Docs là trình soạn thảo văn bản miễn phí, chạy trên Windows, macOS và Linux. Mở lên là viết được ngay: trang A4 đúng như bản in, xuất Word/PDF, dữ liệu lưu ngay trên máy và không cần tài khoản.',
        highlights: [
          'Windows · macOS · Linux — dữ liệu lưu ngay trên máy bạn',
          'Định dạng đầy đủ: tiêu đề, danh sách, bảng biểu, ảnh có chú thích',
          'Trang A4/Letter/Legal thật, in ra đúng như trên màn hình',
          'Gõ “/” để chèn nhanh nội dung, tự động lưu bản nháp',
        ],
        formats: {
          items: [
            {
              icon: 'mdi-microsoft-word',
              label: 'Word (.docx)',
              text: 'Gửi cơ quan, giữ đúng định dạng',
            },
            { icon: 'mdi-file-pdf-box', label: 'PDF (.pdf)', text: 'In và chốt bản cuối' },
            { icon: 'mdi-language-html5', label: 'HTML', text: 'Đưa lên website' },
            { icon: 'mdi-code-json', label: 'JSON', text: 'Sao lưu toàn bộ tài liệu' },
            {
              icon: 'mdi-file-outline',
              label: 'Văn bản thuần (.txt)',
              text: 'Dán vào form, email',
            },
          ],
          importNote: 'Nhập lại từ Word, HTML, JSON hoặc TXT.',
        },
        shortcuts: [
          { keys: '⌘/Ctrl + S', action: 'Lưu tài liệu' },
          { keys: '⌘/Ctrl + P', action: 'In tài liệu' },
          { keys: '⌘/Ctrl + F', action: 'Tìm và thay thế' },
          { keys: '⌘/Ctrl + B · I · U', action: 'Đậm · Nghiêng · Gạch chân' },
          { keys: '/', action: 'Chèn nhanh khối nội dung' },
          { keys: 'Tab · ⇧Tab', action: 'Thụt lề · Bỏ thụt lề' },
        ],
        platform: 'Windows · macOS · Linux',
        version: 'v1.0',
        updated: 'Tháng 10/2026',
        license: 'Miễn phí',
      },
      en: {
        overview:
          'VN Free Docs is a free word processor for Windows, macOS and Linux. Open it and start typing right away: A4 pages match the printout, documents export to Word or PDF, and your files stay on your own machine with no account needed.',
        highlights: [
          'Windows · macOS · Linux — files stay on your own machine',
          'Full formatting: headings, lists, tables, captioned images',
          'True A4/Letter/Legal pages that print exactly as shown',
          'Type “/” to insert content fast, drafts saved automatically',
        ],
        formats: {
          items: [
            {
              icon: 'mdi-microsoft-word',
              label: 'Word (.docx)',
              text: 'Send to agencies, layout intact',
            },
            {
              icon: 'mdi-file-pdf-box',
              label: 'PDF (.pdf)',
              text: 'Print and lock the final version',
            },
            { icon: 'mdi-language-html5', label: 'HTML', text: 'Publish on a website' },
            { icon: 'mdi-code-json', label: 'JSON', text: 'Back up the whole document' },
            {
              icon: 'mdi-file-outline',
              label: 'Plain text (.txt)',
              text: 'Paste into forms and email',
            },
          ],
          importNote: 'Import from Word, HTML, JSON or TXT.',
        },
        shortcuts: [
          { keys: '⌘/Ctrl + S', action: 'Save document' },
          { keys: '⌘/Ctrl + P', action: 'Print' },
          { keys: '⌘/Ctrl + F', action: 'Find and replace' },
          { keys: '⌘/Ctrl + B · I · U', action: 'Bold · Italic · Underline' },
          { keys: '/', action: 'Insert a content block' },
          { keys: 'Tab · ⇧Tab', action: 'Indent · Outdent' },
        ],
        platform: 'Windows · macOS · Linux',
        version: 'v1.0',
        updated: 'October 2026',
        license: 'Free',
      },
    },
  },
  {
    id: 'ho-so-nhan-su',
    icon: 'mdi-account-file-text-outline',
    category: 'docs',
    tag: 'free',
    status: 'inProgress',
    accent: 'violet',
    link: '#',
    vi: {
      name: 'Hợp đồng & hồ sơ nhân sự',
      description: 'Hợp đồng thử việc, hợp đồng lao động, quyết định lương và biểu mẫu onboarding.',
    },
    en: {
      name: 'HR contracts & records',
      description: 'Probation and labour contracts, salary decisions and onboarding forms.',
    },
    details: {
      vi: {
        overview:
          'Bộ biểu mẫu nhân sự dùng chung cho doanh nghiệp nhỏ: hợp đồng thử việc, hợp đồng lao động, quyết định lương, biên bản bàn giao và checklist nhận việc. Mỗi mẫu chỉ cần điền thông tin công ty và nhân sự một lần.',
        highlights: [
          'Hợp đồng thử việc và hợp đồng lao động',
          'Quyết định lương, phụ lục điều chỉnh',
          'Biên bản bàn giao, checklist nhận việc mới',
          'Ô điền sẵn theo thông tin doanh nghiệp',
        ],
        format: 'Word (.docx)',
        version: 'Đang hoàn thiện',
        updated: 'Dự kiến 2026',
      },
      en: {
        overview:
          'An HR form pack for small teams: probation and labour contracts, salary decisions, handover records and a new-hire checklist. Fill in your company details once and every template is ready.',
        highlights: [
          'Probation and labour contracts',
          'Salary decisions and contract addenda',
          'Handover records and new-hire checklist',
          'Fill-in fields for your company details',
        ],
        format: 'Word (.docx)',
        version: 'In progress',
        updated: 'Expected 2026',
      },
    },
  },
  {
    id: 'xu-ly-file',
    icon: 'mdi-file-cog-outline',
    category: 'other',
    tag: 'openSource',
    status: 'inProgress',
    accent: 'cyan',
    link: '#',
    vi: {
      name: 'Công cụ xử lý Excel & PDF',
      description:
        'Gộp, tách, đổi tên, chuyển đổi hàng loạt — chạy trực tiếp trên máy bạn, không upload lên mạng.',
    },
    en: {
      name: 'Excel & PDF utility',
      description:
        'Merge, split, rename and batch convert files locally — nothing is uploaded to the cloud.',
    },
    details: {
      vi: {
        overview:
          'Tiện ích chạy trực tiếp trên máy bạn: gộp nhiều file Excel/PDF thành một, tách theo trang hoặc theo sheet, đổi tên hàng loạt và chuyển đổi định dạng. Dữ liệu không rời khỏi máy nên phù hợp với hồ sơ nội bộ.',
        highlights: [
          'Gộp và tách Excel, PDF hàng loạt',
          'Đổi tên file theo quy tắc có sẵn',
          'Chạy offline, không upload dữ liệu lên mạng',
          'Xử lý cả thư mục nhiều file một lúc',
        ],
        format: 'Ứng dụng chạy trên máy (Windows · macOS)',
        version: 'Đang hoàn thiện',
        updated: 'Dự kiến 2026',
      },
      en: {
        overview:
          'A utility that runs on your own machine: merge many Excel/PDF files into one, split by page or by sheet, rename in bulk and convert formats. Nothing leaves your computer, which suits internal records.',
        highlights: [
          'Bulk merge and split for Excel and PDF',
          'Rule-based batch renaming',
          'Runs offline, no uploads',
          'Process a whole folder in one go',
        ],
        format: 'Desktop app (Windows · macOS)',
        version: 'In progress',
        updated: 'Expected 2026',
      },
    },
  },
  {
    id: 'nen-anh-hang-loat',
    icon: 'mdi-image-multiple-outline',
    category: 'other',
    tag: 'free',
    status: 'planned',
    accent: 'amber',
    link: '#',
    vi: {
      name: 'Nén & chuyển đổi ảnh hàng loạt',
      description:
        'Giảm dung lượng ảnh giữ nguyên chất lượng, xử lý cả thư mục chỉ trong vài giây.',
    },
    en: {
      name: 'Batch image compressor',
      description: 'Shrink images while keeping quality, process a whole folder in seconds.',
    },
    details: {
      vi: {
        overview:
          'Công cụ nén ảnh giữ nguyên độ nét: giảm dung lượng JPG, PNG và WEBP cho cả thư mục, có tuỳ chọn kích thước và chất lượng trước khi lưu. Ảnh xử lý ngay trên máy bạn, không đi qua máy chủ nào.',
        highlights: [
          'Nén JPG, PNG, WEBP giữ nguyên độ nét',
          'Tuỳ chọn kích thước và mức chất lượng',
          'Xử lý cả thư mục, giữ nguyên tên file',
          'Xem trước dung lượng trước khi lưu',
        ],
        format: 'Ứng dụng web',
        version: 'Trong kế hoạch',
        updated: 'Dự kiến 2026',
      },
      en: {
        overview:
          'A compressor that keeps images sharp while cutting file size: shrink JPG, PNG and WEBP across a whole folder, with size and quality options before saving. Everything is processed on your machine, never on a server.',
        highlights: [
          'Compress JPG, PNG, WEBP without visible loss',
          'Choose output size and quality level',
          'Whole-folder processing, filenames untouched',
          'Preview the new file size before saving',
        ],
        format: 'Web app',
        version: 'Planned',
        updated: 'Expected 2026',
      },
    },
  },
]

/** Thứ tự & nhãn của bộ lọc danh mục (chữ hiển thị lấy từ i18n.js). */
export const toolCategories = ['all', 'excel', 'docs', 'other']

/** Màu & icon của nhãn trạng thái — dùng chung cho thẻ công cụ và hộp thoại mô tả. */
export const TOOL_STATUS_META = {
  available: { color: 'success', icon: 'mdi-check-circle-outline' },
  inProgress: { color: 'warning', icon: 'mdi-progress-wrench' },
  planned: { color: 'info', icon: 'mdi-calendar-clock-outline' },
}

/** Màu & icon của nhãn phân loại (miễn phí / mã nguồn mở / vừa cập nhật). */
export const TOOL_TAG_META = {
  free: { color: 'primary', icon: 'mdi-gift-outline' },
  openSource: { color: 'accent', icon: 'mdi-source-branch' },
  updated: { color: 'secondary', icon: 'mdi-clock-fast' },
}

/** Link mẫu (`#` hoặc rỗng) thì chưa dẫn đi đâu được — dùng để hiện ghi chú demo. */
export const isDemoLink = (link) => !link || link === '#'
