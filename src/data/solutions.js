/**
 * Giải pháp công nghệ cho doanh nghiệp.
 * Thêm một giải pháp mới: copy một object bên dưới và sửa lại.
 *  - points: danh sách lợi ích (3-4 gạch đầu dòng)
 *  - ctaTarget: id của section cần cuộn tới khi bấm "Tư vấn ngay"
 */
export const solutions = [
  {
    id: 'ai-local',
    icon: 'mdi-brain',
    accent: 'blue',
    ctaTarget: '#lien-he',
    vi: {
      title: 'Giải pháp AI chạy local',
      description:
        'Đưa mô hình AI về chạy ngay trên máy chủ của bạn: dữ liệu nội bộ không rời khỏi công ty, không phụ thuộc vào dịch vụ cloud nước ngoài.',
      points: [
        'Dữ liệu khách hàng, hợp đồng không gửi lên cloud',
        'Không phí API theo lượt, không giới hạn truy vấn',
        'Tùy chỉnh theo tài liệu và quy trình riêng',
        'Vẫn dùng được khi mất kết nối internet',
      ],
    },
    en: {
      title: 'On-premise AI solutions',
      description:
        'Run AI models on your own server: internal data never leaves the company and you do not depend on foreign cloud services.',
      points: [
        'Customer and contract data never leaves your network',
        'No per-request API fees, no query limits',
        'Fine-tuned on your own documents and workflows',
        'Keeps working even without internet access',
      ],
    },
  },
  {
    id: 'luu-tru-noi-bo',
    icon: 'mdi-server-outline',
    accent: 'cyan',
    ctaTarget: '#lien-he',
    vi: {
      title: 'Lưu trữ & chia sẻ dữ liệu nội bộ',
      description:
        'NAS, sao lưu tự động và chia sẻ file an toàn cho doanh nghiệp nhỏ — thay thế ổ cứng rời và các dịch vụ lưu trữ tốn phí hàng tháng.',
      points: [
        'Thiết kế hệ thống NAS theo quy mô và ngân sách',
        'Sao lưu tự động theo nguyên tắc 3-2-1',
        'Phân quyền truy cập theo phòng ban',
        'Truy cập từ xa an toàn qua VPN',
      ],
    },
    en: {
      title: 'Internal storage & file sharing',
      description:
        'NAS, automated backup and safe file sharing for small businesses — replacing external drives and pricey monthly cloud plans.',
      points: [
        'NAS architecture sized to your budget',
        'Automated 3-2-1 backup strategy',
        'Access permissions by department',
        'Secure remote access over VPN',
      ],
    },
  },
  {
    id: 'phan-mem-theo-yeu-cau',
    icon: 'mdi-code-tags',
    accent: 'violet',
    ctaTarget: '#lien-he',
    vi: {
      title: 'Thiết kế & phát triển phần mềm theo yêu cầu',
      description:
        'Từ công cụ nội bộ nhỏ đến web app hoàn chỉnh — làm đúng nhu cầu, không thêm tính năng cho có.',
      points: [
        'Khảo sát quy trình thật trước khi viết code',
        'Web app, tool desktop hoặc API tích hợp',
        'Bàn giao kèm tài liệu và hướng dẫn sử dụng',
        'Bảo hành và chỉnh sửa sau bàn giao',
      ],
    },
    en: {
      title: 'Custom software design & development',
      description:
        'From a small internal tool to a complete web app — built for the actual need, with no filler features.',
      points: [
        'Real workflow discovery before any code',
        'Web apps, desktop tools or integration APIs',
        'Handover with documentation and training',
        'Warranty and adjustments after delivery',
      ],
    },
  },
  {
    id: 'tu-dong-hoa',
    icon: 'mdi-cog-sync-outline',
    accent: 'emerald',
    ctaTarget: '#lien-he',
    vi: {
      title: 'Tự động hoá quy trình',
      description:
        'Thay những thao tác lặp lại mỗi ngày bằng luồng tự động: tổng hợp báo cáo, nhập liệu, gửi thông báo.',
      points: [
        'Tự động tổng hợp báo cáo định kỳ',
        'Đồng bộ dữ liệu giữa các phần mềm đang dùng',
        'Thông báo qua Zalo, Telegram hoặc Email',
        'Giảm sai sót do nhập tay',
      ],
    },
    en: {
      title: 'Workflow automation',
      description:
        'Replace daily repetitive tasks with automated flows: report generation, data entry and notifications.',
      points: [
        'Scheduled report generation',
        'Data sync between the tools you already use',
        'Notifications via Zalo, Telegram or email',
        'Fewer manual data-entry mistakes',
      ],
    },
  },
  {
    id: 'tich-hop-ai',
    icon: 'mdi-transit-connection-variant',
    accent: 'amber',
    ctaTarget: '#lien-he',
    vi: {
      title: 'Tích hợp AI vào hệ thống hiện có',
      description:
        'Thêm khả năng AI vào phần mềm bạn đang dùng mà không cần thay thế toàn bộ hệ thống.',
      points: [
        'Chatbot trả lời dựa trên dữ liệu riêng',
        'Tìm kiếm thông minh trong kho tài liệu',
        'Tóm tắt và phân loại văn bản tự động',
        'Kết nối qua API, giữ nguyên hệ thống cũ',
      ],
    },
    en: {
      title: 'AI integration into existing systems',
      description: 'Add AI capability to the software you already run without replacing the whole system.',
      points: [
        'Chatbot answering from your own data',
        'Smart search across your document library',
        'Automatic summarising and classification',
        'API-based integration, legacy systems untouched',
      ],
    },
  },
]
