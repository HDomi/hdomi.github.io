import { defineEventHandler, createError, getRouterParam } from "h3";
import { fetchFromFirebase } from "../../utils/firebase";

interface FirebasePost {
  uuid: string;
  title: string;
  summary?: string;
  content?: string;
  createdAt: string;
  tags?: Record<string, boolean> | string[];
}

interface PostDetail {
  uuid: string;
  title: string;
  summary: string;
  content: string;
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

export default defineEventHandler(async (event): Promise<PostDetail> => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing post ID",
    });
  }

  try {
    const rawPosts = await fetchFromFirebase<Record<string, FirebasePost>>("/posts.json");
    if (!rawPosts) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    // uuid가 일치하는 포스트 검색
    const post = Object.values(rawPosts).find((p): p is FirebasePost => !!(p && p.uuid === id));
    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    return {
      uuid: post.uuid,
      title: post.title,
      summary: post.summary || "",
      content: post.content || "",
      createdAt: post.createdAt,
      tags: formatTags(post.tags),
    };
  } catch (error: any) {
    console.error(`[API post detail] Error for ${id}:`, error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to fetch post detail",
    });
  }
});
