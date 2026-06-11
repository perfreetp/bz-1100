import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import classnames from 'classnames';
import { mockPosts, hotPosts } from '@/data/posts';
import { formatNumber } from '@/utils';
import PostCard from '@/components/PostCard';
import styles from './index.module.scss';

const tabs = ['推荐', '关注', '热门', '作品', '问答', '提示词'];

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false);

  usePullDownRefresh(() => {
    console.log('[Home] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'none' });
    }, 1000);
  });

  useReachBottom(() => {
    if (loading) return;
    console.log('[Home] 加载更多');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Taro.showToast({ title: '已加载全部', icon: 'none' });
    }, 1000);
  });

  const handleSearch = useCallback(() => {
    console.log('[Home] 点击搜索');
    Taro.showToast({ title: '搜索功能', icon: 'none' });
  }, []);

  const handleHotItemClick = useCallback((postId: string) => {
    console.log('[Home] 点击热榜:', postId);
    Taro.navigateTo({ url: `/pages/work-detail/index?id=${postId}` });
  }, []);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.topBar}>
          <Text className={styles.brand}>AI Creator Hub</Text>
        </View>

        <View className={styles.searchBar} onClick={handleSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索提示词、作品、用户...</Text>
        </View>

        <ScrollView className={styles.tabs} scrollX enhanced showScrollbar={false}>
          {tabs.map((tab, idx) => (
            <View
              key={tab}
              className={classnames(styles.tab, idx === activeTab && styles.activeTab)}
              onClick={() => setActiveTab(idx)}
            >
              <Text className={styles.tabText}>{tab}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className={styles.content}>
        {activeTab === 0 && (
          <View className={styles.hotSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.fireIcon}>🔥</Text>
                今日热榜
              </Text>
              <Text className={styles.moreLink}>查看更多 ›</Text>
            </View>
            <View className={styles.hotList}>
              {hotPosts.map((post, idx) => (
                <View
                  key={post.id}
                  className={styles.hotItem}
                  onClick={() => handleHotItemClick(post.id)}
                >
                  <Text className={classnames(styles.rank, idx < 3 && styles.rankTop)}>
                    {idx + 1}
                  </Text>
                  <Text className={styles.hotTitle}>
                    {post.title || post.content.slice(0, 30)}
                  </Text>
                  <Text className={styles.hotCount}>{formatNumber(post.likes)} 热度</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.postsList}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomePage;
