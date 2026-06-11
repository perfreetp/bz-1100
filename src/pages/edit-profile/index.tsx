import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { currentUser } from '@/data/users';
import UserAvatar from '@/components/UserAvatar';
import styles from './index.module.scss';

const availableBadges = [
  { id: '1', icon: '🎨', name: '视觉创作者' },
  { id: '2', icon: '✍️', name: '文案大师' },
  { id: '3', icon: '🎬', name: '视频创作者' },
  { id: '4', icon: '🎵', name: '音乐制作人' },
  { id: '5', icon: '💻', name: '代码极客' },
  { id: '6', icon: '🌟', name: '社区新星' },
  { id: '7', icon: '🔥', name: '活跃达人' },
  { id: '8', icon: '📚', name: '知识分享者' }
];

const EditProfilePage: React.FC = () => {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    currentUser.badges?.map(b => b.id) || []
  );

  const toggleBadge = (badgeId: string) => {
    if (selectedBadges.includes(badgeId)) {
      setSelectedBadges(selectedBadges.filter(id => id !== badgeId));
    } else if (selectedBadges.length < 3) {
      setSelectedBadges([...selectedBadges, badgeId]);
    } else {
      Taro.showToast({ title: '最多选择3个徽章', icon: 'none' });
    }
  };

  const handleSave = () => {
    console.log('[EditProfile] 保存资料', { name, bio, selectedBadges });
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 500);
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.avatarSection}>
          <UserAvatar src={currentUser.avatar} size="xl" />
          <Text className={styles.avatarLabel}>点击更换头像</Text>
        </View>

        <View className={styles.formGroup}>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>昵称</Text>
            <Input
              className={styles.formInput}
              value={name}
              onInput={(e) => setName(e.detail.value)}
              placeholder="请输入昵称"
              placeholderStyle="color: #9CA3AF"
            />
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>简介</Text>
            <Input
              className={styles.formInput}
              value={bio}
              onInput={(e) => setBio(e.detail.value)}
              placeholder="一句话介绍自己"
              placeholderStyle="color: #9CA3AF"
              maxlength={50}
            />
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>性别</Text>
            <Text className={styles.formValue}>{currentUser.gender || '保密'}</Text>
            <Text className={styles.formArrow}>›</Text>
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>地区</Text>
            <Text className={styles.formValue}>北京</Text>
            <Text className={styles.formArrow}>›</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>我的徽章（最多选3个）</Text>
        <View className={styles.badgesList}>
          <View className={styles.badgeGrid}>
            {availableBadges.map(badge => (
              <View
                key={badge.id}
                className={classnames(
                  styles.badgeItem,
                  selectedBadges.includes(badge.id) && styles.badgeItemActive
                )}
                onClick={() => toggleBadge(badge.id)}
              >
                <Text className={styles.badgeIcon}>{badge.icon}</Text>
                <Text className={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.saveBtn} onClick={handleSave}>
        <Text>保存</Text>
      </View>
    </View>
  );
};

export default EditProfilePage;
