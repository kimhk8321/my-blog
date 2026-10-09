import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const slugs = [
  "algorithm-advanced-01-prefix-sum", "algorithm-advanced-02-monotonic-stack",
  "algorithm-advanced-03-parametric-search", "algorithm-advanced-04-dijkstra",
  "algorithm-advanced-05-union-find",
];

function readPost(slug: string) {
  return matter(fs.readFileSync(path.join(process.cwd(), "posts", `${slug}.mdx`), "utf8"));
}

function code(slug: string) {
  return [...readPost(slug).content.matchAll(/```js\r?\n([\s\S]*?)```/g)].map((match) => match[1]).join("\n");
}

function verify(index: number, checks: string) {
  const normalize = (value: unknown) => JSON.stringify(value, (_, item) =>
    typeof item === "bigint" || (typeof item === "number" && !Number.isFinite(item)) ? String(item) : item);
  vm.runInNewContext(`${code(slugs[index - 1])}\n${checks}`, {
    console: { log() {} },
    equal(actual: unknown, expected: unknown) { expect(normalize(actual)).toBe(normalize(expected)); },
    ok(value: unknown) { expect(Boolean(value)).toBe(true); },
  }, { timeout: 5000 });
}

describe("advanced algorithm article examples", () => {
  it("prints the small examples' stated answers", () => {
    const expected = [
      [3, 3], [[3, 3, -1]], [2, 3, 4], [[0, 1, 2]], [true, false, 1],
    ];
    slugs.forEach((slug, index) => {
      const output: unknown[] = [];
      vm.runInNewContext(code(slug), { console: { log(value: unknown) { output.push(value); } } }, { timeout: 5000 });
      expect(JSON.parse(JSON.stringify(output))).toEqual(expected[index]);
    });
  });

  it("publishes five linked installments with separate application series metadata", () => {
    slugs.forEach((slug, index) => {
      const { data, content } = readPost(slug);
      expect(data.date).toBe("2026-10-09");
      expect(data.category).toBe("algorithm");
      expect(data.series).toBe("알고리즘 응용");
      expect(data.seriesOrder).toBe(index + 1);
      expect(data.order).toBe(index + 1);
      expect(data.migrated).not.toBe(true);
      expect(data.tags.includes("데모")).toBe(/<Demo\b/.test(content));
      for (const [, target] of content.matchAll(/\]\(\/posts\/([^\s)#]+)(?:#[^)]*)?\)/g)) {
        expect(fs.existsSync(path.join(process.cwd(), "posts", `${target}.mdx`))).toBe(true);
      }
    });
  });

  it("prefix frequencies match enumeration with zero and negative targets", () => {
    verify(1, `
      for(let encoded=0;encoded<243;encoded++) {
        let rest=encoded;
        const nums=Array.from({length:5},()=>{const v=rest%3-1;rest=Math.floor(rest/3);return v;});
        for(let target=-3;target<=3;target++) equal(countTargetSubarrays(nums,target),countTargetSlow(nums,target));
      }
      equal(countTargetSubarrays([],0),0);
      equal(countTargetSubarrays([0,0,0],0),6);
      equal(countTargetSubarrays([3,4,-7,1,3,3,1,-4],7),4);
      equal(countTargetSubarrays([3,4,-7,1,3,3,1,-4],-3),4);
    `);
  });

  it("monotonic stack handles equal, decreasing and negative values", () => {
    verify(2, `
      for(let encoded=0;encoded<729;encoded++) {
        let rest=encoded;
        const nums=Array.from({length:6},()=>{const v=rest%3-1;rest=Math.floor(rest/3);return v;});
        equal(nextGreater(nums),nextGreaterSlow(nums));
      }
      equal(nextGreater([]),[]);
      equal(nextGreater([2,1,3,2,4]),[3,3,4,4,-1]);
      equal(nextGreater([2,2,3]),[3,3,-1]);
    `);
  });

  it("minimum inspection time matches exhaustive times within the safe integer range", () => {
    verify(3, `
      for(let a=1;a<=5;a++) for(let b=1;b<=5;b++) for(let people=0;people<=12;people++) {
        let time=0;
        while(Math.floor(time/a)+Math.floor(time/b)<people) time++;
        equal(minimumInspectionTime(people,[a,b]),time);
      }
      equal(minimumInspectionTime(6,[7,10]),28);
      equal(countProcessed(3,[2,3]),2);
      equal(countProcessed(4,[2,3]),3);
      equal(minimumInspectionTime(3,[2,3]),4);
      equal(minimumInspectionTime(1000000,[1000000]),1000000000000);
      equal(minimumInspectionTime(1,[Number.MAX_SAFE_INTEGER]),Number.MAX_SAFE_INTEGER);
      equal(minimumInspectionTime(0,[2,3]),0);
      equal(minimumInspectionTime(3,[5,2]),5);
    `);
  });

  it("weighted shortest paths agree with repeated edge relaxation", () => {
    verify(4, `
      for(let seed=0;seed<40;seed++) {
        const edges=[];
        for(let a=0;a<5;a++) for(let b=0;b<5;b++) {
          if(a!==b&&(a*7+b*3+seed)%4===0) edges.push([a,b,(a*3+b+seed)%6]);
        }
        for(let start=0;start<5;start++) {
          const expected=Array(5).fill(Infinity); expected[start]=0;
          for(let round=0;round<4;round++) for(const [a,b,w] of edges) expected[b]=Math.min(expected[b],expected[a]+w);
          equal(dijkstra(5,edges,start),expected);
        }
      }
      equal(dijkstra(4,[[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5]],0),[0,3,1,4]);
      equal(dijkstra(3,[[0,1,9],[0,1,1],[1,2,0]],0),[0,1,1]);
      equal(dijkstra(4,[[0,1,0],[1,0,0],[0,2,0],[1,2,0]],0),[0,0,0,Infinity]);
      equal(dijkstra(1,[],0),[0]);
      equal(dijkstra(3,[],1),[Infinity,0,Infinity]);
    `);
  });

  it("Union-Find matches explicit group labels over repeated merges", () => {
    verify(5, `
      const testedParent=Array.from({length:8},(_,i)=>i),testedSize=Array(8).fill(1);
      const labels=Array.from({length:8},(_,i)=>i);
      let groupCount=8;
      for(let step=0;step<40;step++) {
        const a=(step*3)%8,b=(step*5+1)%8;
        const oldA=labels[a],oldB=labels[b];
        const merged=union(testedParent,testedSize,a,b);
        equal(merged,oldA!==oldB);
        if(merged) groupCount--;
        for(let i=0;i<8;i++) if(labels[i]===oldB) labels[i]=oldA;
        equal(groupCount,new Set(labels).size);
        for(let i=0;i<8;i++) for(let j=0;j<8;j++) equal(find(testedParent,i)===find(testedParent,j),labels[i]===labels[j]);
        for(let i=0;i<8;i++) equal(testedSize[find(testedParent,i)],labels.filter(label=>label===labels[i]).length);
      }
      const chain=[0,0,1,2,3];equal(find(chain,4),0);
      ok(chain[4]!==3);
      const singleton=[0],singletonSize=[1];
      equal(find(singleton,0),0);equal(union(singleton,singletonSize,0,0),false);
      equal(singletonSize,[1]);
    `);
  });
});
