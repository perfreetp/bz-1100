import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import type { HistoryItem as StoreHistoryItem } from '@/types';
import styles from './index.module.scss';

type TabType = 'all' | 'post' | 'work' | 'qa';

interface HistoryDisplayItem {
  id: string;
  type: TabType;
  title: string;
  desc: string;
  cover: string;
  time: string;
  dateGroup: string;
}

const typeNameMap: Record<TabType, string> = {
  all: '全部',
  post: '动态',
  work: '作品',
  qa: '问答'
};

const typeLabelMap: Record<string, string> = {
  post: '动态',
  prompt: '动态',
  work: '作品',
  qa: '问答'
};

const formatDateGroup = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);
  const itemStr = formatDate(date);

  if (itemStr === todayStr) return '今天';
  if (itemStr === yesterdayStr) return '昨天';
  return itemStr;
};

const HistoryPage: React.FC = () => {
  const { history, clearHistory } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const displayHistory = useMemo((): HistoryDisplayItem[] => {
    return history.map((item: StoreHistoryItem): HistoryDisplayItem => {
      const post = item.post;
      const type = post?.type === 'work' ? 'work' : post?.type === 'qa' ? 'qa' : 'post';
      return {
        id: item.postId,
        type,
        title: post?.title || (post?.content?.slice(0, 30) || '无标题'),
        desc: post?.content || '',
        cover: post?.images?.[0] || (post as any)?.cover || '',
        time: formatDateGroup(item.viewedAt),
        dateGroup: formatDateGroup(item.viewedAt)
      };
    });
  }, [history]);

  const filteredHistory = activeTab === 'all'
    ? displayHistory
    : displayHistory.filter(item => item.type === activeTab);

  const groupedHistory = filteredHistory.reduce<Record<string, HistoryDisplayItem[]>>((acc, item) => {
    if (!acc[item.dateGroup]) acc[item.dateGroup] = [];
    acc[item.dateGroup].push(item);
    return acc;
  }, {});

  const handleClear = () => {
    Taro.showModal({
      title: '清空历史',
      content: '确定要清空所有浏览历史吗？',
      confirmColor: '#7C3AED',
      success: (res) => {
        if (res.confirm) {
          clearHistory();
          Taro.showToast({ title: '历史已清空', icon: 'success' });
        }
      }
    });
  };

  const handleItemClick = (item: HistoryDisplayItem) => {
    console.log('[History] 点击历史:', item.id, item.type);
    const routes = {
      post: '/pages/work-detail/index',
      work: '/pages/work-detail/index',
      qa: '/pages/qa-detail/index'
    };
    const url = `${routes[item.type]}?id=${item.id}`;
    Taro.navigateTo({ url });
  };

  const tabs: TabType[] = ['all', 'post', 'work', 'qa'];

  return (
    <View className={styles.container}>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab}
            className={classnames(styles.tab, activeTab === tab && styles.tabActive)}
            onClick={() => setActiveTab(tab)}
          >
            <Text>{typeNameMap[tab]}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {Object.keys(groupedHistory).length > 0 ? (
          <View className={styles.historyList}>
            {Object.entries(groupedHistory).map(([date, items]) => (
              <View key={date} className={styles.dateGroup}>
                <Text className={styles.dateHeader}>{date}</Text>
                {items.map(item => (
                  <View
                    key={`${item.type}-${item.id}`}
                    className={styles.historyCard}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.cover ? (
                      <Image
                        className={styles.cardCover}
                        src={item.cover}
                        mode="aspectFill"
                        onError={(e) => console.error('[History] 图片加载失败:', e)}
                      />
                    ) : (
                      <View className={styles.cardCover} />
                    )}
                    <View className={styles.cardContent}>
                      <Text className={styles.cardTitle}>{item.title}</Text>
                      <Text className={styles.cardDesc}>{item.desc}</Text>
                      <View className={styles.cardMeta}>
                        <View className={styles.typeTag}>
                          <Text>{typeLabelMap[item.type]}</Text>
                        </View>
                        <Text>{item.time}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState icon="📭" title="暂无浏览记录" desc="快去探索精彩内容吧" />
          </View>
        )}

        {history.length > 0 && (
          <View className={styles.clearBar}>
            <View className={styles.clearBtn} onClick={handleClear}>
              <Text>清空浏览历史</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryPage;
