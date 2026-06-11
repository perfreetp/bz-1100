import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ModelTagProps {
  name: string;
  onClick?: () => void;
}

const ModelTag: React.FC<ModelTagProps> = ({ name, onClick }) => {
  return (
    <View className={styles.tag} onClick={onClick}>
      <Text className={styles.text}>{name}</Text>
    </View>
  );
};

export default ModelTag;
