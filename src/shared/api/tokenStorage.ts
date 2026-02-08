/**
 * JWT 토큰 저장소
 *
 * 보안 전략:
 *  - accessToken: 자바스크립트 클로저(메모리) 변수에 저장
 *    → DOM에 노출되지 않아 XSS로 직접 탈취가 어려움
 *    → 새로고침 시 사라지므로 refreshToken으로 재발급 필요
 *  - refreshToken: js-cookie를 통해 Secure + SameSite=Strict 쿠키에 저장
 *    → CSRF 공격 방어
 *
 * 참고: 서버에서 HttpOnly 쿠키를 직접 설정할 수 없는 환경의 차선책이다.
 */
import Cookies from "js-cookie";

const REFRESH_TOKEN_KEY = "refreshToken";

// accessToken은 메모리에만 보관 (새로고침 시 null로 초기화됨)
let accessTokenInMemory: string | null = null;

// 현재 페이지가 HTTPS인지 확인 (쿠키 Secure 플래그 결정용)
const isSecureContext = window.location.protocol === "https:";

export const tokenStorage = {
  // 메모리에서 accessToken 반환
  getAccessToken: (): string | null => {
    return accessTokenInMemory;
  },

  // 쿠키에서 refreshToken 반환 (없으면 null)
  getRefreshToken: (): string | null => {
    return Cookies.get(REFRESH_TOKEN_KEY) ?? null;
  },

  // 로그인 또는 토큰 갱신 성공 시 두 토큰을 각각의 저장소에 저장
  setTokens: (accessToken: string, refreshToken: string): void => {
    accessTokenInMemory = accessToken;
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      secure: isSecureContext,
      sameSite: "strict",
      expires: 7, // 7일 유효 (서버의 refreshToken 만료 주기와 일치시킬 것)
    });
  },

  // 로그아웃 또는 토큰 갱신 실패 시 모든 토큰 제거
  clearTokens: (): void => {
    accessTokenInMemory = null;
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  // 로그인 상태 판별 (refreshToken 쿠키 존재 여부로 판단)
  hasTokens: (): boolean => {
    return !!Cookies.get(REFRESH_TOKEN_KEY);
  },
};
