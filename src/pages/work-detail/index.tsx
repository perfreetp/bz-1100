import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { formatNumber, formatTime } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import ModelTag from '@/components/ModelTag';
import TopicTag from '@/components/TopicTag';
import ActionBar from '@/components/ActionBar';
import EmptyState from '@/components/EmptyState';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import type { Post, Work, User, Comment } from '@/types';
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
    addHistory,
    getComments,
    addComment,
    toggleCommentLike,
    deleteComment
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
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [, setTick] = useState(0);

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

  useEffect(() => {
    if (content) {
      const targetType = content.type === 'work' ? 'work' : 'post';
      setCommentsList(getComments(content.id, targetType));
    }
  }, [workId, content, getComments]);

  useDidShow(() => {
    if (content) {
      setLiked(!!content.isLiked);
      setCollected(!!content.isCollected);
      setFollowed(isFollowing(content.author.id));
      const targetType = content.type === 'work' ? 'work' : 'post';
      setCommentsList(getComments(content.id, targetType));
    }
  });

  const handleLike = () => {
    if (!content) return;
    const likeType = content.type === 'work' ? 'work' : 'post';
    toggleLike(likeType, content.id);
    const newLiked = !liked;
    setLiked(newLiked);
    setTimeout(() => setTick(t => t + 1), 50);
  };

  const handleCollect = () => {
    if (!content) return;
    const collectType = content.type === 'work' ? 'work' : 'post';
    toggleCollect(collectType, content.id);
    setCollected(!collected);
    Taro.showToast({ title: collected ? '已取消收藏' : '已收藏', icon: 'none' });
    setTimeout(() => setTick(t => t + 1), 50);
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

  const handleCommentSend = () => {
    if (!content) return;
    const text = commentText.trim();
    if (!text) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    const targetType = content.type === 'work' ? 'work' : 'post';
    addComment(content.id, targetType, text, user);
    setCommentText('');
    setCommentsList(getComments(content.id, targetType));
    setTimeout(() => setTick(t => t + 1), 50);
    Taro.showToast({ title: '评论成功', icon: 'success' });
  };

  const handleCommentLike = (commentId: string) => {
    toggleCommentLike(commentId);
    if (content) {
      const targetType = content.type === 'work' ? 'work' : 'post';
      setCommentsList(getComments(content.id, targetType));
    }
  };

  const handleCommentDelete = (commentId: string) => {
    Taro.showModal({
      title: '删除评论',
      content: '确定要删除这条评论吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          const success = deleteComment(commentId, user.id);
          if (success) {
            if (content) {
              const targetType = content.type === 'work' ? 'work' : 'post';
              setCommentsList(getComments(content.id, targetType));
            }
            Taro.showToast({ title: '评论已删除', icon: 'none' });
          } else {
            Taro.showToast({ title: '只能删除自己的评论', icon: 'none' });
          }
        }
      }
    });
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
          <Text className={styles.statItem}>💬 {formatNumber(commentsList.length)} 评论</Text>
          <Text className={styles.statItem}>🔗 {formatNumber(content.shares || 0)} 转发</Text>
        </View>

        <View className={styles.comments}>
          <Text className={styles.sectionTitle}>💬 评论 ({commentsList.length})</Text>
          {commentsList.length > 0 ? (
            commentsList.map(c => (
              <View key={c.id} className={styles.commentItem}>
                <UserAvatar src={c.author?.avatar || ''} size="md" />
                <View className={styles.commentBody}>
                  <View className={styles.commentHead}>
                    <Text className={styles.commentAuthor}>
                      {c.author?.name || '匿名用户'}
                    </Text>
                    <Text className={styles.commentTime}>{formatTime(c.createdAt)}</Text>
                  </View>
                  <Text className={styles.commentContent}>{c.content}</Text>
                  <View className={styles.commentActions}>
                    <View
                      className={classnames(styles.commentAction, c.isLiked && styles.liked)}
                      onClick={() => handleCommentLike(c.id)}
                    >
                      <Text>{c.isLiked ? '❤️' : '🤍'}</Text>
                      <Text>{c.likes || 0}</Text>
                    </View>
                    {c.author.id === user.id && (
                      <View
                        className={styles.commentAction}
                        onClick={() => handleCommentDelete(c.id)}
                      >
                        <Text style={{ color: '#EF4444' }}>删除</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: 24 }}>还没有评论，快来发表第一条吧～</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Input
          className={styles.commentInput}
          placeholder="说点什么..."
          placeholderClass={styles.placeholder}
          value={commentText}
          onInput={(e) => setCommentText(e.detail.value)}
          onConfirm={handleCommentSend}
          confirmType="send"
        />
        <ActionBar
          likes={content.likes || 0}
          comments={commentsList.length}
          shares={content.shares || 0}
          collects={content.collects || 0}
          isLiked={liked}
          isCollected={collected}
          onLike={handleLike}
          onComment={() => {}}
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
