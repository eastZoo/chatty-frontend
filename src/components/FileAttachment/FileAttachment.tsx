import React from "react";
import styled from "styled-components";
import {
  FiFile,
  FiImage,
  FiFileText,
  FiArchive,
  FiDownload,
  FiX,
} from "react-icons/fi";

const FileContainer = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  margin: 8px 0;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
`;

const FileContent = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
`;

const FileIconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
  word-break: break-word;
`;

const FileMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileSize = styled.span``;

const FileType = styled.span`
  background: ${({ theme }) => theme.colors.bgTertiary};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 8px;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const PreviewContainer = styled.div`
  max-height: 200px;
  overflow: hidden;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
`;

interface FileAttachmentProps {
  file: {
    id: string;
    originalName: string;
    filename: string;
    size: number;
    mimetype?: string;
    type?: string; // 백엔드에서 type 필드를 사용할 수도 있음
    url: string;
    uploadedBy?: any;
  };
  isOwn?: boolean;
  onDownload?: (file: any) => void;
  onRemove?: (fileId: string) => void;
  onClick?: () => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  file,
  isOwn = false,
  onDownload,
  onRemove,
  onClick,
}) => {
  // 파일명 안전하게 처리 (인코딩 문제 방지)
  const getSafeFileName = (fileName: string) => {
    try {
      // 파일명이 깨진 경우 디코딩 시도
      if (
        fileName.includes("ì") ||
        fileName.includes("í") ||
        fileName.includes("â") ||
        fileName.includes("ê") ||
        fileName.includes("ô") ||
        fileName.includes("û")
      ) {
        // 여러 인코딩 방식으로 복구 시도
        const attempts = [
          // UTF-8로 잘못 해석된 경우
          () => {
            const bytes = [];
            for (let i = 0; i < fileName.length; i++) {
              bytes.push(fileName.charCodeAt(i));
            }
            return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
          },
          // Latin-1로 잘못 해석된 경우
          () => decodeURIComponent(escape(fileName)),
          // ISO-8859-1로 잘못 해석된 경우
          () => {
            const bytes = [];
            for (let i = 0; i < fileName.length; i++) {
              bytes.push(fileName.charCodeAt(i) & 0xff);
            }
            return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
          },
        ];

        for (const attempt of attempts) {
          try {
            const decoded = attempt();
            if (
              decoded !== fileName &&
              !decoded.includes("ì") &&
              !decoded.includes("í")
            ) {
              console.log(`파일명 복구 성공: ${fileName} -> ${decoded}`);
              return decoded;
            }
          } catch (e) {
            // 다음 시도로 계속
          }
        }
      }
      return fileName;
    } catch (error) {
      console.warn("파일명 디코딩 실패:", error);
      return fileName;
    }
  };

  // mimetype 또는 type 필드에서 MIME 타입 가져오기
  const getMimeType = () => file.mimetype || file.type || "";

  const getFileIcon = (mimetype: string) => {
    if (!mimetype) {
      return <FiFile size={20} />;
    }
    if (mimetype.startsWith("image/")) {
      return <FiImage size={20} />;
    } else if (mimetype.startsWith("text/")) {
      return <FiFileText size={20} />;
    } else if (
      mimetype.includes("zip") ||
      mimetype.includes("rar") ||
      mimetype.includes("tar")
    ) {
      return <FiArchive size={20} />;
    } else {
      return <FiFile size={20} />;
    }
  };

  const getFileTypeColor = (mimetype: string) => {
    if (!mimetype) return "#8E8E93";
    if (mimetype.startsWith("image/")) return "#007AFF";
    if (mimetype.startsWith("text/")) return "#34C759";
    if (
      mimetype.includes("zip") ||
      mimetype.includes("rar") ||
      mimetype.includes("tar")
    )
      return "#FF9500";
    return "#8E8E93";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (originalName: string) => {
    return originalName.split(".").pop()?.toUpperCase() || "FILE";
  };

  const renderPreview = () => {
    const mimeType = getMimeType();
    if (mimeType && mimeType.startsWith("image/") && file.url) {
      return (
        <PreviewContainer>
          <ImagePreview
            src={`${import.meta.env.VITE_API_BASE_URL}/files/${file.id}`}
            alt={getSafeFileName(file.originalName)}
          />
        </PreviewContainer>
      );
    }
    // 텍스트 미리보기는 제거 (서버에서 파일 내용을 직접 제공하지 않음)
    return null;
  };

  return (
    <FileContainer onClick={onClick}>
      <FileContent>
        <FileIconContainer style={{ color: getFileTypeColor(getMimeType()) }}>
          {getFileIcon(getMimeType())}
        </FileIconContainer>
        <FileInfo>
          <FileName>{getSafeFileName(file.originalName)}</FileName>
          <FileMeta>
            <FileSize>{formatFileSize(file.size)}</FileSize>
            <FileType>
              {getFileExtension(getSafeFileName(file.originalName))}
            </FileType>
          </FileMeta>
        </FileInfo>
        <ActionButtons>
          {onDownload && (
            <ActionButton onClick={() => onDownload(file)} title="다운로드">
              <FiDownload size={16} />
            </ActionButton>
          )}
          {isOwn && onRemove && (
            <ActionButton onClick={() => onRemove(file.id)} title="삭제">
              <FiX size={16} />
            </ActionButton>
          )}
        </ActionButtons>
      </FileContent>
      {renderPreview()}
    </FileContainer>
  );
};

export default FileAttachment;
