/**
 * Thông tin nhận diện thương hiệu & chủ sở hữu.
 * Sửa ở đây là toàn bộ app bar, footer, hero, README đều đổi theo.
 */
export const site = {
  brand: {
    // Wordmark được tách để có thể tô gradient cho phần "Free".
    namePrefix: 'VN ',
    nameAccent: 'Free',
    nameSuffix: ' Docs',
    fullName: 'VN Free Docs',
    domain: 'vnfreedocs.vn',
    url: 'https://vnfreedocs.vn/',
    email: 'hello@vnfreedocs.vn',
  },
  owner: {
    // TODO: thay bằng tên thật của bạn
    name: 'Nguyễn Văn A',
    role: {
      vi: 'Lập trình viên AI & Blockchain/DeFi',
      en: 'AI & Blockchain/DeFi developer',
    },
  },
  // Thông tin dùng cho SEO / thẻ chia sẻ mạng xã hội
  seo: {
    title: {
      vi: 'VN Free Docs – Tài liệu & công cụ miễn phí cho người Việt',
      en: 'VN Free Docs – Free documents & tools for Vietnamese people',
    },
    description: {
      vi: 'VN Free Docs cung cấp tài liệu, mẫu Excel và công cụ miễn phí cho người Việt, cùng giải pháp AI local, lưu trữ và phần mềm cho doanh nghiệp.',
      en: 'VN Free Docs offers free Vietnamese documents, Excel templates and utilities, plus local AI, storage and custom software solutions for small businesses.',
    },
  },
}
