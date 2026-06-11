import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { mockMessages, mockChatSessions } from '@/data/messages';
import { formatTime } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import styles from './index.module.scss';

const MessagePage: React.FC = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [chats] = useState(mockChatSessions);

  usePullDownRefresh(() => {
    console.log('[Message] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const unreadMentionCount = messages.filter(m => m.type === 'mention' && !m.isRead).length;
  const unreadSystemCount = messages.filter(m => m.type === 'system' && !m.isRead).length;
  const unreadChatCount = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleChatClick = (chatId: string) => {
    console.log('[Message] 点击会话:', chatId);
    Taro.navigateTo({ url: `/pages/chat/index?id=${chatId}` });
  };

  const handleMsgClick = (msgId: string) => {
    console.log('[Message] 点击消息:', msgId);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
  };

  const handleMentionClick = () => {
    console.log('[Message] 查看@提醒');
    Taro.showToast({ title: '@提醒列表', icon: 'none' });
  };

  const handleSystemClick = () => {
    console.log('[Message] 查看系统通知');
    Taro.showToast({ title: '系统通知列表', icon: 'none' });
  };

  const handleChatEntryClick = () => {
    console.log('[Message] 查看私信列表');
    Taro.showToast({ title: '私信列表', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>消息中心</Text>
      </View>

      <View className={styles.msgTypes}>
        <View className={styles.msgType} onClick={handleMentionClick}>
          <Text className={styles.typeIcon}>📢</Text>
          <Text className={styles.typeName}>@我的</Text>
          {unreadMentionCount > 0 && (
            <View className={styles.badge}>{unreadMentionCount}</View>
          )}
        </View>
        <View className={styles.msgType} onClick={handleChatEntryClick}>
          <Text className={styles.typeIcon}>💬</Text>
          <Text className={styles.typeName}>私信</Text>
          {unreadChatCount > 0 && (
            <View className={styles.badge}>{unreadChatCount}</View>
          )}
        </View>
        <View className={styles.msgType} onClick={handleSystemClick}>
          <Text className={styles.typeIcon}>🔔</Text>
          <Text className={styles.typeName}>系统</Text>
          {unreadSystemCount > 0 && (
            <View className={styles.badge}>{unreadSystemCount}</View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>私信对话</Text>
          <Text className={styles.moreLink}>查看全部 ›</Text>
        </View>
        <View className={styles.chatList}>
          {chats.slice(0, 3).map(chat => (
            <View
              key={chat.id}
              className={styles.chatItem}
              onClick={() => handleChatClick(chat.id)}
            >
              <View className={styles.chatAvatar}>
                <UserAvatar src={chat.user.avatar} size="lg" />
                {chat.unreadCount > 0 && (
                  <View className={styles.unreadBadge}>{chat.unreadCount}</View>
                )}
              </View>
              <View className={styles.chatInfo}>
                <View className={styles.chatTop}>
                  <Text className={styles.chatName}>{chat.user.name}</Text>
                  <Text className={styles.chatTime}>{formatTime(chat.updatedAt)}</Text>
                </View>
                <Text className={styles.chatPreview}>{chat.lastMessage}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>通知消息</Text>
        </View>
        <View className={styles.msgList}>
          {messages.map(msg => (
            <View
              key={msg.id}
              className={styles.msgCard}
              onClick={() => handleMsgClick(msg.id)}
            >
              {!msg.isRead && <View className={styles.unreadDot} />}
              {msg.from ? (
                <UserAvatar src={msg.from.avatar} size="lg" />
              ) : (
                <View style={{ width: 80, height: 80, borderRadius: 999, background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                  <Text>📬</Text>
                </View>
              )}
              <View className={styles.msgContent}>
                <Text className={styles.msgTitle}>{msg.title}</Text>
                <Text className={styles.msgDesc}>{msg.content}</Text>
                <View className={styles.msgMeta}>
                  <Text className={styles.msgTime}>{formatTime(msg.createdAt)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MessagePage;
