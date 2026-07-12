import { defineEventHandler, createError } from "h3";
import { fetchFromFirebase } from "../utils/firebase";

interface FirebasePost {
  uuid: string;
  title: string;
  summary?: string;
  content?: string;
  createdAt: string;
  tags?: Record<string, boolean> | string[];
}

interface PostIndexItem {
  uuid: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
}

function formatTags(tags: FirebasePost["tags"]): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === "object") {
    return Object.entries(tags)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  }
  return [];
}

export default defineEventHandler(async (event): Promise<PostIndexItem[]> => {
  try {
    const rawPosts = await fetchFromFirebase<Record<string, FirebasePost>>("/posts.json");
    if (!rawPosts) return [];

    // 유효 포스트 필터링
    const postsList: FirebasePost[] = Object.values(rawPosts).filter(
      (p): p is FirebasePost => !!(p && p.uuid),
    );

    // 작성일 기준 내림차순 정렬
    postsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 메인 리스트 경량화를 위해 본문을 제외하고 목록 인덱스용 항목만 추출
    return postsList.map((post) => ({
      uuid: post.uuid,
      title: post.title,
      summary: post.summary || "",
      createdAt: post.createdAt,
      tags: formatTags(post.tags),
    }));
  } catch (error: any) {
    console.error("[API posts] Error:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch posts from Firebase",
    });
  }
});
