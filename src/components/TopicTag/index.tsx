import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface TopicTagProps {
  name: string;
  onClick?: () => void;
}

const TopicTag: React.FC<TopicTagProps> = ({ name, onClick }) => {
  return (
    <View className={styles.tag} onClick={onClick}>
      <Text className={styles.hash}>#</Text>
      <Text className={styles.text}>{name}</Text>
    </View>
  );
};

export default TopicTag;
