/**
 * JWT 토큰 저장소.
 *
 * accessToken → 자바스크립트 메모리(변수)에 저장
 *   - localStorage보다 XSS 공격에 강함 (DOM에서 접근 불가)
 *   - 대신 새로고침하면 사라지므로, refreshToken으로 재발급 받아야 함
 *
 * refreshToken → 쿠키(Secure + SameSite=Strict)에 저장
 *   - SameSite=Strict로 CSRF 공격 방어
 *   - 7일 후 만료 (서버 설정과 맞춤)
 *
 * onAuthChange 콜백:
 *   setTokens / clearTokens 호출 시 AuthContext에 상태 변화를 알려서
 *   인터셉터에서 발생한 토큰 변경이 React UI에 즉시 반영되게 한다.
 */
import Cookies from "js-cookie";

const REFRESH_TOKEN_KEY = "refreshToken";

let accessTokenInMemory: string | null = null;

export const tokenStorage = {
  /** AuthContext가 등록하는 콜백. 토큰 상태 변경 시 React 상태를 동기화한다. */
  onAuthChange: null as ((authenticated: boolean) => void) | null,

  getAccessToken: (): string | null => {
    return accessTokenInMemory;
  },

  getRefreshToken: (): string | null => {
    return Cookies.get(REFRESH_TOKEN_KEY) ?? null;
  },

  /** 로그인 성공 또는 토큰 갱신 성공 시 호출 */
  setTokens: (accessToken: string, refreshToken: string): void => {
    accessTokenInMemory = accessToken;
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      sameSite: "strict",
      expires: 7,
    });
    tokenStorage.onAuthChange?.(true);
  },

  /** 로그아웃 또는 토큰 갱신 실패 시 호출 */
  clearTokens: (): void => {
    accessTokenInMemory = null;
    Cookies.remove(REFRESH_TOKEN_KEY);
    tokenStorage.onAuthChange?.(false);
  },

  /** 로그인 여부 확인 (refreshToken 쿠키가 존재하면 로그인 상태) */
  hasTokens: (): boolean => {
    return !!Cookies.get(REFRESH_TOKEN_KEY);
  },
};
