import React, { useState } from "react";
import styled from "styled-components";
import { FiCopy, FiCheck, FiCode, FiDownload } from "react-icons/fi";

const CodeBlockContainer = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  margin: 8px 0;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
`;

const CodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LanguageTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 10px;
  font-weight: 600;
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
  padding: 4px;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const CodeContent = styled.pre`
  margin: 0;
  padding: 16px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  color: ${({ theme }) => theme.colors.text};
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;

  /* 코드 하이라이팅을 위한 기본 스타일 */
  .keyword {
    color: #0077aa;
  }
  .string {
    color: #669900;
  }
  .number {
    color: #990055;
  }
  .comment {
    color: #999999;
    font-style: italic;
  }
  .function {
    color: #dd4a68;
  }
  .variable {
    color: #ee5a24;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FileIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  fileSize?: number;
  isOwn?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "text",
  filename,
  fileSize,
  isOwn = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const handleDownload = () => {
    if (filename) {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <CodeBlockContainer>
      <CodeHeader>
        <LanguageTag>
          <FiCode size={12} />
          {language}
        </LanguageTag>
        <ActionButtons>
          <ActionButton onClick={handleCopy} title="코드 복사">
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
          </ActionButton>
          {filename && (
            <ActionButton onClick={handleDownload} title="파일 다운로드">
              <FiDownload size={14} />
            </ActionButton>
          )}
        </ActionButtons>
      </CodeHeader>
      <CodeContent>{code}</CodeContent>
      {filename && (
        <FileInfo>
          <FileIcon>
            <FiCode size={14} />
          </FileIcon>
          <span>{filename}</span>
          {fileSize && <span>({formatFileSize(fileSize)})</span>}
        </FileInfo>
      )}
    </CodeBlockContainer>
  );
};

export default CodeBlock;
