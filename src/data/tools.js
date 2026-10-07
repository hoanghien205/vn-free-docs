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
      description: 'Cash book, receivables/payables and P&L reports with formulas ready to fill in.',
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
    link: '#',
    vi: {
      name: 'Phần mềm soạn thảo văn bản',
      description: 'Đơn giản và dễ dàng soạn thảo một tài liệu bất kỳ',
    },
    en: {
      name: 'Official document editors',
      description: 'Easy and simple Letters, decisions, minutes and notices formatted to Vietnamese administrative standards.',
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
      description: 'Gộp, tách, đổi tên, chuyển đổi hàng loạt — chạy trực tiếp trên máy bạn, không upload lên mạng.',
    },
    en: {
      name: 'Excel & PDF utility',
      description: 'Merge, split, rename and batch convert files locally — nothing is uploaded to the cloud.',
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
      description: 'Giảm dung lượng ảnh giữ nguyên chất lượng, xử lý cả thư mục chỉ trong vài giây.',
    },
    en: {
      name: 'Batch image compressor',
      description: 'Shrink images while keeping quality, process a whole folder in seconds.',
    },
  }
]

/** Thứ tự & nhãn của bộ lọc danh mục (chữ hiển thị lấy từ i18n.js). */
export const toolCategories = ['all', 'excel', 'docs', 'other']
