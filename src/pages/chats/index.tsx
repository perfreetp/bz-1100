import React from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import { formatTime } from '@/utils';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const ChatsPage: React.FC = () => {
  const { getChatSessions, isBlocked, toggleChatBlock } = useAppStore();
  const sessions = getChatSessions();

  useDidShow(() => {
    console.log('[Chats] useDidShow - 会话数:', sessions.length);
  });

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

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        {sessions.length > 0 ? (
          <View className={styles.sessionList}>
            {sessions.map((session) => {
              const lastMsg = session.messages[session.messages.length - 1];
              const blocked = session.isBlocked || isBlocked(session.user.id);

              return (
                <View
                  key={session.id}
                  className={classnames(styles.sessionItem, blocked && styles.blocked)}
                  onClick={() => handleSessionClick(session.id, blocked)}
                >
                  <View className={styles.avatarWrap}>
                    <Image
                      className={styles.avatar}
                      src={session.user.avatar}
                      mode="aspectFill"
                      onError={(e) => console.error('[Chats] 头像加载失败:', e)}
                    />
                    {session.unreadCount > 0 && !blocked && (
                      <View className={styles.badge}>
                        <Text className={styles.badgeText}>
                          {session.unreadCount > 99 ? '99+' : session.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className={styles.sessionInfo}>
                    <View className={styles.sessionHeader}>
                      <Text className={styles.userName}>
                        {session.user.name || '匿名用户'}
                      </Text>
                      <Text className={styles.time}>
                        {lastMsg ? formatTime(lastMsg.createdAt) : ''}
                      </Text>
                    </View>
                    <View className={styles.lastRow}>
                      <Text className={classnames(styles.lastMessage, blocked && styles.blockedText)}>
                        {blocked
                          ? '[该用户已被屏蔽]'
                          : lastMsg
                            ? lastMsg.content
                            : '暂无消息'}
                      </Text>
                    </View>
                  </View>

                  <View className={styles.actions}>
                    {blocked && (
                      <View
                        className={styles.unblockHint}
                        onClick={(e) => handleBlockToggle(session.id, true, e)}
                      >
                        <Text>已屏蔽</Text>
                      </View>
                    )}
                    <View
                      className={styles.moreBtn}
                      onClick={(e) => handleMore(session.id, blocked, e)}
                    >
                      <Text>⋯</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ paddingTop: 200 }}>
            <EmptyState icon="💬" title="暂无私信" desc="与感兴趣的创作者私信交流吧" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ChatsPage;
