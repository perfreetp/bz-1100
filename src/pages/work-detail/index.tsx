import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { formatNumber, formatTime } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import ModelTag from '@/components/ModelTag';
import TopicTag from '@/components/TopicTag';
import ActionBar from '@/components/ActionBar';
import CommentItem from '@/components/CommentItem';
import EmptyState from '@/components/EmptyState';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import type { Post, Work, User } from '@/types';
import styles from './index.module.scss';

interface UnifiedContent {
  id: string;
  type: 'work' | 'prompt';
  author: User;
  title?: string;
  description: string;
  cover?: string;
  images?: string[];
  modelTags?: any[];
  topics?: any[];
  prompt?: string;
  process?: string;
  likes: number;
  comments: number;
  shares: number;
  collects: number;
  isLiked?: boolean;
  isCollected?: boolean;
  createdAt: string;
}

const WorkDetailPage: React.FC = () => {
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const workId = routerParams?.id || '';

  const {
    getWork,
    getPost,
    toggleLike,
    toggleCollect,
    toggleFollow,
    isFollowing,
    blockUser,
    currentUser,
    addHistory
  } = useAppStore();

  const user: User = currentUser || defaultCurrentUser;

  const content = useMemo((): UnifiedContent | null => {
    const work = getWork(workId);
    if (work) {
      return {
        id: work.id,
        type: 'work',
        author: work.author,
        title: work.title,
        description: work.description,
        cover: work.cover,
        images: work.images,
        modelTags: work.modelTags,
        topics: work.topics,
        prompt: work.prompt,
        process: work.process,
        likes: work.likes ?? 0,
        comments: work.comments ?? 0,
        shares: work.shares ?? 0,
        collects: work.collects ?? 0,
        isLiked: work.isLiked,
        isCollected: work.isCollected,
        createdAt: work.createdAt
      };
    }

    const post = getPost(workId);
    if (post && post.type !== 'qa') {
      return {
        id: post.id,
        type: 'prompt',
        author: post.author,
        title: post.title,
        description: post.content,
        images: post.images,
        modelTags: post.modelTags,
        topics: post.topics,
        likes: post.likes ?? 0,
        comments: post.comments ?? 0,
        shares: post.shares ?? 0,
        collects: post.collects ?? 0,
        isLiked: post.isLiked,
        isCollected: post.isCollected,
        createdAt: post.createdAt
      };
    }

    return null;
  }, [workId, getWork, getPost]);

  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    if (content) {
      setLiked(!!content.isLiked);
      setCollected(!!content.isCollected);
      setFollowed(isFollowing(content.author.id));
      Taro.setNavigationBarTitle({
        title: content.title || (content.type === 'work' ? '作品详情' : '动态详情')
      });

      const historyPost = {
        id: content.id,
        type: content.type === 'work' ? 'work' : 'prompt',
        author: content.author,
        title: content.title,
        content: content.description,
        images: content.images,
        modelTags: content.modelTags,
        topics: content.topics,
        likes: content.likes,
        comments: content.comments,
        shares: content.shares,
        collects: content.collects,
        isLiked: content.isLiked,
        isCollected: content.isCollected,
        createdAt: content.createdAt
      } as Post;

      addHistory({
        id: `h-${Date.now()}`,
        postId: content.id,
        post: historyPost,
        viewedAt: new Date().toISOString()
      });
    }
  }, [workId, content, isFollowing, addHistory]);

  useDidShow(() => {
    if (content) {
      setLiked(!!content.isLiked);
      setCollected(!!content.isCollected);
      setFollowed(isFollowing(content.author.id));
    }
  });

  const handleLike = () => {
    if (!content) return;
    const likeType = content.type === 'work' ? 'work' : 'post';
    toggleLike(likeType, content.id);
    setLiked(!liked);
  };

  const handleCollect = () => {
    if (!content) return;
    const collectType = content.type === 'work' ? 'work' : 'post';
    toggleCollect(collectType, content.id);
    setCollected(!collected);
    Taro.showToast({ title: collected ? '已取消收藏' : '已收藏', icon: 'none' });
  };

  const handleShare = () => {
    console.log('[WorkDetail] 分享:', workId);
    Taro.showToast({ title: '分享功能', icon: 'none' });
  };

  const handleFollow = () => {
    if (!content) return;
    toggleFollow(content.author.id);
    const newFollowed = !followed;
    setFollowed(newFollowed);
    Taro.showToast({ title: newFollowed ? '关注成功' : '已取消关注', icon: 'none' });
  };

  const handleComment = () => {
    console.log('[WorkDetail] 评论:', workId);
    Taro.showToast({ title: '评论功能', icon: 'none' });
  };

  const handleMore = () => {
    if (!content) return;
    Taro.showActionSheet({
      itemList: ['举报内容', '屏蔽用户', '复制链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '举报已提交', icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.showModal({
            title: '屏蔽用户',
            content: `确定要屏蔽 ${content.author.name} 吗？`,
            confirmColor: '#EF4444',
            success: (r) => {
              if (r.confirm) {
                blockUser(content.author.id);
                Taro.showToast({ title: '已屏蔽', icon: 'success' });
              }
            }
          });
        } else if (res.tapIndex === 2) {
          Taro.setClipboardData({ data: `https://aichuangyi.com/content/${content.id}` });
        }
      },
      fail: () => {}
    });
  };

  const handleImagePreview = (current: string) => {
    if (!content?.images) return;
    Taro.previewImage({
      current,
      urls: content.images
    });
  };

  const handleTopicClick = (topicId: string, e: any) => {
    e?.stopPropagation?.();
    Taro.navigateTo({ url: `/pages/topic-detail/index?id=${topicId}` });
  };

  if (!content) {
    return (
      <View className={styles.container} style={{ paddingTop: 200 }}>
        <EmptyState icon="😕" title="内容不存在或已被删除" desc="去看看其他精彩内容吧" />
      </View>
    );
  }

  const comments = [
    {
      id: 'c1',
      author: { id: 'u2', name: '设计达人', avatar: 'https://picsum.photos/id/65/200/200' },
      content: '这个prompt太棒了！我也试一下',
      likes: 23,
      isLiked: false,
      createdAt: '2025-01-10T10:30:00Z'
    },
    {
      id: 'c2',
      author: { id: 'u3', name: '创意新人', avatar: 'https://picsum.photos/id/66/200/200' },
      content: '请问是用的哪个checkpoint？效果真的赞',
      likes: 8,
      isLiked: true,
      createdAt: '2025-01-10T09:15:00Z'
    }
  ];

  return (
    <View className={styles.container}>
      <ScrollView scrollY className={styles.scroll}>
        <View className={styles.authorBar}>
          <UserAvatar src={content.author?.avatar || ''} size="lg" />
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{content.author?.name || '匿名用户'}</Text>
            <Text className={styles.authorDesc}>{formatTime(content.createdAt)}</Text>
          </View>
          {content.author?.id !== user.id && (
            <View
              className={classnames(styles.followBtn, followed && styles.followed)}
              onClick={handleFollow}
            >
              <Text>{followed ? '已关注' : '关注'}</Text>
            </View>
          )}
        </View>

        <View className={styles.content}>
          {content.title && <Text className={styles.title}>{content.title}</Text>}
          <Text className={styles.desc}>{content.description || '暂无描述'}</Text>

          {content.images && content.images.length > 0 && (
            <View className={styles.imageList}>
              {content.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  mode="widthFix"
                  className={styles.imageItem}
                  onClick={() => handleImagePreview(img)}
                  onError={(e) => console.error('[WorkDetail] 图片加载失败:', e)}
                />
              ))}
            </View>
          )}

          {content.modelTags && content.modelTags.length > 0 && (
            <View className={styles.tags}>
              {content.modelTags.map(tag => (
                <ModelTag key={tag.id} name={tag.name} />
              ))}
            </View>
          )}

          {content.topics && content.topics.length > 0 && (
            <View className={styles.topics}>
              {content.topics.map(topic => (
                <TopicTag
                  key={topic.id}
                  name={topic.name}
                  onClick={(e) => handleTopicClick(topic.id, e)}
                />
              ))}
            </View>
          )}

          {content.prompt && (
            <View className={styles.promptSection}>
              <Text className={styles.sectionTitle}>💡 提示词</Text>
              <View className={styles.promptBlock}>
                <Text className={styles.promptText}>{content.prompt}</Text>
              </View>
            </View>
          )}

          {content.process && (
            <View className={styles.processSection}>
              <Text className={styles.sectionTitle}>🎨 创作过程</Text>
              <Text className={styles.processText}>{content.process}</Text>
            </View>
          )}
        </View>

        <View className={styles.stats}>
          <Text className={styles.statItem}>❤️ {formatNumber(content.likes || 0)} 点赞</Text>
          <Text className={styles.statItem}>💬 {formatNumber(content.comments || 0)} 评论</Text>
          <Text className={styles.statItem}>🔗 {formatNumber(content.shares || 0)} 转发</Text>
        </View>

        <View className={styles.comments}>
          <Text className={styles.sectionTitle}>💬 评论 ({comments.length})</Text>
          {comments.map(comment => (
            <CommentItem key={comment.id} data={comment} />
          ))}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.commentInput} onClick={handleComment}>
          <Text className={styles.inputIcon}>💬</Text>
          <Text className={styles.inputText}>说点什么...</Text>
        </View>
        <ActionBar
          likes={content.likes || 0}
          comments={content.comments || 0}
          shares={content.shares || 0}
          collects={content.collects || 0}
          isLiked={liked}
          isCollected={collected}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onCollect={handleCollect}
          compact
        />
        <View className={styles.moreBtn} onClick={handleMore}>
          <Text>⋯</Text>
        </View>
      </View>
    </View>
  );
};

export default WorkDetailPage;
