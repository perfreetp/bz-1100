import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockPosts } from '@/data/posts';
import { mockWorks } from '@/data/works';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

type TabType = 'all' | 'post' | 'work' | 'qa';

interface HistoryItem {
  id: string;
  type: TabType;
  title: string;
  desc: string;
  cover: string;
  time: string;
  dateGroup: string;
}

const generateMockHistory = (): HistoryItem[] => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const dayBefore = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return [
    {
      id: mockPosts[0].id,
      type: 'post',
      title: mockPosts[0].title,
      desc: mockPosts[0].content,
      cover: mockPosts[0].images?.[0] || '',
      time: '2小时前',
      dateGroup: formatDate(today)
    },
    {
      id: mockWorks[0].id,
      type: 'work',
      title: mockWorks[0].title,
      desc: mockWorks[0].description,
      cover: mockWorks[0].cover,
      time: '30分钟前',
      dateGroup: formatDate(today)
    },
    {
      id: mockPosts[2].id,
      type: 'qa',
      title: mockPosts[2].title,
      desc: mockPosts[2].content,
      cover: '',
      time: '1小时前',
      dateGroup: formatDate(today)
    },
    {
      id: mockWorks[1].id,
      type: 'work',
      title: mockWorks[1].title,
      desc: mockWorks[1].description,
      cover: mockWorks[1].cover,
      time: '昨天 18:30',
      dateGroup: formatDate(yesterday)
    },
    {
      id: mockPosts[1].id,
      type: 'post',
      title: mockPosts[1].title,
      desc: mockPosts[1].content,
      cover: mockPosts[1].images?.[0] || '',
      time: '昨天 14:20',
      dateGroup: formatDate(yesterday)
    },
    {
      id: mockPosts[3].id,
      type: 'qa',
      title: mockPosts[3].title,
      desc: mockPosts[3].content,
      cover: '',
      time: '前天 10:15',
      dateGroup: formatDate(dayBefore)
    }
  ];
};

const typeNameMap: Record<TabType, string> = {
  all: '全部',
  post: '动态',
  work: '作品',
  qa: '问答'
};

const typeLabelMap: Record<string, string> = {
  post: '动态',
  work: '作品',
  qa: '问答'
};

const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [history, setHistory] = useState<HistoryItem[]>(generateMockHistory());

  const filteredHistory = activeTab === 'all'
    ? history
    : history.filter(item => item.type === activeTab);

  const groupedHistory = filteredHistory.reduce<Record<string, HistoryItem[]>>((acc, item) => {
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
          setHistory([]);
          Taro.showToast({ title: '历史已清空', icon: 'success' });
        }
      }
    });
  };

  const handleItemClick = (item: HistoryItem) => {
    const routes = {
      post: '/pages/work-detail/index',
      work: '/pages/work-detail/index',
      qa: '/pages/qa-detail/index'
    };
    Taro.navigateTo({ url: routes[item.type as Exclude<TabType, 'all'>] });
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
