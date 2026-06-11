import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import { mockWorks } from '@/data/works';
import { formatCount } from '@/utils';
import PostCard from '@/components/PostCard';
import WorkCard from '@/components/WorkCard';
import EmptyState from '@/components/EmptyState';
import UserAvatar from '@/components/UserAvatar';
import type { User, Post, Work } from '@/types';
import styles from './index.module.scss';

const tabs = ['动态', '作品', '收藏'];

const ProfilePage: React.FC = () => {
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const userIdParam = routerParams?.userId as string | undefined;

  const {
    currentUser,
    posts,
    works,
    getUser,
    toggleFollow,
    isFollowing,
    getChatSessions,
    sendChatMessage
  } = useAppStore();

  const [activeTab, setActiveTab] = useState(0);
  const [followed, setFollowed] = useState(false);

  const me: User = currentUser || defaultCurrentUser;
  const isMe = !userIdParam || userIdParam === me.id;

  const user: User = useMemo(() => {
    if (isMe) return me;
    const found = getUser(userIdParam || '');
    return found || defaultCurrentUser;
  }, [userIdParam, isMe, me, getUser]);

  const userPosts = useMemo((): Post[] => {
    return posts.filter(p => p.author.id === user.id);
  }, [posts, user.id]);

  const userWorks = useMemo((): Work[] => {
    return works.filter(w => w.author.id === user.id);
  }, [works, user.id]);

  const allWorks = userWorks.length > 0 ? userWorks : (isMe ? mockWorks : []);

  useDidShow(() => {
    if (!isMe) {
      setFollowed(isFollowing(user.id));
    }
  });

  const handleSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' });
  };

  const handleEditProfile = () => {
    Taro.navigateTo({ url: '/pages/edit-profile/index' });
  };

  const handleHistory = () => {
    Taro.navigateTo({ url: '/pages/history/index' });
  };

  const handleDrafts = () => {
    Taro.navigateTo({ url: '/pages/drafts/index' });
  };

  const handleFollow = () => {
    if (isMe) return;
    toggleFollow(user.id);
    const newFollowed = !followed;
    setFollowed(newFollowed);
    Taro.showToast({
      title: newFollowed ? '关注成功' : '已取消关注',
      icon: 'none'
    });
  };

  const handleChat = () => {
    if (isMe) return;
    const sessions = getChatSessions();
    const existing = sessions.find(s => s.user.id === user.id);
    if (existing) {
      Taro.navigateTo({ url: `/pages/chat/index?id=${existing.id}` });
    } else {
      Taro.showToast({ title: '开始私信吧', icon: 'none' });
    }
  };

  const handleLinkClick = (link: string) => {
    Taro.showToast({ title: `${link}功能`, icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        {isMe && (
          <View className={styles.settingsIcon} onClick={handleSettings}>
            <Text>⚙️</Text>
          </View>
        )}

        <View className={styles.userInfo}>
          <View className={styles.avatarWrap}>
            <UserAvatar src={user.avatar || ''} size="lg" />
          </View>
          <View className={styles.userMeta}>
            <Text className={styles.userName}>{user.name || '匿名用户'}</Text>
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
          <Text className={styles.statValue}>{formatCount(allWorks.length)}</Text>
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

      {isMe ? (
        <View className={styles.actionRow}>
          <View className={styles.editBtn} onClick={handleEditProfile}>
            <Text>编辑资料</Text>
          </View>
          <View className={styles.shareBtn}>
            <Text>📤</Text>
          </View>
        </View>
      ) : (
        <View className={styles.actionRow}>
          <View
            className={classnames(styles.followBtn, followed && styles.followed)}
            onClick={handleFollow}
          >
            <Text>{followed ? '已关注' : '+ 关注'}</Text>
          </View>
          <View className={styles.chatBtn} onClick={handleChat}>
            <Text>💬 私信</Text>
          </View>
        </View>
      )}

      {isMe && (
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
      )}

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
            {userPosts.length > 0 ? (
              userPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <EmptyState icon="📝" title="还没有动态" desc={isMe ? '快去发布你的第一条动态吧' : 'TA还没有发布动态'} />
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
              <EmptyState icon="🎨" title="还没有作品" desc={isMe ? '快去发布你的第一个作品吧' : 'TA还没有发布作品'} />
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
