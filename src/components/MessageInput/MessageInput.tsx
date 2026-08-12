import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { FiCode, FiImage, FiFile, FiX } from "react-icons/fi";
import socket from "@/lib/api/socket";
import { adminInfoSelector } from "@/store/adminInfo";
import { InputContainer, TextInput, SendButton } from "./MessageInput.styles";
import { selectedChatState } from "@/store/atoms";
import CodeBlock from "@/components/CodeBlock/CodeBlock";
import FileAttachment from "@/components/FileAttachment/FileAttachment";
import { uploadFile, uploadFileDirect } from "@/lib/api/files";
import type { Message } from "@/lib/api/message";
import * as S from "./MessageInput.styles";
import heic2any from "heic2any";
import { toast } from "react-toastify";

type ClientMessage = Message & {
  clientMessageId: string;
  deliveryStatus?: "sending" | "sent";
};

interface SendMessageAck {
  ok: boolean;
  message?: Message & { clientMessageId?: string };
  error?: string;
}

interface MessageInputProps {
  chatId?: string;
  replyTargetId?: string;
  setReplyTarget: React.Dispatch<
    React.SetStateAction<{
      messageId: string;
      content: string;
      senderId: string;
      senderName: string;
    } | null>
  >;
  keyboardOffset?: number;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  onOptimisticMessage: (message: ClientMessage) => void;
  onMessageAcknowledged: (
    clientMessageId: string,
    message?: Message & { clientMessageId?: string },
  ) => void;
  onMessageFailed: (clientMessageId: string) => boolean;
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
  uploadedBy?: unknown;
}

const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  replyTargetId,
  setReplyTarget,
  keyboardOffset = 0,
  onInputFocus,
  onInputBlur,
  onOptimisticMessage,
  onMessageAcknowledged,
  onMessageFailed,
}) => {
  const [content, setContent] = useState("");
  const [selectedChat] = useRecoilState(selectedChatState);
  const adminInfo = useRecoilValue(adminInfoSelector);
  // 사진 업로드 후, 확장자를 변경해야 할 지 확인하면서 변경할 때 뜨는 모달 상태 값
  const [isUploading, setIsUploading] = useState(false);

  // 첨부 파일 상태
  const [codeAttachments, setCodeAttachments] = useState<CodeAttachment[]>([]);
  const [fileAttachments, setFileAttachments] = useState<FileAttachmentData[]>(
    [],
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentChatIdRef = useRef(chatId);
  currentChatIdRef.current = chatId;

  const sendWithOptimisticUpdate = useCallback(
    (
      messageContent: string,
      attachments: FileAttachmentData[],
      targetReplyId?: string,
      restoreOnFailure?: () => void,
    ) => {
      if (!chatId || !selectedChat?.type || !adminInfo?.id) return false;

      const clientMessageId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const sentChatId = chatId;
      const optimisticMessage: ClientMessage = {
        id: `optimistic:${clientMessageId}`,
        clientMessageId,
        deliveryStatus: "sending",
        content: messageContent,
        createdAt: new Date().toISOString(),
        sender: { id: adminInfo.id, username: adminInfo.username },
        fileIds: attachments.map((file) => file.id),
        files: attachments.map((file) => ({
          id: file.id,
          originalName: file.originalName,
          filename: file.filename,
          mimetype: file.mimetype ?? "application/octet-stream",
          size: String(file.size),
          url: file.url,
        })),
        replyTarget: targetReplyId ? { id: targetReplyId } : undefined,
        ...(selectedChat.type === "private"
          ? { privateChat: { id: chatId } }
          : { chat: { id: chatId } }),
      };

      onOptimisticMessage(optimisticMessage);
      socket.timeout(10000).emit(
        "sendMessage",
        {
          chatId,
          content: messageContent,
          chatType: selectedChat.type,
          replyTargetId: targetReplyId,
          fileIds:
            attachments.length > 0
              ? attachments.map((file) => file.id)
              : undefined,
          clientMessageId,
        },
        (timeoutError: Error | null, ack?: SendMessageAck) => {
          if (timeoutError || !ack?.ok) {
            console.error(
              "메시지 전송 실패:",
              ack?.error ?? timeoutError?.message ?? "ACK 응답 없음",
            );
            const shouldRestore = onMessageFailed(clientMessageId);
            if (shouldRestore && currentChatIdRef.current === sentChatId) {
              restoreOnFailure?.();
              toast.error("메시지 전송에 실패해 입력 내용을 복원했습니다.");
            }
            return;
          }

          onMessageAcknowledged(clientMessageId, ack.message);
        },
      );

      return true;
    },
    [
      adminInfo?.id,
      adminInfo?.username,
      chatId,
      onMessageAcknowledged,
      onMessageFailed,
      onOptimisticMessage,
      selectedChat?.type,
    ],
  );

  const keyboardStyle = useMemo(
    () =>
      ({
        "--keyboard-offset": `${keyboardOffset}px`,
      }) as React.CSSProperties,
    [keyboardOffset],
  );

  // 메시지 전송 후 입력 필드에 포커스를 유지
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const hasContent =
        content.trim() ||
        codeAttachments.length > 0 ||
        fileAttachments.length > 0;

      if (hasContent) {
        const contentToSend = content;
        const filesToSend = [...fileAttachments];
        const codeToRestore = [...codeAttachments];
        const sent = sendWithOptimisticUpdate(
          contentToSend,
          filesToSend,
          replyTargetId,
          () => {
            setContent((current) =>
              current.trim() ? `${contentToSend}\n${current}` : contentToSend,
            );
            setFileAttachments((current) => {
              const currentIds = new Set(current.map((file) => file.id));
              return [
                ...filesToSend.filter((file) => !currentIds.has(file.id)),
                ...current,
              ];
            });
            setCodeAttachments((current) => [...codeToRestore, ...current]);
          },
        );
        if (!sent) return;

        setContent("");
        setCodeAttachments([]);
        setFileAttachments([]);
        setReplyTarget(null);

        // 메시지 전송 후 입력 필드에 다시 포커스 설정
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    },
    [
      content,
      codeAttachments,
      fileAttachments,
      replyTargetId,
      sendWithOptimisticUpdate,
      setReplyTarget,
    ],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);

      // 🔥 자동 높이 조절
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
    },
    [],
  );

  /**
   * 텍스트 아리아에 이미지 바로 붙혀넣는 함수
   */
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;

    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.kind === "file" && item.type.includes("image")) {
        e.preventDefault();

        const file = item.getAsFile();
        if (!file) return;

        try {
          let uploadedFile;
          try {
            uploadedFile = await uploadFile(file);
          } catch {
            uploadedFile = await uploadFileDirect(file);
          }

          setFileAttachments([
            {
              id: uploadedFile.id,
              originalName: uploadedFile.originalName,
              filename: uploadedFile.filename,
              size: uploadedFile.size,
              mimetype: uploadedFile.mimetype,
              url: uploadedFile.url,
              uploadedBy: uploadedFile.uploadedBy,
            },
          ]);
        } catch (err) {
          console.error("붙여넣기 이미지 업로드 실패", err);
        }
      }
    }
  };

  const triggerFocusAdjust = useCallback(
    (element?: HTMLElement | null) => {
      onInputFocus?.();
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 150);
      }
    },
    [onInputFocus],
  );

  const handleTextInputFocus = useCallback(() => {
    triggerFocusAdjust(inputRef.current);
  }, [triggerFocusAdjust]);

  const handleBlur = useCallback(() => {
    onInputBlur?.();
  }, [onInputBlur]);

  // 기능 선택
  const handleFeatureSelect = useCallback(
    (feature: "message" | "code" | "file" | "image") => {
      setActiveFeature(feature);
      if (feature === "code") {
        // 코드 모드 진입 시 코드 입력창에 포커스
        setTimeout(() => {
          const codeTextArea = document.querySelector(
            "[data-code-textarea]",
          ) as HTMLTextAreaElement;
          if (codeTextArea) {
            codeTextArea.focus();
          }
        }, 100);
      }
    },
    [],
  );

  // 코드 전송 - 바로 메시지로 전송
  const handleSendCode = useCallback(() => {
    if (codeInput.trim()) {
      // 코드를 ```로 시작하는 형식으로 변환 (서버에서 파싱 가능)
      const formattedCode = `\`\`\`${selectedLanguage}\n${codeInput.trim()}\n\`\`\``;

      const codeToRestore = codeInput;
      const sent = sendWithOptimisticUpdate(formattedCode, [], undefined, () =>
        setCodeInput((current) =>
          current.trim() ? `${codeToRestore}\n${current}` : codeToRestore,
        ),
      );
      if (!sent) return;

      setCodeInput("");
      // 코드 모드 유지 - 전송 후에도 코드 모드에서 계속 작업 가능
    }
  }, [codeInput, selectedLanguage, sendWithOptimisticUpdate]);

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

  /// 아이폰 사진 업로드시, 확장자 변경 (heic -> jpg)
  const convertHeicIfNeeded = async (file: File): Promise<File> => {
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic");

    if (!isHeic) return file;

    setIsUploading(true);

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    setIsUploading(false);

    return new File(
      [convertedBlob as Blob],
      file.name.replace(/\.heic$/i, ".jpg"),
      { type: "image/jpeg" },
    );
  };

  // 파일 첨부 처리
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        try {
          // 파일 크기 제한 (10MB)
          const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
          const oversizedFiles = Array.from(files).filter(
            (file) => file.size > MAX_FILE_SIZE,
          );

          if (oversizedFiles.length > 0) {
            alert(
              `다음 파일들이 너무 큽니다 (10MB 제한):\n${oversizedFiles
                .map((f) => f.name)
                .join("\n")}`,
            );
            return;
          }

          // 각 파일을 순차적으로 업로드
          for (const originalFile of Array.from(files)) {
            const file = await convertHeicIfNeeded(originalFile);

            console.log("업로드할 파일:", {
              name: file.name,
              size: file.size,
              type: file.type,
            });

            let uploadedFile;
            try {
              // 먼저 기본 방법으로 업로드 시도
              uploadedFile = await uploadFile(file);
              console.log("기본 업로드 성공:", uploadedFile);
            } catch (error) {
              console.warn("기본 업로드 실패, 대안 방법 시도:", error);
              try {
                // 대안 방법으로 업로드 시도
                uploadedFile = await uploadFileDirect(file);
                console.log("대안 업로드 성공:", uploadedFile);
              } catch (directError) {
                console.error("대안 업로드도 실패:", directError);
                throw directError;
              }
            }

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
          alert("파일 업로드에 실패했습니다. 다시 시도해주세요.");
        }
      }

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
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
      `"${file.originalName}" 파일을 다운로드하시겠습니까?`,
    );

    if (shouldDownload) {
      try {
        // 파일 다운로드 URL 생성
        const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}${file.url}`;

        // fetch로 파일 데이터 가져오기
        const response = await fetch(downloadUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("chatty_accessToken")}`, // 인증 토큰 추가
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
  }, [replyTargetId]);

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
          <S.FileAttachmentList>
            {fileAttachments.map((file) => (
              <FileAttachment
                key={file.id}
                file={file}
                isOwn={true}
                onRemove={handleRemoveFile}
                onDownload={handleFileDownload}
              />
            ))}
          </S.FileAttachmentList>
        </S.AttachmentContainer>
      )}
      {/* 입력 영역 */}
      <InputContainer
        style={keyboardStyle}
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
            onFocus={(e) => triggerFocusAdjust(e.currentTarget)}
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
            onBlur={handleBlur}
          />
        ) : (
          <TextInput
            ref={inputRef}
            placeholder="메시지를 입력하세요..."
            value={content}
            onChange={handleChange}
            maxLength={1000}
            onFocus={handleTextInputFocus}
            onBlur={handleBlur}
            rows={1}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              // 한글 입력(IME) 조합 중이면 아무 것도 안 함
              if (e.nativeEvent.isComposing) return;

              if (e.key === "Enter") {
                if (e.shiftKey) {
                  // ✅ Shift + Enter → 줄바꿈 허용 (기본 동작)
                  return;
                } else {
                  // ✅ Enter → 전송
                  e.preventDefault(); // 줄바꿈 차단
                  handleSubmit(e);
                }
              }
            }}
          />
        )}

        <SendButton
          type="submit"
          disabled={
            activeFeature === "code"
              ? !codeInput.trim()
              : !content.trim() && !hasAttachments
          }
        >
          {""}
        </SendButton>
      </InputContainer>
      <S.HiddenFileInput
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="*/*"
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
      {isUploading && (
        <S.UploadingModal>
          <S.UploadingModalMessage>
            이미지 업로드 중입니다...
          </S.UploadingModalMessage>
        </S.UploadingModal>
      )}
    </>
  );
};

export default React.memo(MessageInput);
