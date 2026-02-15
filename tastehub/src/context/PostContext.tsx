'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Post, Engagement } from '@/types';
import { useSession } from 'next-auth/react';

interface PostContextType {
  posts: Post[];
  loading: boolean;
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  updateEngagement: (id: string, engagement: Engagement) => Promise<void>;
  getPostsByDate: (date: string) => Post[];
  getPostsByPlatform: (platform: string) => Post[];
  refreshPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchPosts = useCallback(async () => {
    if (!session?.user) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (post: Omit<Post, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts((prev) => [newPost, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updates } : post))
    );
    try {
      await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update post:', error);
      fetchPosts(); // revert on error
    }
  };

  const deletePost = async (id: string) => {
    // Optimistic delete
    const prev = posts;
    setPosts((p) => p.filter((post) => post.id !== id));
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setPosts(prev); // revert
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      setPosts(prev); // revert
    }
  };

  const updateEngagement = async (id: string, engagement: Engagement) => {
    // Optimistic
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, engagement } : post))
    );
    try {
      await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagement }),
      });
    } catch (error) {
      console.error('Failed to update engagement:', error);
      fetchPosts();
    }
  };

  const getPostsByDate = (date: string) => {
    return posts.filter((post) => post.date === date);
  };

  const getPostsByPlatform = (platform: string) => {
    return posts.filter((post) => post.platform === platform);
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        addPost,
        updatePost,
        deletePost,
        updateEngagement,
        getPostsByDate,
        getPostsByPlatform,
        refreshPosts: fetchPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
