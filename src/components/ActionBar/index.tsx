import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { formatNumber } from '@/utils';
import styles from './index.module.scss';

interface ActionBarProps {
  likes?: number;
  comments?: number;
  shares?: number;
  collects?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  collectCount?: number;
  isLiked?: boolean;
  isCollected?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onCollect?: () => void;
  compact?: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  likes,
  comments,
  shares,
  collects,
  likeCount,
  commentCount,
  shareCount,
  collectCount,
  isLiked,
  isCollected,
  onLike,
  onComment,
  onShare,
  onCollect,
  compact
}) => {
  const finalLikes = likeCount ?? likes ?? 0;
  const finalComments = commentCount ?? comments ?? 0;
  const finalShares = shareCount ?? shares ?? 0;
  const finalCollects = collectCount ?? collects ?? 0;

  return (
    <View className={classnames(styles.bar, compact && styles.compact)}>
      <View
        className={classnames(styles.item, isLiked && styles.active, styles.like)}
        onClick={onLike}
      >
        <Text className={styles.icon}>{isLiked ? '❤️' : '🤍'}</Text>
        <Text className={styles.text}>{formatNumber(finalLikes)}</Text>
      </View>
      <View className={styles.item} onClick={onComment}>
        <Text className={styles.icon}>💬</Text>
        <Text className={styles.text}>{formatNumber(finalComments)}</Text>
      </View>
      <View className={styles.item} onClick={onShare}>
        <Text className={styles.icon}>🔗</Text>
        <Text className={styles.text}>{formatNumber(finalShares)}</Text>
      </View>
      <View
        className={classnames(styles.item, isCollected && styles.active, styles.collect)}
        onClick={onCollect}
      >
        <Text className={styles.icon}>{isCollected ? '⭐' : '☆'}</Text>
        <Text className={styles.text}>{formatNumber(finalCollects)}</Text>
      </View>
    </View>
  );
};

export default ActionBar;
