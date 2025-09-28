import { request } from "./axiosInstance";

export interface FileUploadResponse {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: any;
  createdAt: string;
  updatedAt: string;
}

export interface FileDeleteResponse {
  message: string;
}

// 파일 업로드
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();

  // NestJS FileInterceptor('file')에 맞춰 'file' 필드명 사용
  formData.append("file", file, file.name);

  console.log("업로드 요청 데이터:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    formDataKeys: Array.from(formData.keys()),
  });

  try {
    const response = await request<FileUploadResponse>({
      url: "/files/upload",
      method: "POST",
      data: formData,
      // FormData 전송 시 Content-Type을 명시적으로 설정하지 않음
      // axios가 자동으로 multipart/form-data와 boundary를 설정
      headers: {
        // Accept 헤더만 설정
        Accept: "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("파일 업로드 에러:", error);
    throw error;
  }
};

// 대안적인 파일 업로드 방법 (직접 axios 사용)
export const uploadFileDirect = async (
  file: File
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file, file.name);

  console.log("직접 업로드 시도:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/files/upload`,
      {
        method: "POST",
        body: formData,
        credentials: "include", // 쿠키 포함
        headers: {
          // Accept 헤더만 설정 (Content-Type은 자동 설정)
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`업로드 실패: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log("직접 업로드 성공:", result);
    return result;
  } catch (error) {
    console.error("직접 업로드 에러:", error);
    throw error;
  }
};

// 파일 삭제
export const deleteFile = async (
  fileId: string
): Promise<FileDeleteResponse> => {
  const response = await request<FileDeleteResponse>({
    url: `/files/${fileId}`,
    method: "DELETE",
  });
  return response;
};

// 파일 다운로드 URL 생성
export const getFileDownloadUrl = (filename: string): string => {
  return `${import.meta.env.VITE_API_BASE_URL}/files/${filename}`;
};
