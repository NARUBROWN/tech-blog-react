import { formatDistance } from 'date-fns';
import { ko } from 'date-fns/locale';

const BLOG_TIME_ZONE = 'Asia/Seoul';
const LEGACY_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;
const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BLOG_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: BLOG_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
});

export const parsePostDate = value => {
    if (!(value instanceof Date) && (typeof value !== 'string' || !value.trim())) return null;

    // 기존 게시글 API는 한국 시각을 시간대 없이 내려줍니다.
    const timestamp = typeof value === 'string' ? value.trim() : value;
    const date = new Date(typeof timestamp === 'string' && LEGACY_TIMESTAMP.test(timestamp)
        ? `${timestamp}+09:00`
        : timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const toPostDateTime = value => parsePostDate(value)?.toISOString() || '';

export const formatPostDate = (value, fallback = '날짜 정보 없음') => {
    const date = parsePostDate(value);
    if (!date) return fallback;

    const parts = Object.fromEntries(dateFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
    return `${parts.year}.${parts.month}.${parts.day}`;
};

export const formatPostDateTime = value => {
    const date = parsePostDate(value);
    return date ? dateTimeFormatter.format(date) : '';
};

export const formatPostRelativeTime = (value, now = new Date()) => {
    const date = parsePostDate(value);
    if (!value) return '임시 저장';
    return date ? formatDistance(date, now, { addSuffix: true, locale: ko }) : '날짜 정보 없음';
};
