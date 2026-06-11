import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockChatSessions, mockChatMessages } from '@/data/messages';
import { currentUser as defaultCurrentUser } from '@/data/users';
import { formatTime } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import useAppStore from '@/store/useAppStore';
import styles from './index.module.scss';

interface MessageDisplay {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isMine: boolean;
}

const ChatPage: React.FC = () => {
  const { currentUser, blockUser, isBlocked } = useAppStore();
  const user = currentUser || defaultCurrentUser;
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const sessionId = routerParams?.id || mockChatSessions[0]?.id;

  const session = mockChatSessions.find(s => s.id === sessionId) || mockChatSessions[0];

  const [messages, setMessages] = useState<MessageDisplay[]>(() =>
    (mockChatMessages || []).map(m => ({
      ...m,
      isMine: m.senderId === user.id
    }))
  );
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (session) {
      Taro.setNavigationBarTitle({ title: session.user?.name || '私信' });
    }
    setTimeout(() => {
      scrollRef.current?.scrollTo?.({ scrollTop: 9999, duration: 100 });
    }, 100);
  }, [messages.length, session]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: MessageDisplay = {
      id: Date.now().toString(),
      senderId: user.id,
      content: text,
      createdAt: new Date().toISOString(),
      isMine: true
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    setTimeout(() => {
      const replyMsg: MessageDisplay = {
        id: (Date.now() + 1).toString(),
        senderId: session?.user?.id || 'other',
        content: '好的！我也觉得这个思路很棒👍',
        createdAt: new Date().toISOString(),
        isMine: false
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1500);
  };

  const handleBlock = () => {
    if (!session?.user?.id) return;
    Taro.showModal({
      title: '屏蔽用户',
      content: `确定要屏蔽 ${session.user.name} 吗？屏蔽后将不再收到对方的消息。`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          blockUser(session.user.id);
          Taro.showToast({ title: '已屏蔽', icon: 'success' });
        }
      }
    });
  };

  const handleMore = () => {
    const isUserBlocked = session?.user?.id ? isBlocked(session.user.id) : false;
    Taro.showActionSheet({
      itemList: [
        isUserBlocked ? '取消屏蔽' : '屏蔽用户',
        '举报用户',
        '清空聊天记录'
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          if (isUserBlocked) {
            Taro.showToast({ title: '已取消屏蔽', icon: 'success' });
          } else {
            handleBlock();
          }
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: '举报已提交', icon: 'none' });
        } else if (res.tapIndex === 2) {
          Taro.showModal({
            title: '清空聊天记录',
            content: '确定要清空聊天记录吗？',
            confirmColor: '#EF4444',
            success: (r) => {
              if (r.confirm) {
                setMessages([]);
                Taro.showToast({ title: '已清空', icon: 'success' });
              }
            }
          });
        }
      },
      fail: () => {}
    });
  };

  if (!session) {
    return (
      <View className={styles.container}>
        <View style={{ padding: 100, alignItems: 'center' }}>
          <Text>会话不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <UserAvatar src={session.user?.avatar} size="md" />
        <View className={styles.headerInfo}>
          <Text className={styles.userName}>{session.user?.name || '用户'}</Text>
          <Text className={styles.userStatus}>
            {session.unreadCount > 0 ? `${session.unreadCount}条新消息` : '在线'}
          </Text>
        </View>
        <View className={styles.moreIcon} onClick={handleMore}>
          <Text>⋯</Text>
        </View>
      </View>

      <ScrollView className={styles.messagesList} scrollY ref={scrollRef} enhanced showScrollbar={false}>
        <Text className={styles.dateDivider}>今天</Text>
        {messages.map((msg, idx) => (
          <View key={msg.id}>
            <View className={classnames(styles.messageRow, msg.isMine && styles.isMine)}>
              <View className={styles.messageAvatar}>
                <UserAvatar
                  src={msg.isMine ? user.avatar : session.user?.avatar}
                  size="sm"
                />
              </View>
              <View>
                <View className={styles.messageBubble}>
                  <Text>{msg.content}</Text>
                </View>
                {(idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId) && (
                  <View className={classnames(styles.messageTime, msg.isMine && styles.isMine)}>
                    <Text>{formatTime(msg.createdAt)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className={styles.inputBar}>
        <View className={styles.iconBtn}>
          <Text>😊</Text>
        </View>
        <View className={styles.inputWrap}>
          <Textarea
            className={styles.textarea}
            value={inputText}
            onInput={(e) => setInputText(e.detail.value)}
            placeholder="说点什么..."
            placeholderStyle="color: #9CA3AF"
            autoHeight
            adjustPosition
            cursorSpacing={20}
            confirmType="send"
            onConfirm={handleSend}
          />
        </View>
        <View className={styles.sendBtn} onClick={handleSend}>
          <Text>发送</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;
