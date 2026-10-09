import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const slugs = [
  "algorithm-01-hash", "algorithm-02-stack-queue", "algorithm-03-two-pointers",
  "algorithm-04-binary-search", "algorithm-05-dfs-bfs", "algorithm-06-backtracking",
  "algorithm-07-greedy", "algorithm-08-dynamic-programming", "algorithm-09-heap",
  "algorithm-10-graph",
];

function readPost(slug: string) {
  return matter(fs.readFileSync(path.join(process.cwd(), "posts", `${slug}.mdx`), "utf8"));
}

function code(slug: string) {
  return [...readPost(slug).content.matchAll(/```js\r?\n([\s\S]*?)```/g)].map((match) => match[1]).join("\n");
}

function verify(index: number, checks: string) {
  vm.runInNewContext(`${code(slugs[index - 1])}\n${checks}`, {
    console: { log() {} },
    equal(actual: unknown, expected: unknown) {
      expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
    },
    ok(value: unknown) { expect(Boolean(value)).toBe(true); },
  }, { timeout: 5000 });
}

describe("algorithm article JavaScript examples", () => {
  it("has ten linked, dated, ordered installments", () => {
    slugs.forEach((slug, index) => {
      const { data, content } = readPost(slug);
      expect(data.date).toBe("2026-10-08");
      expect(data.category).toBe("algorithm");
      expect(data.series).toBe("유형별 알고리즘 복습");
      expect(data.seriesOrder).toBe(index + 1);
      expect(data.order).toBe(index + 1);
      expect(data.migrated).not.toBe(true);
      expect(code(slug).length).toBeGreaterThan(100);
      for (const [, target] of content.matchAll(/\]\(\/posts\/([^\s)#]+)(?:#[^)]*)?\)/g)) {
        expect(fs.existsSync(path.join(process.cwd(), "posts", `${target}.mdx`))).toBe(true);
      }
    });
  });

  it("counts names and distinguishes repeated participants", () => {
    verify(1, `
      equal([...countNames(["kim","lee","kim"])], [["kim",2],["lee",1]]);
      equal([...countNames([])], []);
      for (const participants of [["kim"],["kim","lee","kim"],["a","a","a","b"]]) {
        for (let missing=0;missing<participants.length;missing++) {
          const completed=participants.filter((_,i)=>i!==missing).reverse();
          equal(findNonCompleter(participants,completed),participants[missing]);
        }
      }
      equal(unique.size,3);
      equal([...unique],[1,2,3]);
    `);
  });

  it("bracket validation matches balance counting and queue preserves order", () => {
    verify(2, `
      for(let length=0;length<=8;length++) for(let mask=0;mask<(1<<length);mask++) {
        let text="",balance=0,valid=true;
        for(let i=0;i<length;i++) {
          const opened=Boolean(mask&(1<<i));
          text+=opened?"(":")";
          balance+=opened?1:-1;
          if(balance<0) valid=false;
        }
        equal(isBalanced(text),valid&&balance===0);
      }
      equal(processQueue([]),[]);
      equal(processQueue(["A","B","C"]),["A","B","C"]);
      equal(stack,[1]);
    `);
  });

  it("two pointers and fixed windows match exhaustive enumeration", () => {
    verify(3, `
      for(let mask=0;mask<81;mask++) {
        let number=mask;
        const values=Array.from({length:4},()=>{const value=number%3-1;number=Math.floor(number/3);return value;});
        for(let k=1;k<=4;k++) {
          const sums=Array.from({length:5-k},(_,i)=>values.slice(i,i+k).reduce((a,b)=>a+b,0));
          equal(maxWindowSum(values,k),Math.max(...sums));
        }
        const ordered=[...values].sort((a,b)=>a-b);
        for(let target=-3;target<=3;target++) {
          let possible=false;
          for(let a=0;a<4;a++) for(let b=a+1;b<4;b++) if(ordered[a]+ordered[b]===target) possible=true;
          const pair=twoSumSorted(ordered,target);
          equal(pair!==null,possible);
          if(pair) {ok(pair[0]<pair[1]);equal(ordered[pair[0]]+ordered[pair[1]],target);}
        }
      }
      equal(maxWindowSum([],1),null);
      equal(maxWindowSum([1],0),null);
      equal(twoSumSorted([3],6),null);
    `);
  });

  it("binary search finds a valid occurrence or returns minus one", () => {
    verify(4, `
      for(const values of [[],[1],[2,2,2],[-3,0,2,2,7]]) for(let target=-4;target<=9;target++) {
        const actual=binarySearch(values,target);
        if(values.includes(target)) {ok(actual>=0&&actual<values.length);equal(values[actual],target);}
        else equal(actual,-1);
      }
      equal(binarySearch([1,2,3,4,5,6,7,8,9],2),1);
    `);
  });

  it("grid BFS matches relaxation and permutation DFS returns complete distinct paths", () => {
    verify(5, `
      for(let mask=0;mask<64;mask++) {
        const cells=Array.from({length:6},(_,i)=>(mask>>i)&1);
        const grid=[cells.slice(0,3),cells.slice(3)];
        const dist=Array(6).fill(Infinity);
        if(!cells[0]) dist[0]=0;
        for(let round=0;round<6;round++) for(let a=0;a<6;a++) for(let b=0;b<6;b++) {
          const adjacent=Math.abs(Math.floor(a/3)-Math.floor(b/3))+Math.abs(a%3-b%3)===1;
          if(!cells[a]&&!cells[b]&&adjacent) dist[b]=Math.min(dist[b],dist[a]+1);
        }
        equal(shortestGridPath(grid),Number.isFinite(dist[5])?dist[5]:-1);
      }
      equal(shortestGridPath([[0]]),0);
      equal(shortestGridPath([]),-1);
      equal(permutations([1,2,3],2),[[1,2],[1,3],[2,1],[2,3],[3,1],[3,2]]);
      for(let r=0;r<=4;r++) {
        const paths=permutations([1,2,3],r);
        equal(paths.length,[1,3,6,6,0][r]);
        equal(new Set(paths.map(path=>JSON.stringify(path))).size,paths.length);
        for(const path of paths) {equal(path.length,r);equal(new Set(path).size,r);}
      }
      equal(permutations([],0),[[]]);
    `);
  });

  it("combination and sign DFS match independent bitmask enumeration", () => {
    verify(6, `
      for(const values of [[],[1,2,3],[1,2,3,4]]) for(let r=0;r<=values.length+1;r++) {
        const expected=[];
        for(let mask=0;mask<(1<<values.length);mask++) {
          const chosen=values.filter((_,i)=>mask&(1<<i));
          if(chosen.length===r) expected.push(JSON.stringify(chosen));
        }
        equal(combinations(values,r).map(item=>JSON.stringify(item)).sort(),expected.sort());
      }
      for(const values of [[],[0],[1,1,1],[1,2,3],[0,1,0]]) for(let target=-6;target<=6;target++) {
        let expected=0;
        for(let mask=0;mask<(1<<values.length);mask++) {
          const sum=values.reduce((sum,value,i)=>sum+((mask&(1<<i))?value:-value),0);
          if(sum===target) expected++;
        }
        equal(countTargetWays(values,target),expected);
      }
    `);
  });

  it("greedy coin count matches minimum-count DP and meetings match all subsets", () => {
    verify(7, `
      const minimum=Array(201).fill(Infinity);
      minimum[0]=0;
      for(let value=1;value<=200;value++) for(const coin of [1,5,10,50]) if(coin<=value) minimum[value]=Math.min(minimum[value],minimum[value-coin]+1);
      for(let amount=0;amount<=200;amount++) equal(changeCoinCount(amount),minimum[amount]);
      const pool=[[0,4],[3,5],[4,8],[8,9],[1,2],[2,6]];
      for(let mask=0;mask<64;mask++) {
        const meetings=pool.filter((_,i)=>mask&(1<<i));
        let best=0;
        for(let subset=0;subset<(1<<meetings.length);subset++) {
          const chosen=meetings.filter((_,i)=>subset&(1<<i)).sort((a,b)=>a[0]-b[0]);
          if(chosen.every((meeting,i)=>i===0||meeting[0]>=chosen[i-1][1])) best=Math.max(best,chosen.length);
        }
        equal(maxMeetingCount(meetings),best);
      }
    `);
  });

  it("DP matches exhaustive stair paths and nonadjacent selections", () => {
    verify(8, `
      function enumerateSteps(remaining) {
        if(remaining===0) return 1;
        if(remaining<0) return 0;
        return enumerateSteps(remaining-1)+enumerateSteps(remaining-2);
      }
      for(let n=0;n<=12;n++) equal(climbWays(n),enumerateSteps(n));
      for(let encoded=0;encoded<81;encoded++) {
        let number=encoded;
        const values=Array.from({length:4},()=>{const value=number%3;number=Math.floor(number/3);return value;});
        let best=0;
        for(let mask=0;mask<16;mask++) {
          if(mask&(mask<<1)) continue;
          const sum=values.reduce((sum,value,i)=>sum+((mask&(1<<i))?value:0),0);
          best=Math.max(best,sum);
        }
        equal(maxNonAdjacentSum(values),best);
      }
      equal(maxNonAdjacentSum([]),0);
      equal(maxNonAdjacentSum([7]),7);
      equal(maxNonAdjacentSum([2,7,9,3,1]),12);
    `);
  });

  it("numeric heap and repeated mixing agree with a sorted-array model", () => {
    verify(9, `
      const tested=new MinHeap();
      const model=[];
      for(let i=0;i<200;i++) {
        if(i%3!==2) {const value=(i*17)%31-15;tested.push(value);model.push(value);}
        else {model.sort((a,b)=>a-b);equal(tested.pop(),model.shift());}
        model.sort((a,b)=>a-b);equal(tested.peek(),model[0]);equal(tested.size,model.length);
      }
      while(model.length) equal(tested.pop(),model.shift());
      equal(tested.pop(),undefined);
      for(const values of [[],[0],[1,1],[0,0,1],[1,2,3,9,10,12]]) for(let target=0;target<=20;target++) {
        const remaining=[...values];
        let count=0;
        while(remaining.length>0) {
          remaining.sort((a,b)=>a-b);
          if(remaining[0]>=target) break;
          if(remaining.length<2) {count=-1;break;}
          const first=remaining.shift(),second=remaining.shift();
          remaining.push(first+second*2);count++;
        }
        equal(mixUntil(values,target),count);
      }
    `);
  });

  it("graph groups and distances match transitive shortest-path closure", () => {
    verify(10, `
      equal(buildGraph(4,[[0,1],[0,2],[2,3]]),[[1,2],[0],[0,3],[2]]);
      const candidates=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
      for(let mask=0;mask<64;mask++) {
        const edges=candidates.filter((_,i)=>mask&(1<<i));
        const dist=Array.from({length:4},(_,a)=>Array.from({length:4},(_,b)=>a===b?0:Infinity));
        for(const [a,b] of edges) {dist[a][b]=1;dist[b][a]=1;}
        for(let k=0;k<4;k++) for(let a=0;a<4;a++) for(let b=0;b<4;b++) dist[a][b]=Math.min(dist[a][b],dist[a][k]+dist[k][b]);
        for(let start=0;start<4;start++) for(let end=0;end<4;end++) equal(graphDistance(4,edges,start,end),Number.isFinite(dist[start][end])?dist[start][end]:-1);
        const seen=new Set();
        let groups=0;
        for(let node=0;node<4;node++) {
          if(seen.has(node)) continue;
          groups++;
          for(let other=0;other<4;other++) if(Number.isFinite(dist[node][other])) seen.add(other);
        }
        equal(countNetworks(4,edges),groups);
      }
      equal(countNetworks(0,[]),0);
      equal(graphDistance(1,[],0,0),0);
    `);
  });
});
