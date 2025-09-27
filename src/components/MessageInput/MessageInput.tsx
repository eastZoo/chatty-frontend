import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { FiCode, FiImage, FiFile, FiX } from "react-icons/fi";
import socket from "@/lib/api/socket";
import { adminInfoSelector } from "@/store/adminInfo";
import { InputContainer, TextInput, SendButton } from "./MessageInput.styles";
import { selectedChatState } from "@/store/atoms";
import CodeBlock from "@/components/CodeBlock/CodeBlock";
import FileAttachment from "@/components/FileAttachment/FileAttachment";
import { uploadFile } from "@/lib/api/files";
import * as S from "./MessageInput.styles";

interface MessageInputProps {
  chatId?: string;
}

interface CodeAttachment {
  id: string;
  code: string;
  language: string;
  filename?: string;
}

interface FileAttachmentData {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimetype?: string;
  type?: string; // 백엔드에서 type 필드를 사용할 수도 있음
  url: string;
  uploadedBy?: any;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [content, setContent] = useState("");
  const [selectedChat] = useRecoilState(selectedChatState);
  const adminInfo = useRecoilValue(adminInfoSelector);
  const [isSending, setIsSending] = useState(false);

  // 첨부 파일 상태
  const [codeAttachments, setCodeAttachments] = useState<CodeAttachment[]>([]);
  const [fileAttachments, setFileAttachments] = useState<FileAttachmentData[]>(
    []
  );
  const [showCodeModal, setShowCodeModal] = useState(false);

  // 기능 모드 상태
  const [activeFeature, setActiveFeature] = useState<
    "message" | "code" | "file" | "image"
  >("message");
  const [codeInput, setCodeInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  // 언어 옵션
  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "scss", label: "SCSS" },
    { value: "sql", label: "SQL" },
    { value: "json", label: "JSON" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
    { value: "bash", label: "Bash" },
    { value: "text", label: "Plain Text" },
  ];

  // 입력 필드에 대한 ref 생성
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 메시지 전송 후 입력 필드에 포커스를 유지
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const hasContent =
        content.trim() ||
        codeAttachments.length > 0 ||
        fileAttachments.length > 0;

      if (hasContent && !isSending) {
        setIsSending(true);

        const messageData = {
          chatId,
          content,
          userId: adminInfo.id,
          username: adminInfo.username,
          chatType: selectedChat?.type,
          // 파일 첨부가 있을 때 fileIds 전송
          fileIds:
            fileAttachments.length > 0
              ? fileAttachments.map((f) => f.id)
              : undefined,
          // TODO: 서버에서 지원해야 할 필드들
          codeAttachments:
            codeAttachments.length > 0 ? codeAttachments : undefined,
          fileAttachments:
            fileAttachments.length > 0 ? fileAttachments : undefined,
        };

        console.log("메시지 전송 중:", messageData);
        socket.emit("sendMessage", messageData);

        setContent("");
        setCodeAttachments([]);
        setFileAttachments([]);

        // 메시지 전송 후 입력 필드에 다시 포커스 설정
        if (inputRef.current) {
          inputRef.current.focus();
        }

        // 전송 상태 리셋 (실제로는 서버 응답을 받으면 리셋해야 함)
        setTimeout(() => setIsSending(false), 1000);
      }
    },
    [
      content,
      chatId,
      adminInfo,
      codeAttachments,
      fileAttachments,
      selectedChat?.type,
      isSending,
    ]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  }, []);

  // 기능 선택
  const handleFeatureSelect = useCallback(
    (feature: "message" | "code" | "file" | "image") => {
      setActiveFeature(feature);
      if (feature === "code") {
        // 코드 모드 진입 시 코드 입력창에 포커스
        setTimeout(() => {
          const codeTextArea = document.querySelector(
            "[data-code-textarea]"
          ) as HTMLTextAreaElement;
          if (codeTextArea) {
            codeTextArea.focus();
          }
        }, 100);
      }
    },
    []
  );

  // 코드 전송 - 바로 메시지로 전송
  const handleSendCode = useCallback(() => {
    if (codeInput.trim() && !isSending) {
      setIsSending(true);

      // 코드를 ```로 시작하는 형식으로 변환 (서버에서 파싱 가능)
      const formattedCode = `\`\`\`${selectedLanguage}\n${codeInput.trim()}\n\`\`\``;

      console.log("코드 전송 중:", formattedCode);
      // 바로 메시지로 전송
      socket.emit("sendMessage", {
        chatId,
        content: formattedCode,
        userId: adminInfo.id,
        username: adminInfo.username,
        chatType: selectedChat?.type,
        fileIds: undefined, // 코드 전송 시에는 파일 첨부 없음
      });

      setCodeInput("");
      // 코드 모드 유지 - 전송 후에도 코드 모드에서 계속 작업 가능

      // 전송 상태 리셋
      setTimeout(() => setIsSending(false), 1000);
    }
  }, [
    codeInput,
    selectedLanguage,
    chatId,
    adminInfo,
    selectedChat?.type,
    isSending,
  ]);

  // 코드 첨부 처리 (기존 모달용)
  const handleAddCode = useCallback(() => {
    if (codeInput.trim()) {
      const newCode: CodeAttachment = {
        id: Date.now().toString(),
        code: codeInput.trim(),
        language: selectedLanguage,
        filename: "", // 빈 문자열로 설정
      };
      setCodeAttachments((prev) => [...prev, newCode]);
      setCodeInput("");
      setShowCodeModal(false);
    }
  }, [codeInput, selectedLanguage]);

  // 파일 첨부 처리
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        try {
          // 각 파일을 순차적으로 업로드
          for (const file of Array.from(files)) {
            const uploadedFile = await uploadFile(file);

            const newFile: FileAttachmentData = {
              id: uploadedFile.id,
              originalName: uploadedFile.originalName,
              filename: uploadedFile.filename,
              size: uploadedFile.size,
              mimetype: uploadedFile.mimetype,
              url: uploadedFile.url,
              uploadedBy: uploadedFile.uploadedBy,
            };

            setFileAttachments((prev) => [...prev, newFile]);
          }
        } catch (error) {
          console.error("파일 업로드 실패:", error);
          // TODO: 사용자에게 오류 알림 표시
        }
      }

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  // 첨부 파일 제거 (현재 미사용, 추후 구현 예정)
  // const handleRemoveCode = useCallback((id: string) => {
  //   setCodeAttachments(prev => prev.filter(item => item.id !== id));
  // }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFileAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 파일 다운로드 핸들러
  const handleFileDownload = useCallback(async (file: FileAttachmentData) => {
    const shouldDownload = window.confirm(
      `"${file.originalName}" 파일을 다운로드하시겠습니까?`
    );

    if (shouldDownload) {
      try {
        // 파일 다운로드 URL 생성
        const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}${file.url}`;

        // fetch로 파일 데이터 가져오기
        const response = await fetch(downloadUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // 인증 토큰 추가
          },
        });

        if (!response.ok) {
          throw new Error("파일 다운로드 실패");
        }

        // Blob으로 변환
        const blob = await response.blob();

        // 다운로드 링크 생성
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.originalName; // 원본 파일명으로 다운로드
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 메모리 정리
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("파일 다운로드 오류:", error);
        alert("파일 다운로드에 실패했습니다.");
      }
    }
  }, []);

  // 파일 선택 트리거
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 컴포넌트 마운트 시 포커스를 설정하여 키보드가 바로 올라오도록 할 수도 있습니다.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const hasAttachments =
    codeAttachments.length > 0 || fileAttachments.length > 0;

  return (
    <>
      {/* 기능 선택 바 */}
      <S.QuickCodeBar>
        <S.FeatureSlider>
          {activeFeature === "message" ? (
            <>
              <S.FeatureButton
                isActive={false}
                onClick={() => handleFeatureSelect("code")}
              >
                <FiCode size={14} />
                코드
              </S.FeatureButton>

              <S.FeatureButton isActive={false} onClick={triggerFileSelect}>
                <FiFile size={14} />
                파일
              </S.FeatureButton>

              <S.FeatureButton isActive={false} onClick={triggerFileSelect}>
                <FiImage size={14} />
                이미지
              </S.FeatureButton>
            </>
          ) : (
            <>
              <S.QuickLanguageSelect
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </S.QuickLanguageSelect>

              <S.QuickActions>
                <S.QuickActionButton
                  onClick={() => handleFeatureSelect("message")}
                >
                  <FiX size={14} />
                  취소
                </S.QuickActionButton>
              </S.QuickActions>
            </>
          )}
        </S.FeatureSlider>
      </S.QuickCodeBar>

      {/* 첨부 파일 표시 */}
      {hasAttachments && (
        <S.AttachmentContainer>
          {codeAttachments.map((code) => (
            <CodeBlock
              key={code.id}
              code={code.code}
              language={code.language}
              filename={code.filename}
              isOwn={true}
            />
          ))}
          {fileAttachments.map((file) => (
            <FileAttachment
              key={file.id}
              file={file}
              isOwn={true}
              onRemove={handleRemoveFile}
              onDownload={handleFileDownload}
            />
          ))}
        </S.AttachmentContainer>
      )}

      {/* 입력 영역 */}
      <InputContainer
        onSubmit={
          activeFeature === "code"
            ? (e) => {
                e.preventDefault();
                handleSendCode();
              }
            : handleSubmit
        }
      >
        {activeFeature === "code" ? (
          <S.CodeTextArea
            data-code-textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder={`${
              languageOptions.find((lang) => lang.value === selectedLanguage)
                ?.label || "JavaScript"
            } 코드를 입력하세요...`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) {
                  // Shift + Enter: 새 줄 추가
                  return;
                } else {
                  // Enter: 전송
                  e.preventDefault();
                  handleSendCode();
                }
              }
            }}
          />
        ) : (
          <TextInput
            ref={inputRef}
            type="text"
            placeholder="메시지를 입력하세요..."
            value={content}
            onChange={handleChange}
            maxLength={1000}
          />
        )}

        <SendButton
          type="submit"
          disabled={
            isSending ||
            (activeFeature === "code"
              ? !codeInput.trim()
              : !content.trim() && !hasAttachments)
          }
        >
          {isSending ? "전송중..." : ""}
        </SendButton>
      </InputContainer>

      <S.HiddenFileInput
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept=".txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.css,.html,.json,.md,.xml,.yaml,.yml,.sql"
      />

      {/* 코드 입력 모달 */}
      <S.CodeInputModal isOpen={showCodeModal}>
        <S.CodeModalContent>
          <S.ModalHeader>
            <S.ModalTitle>코드 추가</S.ModalTitle>
            <S.CloseButton onClick={() => setShowCodeModal(false)}>
              <FiX />
            </S.CloseButton>
          </S.ModalHeader>

          <S.FormGroup>
            <S.Label>언어</S.Label>
            <S.LanguageSelect
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </S.LanguageSelect>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>코드</S.Label>
            <S.TextArea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="코드를 입력하세요..."
            />
          </S.FormGroup>

          <S.ModalActions>
            <S.Button onClick={() => setShowCodeModal(false)}>취소</S.Button>
            <S.Button
              variant="primary"
              onClick={handleAddCode}
              disabled={!codeInput.trim()}
            >
              추가
            </S.Button>
          </S.ModalActions>
        </S.CodeModalContent>
      </S.CodeInputModal>
    </>
  );
};

export default React.memo(MessageInput);
