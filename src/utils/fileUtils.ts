/**
 * 파일 관련 유틸리티 함수들
 */

import { request } from "@/lib/api/axiosInstance";

export interface FileDownloadParams {
  id: string;
  originalName: string;
}

/**
 * 파일을 다운로드하는 함수
 * @param file - 다운로드할 파일 정보 (id, originalName)
 * @throws 파일 다운로드 실패 시 에러 발생
 */
export const downloadFile = async (file: FileDownloadParams): Promise<void> => {
  const shouldDownload = window.confirm(
    `"${file.originalName}" 파일을 다운로드하시겠습니까?`
  );

  if (!shouldDownload) {
    return;
  }

  try {
    // 파일 다운로드 요청
    const response = await request<Blob>({
      method: "GET",
      url: `/files/${file.id}`,
      responseType: "blob",
    });

    // 다운로드 링크 생성 및 클릭
    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 메모리 정리
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
    alert("파일 다운로드에 실패했습니다.");
    throw error;
  }
};
