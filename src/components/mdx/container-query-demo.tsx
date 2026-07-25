"use client";

import { useState } from "react";

const css = `
.cq-wrap { container-type: inline-size; }
.cq-card { display: flex; flex-direction: column; gap: 12px; }
.cq-thumb { width: 100%; height: 80px; flex-shrink: 0; }
@container (min-width: 380px) {
  .cq-card { flex-direction: row; align-items: center; }
  .cq-thumb { width: 120px; height: 72px; }
}
`;

export function ContainerQueryDemo() {
  const [width, setWidth] = useState(280);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <label className="flex items-center gap-2 text-xs">
        컨테이너 너비
        <input
          type="range"
          min={200}
          max={520}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-14 font-mono">{width}px</span>
      </label>

      <div className="cq-wrap" style={{ width, maxWidth: "100%" }}>
        <div className="cq-card rounded-md border border-black/10 p-3 dark:border-white/15">
          <div className="cq-thumb rounded bg-gradient-to-br from-indigo-400 to-purple-500" />
          <div>
            <div className="font-semibold">컨테이너 쿼리 카드</div>
            <div className="text-xs text-foreground/60">
              컨테이너가 <b>380px</b> 이상이면 가로 배치, 좁으면 세로 배치로
              바뀝니다. 화면(viewport)이 아니라 <b>이 박스</b> 너비를 기준으로요.
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-foreground/50">
        슬라이더로 컨테이너 폭을 조절해 보세요. 미디어 쿼리와 달리 부모 컨테이너
        크기에 반응해, 컴포넌트를 어디에 놓든 스스로 적응합니다.
      </p>
    </div>
  );
}
