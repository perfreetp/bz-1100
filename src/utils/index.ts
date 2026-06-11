import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatTime = (dateStr: string): string => {
  const date = dayjs(dateStr);
  const now = dayjs();
  const diff = now.diff(date, 'minute');
  
  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}小时前`;
  if (diff < 60 * 24 * 7) return `${Math.floor(diff / (60 * 24))}天前`;
  return date.format('YYYY-MM-DD');
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

export const formatCount = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toString();
};
