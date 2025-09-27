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
