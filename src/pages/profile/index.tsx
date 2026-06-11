import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import { mockWorks } from '@/data/works';
import { formatCount } from '@/utils';
import PostCard from '@/components/PostCard';
import WorkCard from '@/components/WorkCard';
import EmptyState from '@/components/EmptyState';
import type { User, Post, Work } from '@/types';
import styles from './index.module.scss';

const tabs = ['动态', '作品', '收藏'];

const ProfilePage: React.FC = () => {
  const { currentUser, posts, works } = useAppStore();
  const [activeTab, setActiveTab] = useState(0);

  const user: User = currentUser || defaultCurrentUser;

  const myPosts = useMemo((): Post[] => {
    return posts.filter(p => p.author.id === user.id);
  }, [posts, user.id]);

  const myWorks = useMemo((): Work[] => {
    return works.filter(w => w.author.id === user.id);
  }, [works, user.id]);

  const allWorks = myWorks.length > 0 ? myWorks : mockWorks;

  const handleSettings = () => {
    console.log('[Profile] 点击设置');
    Taro.navigateTo({ url: '/pages/settings/index' });
  };

  const handleEditProfile = () => {
    console.log('[Profile] 编辑个人资料');
    Taro.navigateTo({ url: '/pages/edit-profile/index' });
  };

  const handleHistory = () => {
    console.log('[Profile] 浏览历史');
    Taro.navigateTo({ url: '/pages/history/index' });
  };

  const handleDrafts = () => {
    console.log('[Profile] 草稿箱');
    Taro.navigateTo({ url: '/pages/drafts/index' });
  };

  const handleLinkClick = (link: string) => {
    console.log('[Profile] 点击快捷入口:', link);
    Taro.showToast({ title: `${link}功能`, icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.settingsIcon} onClick={handleSettings}>
          <Text>⚙️</Text>
        </View>

        <View className={styles.userInfo}>
          <View className={styles.avatarWrap}>
            <Image
              className={styles.avatar}
              src={user.avatar}
              mode="aspectFill"
              onError={(e) => console.error('[Profile] 头像加载失败:', e)}
            />
          </View>
          <View className={styles.userMeta}>
            <Text className={styles.userName}>{user.name}</Text>
            {user.badges && user.badges.length > 0 && (
              <View className={styles.badges}>
                {user.badges.map(badge => (
                  <View key={badge.id} className={styles.badgeItem}>
                    <Text className={styles.badgeIcon}>{badge.icon}</Text>
                    <Text className={styles.badgeText}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        {user.bio && <Text className={styles.bio}>{user.bio}</Text>}
      </View>

      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatCount(myWorks.length)}</Text>
          <Text className={styles.statLabel}>作品</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatCount(user.following || 0)}</Text>
          <Text className={styles.statLabel}>关注</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatCount(user.followers || 0)}</Text>
          <Text className={styles.statLabel}>粉丝</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatCount(328)}</Text>
          <Text className={styles.statLabel}>获赞</Text>
        </View>
      </View>

      <View className={styles.actionRow}>
        <View className={styles.editBtn} onClick={handleEditProfile}>
          <Text>编辑资料</Text>
        </View>
        <View className={styles.shareBtn}>
          <Text>📤</Text>
        </View>
      </View>

      <View className={styles.quickLinks}>
        <View className={styles.linkItem} onClick={handleHistory}>
          <Text className={styles.linkIcon}>🕐</Text>
          <Text className={styles.linkText}>浏览历史</Text>
        </View>
        <View className={styles.linkItem} onClick={handleDrafts}>
          <Text className={styles.linkIcon}>📝</Text>
          <Text className={styles.linkText}>草稿箱</Text>
        </View>
        <View className={styles.linkItem} onClick={() => handleLinkClick('我的话题')}>
          <Text className={styles.linkIcon}>💬</Text>
          <Text className={styles.linkText}>我的话题</Text>
        </View>
        <View className={styles.linkItem} onClick={() => handleLinkClick('我的问答')}>
          <Text className={styles.linkIcon}>❓</Text>
          <Text className={styles.linkText}>我的问答</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab, idx) => (
          <View
            key={tab}
            className={classnames(styles.tab, idx === activeTab && styles.activeTab)}
            onClick={() => setActiveTab(idx)}
          >
            <Text className={styles.tabText}>{tab}</Text>
          </View>
        ))}
      </View>

      <View style={{ paddingTop: 24 }}>
        {activeTab === 0 && (
          <View className={styles.contentList}>
            {myPosts.length > 0 ? (
              myPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <EmptyState icon="📝" title="还没有动态" desc="快去发布你的第一条动态吧" />
            )}
          </View>
        )}

        {activeTab === 1 && (
          <View className={styles.contentList}>
            {allWorks.length > 0 ? (
              <View className={styles.worksGrid}>
                {allWorks.map(work => (
                  <View key={work.id} style={{ width: 'calc(50% - 12rpx)' }}>
                    <WorkCard work={work} />
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="🎨" title="还没有作品" desc="快去发布你的第一个作品吧" />
            )}
          </View>
        )}

        {activeTab === 2 && (
          <EmptyState icon="⭐" title="暂无收藏" desc="看到喜欢的内容记得收藏哦" />
        )}
      </View>
    </View>
  );
};

export default ProfilePage;
