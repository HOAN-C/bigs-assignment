/**
 * accessToken에서 사용자 정보를 추출하는 유틸리티.
 *
 * jwt-decode로 HS256 토큰의 payload를 디코딩한다.
 * 서명 검증은 서버에서 하므로, 여기서는 payload 읽기만 담당한다.
 */
import { jwtDecode } from "jwt-decode";
import type { TokenPayload, AuthUser } from "../types";

/** accessToken을 디코딩하여 사용자 정보를 반환한다. 실패 시 null. */
export function decodeAccessToken(accessToken: string): AuthUser | null {
  try {
    const payload = jwtDecode<TokenPayload>(accessToken);
    return {
      name: payload.name,
      username: payload.username,
    };
  } catch {
    return null;
  }
}
