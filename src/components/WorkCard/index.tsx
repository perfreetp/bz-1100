import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Work } from '@/types';
import { formatNumber } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import styles from './index.module.scss';

interface WorkCardProps {
  work: Work;
}

const WorkCard: React.FC<WorkCardProps> = ({ work }) => {
  const handleClick = () => {
    console.log('[WorkCard] 点击作品:', work.id);
    Taro.navigateTo({ url: `/pages/work-detail/index?id=${work.id}` });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.coverWrap}>
        <Image
          className={styles.cover}
          src={work.cover}
          mode="aspectFill"
          onError={(e) => console.error('[WorkCard] 封面加载失败:', work.cover, e)}
        />
        <View className={styles.overlay}>
          <View className={styles.statRow}>
            <View className={styles.stat}>
              <Text className={styles.icon}>❤️</Text>
              <Text>{formatNumber(work.likes)}</Text>
            </View>
            <View className={styles.stat}>
              <Text className={styles.icon}>💬</Text>
              <Text>{formatNumber(work.comments)}</Text>
            </View>
          </View>
        </View>
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{work.title}</Text>
        <View className={styles.author}>
          <UserAvatar src={work.author.avatar} size="sm" />
          <Text className={styles.authorName}>{work.author.name}</Text>
        </View>
      </View>
    </View>
  );
};

export default WorkCard;
