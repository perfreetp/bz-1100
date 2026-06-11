import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Answer, Comment } from '@/types';
import { formatTime, formatNumber } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import styles from './index.module.scss';

interface CommentItemProps {
  data: Answer | Comment;
  showBest?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ data, showBest = false }) => {
  const [liked, setLiked] = useState(data.isLiked);
  const [count, setCount] = useState(data.likes);

  const handleLike = () => {
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    console.log('[CommentItem] 点赞回答/评论:', data.id);
  };

  const isBest = 'isBest' in data && data.isBest;

  return (
    <View className={styles.item}>
      <UserAvatar src={data.author.avatar} size="md" />
      <View className={styles.contentWrap}>
        <View className={styles.header}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <Text className={styles.name}>{data.author.name}</Text>
            {showBest && isBest && (
              <View className={styles.badge}>
                <Text>最佳回答</Text>
              </View>
            )}
          </View>
        </View>
        <Text className={styles.text}>{data.content}</Text>
        <View className={styles.footer}>
          <Text className={styles.time}>{formatTime(data.createdAt)}</Text>
          <View
            className={classnames(styles.likeBtn, liked && styles.liked)}
            onClick={handleLike}
          >
            <Text className={styles.likeIcon}>{liked ? '❤️' : '🤍'}</Text>
            <Text className={styles.likeText}>{formatNumber(count)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentItem;
