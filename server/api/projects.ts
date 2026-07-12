import { defineEventHandler, createError } from "h3";
import { fetchFromFirebase } from "../utils/firebase";

interface FirebaseProject {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  tags: string[];
  scrapedAt: string;
  success: boolean;
  error?: string;
}

export default defineEventHandler(async (event): Promise<FirebaseProject[]> => {
  try {
    const rawProjects = await fetchFromFirebase<
      Record<string, FirebaseProject> | FirebaseProject[]
    >("/projects.json");
    if (!rawProjects) return [];

    // 객체 형태로 수신된 경우 배열로 변환
    const projectsList: FirebaseProject[] = Array.isArray(rawProjects)
      ? rawProjects
      : Object.values(rawProjects);

    // success가 false가 아닌 정상 항목만 필터링하여 반환
    return projectsList.filter((p): p is FirebaseProject => !!(p && p.success !== false));
  } catch (error: any) {
    console.error("[API projects] Error:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch projects from Firebase",
    });
  }
});
