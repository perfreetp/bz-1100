import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { formatTime, formatNumber } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import ModelTag from '@/components/ModelTag';
import TopicTag from '@/components/TopicTag';
import CommentItem from '@/components/CommentItem';
import EmptyState from '@/components/EmptyState';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import type { User } from '@/types';
import styles from './index.module.scss';

const QaDetailPage: React.FC = () => {
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const questionId = routerParams?.id || '';

  const {
    getQuestion,
    toggleLike,
    toggleFollow,
    isFollowing,
    adoptAnswer,
    blockUser,
    currentUser,
    addHistory
  } = useAppStore();

  const user: User = currentUser || defaultCurrentUser;
  const question = getQuestion(questionId);
  const [followed, setFollowed] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (question) {
      setFollowed(isFollowing(question.author.id));
      setLiked(!!question.isLiked);
      Taro.setNavigationBarTitle({ title: question.title || '问答详情' });

      addHistory({
        id: `h-${Date.now()}`,
        postId: question.id,
        post: {
          id: question.id,
          type: 'qa',
          author: question.author,
          title: question.title,
          content: question.content,
          images: [],
          modelTags: question.modelTags,
          topics: question.topics,
          likes: question.likes,
          comments: question.answers.length,
          shares: 0,
          collects: 0,
          createdAt: question.createdAt
        } as any,
        viewedAt: new Date().toISOString()
      });
    }
  }, [questionId, question, isFollowing, addHistory]);

  useDidShow(() => {
    if (question) {
      setFollowed(isFollowing(question.author.id));
      setLiked(!!question.isLiked);
    }
  });

  const handleFollow = () => {
    if (!question) return;
    toggleFollow(question.author.id);
    const newFollowed = !followed;
    setFollowed(newFollowed);
    Taro.showToast({
      title: newFollowed ? '关注成功' : '已取消关注',
      icon: 'none'
    });
  };

  const handleAnswer = () => {
    console.log('[QaDetail] 写回答:', questionId);
    Taro.showToast({ title: '写回答功能', icon: 'none' });
  };

  const handleAdopt = (answerId: string) => {
    if (!question) return;
    if (question.author.id !== user.id) {
      Taro.showToast({ title: '只能采纳自己提问的回答', icon: 'none' });
      return;
    }
    adoptAnswer(question.id, answerId);
    Taro.showToast({ title: '已采纳为最佳回答', icon: 'success' });
  };

  const handleLike = () => {
    if (!question) return;
    toggleLike('question', question.id);
    setLiked(!liked);
  };

  const handleMore = () => {
    if (!question) return;
    Taro.showActionSheet({
      itemList: ['举报内容', '屏蔽用户', '复制链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '举报已提交', icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.showModal({
            title: '屏蔽用户',
            content: `确定要屏蔽 ${question.author.name} 吗？`,
            confirmColor: '#EF4444',
            success: (r) => {
              if (r.confirm) {
                blockUser(question.author.id);
                Taro.showToast({ title: '已屏蔽', icon: 'success' });
              }
            }
          });
        } else if (res.tapIndex === 2) {
          Taro.setClipboardData({ data: `https://aichuangyi.com/qa/${question.id}` });
        }
      },
      fail: () => {}
    });
  };

  if (!question) {
    return (
      <View className={styles.container} style={{ paddingTop: 200 }}>
        <EmptyState icon="😕" title="问题不存在或已被删除" desc="去看看其他精彩内容吧" />
      </View>
    );
  }

  const isMyQuestion = question.author.id === user.id;
  const safeAuthor = question.author || { id: '', name: '匿名用户', avatar: '' };
  const safeAnswers = question.answers || [];

  const handleTopicClick = (topicId: string, e: any) => {
    e?.stopPropagation?.();
    Taro.navigateTo({ url: `/pages/topic-detail/index?id=${topicId}` });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.questionCard}>
          <View className={styles.authorRow}>
            <UserAvatar src={safeAuthor.avatar || ''} size="lg" />
            <View className={styles.authorInfo}>
              <Text className={styles.authorName}>{safeAuthor.name || '匿名用户'}</Text>
              <Text className={styles.meta}>{formatTime(question.createdAt)}</Text>
            </View>
            {!isMyQuestion && (
              <View
                className={classnames(styles.followBtn, followed && styles.followed)}
                onClick={handleFollow}
              >
                <Text>{followed ? '已关注' : '关注'}</Text>
              </View>
            )}
            {!isMyQuestion && (
              <View style={{ marginLeft: 16 }} onClick={handleMore}>
                <Text style={{ fontSize: 32 }}>⋯</Text>
              </View>
            )}
          </View>

          <Text className={styles.title}>{question.title || '无标题'}</Text>
          <Text className={styles.content}>{question.content || '暂无内容'}</Text>

          {question.modelTags && question.modelTags.length > 0 && (
            <View className={styles.tags}>
              {question.modelTags.map(tag => (
                <ModelTag key={tag.id} name={tag.name} />
              ))}
            </View>
          )}

          {question.topics && question.topics.length > 0 && (
            <View className={styles.topics}>
              {question.topics.map(topic => (
                <TopicTag
                  key={topic.id}
                  name={topic.name}
                  onClick={(e) => handleTopicClick(topic.id, e)}
                />
              ))}
            </View>
          )}

          <View className={styles.statsRow}>
            <View className={styles.stat}>
              <Text className={styles.statIcon}>👀</Text>
              <Text>{formatNumber(question.views || 0)} 浏览</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.statIcon}>💬</Text>
              <Text>{safeAnswers.length} 回答</Text>
            </View>
            <View className={styles.stat} onClick={handleLike}>
              <Text className={styles.statIcon}>{liked ? '❤️' : '🤍'}</Text>
              <Text>{formatNumber(question.likes || 0)} 赞同</Text>
            </View>
          </View>
        </View>

        <View className={styles.answersSection}>
          <View className={styles.answersHeader}>
            <Text className={styles.answersTitle}>全部回答</Text>
            <Text className={styles.answersCount}>{safeAnswers.length} 个回答</Text>
          </View>

          {safeAnswers.length > 0 ? (
            safeAnswers.map(answer => (
              <View key={answer.id} className={styles.answerCard}>
                <CommentItem data={answer} showBest />
                {isMyQuestion && !answer.isBest && (
                  <View
                    style={{ marginTop: 16, alignSelf: 'flex-end' }}
                    onClick={() => handleAdopt(answer.id)}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        color: '#7C3AED',
                        fontWeight: 500,
                        padding: '8rpx 24rpx',
                        background: 'rgba(124, 58, 237, 0.08)',
                        borderRadius: 999
                      }}
                    >
                      采纳为最佳回答
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <EmptyState icon="💭" title="暂无回答" desc="快来写下第一个回答吧" />
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.inputBar} onClick={handleAnswer}>
          <Text className={styles.inputIcon}>✍️</Text>
          <Text className={styles.inputText}>写下你的回答...</Text>
        </View>
      </View>
    </View>
  );
};

export default QaDetailPage;
