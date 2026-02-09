/**
 * styled-components 테마 정의.
 *
 * Pencil 디자인 시스템의 변수를 light/dark 테마 객체로 매핑한다.
 * 모든 색상, 폰트, 브레이크포인트 등 디자인 토큰이 이 파일에 집중되어 있어
 * 컴포넌트에서는 theme 객체만 참조하면 된다.
 */

export interface AppTheme {
  colors: {
    accentPrimary: string;
    accentHover: string;
    accentSubtle: string;
    bgPrimary: string;
    bgSurface: string;
    bgInput: string;
    bgMuted: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;
    textOnAccent: string;
    borderPrimary: string;
    borderDivider: string;
    destructive: string;
    error: string;
    categoryNotice: string;
    categoryFree: string;
    categoryQna: string;
    categoryEtc: string;
  };
  fonts: {
    primary: string;
    mono: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    laptop: string;
    desktop: string;
  };
}

export const lightTheme: AppTheme = {
  colors: {
    accentPrimary: '#0D6E6E',
    accentHover: '#0A5555',
    accentSubtle: '#E8F5F5',
    bgPrimary: '#FAFAFA',
    bgSurface: '#FFFFFF',
    bgInput: '#FFFFFF',
    bgMuted: '#F5F5F5',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#888888',
    textMuted: '#AAAAAA',
    textOnAccent: '#FFFFFF',
    borderPrimary: '#E5E5E5',
    borderDivider: '#F0F0F0',
    destructive: '#DC3545',
    error: '#DC3545',
    categoryNotice: '#0D6E6E',
    categoryFree: '#3B82F6',
    categoryQna: '#E07B54',
    categoryEtc: '#888888',
  },
  fonts: {
    primary: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1440px',
  },
};

export const darkTheme: AppTheme = {
  colors: {
    accentPrimary: '#14A3A3',
    accentHover: '#17BABA',
    accentSubtle: '#0D2E2E',
    bgPrimary: '#121212',
    bgSurface: '#1E1E1E',
    bgInput: '#252525',
    bgMuted: '#2A2A2A',
    textPrimary: '#E8E8E8',
    textSecondary: '#A0A0A0',
    textTertiary: '#707070',
    textMuted: '#555555',
    textOnAccent: '#FFFFFF',
    borderPrimary: '#333333',
    borderDivider: '#2A2A2A',
    destructive: '#F06070',
    error: '#F06070',
    categoryNotice: '#14A3A3',
    categoryFree: '#60A5FA',
    categoryQna: '#F09070',
    categoryEtc: '#707070',
  },
  fonts: {
    primary: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1440px',
  },
};
