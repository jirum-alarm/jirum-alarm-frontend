// 실행 뒤: 화면별 조각(.out/parts/*.md)을 report.md 하나로 모은다. 맨 위에 종류별 개수 요약 —
// AI 는 요약 → ❌ 화면 → 그 화면 png 순으로 본다. (재시도가 있어도 화면당 마지막 결과 하나만 남는다.)
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export default function globalTeardown() {
  const parts = join(__dirname, '.out', 'parts');
  if (!existsSync(parts)) return;
  const sections = readdirSync(parts)
    .sort()
    .map((f) => readFileSync(join(parts, f), 'utf8'));
  const counts = new Map<string, number>();
  for (const line of sections.join('\n').split('\n')) {
    const m = /^- (❌|⚠️) ([^:]+):/.exec(line);
    if (m) counts.set(`${m[1]} ${m[2]}`, (counts.get(`${m[1]} ${m[2]}`) ?? 0) + 1);
  }
  const summary = [...counts.entries()].sort().map(([k, n]) => `- ${k}: ${n}`);
  writeFileSync(
    join(__dirname, '.out', 'report.md'),
    `# 화면 하네스 결과\n\n${sections.length}개 화면.\n\n${summary.join('\n') || '- 문제 없음'}\n\n${sections.join('\n')}`,
  );
}
