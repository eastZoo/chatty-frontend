/**
 * 메시지 관련 유틸리티 함수들
 */

export type ParsedMessagePart =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language: string };

/**
 * 메시지 내용에서 코드 블록을 파싱하여 텍스트와 코드 블록을 분리
 * @param content - 파싱할 메시지 내용
 * @returns 파싱된 메시지 파트 배열 (텍스트 또는 코드 블록)
 *
 * @example
 * parseCodeBlocks("안녕하세요\n```javascript\nconsole.log('hello');\n```")
 * // [{ type: "text", content: "안녕하세요" }, { type: "code", content: "console.log('hello');", language: "javascript" }]
 */
export const parseCodeBlocks = (content: string): ParsedMessagePart[] => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: ParsedMessagePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // 코드 블록 이전의 텍스트 추가
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({ type: "text", content: textContent });
      }
    }

    // 코드 블록 추가
    const language = match[1] || "text";
    const code = match[2].trim();
    parts.push({ type: "code", content: code, language });

    lastIndex = match.index + match[0].length;
  }

  // 마지막 텍스트 추가
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();
    if (textContent) {
      parts.push({ type: "text", content: textContent });
    }
  }

  // 파싱 결과가 없으면 전체를 텍스트로 반환
  return parts.length > 0 ? parts : [{ type: "text", content }];
};
