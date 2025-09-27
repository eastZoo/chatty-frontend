import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { FiCode, FiPaperclip, FiX, FiPlus } from "react-icons/fi";
import socket from "@/lib/api/socket";
import { adminInfoSelector } from "@/store/adminInfo";
import {
  InputContainer,
  TextInput,
  SendButton,
  AttachmentButton,
  AttachmentDropdown,
  DropdownItem,
} from "./MessageInput.styles";
import { selectedChatState } from "@/store/atoms";
import CodeBlock from "@/components/CodeBlock/CodeBlock";
import FileAttachment from "@/components/FileAttachment/FileAttachment";
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
  name: string;
  size: number;
  type: string;
  content?: string;
  url?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [content, setContent] = useState("");
  const [selectedChat] = useRecoilState(selectedChatState);
  const adminInfo = useRecoilValue(adminInfoSelector);

  // 첨부 파일 상태
  const [codeAttachments, setCodeAttachments] = useState<CodeAttachment[]>([]);
  const [fileAttachments, setFileAttachments] = useState<FileAttachmentData[]>(
    []
  );
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);

  // 코드 입력 상태
  const [codeInput, setCodeInput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [filename, setFilename] = useState("");

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

      if (hasContent) {
        socket.emit("sendMessage", {
          chatId,
          content,
          userId: adminInfo.id,
          username: adminInfo.username,
          chatType: selectedChat?.type,
          // TODO: 서버에서 지원해야 할 필드들
          codeAttachments:
            codeAttachments.length > 0 ? codeAttachments : undefined,
          fileAttachments:
            fileAttachments.length > 0 ? fileAttachments : undefined,
        });

        setContent("");
        setCodeAttachments([]);
        setFileAttachments([]);

        // 메시지 전송 후 입력 필드에 다시 포커스 설정
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    },
    [
      content,
      chatId,
      adminInfo,
      codeAttachments,
      fileAttachments,
      selectedChat?.type,
    ]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  }, []);

  // 코드 첨부 처리
  const handleAddCode = useCallback(() => {
    if (codeInput.trim()) {
      const newCode: CodeAttachment = {
        id: Date.now().toString(),
        code: codeInput.trim(),
        language,
        filename: filename.trim() || undefined,
      };
      setCodeAttachments((prev) => [...prev, newCode]);
      setCodeInput("");
      setFilename("");
      setShowCodeModal(false);
    }
  }, [codeInput, language, filename]);

  // 파일 첨부 처리
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            const newFile: FileAttachmentData = {
              id: Date.now().toString() + Math.random(),
              name: file.name,
              size: file.size,
              type: file.type,
              content: file.type.startsWith("text/") ? content : undefined,
              // TODO: 실제 파일 업로드 시 URL 생성
              url: file.type.startsWith("image/") ? content : undefined,
            };
            setFileAttachments((prev) => [...prev, newFile]);
          };

          if (file.type.startsWith("text/") || file.type.startsWith("image/")) {
            reader.readAsDataURL(file);
          } else {
            // 바이너리 파일의 경우 서버 업로드 필요
            // TODO: 파일 업로드 API 호출
            console.log("Binary file upload needed:", file.name);
          }
        });
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

  // 드롭다운 토글
  const toggleAttachmentDropdown = useCallback(() => {
    setShowAttachmentDropdown((prev) => !prev);
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAttachmentDropdown) {
        const target = event.target as Element;
        if (!target.closest("[data-attachment-dropdown]")) {
          setShowAttachmentDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachmentDropdown]);

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
            />
          ))}
        </S.AttachmentContainer>
      )}

      {/* 메시지 입력 */}
      <InputContainer onSubmit={handleSubmit} data-attachment-dropdown>
        <AttachmentButton onClick={toggleAttachmentDropdown}>
          <FiPlus size={20} />
          <AttachmentDropdown isOpen={showAttachmentDropdown}>
            <DropdownItem
              onClick={() => {
                setShowCodeModal(true);
                setShowAttachmentDropdown(false);
              }}
            >
              <FiCode size={16} />
              코드 추가
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                fileInputRef.current?.click();
                setShowAttachmentDropdown(false);
              }}
            >
              <FiPaperclip size={16} />
              파일 첨부
            </DropdownItem>
          </AttachmentDropdown>
        </AttachmentButton>

        <TextInput
          ref={inputRef}
          type="text"
          placeholder="메시지를 입력하세요..."
          value={content}
          onChange={handleChange}
          maxLength={1000}
        />
        <SendButton
          type="submit"
          disabled={!content.trim() && !hasAttachments}
        ></SendButton>
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
            <S.Label>파일명 (선택사항)</S.Label>
            <S.Input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="예: App.js"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>언어</S.Label>
            <S.Input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="javascript, python, java, etc."
            />
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
