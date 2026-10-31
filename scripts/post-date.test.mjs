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
            relative: '약 1시간 전',
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
