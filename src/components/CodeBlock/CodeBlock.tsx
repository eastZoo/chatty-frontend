import React, { useState } from "react";
import styled from "styled-components";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck, FiCode, FiDownload } from "react-icons/fi";
import { useRecoilValue } from "recoil";
import { darkModeState } from "@/store/theme";

const CodeBlockContainer = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  margin: 8px 0;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)`
  margin: 0 !important;
  padding: 16px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  max-height: 400px !important;
  overflow-y: auto !important;
  overflow-x: auto !important;
  border-radius: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  word-wrap: break-word !important;
  word-break: break-word !important;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bgTertiary};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
  }

  /* 가로 스크롤바 */
  &::-webkit-scrollbar:horizontal {
    height: 6px;
  }

  /* 코드 라인 스타일 */
  code {
    word-wrap: break-word !important;
    word-break: break-word !important;
    white-space: pre-wrap !important;
  }

  /* 긴 코드 라인 처리 */
  pre {
    overflow-x: auto !important;
    max-width: 100% !important;
    word-wrap: break-word !important;
    word-break: break-word !important;
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
}) => {
  const [copied, setCopied] = useState(false);
  const isDarkMode = useRecoilValue(darkModeState);

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
      <StyledSyntaxHighlighter
        language={language}
        style={isDarkMode ? oneDark : oneLight}
        showLineNumbers={false}
        wrapLines={true}
        wrapLongLines={true}
        customStyle={{
          background: "transparent",
          margin: 0,
          padding: "16px",
        }}
      >
        {code}
      </StyledSyntaxHighlighter>
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
