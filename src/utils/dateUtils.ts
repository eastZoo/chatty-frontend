/**
 * 날짜/시간 유틸리티 함수들
 */

/**
 * ISO 날짜 문자열을 한국 시간으로 포맷팅
 * @param timestamp - ISO 형식의 날짜 문자열
 * @returns "YYYY-MM-DD HH:MM AM/PM" 형식의 문자열
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  date.setHours(date.getHours() + 9); // UTC+9 (한국 시간)

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
