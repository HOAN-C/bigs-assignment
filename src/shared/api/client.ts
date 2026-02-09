/**
 * 앱 전체에서 사용하는 공통 Axios 인스턴스.
 *
 * 이 파일 하나로 모든 API 요청의 인증 처리가 자동화된다.
 * - 요청 인터셉터: 매 요청마다 accessToken을 Authorization 헤더에 자동 부착
 *   → accessToken이 없지만 refreshToken이 있으면 선제적으로 갱신한다 (새로고침 직후 시나리오)
 * - 응답 인터셉터: 401/403 응답 시 토큰을 자동 갱신하고 실패한 요청을 재시도
 *
 * 토큰 갱신 중 다른 요청도 401/403을 받을 수 있기 때문에,
 * 갱신은 한 번만 실행하고 나머지 요청은 큐에 대기시킨 뒤 일괄 재시도하는 구조다.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 현재 토큰 갱신이 진행 중인지 추적하는 플래그
let isRefreshing = false;

// 토큰 갱신 중 대기하는 요청 큐
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// 진행 중인 선제적 갱신의 Promise (중복 갱신 방지)
let pendingRefreshPromise: Promise<string> | null = null;

// 큐에 쌓인 대기 요청들을 한번에 처리 (성공 시 새 토큰 전달, 실패 시 에러 전파)
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

/**
 * refreshToken으로 accessToken을 갱신한다.
 * 이미 갱신 중이면 기존 Promise를 반환하여 중복 호출을 방지한다.
 */
const refreshAccessToken = (): Promise<string> => {
  if (pendingRefreshPromise) return pendingRefreshPromise;

  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token"));
  }

  // apiClient가 아닌 기본 axios를 사용 (인터셉터 무한루프 방지)
  pendingRefreshPromise = axios
    .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
    .then((response) => {
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      tokenStorage.setTokens(accessToken, newRefreshToken);
      return accessToken;
    })
    .finally(() => {
      pendingRefreshPromise = null;
    });

  return pendingRefreshPromise;
};

/**
 * [요청 인터셉터]
 * 모든 요청 직전에 실행되어 accessToken을 헤더에 붙여준다.
 *
 * 새로고침 직후처럼 accessToken은 없지만 refreshToken(쿠키)은 있는 경우,
 * API 호출 전에 선제적으로 토큰을 갱신하여 401/403을 미연에 방지한다.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let accessToken = tokenStorage.getAccessToken();

    // accessToken이 없지만 refreshToken이 있으면 선제적으로 갱신 (새로고침 직후)
    if (!accessToken && tokenStorage.getRefreshToken()) {
      try {
        accessToken = await refreshAccessToken();
      } catch {
        // 갱신 실패 시 토큰 없이 요청 진행 (서버가 401/403으로 응답하면 응답 인터셉터가 처리)
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * [응답 인터셉터]
 * 401 또는 403 응답을 감지하면 refreshToken으로 토큰을 갱신하고,
 * 실패했던 요청을 새 토큰으로 재시도한다.
 *
 * Spring Security는 인증 누락/만료 시 401 대신 403을 반환하는 경우가 있어
 * 두 상태 코드 모두 처리한다.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean; // 이 요청이 이미 재시도된 것인지 표시
    };

    const status = error.response?.status;

    // 401/403이 아니거나 이미 재시도한 요청이면 더 이상 처리하지 않음
    if ((status !== 401 && status !== 403) || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 이미 다른 요청이 토큰 갱신 중이면, 이 요청은 큐에 넣고 갱신 완료를 기다림
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    // 이 요청이 첫 번째 401/403 → 토큰 갱신 시작
    originalRequest._retry = true; // 무한 루프 방지: 재시도 시 이 블록을 다시 타지 않도록
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      // refreshToken 자체가 없으면 로그아웃 상태로 간주
      tokenStorage.clearTokens();
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const accessToken = await refreshAccessToken();
      processQueue(null, accessToken);

      // 원래 실패했던 요청을 새 토큰으로 재시도
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // 토큰 갱신 자체가 실패하면 큐의 모든 요청도 실패 처리하고 로그아웃
      processQueue(refreshError as Error, null);
      tokenStorage.clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
