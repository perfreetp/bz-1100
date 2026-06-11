import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import { formatTime, formatNumber } from '@/utils';
import EmptyState from '@/components/EmptyState';
import type { Post, Work, Question, Topic, User } from '@/types';
import styles from './index.module.scss';

type SearchCategory = 'all' | 'post' | 'work' | 'qa' | 'topic' | 'author';

interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  desc: string;
  cover: string;
  author: User;
  tags: string[];
  time: string;
  extra?: string;
  targetType: 'post' | 'work' | 'qa' | 'topic' | 'author';
  targetId: string;
}

const categories: { key: SearchCategory; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'post', label: '动态' },
  { key: 'work', label: '作品' },
  { key: 'qa', label: '问答' },
  { key: 'topic', label: '话题' },
  { key: 'author', label: '用户' }
];

const SearchPage: React.FC = () => {
  const { posts, works, questions, topics, users, isBlocked } = useAppStore();
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [searchTriggered, setSearchTriggered] = useState(false);

  useDidShow(() => {
    console.log('[Search] useDidShow');
  });

  const containsKeyword = (text: string | undefined, kw: string): boolean => {
    if (!text || !kw) return false;
    return text.toLowerCase().includes(kw.toLowerCase());
  };

  const hotKeywords = ['Midjourney', '提示词', 'SDXL', '人像', 'Stable Diffusion', 'Lora', 'ComfyUI', '风格化'];

  const results = useMemo((): SearchResult[] => {
    if (!keyword.trim()) return [];
    const kw = keyword.trim().toLowerCase();
    const list: SearchResult[] = [];

    if (activeCategory === 'all' || activeCategory === 'post' || activeCategory === 'work') {
      works
        .filter(w => !isBlocked(w.author.id))
        .forEach((w: Work) => {
          if (
            containsKeyword(w.title, kw) ||
            containsKeyword(w.description, kw) ||
            containsKeyword(w.author.name, kw) ||
            (w.modelTags || []).some(t => containsKeyword(t.name, kw)) ||
            (w.topics || []).some(t => containsKeyword(t.name, kw))
          ) {
            list.push({
              id: `work-${w.id}`,
              type: 'work',
              title: w.title || '未命名作品',
              desc: w.description || '',
              cover: w.cover || w.images?.[0] || '',
              author: w.author,
              tags: (w.modelTags || []).map(t => t.name).slice(0, 3),
              time: w.createdAt,
              extra: `${formatNumber(w.likes || 0)}赞 ${formatNumber(w.comments || 0)}评论`,
              targetType: 'work',
              targetId: w.id
            });
          }
        });
    }

    if (activeCategory === 'all' || activeCategory === 'post') {
      posts
        .filter(p => !isBlocked(p.author.id))
        .filter(p => p.type === 'prompt')
        .forEach((p: Post) => {
          if (
            containsKeyword(p.title, kw) ||
            containsKeyword(p.content, kw) ||
            containsKeyword(p.author.name, kw) ||
            (p.modelTags || []).some(t => containsKeyword(t.name, kw)) ||
            (p.topics || []).some(t => containsKeyword(t.name, kw))
          ) {
            list.push({
              id: `post-${p.id}`,
              type: 'post',
              title: p.title || p.content?.slice(0, 30) || '动态',
              desc: p.content || '',
              cover: p.images?.[0] || '',
              author: p.author,
              tags: (p.modelTags || []).map(t => t.name).slice(0, 3),
              time: p.createdAt,
              extra: `${formatNumber(p.likes || 0)}赞 ${formatNumber(p.comments || 0)}评论`,
              targetType: 'post',
              targetId: p.id
            });
          }
        });
    }

    if (activeCategory === 'all' || activeCategory === 'qa') {
      questions
        .filter(q => !isBlocked(q.author.id))
        .forEach((q: Question) => {
          if (
            containsKeyword(q.title, kw) ||
            containsKeyword(q.content, kw) ||
            containsKeyword(q.author.name, kw) ||
            (q.modelTags || []).some(t => containsKeyword(t.name, kw)) ||
            (q.topics || []).some(t => containsKeyword(t.name, kw))
          ) {
            list.push({
              id: `qa-${q.id}`,
              type: 'qa',
              title: q.title || '问题',
              desc: q.content || '',
              cover: '',
              author: q.author,
              tags: (q.modelTags || []).map(t => t.name).slice(0, 3),
              time: q.createdAt,
              extra: `${q.answers?.length || 0}回答 ${formatNumber(q.likes || 0)}赞`,
              targetType: 'qa',
              targetId: q.id
            });
          }
        });
    }

    if (activeCategory === 'all' || activeCategory === 'topic') {
      topics.forEach((t: Topic) => {
        if (containsKeyword(t.name, kw) || containsKeyword(t.description, kw)) {
          list.push({
            id: `topic-${t.id}`,
            type: 'topic',
            title: `#${t.name}`,
            desc: t.description || '',
            cover: t.cover || '',
            author: { id: 'system', name: '话题', avatar: '' } as User,
            tags: [],
            time: t.createdAt || '',
            extra: `${formatNumber(t.postsCount || 0)}帖子 ${formatNumber(t.membersCount || 0)}成员`,
            targetType: 'topic',
            targetId: t.id
          });
        }
      });
    }

    if (activeCategory === 'all' || activeCategory === 'author') {
      users
        .filter(u => !isBlocked(u.id))
        .forEach((u: User) => {
          if (containsKeyword(u.name, kw) || containsKeyword(u.bio, kw)) {
            list.push({
              id: `user-${u.id}`,
              type: 'author',
              title: u.name,
              desc: u.bio || '',
              cover: u.avatar || '',
              author: u,
              tags: (u.badges || []).map(b => b.name).slice(0, 2),
              time: '',
              extra: `${formatNumber(u.followers || 0)}粉丝 ${formatNumber(u.worksCount || 0)}作品`,
              targetType: 'author',
              targetId: u.id
            });
          }
        });
    }

    return list.sort((a, b) => {
      if (a.type === b.type) {
        return new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime();
      }
      return 0;
    });
  }, [keyword, activeCategory, posts, works, questions, topics, users, isBlocked]);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log('[Search] 点击结果:', result.id);
    switch (result.targetType) {
      case 'work':
      case 'post':
        Taro.navigateTo({ url: `/pages/work-detail/index?id=${result.targetId}` });
        break;
      case 'qa':
        Taro.navigateTo({ url: `/pages/qa-detail/index?id=${result.targetId}` });
        break;
      case 'topic':
        Taro.navigateTo({ url: `/pages/topic-detail/index?id=${result.targetId}` });
        break;
      case 'author':
        Taro.navigateTo({ url: `/pages/profile/index?userId=${result.targetId}` });
        break;
    }
  }, []);

  const handleHotKeyword = (kw: string) => {
    setKeyword(kw);
    setSearchTriggered(true);
  };

  const handleClear = () => {
    setKeyword('');
    setSearchTriggered(false);
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <View className={styles.searchInputWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索标题、正文、作者、话题..."
            placeholderClass={styles.placeholder}
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={() => setSearchTriggered(true)}
            focus
          />
          {keyword && (
            <View className={styles.clearBtn} onClick={handleClear}>
              <Text>×</Text>
            </View>
          )}
        </View>
        <Text
          className={styles.cancelBtn}
          onClick={() => Taro.navigateBack()}
        >
          取消
        </Text>
      </View>

      {!keyword.trim() && (
        <View className={styles.hotSection}>
          <Text className={styles.sectionTitle}>🔥 热门搜索</Text>
          <View className={styles.hotTags}>
            {hotKeywords.map(kw => (
              <View
                key={kw}
                className={styles.hotTag}
                onClick={() => handleHotKeyword(kw)}
              >
                <Text>{kw}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {keyword.trim() && (
        <ScrollView className={styles.scrollView} scrollY>
          <ScrollView
            className={styles.catScroll}
            scrollX
            enhanced
            showScrollbar={false}
          >
            <View className={styles.catList}>
              {categories.map(cat => (
                <View
                  key={cat.key}
                  className={classnames(styles.catItem, activeCategory === cat.key && styles.catActive)}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  <Text>{cat.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {results.length > 0 ? (
            <View className={styles.results}>
              {results.map(r => (
                <View
                  key={r.id}
                  className={styles.resultCard}
                  onClick={() => handleResultClick(r)}
                >
                  {(r.cover || r.type === 'author') && (
                    <View className={styles.coverWrap}>
                      <Image
                        className={styles.cover}
                        src={r.cover || r.author.avatar}
                        mode="aspectFill"
                        onError={(e) => console.error('[Search] 图片加载失败:', e)}
                      />
                    </View>
                  )}
                  <View className={styles.resultInfo}>
                    <Text className={styles.resultTitle}>
                      {r.title}
                    </Text>
                    {r.desc && (
                      <Text className={styles.resultDesc}>
                        {r.desc.length > 80 ? r.desc.slice(0, 80) + '...' : r.desc}
                      </Text>
                    )}
                    <View className={styles.resultMeta}>
                      {r.tags.length > 0 && (
                        <View className={styles.tagList}>
                          {r.tags.map((tag, i) => (
                            <Text key={i} className={styles.tag}>
                              {tag}
                            </Text>
                          ))}
                        </View>
                      )}
                      <View className={styles.metaRight}>
                        {r.author?.name && r.type !== 'topic' && (
                          <Text className={styles.authorName}>
                            {r.author.name}
                          </Text>
                        )}
                        {r.time && (
                          <Text className={styles.time}>
                            {formatTime(r.time)}
                          </Text>
                        )}
                      </View>
                    </View>
                    {r.extra && (
                      <Text className={styles.resultExtra}>{r.extra}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ paddingTop: 160 }}>
              <EmptyState icon="🔍" title="没有找到相关内容" desc="换个关键词试试吧" />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default SearchPage;
