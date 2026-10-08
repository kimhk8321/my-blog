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

function verify(index: number, checks: string, prelude = "") {
  vm.runInNewContext(`${prelude}\n${code(slugs[index - 1])}\n${checks}`, {
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

  it("hash lookup agrees with pair enumeration and preserves multiplicities", () => {
    verify(1, `
      for (const nums of [[], [3], [3,3], [0,-2,2,0], [1,5,1,-3]]) {
        for (let target = -5; target <= 8; target++) {
          const actual = twoSum(nums, target);
          const baseline = twoSumSlow(nums, target);
          equal(actual === null, baseline === null);
          if (actual) {
            ok(actual[0] !== actual[1]);
            equal(nums[actual[0]] + nums[actual[1]], target);
          }
        }
      }
      equal(sameCounts([1,1,2], [1,2,2]), false);
      equal(sameCounts([], []), true);
      equal(sameCounts([0,-1,0], [0,0,-1]), true);
    `);
  });

  it("stack and queue handle empty, repeated, and ordered inputs", () => {
    verify(2, `
      for (const [text, expected] of [["",true],["([{}])",true],[")(",false],["([)]",false],["((",false]]) equal(isBalanced(text), expected);
      for (const nums of [[], [1], [1,1,1], [4,3,2,1], [1,2,3,4], [-3,-1,-2,0]]) {
        const expected = nums.map((value, i) => nums.slice(i + 1).find((other) => other > value) ?? -1);
        equal(nextGreater(nums), expected);
      }
      const testedQueue = new Queue();
      equal(testedQueue.dequeue(), undefined);
      for (let i = 0; i < 100; i++) testedQueue.enqueue(i);
      for (let i = 0; i < 100; i++) equal(testedQueue.dequeue(), i);
      equal(testedQueue.size, 0);
    `);
  });

  it("window and prefix sums match all subarrays on signed inputs", () => {
    verify(3, `
      for (let mask = 0; mask < 81; mask++) {
        let number = mask;
        const nums = Array.from({length:4}, () => {const value = number % 3 - 1; number = Math.floor(number / 3); return value;});
        for (let k = 1; k <= 4; k++) {
          const sums = Array.from({length:5-k}, (_, i) => nums.slice(i,i+k).reduce((a,b)=>a+b,0));
          equal(maxWindowSum(nums,k), Math.max(...sums));
        }
        for (let target = -2; target <= 2; target++) {
          let count = 0;
          for (let i = 0; i < 4; i++) for (let j = i + 1; j <= 4; j++) if (nums.slice(i,j).reduce((a,b)=>a+b,0) === target) count++;
          equal(countTargetSubarrays(nums,target), count);
        }
        const positive = nums.map((n)=>n+2);
        for (let target = 1; target <= 13; target++) {
          let best = Infinity;
          for (let i = 0; i < 4; i++) for (let j = i + 1; j <= 4; j++) if (positive.slice(i,j).reduce((a,b)=>a+b,0) >= target) best = Math.min(best,j-i);
          equal(minSubarrayLength(positive,target), best === Infinity ? 0 : best);
        }
      }
      equal(maxWindowSum([],1), null);
      equal(maxWindowSum([1],0), null);
      equal(minSubarrayLength([1,-1,5],5), 3);
      for (const nums of [[],[3],[3,3],[-3,0,2,4,7]]) for (let target=-5;target<=15;target++) {
        let possible=false;
        for(let a=0;a<nums.length;a++) for(let b=a+1;b<nums.length;b++) if(nums[a]+nums[b]===target) possible=true;
        const pair=twoSumSorted(nums,target);
        equal(pair!==null,possible);
        if(pair) {ok(pair[0]<pair[1]);equal(nums[pair[0]]+nums[pair[1]],target);}
      }
    `);
  });

  it("binary boundaries and minimum shipping capacity match linear search", () => {
    verify(4, `
      for (const nums of [[],[1],[2,2,2],[-3,-1,0,0,7]]) for (let t=-4;t<=9;t++) {
        const lower = nums.findIndex((n)=>n>=t);
        const upper = nums.findIndex((n)=>n>t);
        equal(lowerBound(nums,t), lower === -1 ? nums.length : lower);
        equal(upperBound(nums,t), upper === -1 ? nums.length : upper);
      }
      for (const weights of [[1],[1,2,3,4,5],[5,1,5,2],[2,2,2]]) for (let days=1;days<=6;days++) {
        let expected = Math.max(...weights);
        for (; expected <= weights.reduce((a,b)=>a+b,0); expected++) {
          let used=1, load=0;
          for (const weight of weights) {if (load+weight>expected) {used++; load=0;} load+=weight;}
          if (used<=days) break;
        }
        equal(minShipCapacity(weights,days),expected);
      }
      equal(minShipCapacity([],1),0);
    `);
  });

  it("BFS matches repeated edge relaxation on every 2x3 wall pattern", () => {
    verify(5, `
      for (let mask=0;mask<64;mask++) {
        const cells=Array.from({length:6},(_,i)=>(mask>>i)&1);
        const testedGrid=[cells.slice(0,3),cells.slice(3)];
        const dist=Array(6).fill(Infinity);
        if (!cells[0]) dist[0]=0;
        for (let round=0;round<6;round++) for (let a=0;a<6;a++) for (let b=0;b<6;b++) {
          const adjacent=Math.abs(Math.floor(a/3)-Math.floor(b/3))+Math.abs(a%3-b%3)===1;
          if (!cells[a] && !cells[b] && adjacent) dist[b]=Math.min(dist[b],dist[a]+1);
        }
        equal(shortestGridPath(testedGrid),Number.isFinite(dist[5])?dist[5]:-1);
      }
      equal(shortestGridPath([[0]]),0);
      equal(shortestGridPath([]),-1);
      equal(countComponents(5,[[0,1],[1,2],[3,4]]),2);
      equal(countComponents(3,[]),3);
      equal(countComponents(0,[]),0);
    `);
  });

  it("backtracking returns distinct complete solutions", () => {
    verify(6, `
      for (let target=0;target<=8;target++) {
        const expected=[];
        for (let ones=0;ones<=target;ones++) for (let twos=0;twos<=target;twos++) for (let threes=0;threes<=target;threes++) {
          if (ones+twos*2+threes*3===target) expected.push([...Array(ones).fill(1),...Array(twos).fill(2),...Array(threes).fill(3)]);
        }
        const normalize=(list)=>list.map((item)=>JSON.stringify(item)).sort();
        equal(normalize(combinationSum([3,1,2,2],target)),normalize(expected));
      }
      equal(uniquePermutations([1,1,2]),[[1,1,2],[1,2,1],[2,1,1]]);
      equal(uniquePermutations([1,1,1]),[[1,1,1]]);
      equal(uniquePermutations([]),[[]]);
      equal(combinationSum([2],3),[]);
    `);
  });

  it("meeting greedy matches exhaustive subsets and coin greedy exposes its counterexample", () => {
    verify(7, `
      const pool=[[0,4],[3,5],[4,8],[8,9],[1,2],[2,6]];
      for (let mask=0;mask<64;mask++) {
        const meetings=pool.filter((_,i)=>mask&(1<<i));
        let best=0;
        for (let subset=0;subset<(1<<meetings.length);subset++) {
          const chosen=meetings.filter((_,i)=>subset&(1<<i)).sort((a,b)=>a[0]-b[0]);
          if (chosen.every((m,i)=>i===0||m[0]>=chosen[i-1][1])) best=Math.max(best,chosen.length);
        }
        equal(selectMeetings(meetings).length,best);
      }
      equal(greedyCoinCount([1,3,4],6),3);
      equal(greedyCoinCount([3,4],6),-1);
    `);
  });

  it("DP agrees with a shortest-state search and subset knapsack", () => {
    verify(8, `
      for (const coins of [[],[2],[1,3,4],[2,5]]) for (let amount=0;amount<=15;amount++) {
        const queue=[[0,0]], visited=new Set([0]);
        let expected=-1;
        for (let head=0;head<queue.length;head++) {
          const [value,count]=queue[head];
          if (value===amount) {expected=count;break;}
          for (const coin of coins) if (value+coin<=amount&&!visited.has(value+coin)) {visited.add(value+coin);queue.push([value+coin,count+1]);}
        }
        equal(minCoins(coins,amount),expected);
      }
      const items=[{weight:2,value:3},{weight:3,value:4},{weight:4,value:5},{weight:1,value:1}];
      for (let capacity=0;capacity<=10;capacity++) {
        let best=0;
        for (let mask=0;mask<16;mask++) {
          let weight=0,value=0;
          items.forEach((item,i)=>{if (mask&(1<<i)) {weight+=item.weight;value+=item.value;}});
          if (weight<=capacity) best=Math.max(best,value);
        }
        equal(knapsack01(items,capacity),best);
      }
      equal(knapsack01([{weight:2,value:3}],4),3);
    `);
  });

  it("heap interleaving and top-k match a sorted model", () => {
    verify(9, `
      for (const direction of [1,-1]) {
        const testedHeap=new BinaryHeap((a,b)=>direction*(a-b));
        const model=[];
        for (let i=0;i<200;i++) {
          if (i%3!==2) {const value=(i*17)%31-15;testedHeap.push(value);model.push(value);}
          else {model.sort((a,b)=>direction*(a-b));equal(testedHeap.pop(),model.shift());}
          model.sort((a,b)=>direction*(a-b));
          equal(testedHeap.peek(),model[0]);equal(testedHeap.size,model.length);
        }
        while(model.length) equal(testedHeap.pop(),model.shift());
        equal(testedHeap.pop(),undefined);
      }
      for (let k=0;k<10;k++) equal(largestK([4,1,7,7,2,9],k),[9,7,7,4,2,1].slice(0,k));
    `);
  });

  it("graph distances match Floyd-Warshall, orders respect dependencies, and MST matches subsets", () => {
    verify(10, `
      for (let seed=0;seed<20;seed++) {
        const edges=[];
        for (let a=0;a<4;a++) for (let b=0;b<4;b++) if (a!==b&&(a*7+b*3+seed)%3) edges.push([a,b,(a*11+b*5+seed)%9]);
        const dist=Array.from({length:4},(_,a)=>Array.from({length:4},(_,b)=>a===b?0:Infinity));
        for (const [a,b,w] of edges) dist[a][b]=Math.min(dist[a][b],w);
        for (let k=0;k<4;k++) for (let a=0;a<4;a++) for (let b=0;b<4;b++) dist[a][b]=Math.min(dist[a][b],dist[a][k]+dist[k][b]);
        for (let start=0;start<4;start++) {
          const actual=dijkstra(4,edges,start);
          for(let end=0;end<4;end++) ok(actual[end]===dist[start][end]);
        }
      }
      const dependencies=[[0,2],[1,2],[2,3]];
      const result=topologicalOrder(5,dependencies);
      equal(result.length,5);
      for(const [a,b] of dependencies) ok(result.indexOf(a)<result.indexOf(b));
      equal(topologicalOrder(2,[[0,1],[1,0]]),null);
      equal(topologicalOrder(0,[]),[]);
      const connections=[[0,1,3],[0,2,-1],[0,3,4],[1,2,2],[1,3,1],[2,3,5]];
      let best=Infinity;
      for(let mask=0;mask<64;mask++) {
        const selected=connections.filter((_,i)=>mask&(1<<i));
        if(selected.length!==3) continue;
        const reached=new Set([0]);
        for(let round=0;round<4;round++) for(const [a,b] of selected) {if(reached.has(a)) reached.add(b);if(reached.has(b)) reached.add(a);}
        if(reached.size===4) best=Math.min(best,selected.reduce((sum,e)=>sum+e[2],0));
      }
      equal(minimumSpanningCost(4,connections),best);
      equal(minimumSpanningCost(3,[[0,1,2]]),null);
      equal(minimumSpanningCost(1,[]),0);
    `, code(slugs[8]));
  });
});
