"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type CourseVideo = {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  position: number;
};

type Course = {
  id: string;
  title: string;
  cover_url: string | null;
  video_url?: Array<{ title: string; video_url: string; position: number }> | null;
  course_videos?: CourseVideo[];
};

export default function VideoPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const videoId = params.videoId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentVideo, setCurrentVideo] = useState<CourseVideo | null>(null);
  const [allVideos, setAllVideos] = useState<CourseVideo[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? null;

      if (!token) {
        setError("Connecte-toi pour accéder à cette vidéo.");
        setLoading(false);
        return;
      }

      // Vérifier l'accès au cours
      const accessRes = await fetch("/api/access", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const accessData = await accessRes.ok ? await accessRes.json() : [];
      const hasAccessGrant = accessData.some((a: { course_id: string }) => a.course_id === courseId);

      // Vérifier les commandes payées
      const ordersRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const hasPaidOrder = ordersData.some(
        (o: { course_id: string; status: string }) => o.course_id === courseId && o.status === "paid"
      );

      if (!hasAccessGrant && !hasPaidOrder) {
        setError("Tu n&apos;as pas accès à ce cours.");
        setLoading(false);
        return;
      }

      // Charger les infos du cours (qui contient video_url)
      const courseRes = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!courseRes.ok) {
        setError("Erreur chargement cours");
        setLoading(false);
        return;
      }

      const courses: Course[] = await courseRes.json();
      const foundCourse = courses.find((c) => c.id === courseId);
      if (!foundCourse) {
        setError("Cours non trouvé");
        setLoading(false);
        return;
      }
      setCourse(foundCourse);

      // Récupérer les vidéos depuis video_url (JSONB) et course_videos (table)
      let videosFromJson: Array<{ title: string; video_url: string; position: number }> = [];
      
      if (foundCourse.video_url) {
        if (Array.isArray(foundCourse.video_url)) {
          videosFromJson = foundCourse.video_url;
        } else if (typeof foundCourse.video_url === "string") {
          try {
            const parsed = JSON.parse(foundCourse.video_url);
            videosFromJson = Array.isArray(parsed) ? parsed : [];
          } catch {
            // Ignore les erreurs de parsing
          }
        }
      }
      
      const videosFromTable = foundCourse.course_videos || [];

      // Combiner les deux sources et créer un format unifié avec les mêmes IDs que l'espace client
      // Ne pas inclure les URLs pour les clients (elles seront chargées via l'API sécurisée)
      const allVideosData = [
        ...videosFromJson.map((v, index) => ({
          id: `json-${courseId}-vid-${index}`,
          course_id: courseId,
          title: v.title,
          video_url: "", // URL masquée, sera chargée via API sécurisée
          position: v.position ?? index,
        })),
        ...videosFromTable.map((v, index) => ({
          id: `table-${courseId}-${v.id}-${index}`,
          course_id: v.course_id,
          title: v.title,
          video_url: "", // URL masquée, sera chargée via API sécurisée
          position: v.position,
        })),
      ];

      // Supprimer les doublons basés sur l'ID (puisqu'on n'a plus les URLs)
      const uniqueVideos = allVideosData.filter((video, index, self) => 
        index === self.findIndex((v) => v.id === video.id)
      );

      // S'assurer que les IDs sont vraiment uniques
      const videosWithUniqueIds = uniqueVideos.map((video, finalIndex) => ({
        ...video,
        id: `${video.id}-idx${finalIndex}`,
      }));

      const sortedVideos = [...videosWithUniqueIds].sort((a, b) => a.position - b.position);
      setAllVideos(sortedVideos);

      // Chercher la vidéo par ID (qui peut être avec ou sans le suffixe -idx)
      const video = sortedVideos.find((v) => v.id === videoId || v.id.startsWith(videoId.split("-idx")[0]));
      if (!video) {
        setError("Vidéo non trouvée");
        setLoading(false);
        return;
      }

      setCurrentVideo(video);

      // Charger l'URL de la vidéo via l'API sécurisée
      const urlRes = await fetch(`/api/courses/${courseId}/video/${videoId}/url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        setVideoUrl(urlData.video_url);
      } else {
        setError("Impossible de charger l'URL de la vidéo");
      }

      setLoading(false);
    };

    checkAccessAndLoad();
  }, [courseId, videoId]);

  const getVimeoEmbedUrl = (url: string) => {
    // Si c'est déjà une URL Vimeo embed, la retourner telle quelle
    if (url.includes("player.vimeo.com")) return url;

    // Extraire l'ID Vimeo depuis différentes formats
    const vimeoIdMatch = url.match(/(?:vimeo\.com\/|vimeo\.com\/video\/)(\d+)/);
    if (vimeoIdMatch) {
      return `https://player.vimeo.com/video/${vimeoIdMatch[1]}?title=0&byline=0&portrait=0`;
    }

    // Si c'est une URL MP4 ou autre, retourner telle quelle
    return url;
  };

  if (loading) {
    return (
      <div className="layout-shell py-10">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="layout-shell py-10 space-y-4">
        <p className="text-red-600">{error || "Vidéo non trouvée"}</p>
        <Link href="/client" className="button-primary">
          Retour à l&apos;espace client
        </Link>
      </div>
    );
  }

  const currentIndex = allVideos.findIndex((v) => v.id === videoId);
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  return (
    <div className="layout-shell py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/client" className="text-sm text-neutral-600 hover:text-brand mb-2 inline-block">
            ← Retour à mes cours
          </Link>
          <h1 className="text-2xl font-semibold">{course?.title || "Cours"}</h1>
          <p className="text-lg font-medium mt-2">{currentVideo.title}</p>
        </div>
      </div>

      <div className="card p-4 md:p-6">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-neutral-200 bg-[#0f1016] shadow-md">
          {videoUrl ? (
            videoUrl.includes("vimeo.com") || videoUrl.includes("player.vimeo.com") ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={getVimeoEmbedUrl(videoUrl)}
                title={currentVideo.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="absolute inset-0 h-full w-full"
                controls
                src={videoUrl}
              >
                Ton navigateur ne supporte pas la lecture vidéo.
              </video>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              Chargement de la vidéo...
            </div>
          )}
        </div>
      </div>

      <div className="card p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4">Toutes les vidéos du cours</h2>
        <div className="grid gap-2">
          {allVideos.map((video, index) => (
            <Link
              key={video.id}
              href={`/course/${courseId}/video/${video.id}`}
              className={`p-3 rounded-lg border transition-colors ${
                video.id === videoId
                  ? "border-brand bg-brand/5"
                  : "border-neutral-200 hover:border-brand/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-neutral-500 w-8">{index + 1}</span>
                <span className="flex-1 font-medium">{video.title}</span>
                {video.id === videoId && (
                  <span className="text-xs bg-brand text-white px-2 py-1 rounded">En cours</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {(prevVideo || nextVideo) && (
        <div className="flex gap-3">
          {prevVideo && (
            <Link
              href={`/course/${courseId}/video/${prevVideo.id}`}
              className="button-secondary flex-1"
            >
              ← Vidéo précédente: {prevVideo.title}
            </Link>
          )}
          {nextVideo && (
            <Link
              href={`/course/${courseId}/video/${nextVideo.id}`}
              className="button-primary flex-1"
            >
              Vidéo suivante: {nextVideo.title} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

