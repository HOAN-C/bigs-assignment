/**
 * 공통 Axios 인스턴스 및 인터셉터 설정
 *
 * 역할:
 *  1. baseURL과 기본 헤더를 가진 axios 인스턴스(apiClient)를 생성한다.
 *  2. 요청 인터셉터: 매 요청마다 메모리에 보관 중인 accessToken을 Authorization 헤더에 주입한다.
 *  3. 응답 인터셉터: 401 응답 시 refreshToken으로 토큰 재발급을 시도하고,
 *     성공하면 원래 요청을 새 토큰으로 재시도한다.
 *     동시에 여러 요청이 401을 받을 경우, refresh는 한 번만 수행하고
 *     나머지 요청은 큐(failedQueue)에 보관했다가 새 토큰으로 일괄 재시도한다.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// refresh 요청이 현재 진행 중인지 여부 (중복 refresh 방지 플래그)
let isRefreshing = false;

// 401로 실패한 요청들을 담아두는 큐
// refresh 완료 후 새 토큰으로 resolve하거나, 실패 시 reject한다.
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// 큐에 쌓인 Promise들을 일괄 처리하는 헬퍼
// token이 있으면 성공(resolve), error가 있으면 실패(reject)
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// ── 요청 인터셉터 ──
// 매 요청 전 tokenStorage에서 accessToken을 꺼내 Bearer 헤더에 부착
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── 응답 인터셉터 ──
// 401 에러 시 토큰 갱신 → 원래 요청 재시도 로직
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean; // 재시도 여부를 표시하는 커스텀 플래그
    };

    // 401이 아니거나, 이미 재시도한 요청이면 그대로 에러 전파
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 다른 요청이 이미 refresh 중이면, 큐에 넣고 대기
    // refresh 완료 시 새 토큰을 받아 이 요청만 재시도
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    // 최초 401: refresh 시작
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      // refreshToken 자체가 없으면 로그아웃 처리 후 에러 전파
      tokenStorage.clearTokens();
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      // 별도 axios 인스턴스(기본 axios)로 refresh 요청
      // apiClient를 쓰면 인터셉터가 다시 타서 무한루프 위험
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
          },
        },
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // 새 토큰 저장 후, 큐에 대기 중인 요청들도 새 토큰으로 처리
      tokenStorage.setTokens(accessToken, newRefreshToken);
      processQueue(null, accessToken);

      // 원래 요청을 새 토큰으로 재시도
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // refresh 실패 시 큐 전체 reject, 토큰 삭제(로그아웃)
      processQueue(refreshError as Error, null);
      tokenStorage.clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
