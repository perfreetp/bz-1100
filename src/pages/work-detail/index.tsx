import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockWorks } from '@/data/works';
import UserAvatar from '@/components/UserAvatar';
import ModelTag from '@/components/ModelTag';
import TopicTag from '@/components/TopicTag';
import ActionBar from '@/components/ActionBar';
import CommentItem from '@/components/CommentItem';
import { formatTime, formatNumber } from '@/utils';
import styles from './index.module.scss';

const WorkDetailPage: React.FC = () => {
  const work = mockWorks[0];
  const [followed, setFollowed] = useState(work.author.isFollowed);
  const [liked, setLiked] = useState(work.isLiked);
  const [collected, setCollected] = useState(work.isCollected);
  const [likeCount, setLikeCount] = useState(work.likes);
  const [collectCount, setCollectCount] = useState(work.collects);

  const handleFollow = () => {
    setFollowed(!followed);
    Taro.showToast({
      title: followed ? '已取消关注' : '关注成功',
      icon: 'none'
    });
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleCollect = () => {
    setCollected(!collected);
    setCollectCount(collected ? collectCount - 1 : collectCount + 1);
    Taro.showToast({
      title: collected ? '已取消收藏' : '收藏成功',
      icon: 'none'
    });
  };

  const handleShare = () => {
    console.log('[WorkDetail] 分享');
    Taro.showToast({ title: '分享功能', icon: 'none' });
  };

  const handleComment = () => {
    console.log('[WorkDetail] 评论');
    Taro.showToast({ title: '评论功能', icon: 'none' });
  };

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: ['举报内容', '屏蔽用户', '复制链接'],
      success: (res) => {
        console.log('[WorkDetail] 操作:', res.tapIndex);
        const actions = ['举报内容', '屏蔽用户', '复制链接'];
        Taro.showToast({ title: actions[res.tapIndex], icon: 'none' });
      }
    });
  };

  const mockComments = [
    {
      id: 'c1',
      author: work.author,
      content: '太美了！请问用的什么风格的LoRA？',
      likes: 45,
      isLiked: false,
      createdAt: '2024-06-10T08:00:00Z'
    },
    {
      id: 'c2',
      author: { id: 'u2', name: '创意设计师Lily', avatar: 'https://picsum.photos/id/338/200/200' },
      content: '这个构图绝了，层次感很强！求更多作品～',
      likes: 28,
      isLiked: true,
      createdAt: '2024-06-09T20:30:00Z'
    }
  ];

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.authorBar}>
          <UserAvatar src={work.author.avatar} size="lg" />
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{work.author.name}</Text>
            <Text className={styles.authorMeta}>{formatTime(work.createdAt)}</Text>
          </View>
          <View
            className={classnames(styles.followBtn, followed && styles.followed)}
            onClick={handleFollow}
          >
            <Text>{followed ? '已关注' : '关注'}</Text>
          </View>
        </View>

        <View className={styles.content}>
          <Text className={styles.title}>{work.title}</Text>
          <Text className={styles.description}>{work.description}</Text>
        </View>

        <View className={styles.imagesSection}>
          <View className={styles.imagesList}>
            {work.images.map((img, idx) => (
              <View key={idx} className={styles.imageItem}>
                <Image
                  className={styles.image}
                  src={img}
                  mode="widthFix"
                  onError={(e) => console.error('[WorkDetail] 图片加载失败:', e)}
                />
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionBlock}>
          <View className={styles.tagsWrap}>
            {work.modelTags.map(tag => (
              <ModelTag key={tag.id} name={tag.name} />
            ))}
          </View>
          <View className={styles.topicsWrap}>
            {work.topics?.map(topic => (
              <TopicTag key={topic.id} name={topic.name} />
            ))}
          </View>
        </View>

        {work.prompt && (
          <View className={styles.sectionBlock}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>✨</Text>
              提示词
            </Text>
            <View className={styles.promptBox}>
              <Text className={styles.promptText}>{work.prompt}</Text>
            </View>
          </View>
        )}

        {work.process && (
          <View className={styles.sectionBlock}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🎨</Text>
              创作过程
            </Text>
            <Text className={styles.processText}>{work.process}</Text>
          </View>
        )}

        <View className={styles.commentsSection}>
          <View className={styles.commentsHeader}>
            <Text className={styles.commentsTitle}>评论区</Text>
            <Text className={styles.commentsCount}>{formatNumber(work.comments)}条评论</Text>
          </View>
          {mockComments.map(c => (
            <CommentItem key={c.id} data={c as any} />
          ))}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.inputBar} onClick={handleComment}>
          <Text className={styles.inputIcon}>💬</Text>
          <Text className={styles.inputText}>说点什么...</Text>
        </View>
        <View
          className={classnames(styles.actionBtn, liked && styles.active)}
          onClick={handleLike}
        >
          <Text className={styles.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
          <Text className={classnames(styles.actionText, styles.like)}>{formatNumber(likeCount)}</Text>
        </View>
        <View
          className={classnames(styles.actionBtn, collected && styles.active)}
          onClick={handleCollect}
        >
          <Text className={styles.actionIcon}>{collected ? '⭐' : '☆'}</Text>
          <Text className={classnames(styles.actionText, styles.collect)}>{formatNumber(collectCount)}</Text>
        </View>
        <View className={styles.actionBtn} onClick={handleShare}>
          <Text className={styles.actionIcon}>🔗</Text>
          <Text className={styles.actionText}>分享</Text>
        </View>
        <View className={styles.actionBtn} onClick={handleMore}>
          <Text className={styles.actionIcon}>⋯</Text>
        </View>
      </View>
    </View>
  );
};

export default WorkDetailPage;
