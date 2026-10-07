/**
 * Thông tin liên hệ & thông tin ủng hộ (donate).
 *
 * ⚠️ TẤT CẢ DỮ LIỆU DƯỚI ĐÂY LÀ MẪU — hãy thay bằng thông tin thật của bạn
 * trước khi deploy lên môi trường thật.
 */

export const contactChannels = [
  {
    id: 'email',
    icon: 'mdi-email-outline',
    accent: 'blue',
    // mailto được tạo tự động từ value
    value: 'hien.nguyenhoang97@gmail.com',
    href: 'mailto:hien.nguyenhoang97@gmail.com',
  },
  {
    id: 'zalo',
    icon: 'mdi-message-processing-outline',
    accent: 'cyan',
    value: '+84 985672953',
    href: 'https://zalo.me/0985672953',
  },
  {
    id: 'facebook',
    icon: 'mdi-facebook',
    accent: 'amber',
    value: 'facebook.com/your-page',
    href: 'https://facebook.com/your-page',
  },
]

/** Nhãn hiển thị cho từng kênh liên hệ (theo ngôn ngữ). */
export const contactLabels = {
  email: { vi: 'Email', en: 'Email' },
  zalo: { vi: 'Zalo', en: 'Zalo' },
  telegram: { vi: 'Telegram', en: 'Telegram' },
  github: { vi: 'GitHub', en: 'GitHub' },
  facebook: { vi: 'Facebook', en: 'Facebook' },
}

export const donate = {
  bank: {
    bankName: 'Ngân hàng TMCP Kỹ Thương (Techcombank)',
    accountNumber: '7769 9539 53',
    accountHolder: 'NGUYEN VAN A',
    branch: 'Chi nhánh Hà Nội',
    // TODO: thay bằng ảnh QR thật, ví dụ /images/qr-techcombank.png
    qr: '/images/qr-nhan.png',
  }
}
