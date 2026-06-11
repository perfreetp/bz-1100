import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockChatSessions, mockChatMessages } from '@/data/messages';
import { currentUser } from '@/data/users';
import { formatTime } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import styles from './index.module.scss';

interface MessageDisplay {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isMine: boolean;
}

const ChatPage: React.FC = () => {
  const session = mockChatSessions[0];
  const [messages, setMessages] = useState<MessageDisplay[]>(
    mockChatMessages.map(m => ({
      ...m,
      isMine: m.senderId === currentUser.id
    }))
  );
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo?.({ scrollTop: 9999, duration: 100 });
    }, 100);
  }, [messages.length]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: MessageDisplay = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: text,
      createdAt: new Date().toISOString(),
      isMine: true
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    setTimeout(() => {
      const replyMsg: MessageDisplay = {
        id: (Date.now() + 1).toString(),
        senderId: session.user.id,
        content: '好的！我也觉得这个思路很棒👍',
        createdAt: new Date().toISOString(),
        isMine: false
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <UserAvatar src={session.user.avatar} size="md" />
        <View className={styles.headerInfo}>
          <Text className={styles.userName}>{session.user.name}</Text>
          <Text className={styles.userStatus}>
            {session.unreadCount > 0 ? `${session.unreadCount}条新消息` : '在线'}
          </Text>
        </View>
        <View
          className={styles.moreIcon}
          onClick={() => Taro.showActionSheet({
            itemList: ['屏蔽用户', '举报用户', '清空聊天记录'],
            fail: () => {}
          })}
        >
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
                  src={msg.isMine ? currentUser.avatar : session.user.avatar}
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
        <View
          className={styles.sendBtn}
          onClick={handleSend}
        >
          <Text>发送</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;
