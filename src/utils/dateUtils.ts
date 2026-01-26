/**
 * 날짜/시간 유틸리티 함수들
 */

/**
 * ISO 날짜 문자열을 로컬 시간으로 포맷팅
 * @param timestamp - ISO 형식의 날짜 문자열 (UTC 또는 로컬 시간)
 * @returns "YYYY-MM-DD HH:MM AM/PM" 형식의 문자열 (로컬 타임존)
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  // new Date()는 ISO 문자열을 자동으로 로컬 타임존으로 변환하므로
  // 수동으로 시간을 더할 필요가 없습니다.

  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const dateStr = `${year}-${month}-${day}`;

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr} ${timeStr}`;
};
