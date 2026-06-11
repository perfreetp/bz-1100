import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockTopics } from '@/data/topics';
import { mockPosts } from '@/data/posts';
import { formatCount } from '@/utils';
import PostCard from '@/components/PostCard';
import styles from './index.module.scss';

const TopicDetailPage: React.FC = () => {
  const topic = mockTopics[0];
  const [joined, setJoined] = useState(topic.isJoined);
  const [membersCount, setMembersCount] = useState(topic.membersCount);
  const posts = mockPosts.filter(p => p.topics?.some(t => t.id === topic.id) || true).slice(0, 5);

  const handleJoin = () => {
    const newJoined = !joined;
    setJoined(newJoined);
    setMembersCount(newJoined ? membersCount + 1 : membersCount - 1);
    Taro.showToast({
      title: newJoined ? '已加入话题' : '已退出话题',
      icon: 'none'
    });
  };

  const handlePost = () => {
    console.log('[TopicDetail] 发布到话题');
    Taro.switchTab({ url: '/pages/publish/index' });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.banner}>
          <Image
            className={styles.bannerImg}
            src={topic.cover}
            mode="aspectFill"
            onError={(e) => console.error('[TopicDetail] 封面加载失败:', e)}
          />
          <View className={styles.bannerOverlay}>
            <View className={styles.bannerContent}>
              <Text className={styles.topicName}>#{topic.name}</Text>
              <Text className={styles.topicMeta}>
                {formatCount(topic.postsCount)}帖子 · {formatCount(membersCount)}成员
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.infoSection}>
          <Text className={styles.desc}>{topic.description}</Text>
          <View className={styles.statsRow}>
            <View className={styles.stat}>
              <Text className={styles.statValue}>{formatCount(topic.postsCount)}</Text>
              <Text className={styles.statLabel}>帖子数</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.statValue}>{formatCount(membersCount)}</Text>
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
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
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
