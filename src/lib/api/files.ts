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
  formData.append("file", file);

  const response = await request<FileUploadResponse>({
    url: "/files/upload",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
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
