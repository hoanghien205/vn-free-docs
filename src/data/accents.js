/** Bảng gradient dùng cho icon tile — khoá `accent` trong src/data/*.js trỏ tới đây. */
export const ACCENTS = {
  blue: 'linear-gradient(135deg, #2B5CFF 0%, #5B8CFF 100%)',
  cyan: 'linear-gradient(135deg, #0EA5E9 0%, #12C8C0 100%)',
  violet: 'linear-gradient(135deg, #7B5CFF 0%, #B18BFF 100%)',
  emerald: 'linear-gradient(135deg, #0F9D63 0%, #34D399 100%)',
  amber: 'linear-gradient(135deg, #E9A100 0%, #FBBF24 100%)',
  rose: 'linear-gradient(135deg, #E11D48 0%, #FB7185 100%)',
}

export const accentGradient = (key) => ACCENTS[key] ?? ACCENTS.blue
