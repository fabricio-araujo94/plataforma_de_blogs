"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialUserLiked: boolean;
}

export function LikeButton({
  postId,
  initialLikes,
  initialUserLiked,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialUserLiked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchLikeStatus() {
      try {
        const res = await api.get(`/posts/${postId}/likes`);
        setLikes(res.data.totalLikes);
        setIsLiked(res.data.userLiked);
      } catch (err) {
        console.error("Error fetching likes: ", err);
      }
    }
    fetchLikeStatus();
  }, [postId]);

  async function handleToggleLike() {
    if (isLoading) return;

    const prevLiked = isLiked;
    const prevLikes = likes;

    setIsLiked(!prevLiked);
    setLikes((prev) => (prevLiked ? prev - 1 : prev + 1));
    setIsLoading(true);

    try {
      const res = await api.post(`/posts/${postId}/like`);

      setIsLiked(res.data.liked);
      setLikes(res.data.totalLikes);
    } catch (err) {
      const error = err as AxiosError;

      setIsLiked(prevLiked);
      setLikes(prevLikes);

      if (error.response?.status === 401) {
        alert("You need to log in to like this post.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
        isLiked
          ? "bg-blue-50 text-blue-600 border border-blue-200"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isLiked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      {likes} {likes === 1 ? "Gosto" : "Gostos"}
    </button>
  );
}
