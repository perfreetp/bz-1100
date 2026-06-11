import React, { useState, useEffect } from 'react';
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
import styles from './index.module.scss';

const WorkDetailPage: React.FC = () => {
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const workId = routerParams?.id || '';

  const {
    getWork,
    toggleLike,
    toggleCollect,
    toggleFollow,
    isFollowing,
    blockUser,
    currentUser,
    addHistory
  } = useAppStore();

  const work = getWork(workId);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    if (work) {
      setLiked(!!work.isLiked);
      setCollected(!!work.isCollected);
      setFollowed(isFollowing(work.author.id));
      Taro.setNavigationBarTitle({ title: work.title || '作品详情' });

      addHistory({
        id: `h-${Date.now()}`,
        postId: work.id,
        post: work,
        viewedAt: new Date().toISOString()
      });
    }
  }, [workId, work, isFollowing, addHistory]);

  useDidShow(() => {
    if (work) {
      setLiked(!!work.isLiked);
      setCollected(!!work.isCollected);
      setFollowed(isFollowing(work.author.id));
    }
  });

  const handleLike = () => {
    if (!work) return;
    toggleLike('work', work.id);
    setLiked(!liked);
  };

  const handleCollect = () => {
    if (!work) return;
    toggleCollect('work', work.id);
    setCollected(!collected);
    Taro.showToast({ title: collected ? '已取消收藏' : '已收藏', icon: 'none' });
  };

  const handleShare = () => {
    console.log('[WorkDetail] 分享作品:', workId);
    Taro.showToast({ title: '分享功能', icon: 'none' });
  };

  const handleFollow = () => {
    if (!work) return;
    toggleFollow(work.author.id);
    const newFollowed = !followed;
    setFollowed(newFollowed);
    Taro.showToast({ title: newFollowed ? '关注成功' : '已取消关注', icon: 'none' });
  };

  const handleComment = () => {
    console.log('[WorkDetail] 评论作品:', workId);
    Taro.showToast({ title: '评论功能', icon: 'none' });
  };

  const handleMore = () => {
    if (!work) return;
    Taro.showActionSheet({
      itemList: ['举报内容', '屏蔽用户', '复制链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '举报已提交', icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.showModal({
            title: '屏蔽用户',
            content: `确定要屏蔽 ${work.author.name} 吗？`,
            confirmColor: '#EF4444',
            success: (r) => {
              if (r.confirm) {
                blockUser(work.author.id);
                Taro.showToast({ title: '已屏蔽', icon: 'success' });
              }
            }
          });
        } else if (res.tapIndex === 2) {
          Taro.setClipboardData({ data: `https://aichuangyi.com/work/${work.id}` });
        }
      },
      fail: () => {}
    });
  };

  const handleImagePreview = (current: string) => {
    if (!work?.images) return;
    Taro.previewImage({
      current,
      urls: work.images
    });
  };

  if (!work) {
    return (
      <View className={styles.container} style={{ paddingTop: 200 }}>
        <EmptyState icon="😕" title="作品不存在或已被删除" desc="去看看其他精彩内容吧" />
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
          <UserAvatar src={work.author.avatar} size="lg" />
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{work.author.name}</Text>
            <Text className={styles.authorDesc}>{formatTime(work.createdAt)}</Text>
          </View>
          {work.author.id !== currentUser?.id && (
            <View
              className={classnames(styles.followBtn, followed && styles.followed)}
              onClick={handleFollow}
            >
              <Text>{followed ? '已关注' : '关注'}</Text>
            </View>
          )}
        </View>

        <View className={styles.content}>
          <Text className={styles.title}>{work.title}</Text>
          <Text className={styles.desc}>{work.description}</Text>

          {work.images && work.images.length > 0 && (
            <View className={styles.imageList}>
              {work.images.map((img, idx) => (
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

          {work.modelTags && work.modelTags.length > 0 && (
            <View className={styles.tags}>
              {work.modelTags.map(tag => (
                <ModelTag key={tag.id} name={tag.name} />
              ))}
            </View>
          )}

          {work.topics && work.topics.length > 0 && (
            <View className={styles.topics}>
              {work.topics.map(topic => (
                <TopicTag key={topic.id} name={topic.name} />
              ))}
            </View>
          )}

          {work.prompt && (
            <View className={styles.promptSection}>
              <Text className={styles.sectionTitle}>💡 提示词</Text>
              <View className={styles.promptBlock}>
                <Text className={styles.promptText}>{work.prompt}</Text>
              </View>
            </View>
          )}

          {work.process && (
            <View className={styles.processSection}>
              <Text className={styles.sectionTitle}>🎨 创作过程</Text>
              <Text className={styles.processText}>{work.process}</Text>
            </View>
          )}
        </View>

        <View className={styles.stats}>
          <Text className={styles.statItem}>❤️ {formatNumber(work.likes)} 点赞</Text>
          <Text className={styles.statItem}>💬 {formatNumber(work.comments)} 评论</Text>
          <Text className={styles.statItem}>🔗 {formatNumber(work.shares)} 转发</Text>
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
          likeCount={work.likes}
          commentCount={work.comments}
          shareCount={work.shares}
          collectCount={work.collects}
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
