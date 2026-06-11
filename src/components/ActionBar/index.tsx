import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { formatNumber } from '@/utils';
import styles from './index.module.scss';

interface ActionBarProps {
  likes: number;
  comments: number;
  shares: number;
  collects: number;
  isLiked?: boolean;
  isCollected?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onCollect?: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  likes,
  comments,
  shares,
  collects,
  isLiked,
  isCollected,
  onLike,
  onComment,
  onShare,
  onCollect
}) => {
  return (
    <View className={styles.bar}>
      <View
        className={classnames(styles.item, isLiked && styles.active, styles.like)}
        onClick={onLike}
      >
        <Text className={styles.icon}>{isLiked ? '❤️' : '🤍'}</Text>
        <Text className={styles.text}>{formatNumber(likes)}</Text>
      </View>
      <View className={styles.item} onClick={onComment}>
        <Text className={styles.icon}>💬</Text>
        <Text className={styles.text}>{formatNumber(comments)}</Text>
      </View>
      <View className={styles.item} onClick={onShare}>
        <Text className={styles.icon}>🔗</Text>
        <Text className={styles.text}>{formatNumber(shares)}</Text>
      </View>
      <View
        className={classnames(styles.item, isCollected && styles.active, styles.collect)}
        onClick={onCollect}
      >
        <Text className={styles.icon}>{isCollected ? '⭐' : '☆'}</Text>
        <Text className={styles.text}>{formatNumber(collects)}</Text>
      </View>
    </View>
  );
};

export default ActionBar;
