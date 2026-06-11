import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockQuestions } from '@/data/questions';
import { formatTime, formatNumber } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import ModelTag from '@/components/ModelTag';
import TopicTag from '@/components/TopicTag';
import CommentItem from '@/components/CommentItem';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const QaDetailPage: React.FC = () => {
  const question = mockQuestions[0];
  const [followed, setFollowed] = useState(question.author.isFollowed);

  const handleFollow = () => {
    setFollowed(!followed);
    Taro.showToast({
      title: followed ? '已取消关注' : '关注成功',
      icon: 'none'
    });
  };

  const handleAnswer = () => {
    console.log('[QaDetail] 写回答');
    Taro.showToast({ title: '写回答功能', icon: 'none' });
  };

  const handleAdopt = (answerId: string) => {
    console.log('[QaDetail] 采纳回答:', answerId);
    Taro.showToast({ title: '已采纳为最佳回答', icon: 'success' });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.questionCard}>
          <View className={styles.authorRow}>
            <UserAvatar src={question.author.avatar} size="lg" />
            <View className={styles.authorInfo}>
              <Text className={styles.authorName}>{question.author.name}</Text>
              <Text className={styles.meta}>{formatTime(question.createdAt)}</Text>
            </View>
            <View
              className={classnames(styles.followBtn, followed && styles.followed)}
              onClick={handleFollow}
            >
              <Text>{followed ? '已关注' : '关注'}</Text>
            </View>
          </View>

          <Text className={styles.title}>{question.title}</Text>
          <Text className={styles.content}>{question.content}</Text>

          {question.modelTags && (
            <View className={styles.tags}>
              {question.modelTags.map(tag => (
                <ModelTag key={tag.id} name={tag.name} />
              ))}
            </View>
          )}

          {question.topics && (
            <View className={styles.topics}>
              {question.topics.map(topic => (
                <TopicTag key={topic.id} name={topic.name} />
              ))}
            </View>
          )}

          <View className={styles.statsRow}>
            <View className={styles.stat}>
              <Text className={styles.statIcon}>👀</Text>
              <Text>{formatNumber(question.views)} 浏览</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.statIcon}>💬</Text>
              <Text>{question.answers.length} 回答</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.statIcon}>❤️</Text>
              <Text>{formatNumber(question.likes)} 赞同</Text>
            </View>
          </View>
        </View>

        <View className={styles.answersSection}>
          <View className={styles.answersHeader}>
            <Text className={styles.answersTitle}>全部回答</Text>
            <Text className={styles.answersCount}>{question.answers.length} 个回答</Text>
          </View>

          {question.answers.length > 0 ? (
            question.answers.map(answer => (
              <View key={answer.id} className={styles.answerCard}>
                <CommentItem data={answer} showBest />
                {!answer.isBest && (
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
