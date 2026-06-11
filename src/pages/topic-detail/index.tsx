import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { formatCount } from '@/utils';
import PostCard from '@/components/PostCard';
import EmptyState from '@/components/EmptyState';
import useAppStore from '@/store/useAppStore';
import styles from './index.module.scss';

const TopicDetailPage: React.FC = () => {
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const topicId = routerParams?.id || '';

  const { getTopic, toggleJoinTopic, isJoinedTopic, posts, addHistory } = useAppStore();

  const topic = getTopic(topicId);
  const [joined, setJoined] = useState(false);
  const [membersCount, setMembersCount] = useState(0);

  useEffect(() => {
    if (topic) {
      setJoined(isJoinedTopic(topic.id));
      setMembersCount(topic.membersCount);
      Taro.setNavigationBarTitle({ title: `#${topic.name}` });

      addHistory({
        id: `h-${Date.now()}`,
        postId: `topic-${topic.id}`,
        post: {
          id: topic.id,
          type: 'prompt',
          author: { id: 'system', name: topic.name, avatar: '' },
          title: topic.name,
          content: topic.description || '',
          images: topic.cover ? [topic.cover] : [],
          topics: [topic],
          likes: 0,
          comments: topic.postsCount,
          shares: 0,
          collects: 0,
          createdAt: new Date().toISOString()
        } as any,
        viewedAt: new Date().toISOString()
      });
    }
  }, [topicId, topic, isJoinedTopic, addHistory]);

  useDidShow(() => {
    if (topic) {
      setJoined(isJoinedTopic(topic.id));
      const t = getTopic(topic.id);
      if (t) setMembersCount(t.membersCount);
    }
  });

  const handleJoin = () => {
    if (!topic) return;
    toggleJoinTopic(topic.id);
    const newJoined = !joined;
    setJoined(newJoined);
    setMembersCount(newJoined ? membersCount + 1 : membersCount - 1);
    Taro.showToast({
      title: newJoined ? '已加入话题' : '已退出话题',
      icon: 'none'
    });
  };

  const handlePost = () => {
    console.log('[TopicDetail] 发布到话题:', topicId);
    Taro.switchTab({ url: '/pages/publish/index' });
  };

  const topicPosts = topic
    ? posts.filter(p => p.topics?.some(t => t.id === topic.id)).slice(0, 20)
    : [];

  if (!topic) {
    return (
      <View className={styles.container} style={{ paddingTop: 200 }}>
        <EmptyState icon="😕" title="话题不存在" desc="去看看其他精彩话题吧" />
      </View>
    );
  }

  const safeName = topic.name || '话题';
  const safeDesc = topic.description || '暂无话题描述';
  const safePostsCount = topic.postsCount || 0;
  const safeMembersCount = topic.membersCount || membersCount || 0;

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.banner}>
          <Image
            className={styles.bannerImg}
            src={topic.cover || ''}
            mode="aspectFill"
            onError={(e) => console.error('[TopicDetail] 封面加载失败:', e)}
          />
          <View className={styles.bannerOverlay}>
            <View className={styles.bannerContent}>
              <Text className={styles.topicName}>#{safeName}</Text>
              <Text className={styles.topicMeta}>
                {formatCount(safePostsCount)}帖子 · {formatCount(safeMembersCount)}成员
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.infoSection}>
          <Text className={styles.desc}>{safeDesc}</Text>
          <View className={styles.statsRow}>
            <View className={styles.stat}>
              <Text className={styles.statValue}>{formatCount(safePostsCount)}</Text>
              <Text className={styles.statLabel}>帖子数</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.statValue}>{formatCount(safeMembersCount)}</Text>
              <Text className={styles.statLabel}>成员数</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.statValue}>今日</Text>
              <Text className={styles.statLabel}>新增 {formatCount(128)}</Text>
            </View>
          </View>
        </View>

        <View className={styles.postsSection}>
          <Text className={styles.sectionTitle}>话题动态</Text>
          {topicPosts.length > 0 ? (
            topicPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <EmptyState icon="📭" title="暂无内容" desc="快来发布第一条动态吧" />
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handlePost}>
          <Text>发布内容</Text>
        </View>
        <View
          className={classnames(styles.primaryBtn, joined && styles.joined)}
          onClick={handleJoin}
        >
          <Text>{joined ? '已加入' : '+ 加入话题'}</Text>
        </View>
      </View>
    </View>
  );
};

export default TopicDetailPage;
