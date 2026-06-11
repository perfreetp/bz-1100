import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import { formatTime } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import EmptyState from '@/components/EmptyState';
import type { ChatSession } from '@/types';
import styles from './index.module.scss';

const ChatsPage: React.FC = () => {
  const chatSessions = useAppStore(state => state.chatSessions);
  const { isBlocked, toggleChatBlock } = useAppStore();
  const [tick, setTick] = useState(0);

  useDidShow(() => {
    setTick(t => t + 1);
  });

  const sessions = useMemo((): ChatSession[] => {
    void tick;
    return [...chatSessions].sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [chatSessions, tick]);

  const handleSessionClick = (sessionId: string, blocked: boolean) => {
    if (blocked) {
      Taro.showToast({ title: '该用户已被屏蔽', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: `/pages/chat/index?id=${sessionId}` });
  };

  const handleBlockToggle = (sessionId: string, blocked: boolean, e: any) => {
    e?.stopPropagation?.();
    const title = blocked ? '是否要解除屏蔽？' : '确定要屏蔽该用户吗？';
    Taro.showModal({
      title,
      content: blocked ? '解除后可以继续接收该用户消息' : '屏蔽后将不再接收该用户消息',
      confirmColor: blocked ? '#7C3AED' : '#EF4444',
      success: (res) => {
        if (res.confirm) {
          toggleChatBlock(sessionId, !blocked);
          Taro.showToast({
            title: !blocked ? '已屏蔽' : '已解除屏蔽',
            icon: 'none'
          });
        }
      }
    });
  };

  const handleMore = (sessionId: string, blocked: boolean, e: any) => {
    e?.stopPropagation?.();
    Taro.showActionSheet({
      itemList: [blocked ? '解除屏蔽' : '屏蔽用户', '删除会话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleBlockToggle(sessionId, blocked, e);
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: '会话已删除', icon: 'none' });
        }
      },
      fail: () => {}
    });
  };

  const getLastMsg = (s: ChatSession) => {
    if (!s.messages || s.messages.length === 0) return '';
    return s.messages[s.messages.length - 1].content;
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>私信</Text>
      </View>

      {sessions.length > 0 ? (
        <ScrollView scrollY className={styles.sessionList}>
          {sessions.map(session => {
            const blocked = session.isBlocked || isBlocked(session.user.id);
            const lastMsg = getLastMsg(session);
            return (
              <View
                key={session.id}
                className={classnames(styles.sessionItem, blocked && styles.blocked)}
                onClick={() => handleSessionClick(session.id, blocked)}
              >
                <View className={styles.avatarWrap}>
                  <UserAvatar src={session.user.avatar || ''} size="md" />
                  {session.unreadCount > 0 && !blocked && (
                    <View className={styles.unreadBadge}>
                      <Text className={styles.unreadText}>
                        {session.unreadCount > 99 ? '99+' : session.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                <View className={styles.sessionInfo}>
                  <View className={styles.sessionHead}>
                    <Text className={styles.userName}>
                      {session.user.name || '匿名用户'}
                    </Text>
                    <Text className={styles.time}>
                      {formatTime(session.lastMessageAt)}
                    </Text>
                  </View>
                  <View className={styles.sessionBottom}>
                    <Text className={styles.lastMsg}>
                      {blocked ? '[该用户已被屏蔽]' : lastMsg}
                    </Text>
                    {blocked && <Text className={styles.blockedTag}>已屏蔽</Text>}
                  </View>
                </View>

                <View className={styles.moreBtn} onClick={(e) => handleMore(session.id, blocked, e)}>
                  <Text>⋯</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <EmptyState icon="💬" title="还没有私信" desc="去发现更多创作者，开始交流吧～" />
      )}
    </View>
  );
};

export default ChatsPage;
