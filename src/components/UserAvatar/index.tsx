import React from 'react';
import { View, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface UserAvatarProps {
  src: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, size = 'md', onClick }) => {
  return (
    <View className={classnames(styles.avatar, styles[size])} onClick={onClick}>
      <Image
        className={styles.image}
        src={src}
        mode="aspectFill"
        onError={(e) => console.error('[UserAvatar] 图片加载失败:', e)}
      />
    </View>
  );
};

export default UserAvatar;
