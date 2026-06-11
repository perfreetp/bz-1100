import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { hotPosts } from '@/data/posts';
import { formatNumber } from '@/utils';
import PostCard from '@/components/PostCard';
import useAppStore from '@/store/useAppStore';
import type { Post } from '@/types';
import styles from './index.module.scss';

const tabs = ['推荐', '关注', '热门', '作品', '问答', '提示词'];

const HomePage: React.FC = () => {
  const { posts, following, isBlocked } = useAppStore();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  useDidShow(() => {
    console.log('[Home] useDidShow - 页面显示，帖子数:', posts.length);
  });

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

  const handleHotItemClick = useCallback((postId: string, postType: string) => {
    console.log('[Home] 点击热榜:', postId, postType);
    if (postType === 'qa') {
      Taro.navigateTo({ url: `/pages/qa-detail/index?id=${postId}` });
    } else {
      Taro.navigateTo({ url: `/pages/work-detail/index?id=${postId}` });
    }
  }, []);

  const getFilteredPosts = (): Post[] => {
    let filtered = posts.filter(p => !isBlocked(p.author.id));

    switch (activeTab) {
      case 1:
        filtered = filtered.filter(p => following.includes(p.author.id));
        break;
      case 2:
        filtered = [...filtered].sort((a, b) => b.likes - a.likes);
        break;
      case 3:
        filtered = filtered.filter(p => p.type === 'work');
        break;
      case 4:
        filtered = filtered.filter(p => p.type === 'qa');
        break;
      case 5:
        filtered = filtered.filter(p => p.type === 'prompt');
        break;
      default:
        break;
    }

    return filtered;
  };

  const displayPosts = getFilteredPosts();

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
                  onClick={() => handleHotItemClick(post.id, post.type)}
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
          {displayPosts.length > 0 ? (
            displayPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <View style={{ padding: 100, alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 28 }}>暂无内容</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomePage;
