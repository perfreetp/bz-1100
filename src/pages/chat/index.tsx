import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Input, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { formatTime } from '@/utils';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import UserAvatar from '@/components/UserAvatar';
import EmptyState from '@/components/EmptyState';
import type { User, ChatMessage } from '@/types';
import styles from './index.module.scss';

const ChatPage: React.FC = () => {
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const sessionId = routerParams?.id as string;

  const {
    currentUser,
    getChatSession,
    sendChatMessage,
    markChatRead,
    toggleChatBlock,
    isBlocked
  } = useAppStore();

  const user: User = currentUser || defaultCurrentUser;
  const session = getChatSession(sessionId || '');

  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (session) {
      markChatRead(session.id);
      Taro.setNavigationBarTitle({ title: session.user.name || '私信' });
    }
  }, [sessionId, session, markChatRead]);

  useDidShow(() => {
    if (session) {
      markChatRead(session.id);
    }
    setTimeout(() => scrollToBottom(), 300);
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 999999;
    }
  };

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 100);
  }, [session?.messages.length]);

  if (!session) {
    return (
      <View className={styles.container} style={{ paddingTop: 200 }}>
        <EmptyState icon="😕" title="会话不存在或已删除" desc="返回会话列表看看吧" />
      </View>
    );
  }

  const chatUser = session.user;
  const blocked = session.isBlocked || isBlocked(chatUser.id);
  const messages = session.messages || [];

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || blocked) return;

    sendChatMessage(session.id, text, user.id);
    setInputValue('');

    setTimeout(() => scrollToBottom(), 100);

    setTimeout(() => {
      const replies = [
        '好的收到！',
        '我也觉得很不错～',
        '请问能分享一下你的技巧吗？',
        '谢谢分享！我试试',
        '这个真的太棒了！'
      ];
      sendChatMessage(
        session.id,
        replies[Math.floor(Math.random() * replies.length)],
        chatUser.id
      );
    }, 1000 + Math.random() * 1500);
  };

  const handleBlockToggle = () => {
    const title = blocked ? '是否解除屏蔽？' : '确定要屏蔽用户吗？';
    Taro.showModal({
      title,
      content: blocked ? '解除后可正常接收该用户消息' : '屏蔽后将不再接收该用户消息',
      confirmColor: blocked ? '#7C3AED' : '#EF4444',
      success: (res) => {
        if (res.confirm) {
          toggleChatBlock(session.id, !blocked);
          Taro.showToast({
            title: !blocked ? '已屏蔽用户' : '已解除屏蔽',
            icon: 'none'
          });
        }
      }
    });
  };

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: [blocked ? '解除屏蔽' : '屏蔽用户', '举报用户'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleBlockToggle();
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: '举报已提交', icon: 'none' });
        }
      },
      fail: () => {}
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <UserAvatar src={chatUser.avatar || ''} size="md" />
          <View className={styles.userMeta}>
            <Text className={styles.userName}>{chatUser.name || '匿名用户'}</Text>
            <Text className={classnames(styles.userStatus, blocked && styles.blocked)}>
              {blocked ? '已屏蔽' : '在线'}
            </Text>
          </View>
        </View>
        <View className={styles.moreBtn} onClick={handleMore}>
          <Text>⋯</Text>
        </View>
      </View>

      {blocked && (
        <View className={styles.blockNotice}>
          <Text className={styles.blockIcon}>🚫</Text>
          <Text className={styles.blockText}>你已屏蔽该用户</Text>
          <Text className={styles.blockAction} onClick={handleBlockToggle}>
            点击解除
          </Text>
        </View>
      )}

      <ScrollView
        scrollY
        className={styles.messagesWrap}
        ref={scrollRef}
        scrollWithAnimation
        enhanced
        showScrollbar={false}
      >
        <View className={styles.messagesList}>
          {messages.length > 0 ? (
            messages.map((msg: ChatMessage) => {
              const isMe = msg.senderId === user.id;
              return (
                <View
                  key={msg.id}
                  className={classnames(styles.messageRow, isMe && styles.isMe)}
                >
                  {!isMe && (
                    <UserAvatar src={chatUser.avatar || ''} size="sm" />
                  )}
                  <View
                    className={classnames(styles.messageBubble, isMe ? styles.meBubble : styles.otherBubble)}
                  >
                    {msg.type === 'image' ? (
                      <Image
                        className={styles.msgImage}
                        src={msg.content}
                        mode="widthFix"
                        onError={(e) => console.error('[Chat] 图片加载失败:', e)}
                      />
                    ) : (
                      <Text className={styles.msgText}>{msg.content}</Text>
                    )}
                  </View>
                  {isMe && (
                    <UserAvatar src={user.avatar || ''} size="sm" />
                  )}
                </View>
              );
            })
          ) : (
            <EmptyState icon="💬" title="开始聊天吧" desc="打个招呼，交流创作心得～" />
          )}
        </View>
      </ScrollView>

      <View className={styles.inputBar}>
        <Input
          className={classnames(styles.input, blocked && styles.inputBlocked)}
          placeholder={blocked ? '已屏蔽对方，无法发送消息' : '输入消息...'}
          placeholderClass={styles.placeholder}
          value={inputValue}
          onInput={(e) => setInputValue(e.detail.value)}
          onConfirm={handleSend}
          disabled={blocked}
          confirmType="send"
        />
        <View
          className={classnames(styles.sendBtn, (!inputValue.trim() || blocked) && styles.disabled)}
          onClick={handleSend}
        >
          <Text>发送</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;
