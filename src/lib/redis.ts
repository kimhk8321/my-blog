import { Redis } from "@upstash/redis";

// 환경변수가 설정돼 있을 때만 클라이언트를 만든다.
// 없으면 null → 조회수 기능이 조용히 비활성화(저장소 없이도 빌드·실행 가능).
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

/** 조회수 랭킹을 담는 Sorted Set. 글마다 점수(조회수)를 들고 있어 정렬이 공짜다. */
export const RANK_KEY = "views:rank";
