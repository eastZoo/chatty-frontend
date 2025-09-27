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

const TextPreview = styled.pre`
  margin: 0;
  padding: 12px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  color: ${({ theme }) => theme.colors.text};
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
`;

interface FileAttachmentProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    content?: string;
  };
  isOwn?: boolean;
  onDownload?: (file: any) => void;
  onRemove?: (fileId: string) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  file,
  isOwn = false,
  onDownload,
  onRemove,
}) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <FiImage size={20} />;
    } else if (type.startsWith("text/")) {
      return <FiFileText size={20} />;
    } else if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("tar")
    ) {
      return <FiArchive size={20} />;
    } else {
      return <FiFile size={20} />;
    }
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "#007AFF";
    if (type.startsWith("text/")) return "#34C759";
    if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
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

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  const renderPreview = () => {
    if (file.type.startsWith("image/") && file.url) {
      return (
        <PreviewContainer>
          <ImagePreview src={file.url} alt={file.name} />
        </PreviewContainer>
      );
    } else if (file.type.startsWith("text/") && file.content) {
      return (
        <PreviewContainer>
          <TextPreview>{file.content}</TextPreview>
        </PreviewContainer>
      );
    }
    return null;
  };

  return (
    <FileContainer>
      <FileContent>
        <FileIconContainer style={{ color: getFileTypeColor(file.type) }}>
          {getFileIcon(file.type)}
        </FileIconContainer>
        <FileInfo>
          <FileName>{file.name}</FileName>
          <FileMeta>
            <FileSize>{formatFileSize(file.size)}</FileSize>
            <FileType>{getFileExtension(file.name)}</FileType>
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
