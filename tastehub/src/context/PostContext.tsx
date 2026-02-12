'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, Engagement } from '@/types';

interface PostContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  updateEngagement: (id: string, engagement: Engagement) => void;
  getPostsByDate: (date: string) => Post[];
  getPostsByPlatform: (platform: string) => Post[];
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  // Load posts from localStorage on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('tastehub-posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Add sample posts for demo
      const samplePosts: Post[] = [
        {
          id: '1',
          title: 'New Recipe Launch',
          description: 'Introducing our new summer salad recipe! Fresh ingredients, amazing taste.',
          platform: 'instagram',
          date: new Date().toISOString().split('T')[0],
          status: 'scheduled',
          engagement: { likes: 245, comments: 32, shares: 18, reach: 1520 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Customer Spotlight',
          description: 'Thank you @foodlover123 for sharing your amazing creation with our products!',
          platform: 'twitter',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Weekend Special Offer',
          description: 'Get 20% off all premium ingredients this weekend! Use code TASTEHUB20 at checkout.',
          platform: 'facebook',
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
      ];
      setPosts(samplePosts);
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('tastehub-posts', JSON.stringify(posts));
    }
  }, [posts]);

  const addPost = (post: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [...prev, newPost]);
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updates } : post))
    );
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const updateEngagement = (id: string, engagement: Engagement) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, engagement } : post))
    );
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
        addPost,
        updatePost,
        deletePost,
        updateEngagement,
        getPostsByDate,
        getPostsByPlatform,
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
