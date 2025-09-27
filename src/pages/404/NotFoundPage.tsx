import { Link } from "react-router-dom";
import styled from "styled-components";

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 40px 20px;
  text-align: center;
  background: ${({ theme }) => theme.colors.bg};
`;

const NotFoundIcon = styled.div`
  width: 120px;
  height: 120px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: ${({ theme }) => theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  opacity: 0.6;
`;

const NotFoundTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
`;

const NotFoundMessage = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 48px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

/**
 * 404 페이지
 * - 없는 경로 접근 시 표시
 */
export default function NotFoundPage() {
  return (
    <NotFoundContainer>
      <NotFoundIcon>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="currentColor"
          />
        </svg>
      </NotFoundIcon>
      <NotFoundTitle>404</NotFoundTitle>
      <NotFoundMessage>
        페이지를 찾을 수 없습니다.
        <br />
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </NotFoundMessage>
      <HomeLink to="/">홈으로 돌아가기</HomeLink>
    </NotFoundContainer>
  );
}
