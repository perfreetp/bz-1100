import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { mockTopics, topicCategories } from '@/data/topics';
import { formatCount } from '@/utils';
import styles from './index.module.scss';

const TopicPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [topics, setTopics] = useState(mockTopics);

  usePullDownRefresh(() => {
    console.log('[Topic] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const handleJoin = useCallback((topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        const newJoined = !t.isJoined;
        Taro.showToast({
          title: newJoined ? '已加入话题' : '已退出话题',
          icon: 'none'
        });
        return {
          ...t,
          isJoined: newJoined,
          membersCount: newJoined ? t.membersCount + 1 : t.membersCount - 1
        };
      }
      return t;
    }));
  }, []);

  const handleTopicClick = useCallback((topicId: string) => {
    console.log('[Topic] 点击话题:', topicId);
    Taro.navigateTo({ url: `/pages/topic-detail/index?id=${topicId}` });
  }, []);

  const myTopics = topics.filter(t => t.isJoined);
  const otherTopics = topics.filter(t => !t.isJoined);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>话题广场</Text>
        <Text className={styles.subtitle}>发现感兴趣的创作话题，与同好一起交流</Text>
      </View>

      <ScrollView className={styles.categories} scrollX enhanced showScrollbar={false}>
        {topicCategories.map((cat, idx) => (
          <View
            key={cat}
            className={classnames(styles.categoryItem, idx === activeCategory && styles.active)}
            onClick={() => setActiveCategory(idx)}
          >
            <Text>{cat}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY>
        {myTopics.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>💜</Text>
              我加入的话题
            </Text>
            <View className={styles.myTopics}>
              {myTopics.map(topic => (
                <View
                  key={topic.id}
                  className={styles.topicCard}
                  onClick={() => handleTopicClick(topic.id)}
                >
                  <View className={styles.coverWrap}>
                    <Image
                      className={styles.cover}
                      src={topic.cover}
                      mode="aspectFill"
                      onError={(e) => console.error('[Topic] 封面加载失败:', e)}
                    />
                  </View>
                  <View className={styles.info}>
                    <View>
                      <Text className={styles.topicName}>{topic.name}</Text>
                      <Text className={styles.topicDesc}>{topic.description}</Text>
                    </View>
                    <View className={styles.topicMeta}>
                      <Text className={styles.metaText}>
                        {formatCount(topic.postsCount)}帖子 · {formatCount(topic.membersCount)}成员
                      </Text>
                      <View
                        className={classnames(styles.joinBtn, topic.isJoined && styles.joined)}
                        onClick={(e) => handleJoin(topic.id, e)}
                      >
                        <Text>{topic.isJoined ? '已加入' : '加入'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🔥</Text>
            热门话题
          </Text>
          <View className={styles.topicGrid}>
            {otherTopics.map(topic => (
              <View
                key={topic.id}
                className={styles.gridItem}
                onClick={() => handleTopicClick(topic.id)}
              >
                <View className={styles.gridCover}>
                  <Image
                    className={styles.gridCoverImg}
                    src={topic.cover}
                    mode="aspectFill"
                    onError={(e) => console.error('[Topic] 封面加载失败:', e)}
                  />
                </View>
                <View className={styles.gridInfo}>
                  <Text className={styles.gridName}>{topic.name}</Text>
                  <Text className={styles.gridMeta}>
                    {formatCount(topic.postsCount)}帖子 · {formatCount(topic.membersCount)}成员
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TopicPage;
