import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import {
    formatPostDate,
    formatPostRelativeTime,
    parsePostDate,
    toPostDateTime,
} from '../src/utils/postDate.js';

for (const timeZone of ['Asia/Seoul', 'UTC', 'America/Los_Angeles']) {
    test(`접속자 시간대가 ${timeZone}이어도 발행 시각과 날짜가 같다`, () => {
        const output = execFileSync(process.execPath, ['--input-type=module', '--eval', `
            import { formatPostDate, formatPostDateTime, formatPostRelativeTime, toPostDateTime } from ${JSON.stringify(new URL('../src/utils/postDate.js', import.meta.url).href)};
            console.log(JSON.stringify({
                legacy: toPostDateTime('2026-10-31T14:00:00'),
                midnight: formatPostDate('2026-10-31T00:30:00'),
                utcMidnight: formatPostDate('2026-10-30T15:30:00Z'),
                dateTime: formatPostDateTime('2026-10-31T14:00:00'),
                relative: formatPostRelativeTime('2026-10-31T14:00:00', new Date('2026-10-31T06:00:00Z')),
            }));
        `], { env: { ...process.env, TZ: timeZone }, encoding: 'utf8' });

        assert.deepEqual(JSON.parse(output), {
            legacy: '2026-10-31T05:00:00.000Z',
            midnight: '2026.10.31',
            utcMidnight: '2026.10.31',
            dateTime: '2026. 10. 31. 오후 2:00',
            relative: '1시간 전',
        });
    });
}

test('이미 시간대가 있는 응답은 중복 보정하지 않는다', () => {
    for (const timestamp of ['2026-10-31T14:00:00+09:00', '2026-10-31T05:00:00Z', '2026-10-30T22:00:00-07:00']) {
        assert.equal(toPostDateTime(timestamp), '2026-10-31T05:00:00.000Z');
    }
});

test('소수 초와 Date 값도 동일한 발행 시각으로 처리한다', () => {
    assert.equal(toPostDateTime('2026-10-31T14:00:00.123456'), '2026-10-31T05:00:00.123Z');
    assert.equal(toPostDateTime(new Date('2026-10-31T05:00:00Z')), '2026-10-31T05:00:00.000Z');
});

test('누락되거나 잘못된 시각 때문에 화면이 깨지지 않는다', () => {
    for (const value of [null, undefined, '', ' ', 'invalid', new Date(NaN)]) {
        assert.equal(parsePostDate(value), null);
        assert.equal(toPostDateTime(value), '');
        assert.equal(formatPostDate(value, '미발행'), '미발행');
    }
    assert.equal(formatPostRelativeTime(null), '임시 저장');
    assert.equal(formatPostRelativeTime('invalid'), '날짜 정보 없음');
});

test('경과 시간은 반올림 없이 한국어 분, 시간, 일 단위로 표시한다', () => {
    const now = new Date('2026-11-02T03:00:00Z');
    for (const [secondsAgo, expected] of [
        [0, '방금 전'],
        [59, '방금 전'],
        [60, '1분 전'],
        [3599, '59분 전'],
        [3600, '1시간 전'],
        [86399, '23시간 전'],
        [86400, '1일 전'],
        [3 * 86400 + 3600, '3일 전'],
        [29 * 86400, '29일 전'],
    ]) {
        const publishedAt = new Date(now.getTime() - secondsAgo * 1000);
        assert.equal(formatPostRelativeTime(publishedAt, now), expected);
    }
});

test('30일부터 개월 단위로, 12개월부터 년과 남은 개월로 표시한다', () => {
    const now = new Date('2026-11-02T03:00:00Z');
    for (const [secondsAgo, expected] of [
        [30 * 86400 - 1, '29일 전'],
        [30 * 86400, '1개월 전'],
        [31 * 86400, '1개월 전'],
        [60 * 86400 - 1, '1개월 전'],
        [60 * 86400, '2개월 전'],
        [90 * 86400, '3개월 전'],
        [360 * 86400 - 1, '11개월 전'],
        [360 * 86400, '1년 전'],
        [390 * 86400 - 1, '1년 전'],
        [390 * 86400, '1년 1개월 전'],
        [420 * 86400, '1년 2개월 전'],
        [720 * 86400 - 1, '1년 11개월 전'],
        [720 * 86400, '2년 전'],
        [750 * 86400, '2년 1개월 전'],
    ]) {
        const publishedAt = new Date(now.getTime() - secondsAgo * 1000);
        assert.equal(formatPostRelativeTime(publishedAt, now), expected);
    }
});

test('미래의 발행 시각도 한국어로 표시한다', () => {
    const now = new Date('2026-11-02T03:00:00Z');
    assert.equal(formatPostRelativeTime(new Date(now.getTime() + 30000), now), '잠시 후');
    assert.equal(formatPostRelativeTime(new Date(now.getTime() + 3600000), now), '1시간 후');
    assert.equal(formatPostRelativeTime(new Date(now.getTime() + 30 * 86400000), now), '1개월 후');
    assert.equal(formatPostRelativeTime(new Date(now.getTime() + 390 * 86400000), now), '1년 1개월 후');
});
