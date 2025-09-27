import styled from "styled-components";

export const InputContainer = styled.form`
  display: flex;
  align-items: flex-end;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 20px;
  box-sizing: border-box;
  width: 100%;
  gap: 12px;
  /* iOS 안전 영역 대응 */
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
  flex-shrink: 0; /* 축소되지 않도록 */
`;

export const TextInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  font-size: 16px;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  box-sizing: border-box;
  line-height: 1.4;
  max-height: 100px;
  min-height: 44px;
  resize: none;
  /* iOS Safari input zoom 방지 */
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  /* 모바일에서 터치 최적화 */
  -webkit-appearance: none;
  appearance: none;
`;

export const AttachmentButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.full};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const AttachmentDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 8px;
  margin-bottom: 8px;
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  flex-direction: column;
  gap: 4px;
  z-index: 1000;
  min-width: 200px;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(0);
  }
`;

export const SendButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.bgTertiary : theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radius.full};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textSecondary : "#FFFFFF"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:active {
    transform: scale(0.95);
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
  }

  /* 전송 아이콘 */
  &::after {
    content: "→";
    font-size: 16px;
    font-weight: bold;
  }
`;

export const AttachmentContainer = styled.div`
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  max-height: 300px;
  overflow-y: auto;
`;

export const CodeInputModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const CodeModalContent = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: ${({ theme }) => theme.radius.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  min-height: 200px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

export const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 12px 24px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant = "secondary", theme }) =>
    variant === "primary"
      ? `
        background: ${theme.colors.primary};
        color: #ffffff;
        &:hover {
          background: ${theme.colors.secondary};
          transform: translateY(-1px);
        }
      `
      : `
        background: ${theme.colors.bgTertiary};
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.border};
        &:hover {
          background: ${theme.colors.border};
        }
      `}

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const QuickCodeBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const FeatureSlider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;
`;

export const FeatureButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.bgTertiary};
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme, isActive }) => (isActive ? "#ffffff" : theme.colors.text)};
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const QuickCodeToggle = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.bgTertiary};
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  color: ${({ theme, isActive }) => (isActive ? "#ffffff" : theme.colors.text)};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const QuickLanguageSelect = styled.select`
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const QuickActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

export const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const CodeModeToggle = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.bgTertiary};
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  color: ${({ theme, isActive }) => (isActive ? "#ffffff" : theme.colors.text)};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CodeModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CodeInputHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LanguageSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  option {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const CodeTextArea = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  min-height: 44px;
  max-height: 200px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-style: italic;
  }

  /* iOS Safari input zoom 방지 */
  font-size: 16px;

  /* 모바일에서 터치 최적화 */
  -webkit-appearance: none;
  appearance: none;
`;

export const CodeActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const CodeActionButton = styled.button<{
  variant?: "primary" | "secondary";
}>`
  padding: 8px 16px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ variant = "secondary", theme }) =>
    variant === "primary"
      ? `
        background: ${theme.colors.primary};
        color: #ffffff;
        &:hover {
          background: ${theme.colors.secondary};
          transform: translateY(-1px);
        }
      `
      : `
        background: ${theme.colors.bgTertiary};
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.border};
  &:hover {
          background: ${theme.colors.border};
        }
      `}

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;
