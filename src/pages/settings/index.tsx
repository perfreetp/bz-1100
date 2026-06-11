import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import styles from './index.module.scss';

const SettingsPage: React.FC = () => {
  const { darkMode, toggleDarkMode, blockedUsers, drafts, history } = useAppStore();

  const handleDarkMode = () => {
    toggleDarkMode();
  };

  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      confirmColor: '#7C3AED',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '缓存已清除', icon: 'success' });
        }
      }
    });
  };

  const handleAbout = () => {
    Taro.showModal({
      title: '关于我们',
      content: 'AI 创意社区 v1.0.0\n致力于为 AI 创作者提供最好的交流平台',
      showCancel: false,
      confirmColor: '#7C3AED'
    });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出登录', icon: 'none' });
        }
      }
    });
  };

  const handleBlockedUsers = () => {
    Taro.showToast({ title: `屏蔽列表：${blockedUsers.length}人`, icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <Text className={styles.sectionTitle}>通用设置</Text>
        <View className={styles.sectionGroup}>
          <View className={styles.settingRow} onClick={handleDarkMode}>
            <View className={styles.settingIcon}>🌙</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>夜间模式</Text>
            </View>
            <View className={classnames(styles.switch, darkMode && styles.on)}>
              <View className={styles.switchKnob} />
            </View>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>🔔</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>消息通知</Text>
            </View>
            <Text className={styles.settingValue}>已开启</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>📱</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>浏览设置</Text>
              <Text className={styles.settingDesc}>图片质量、自动播放等</Text>
            </View>
            <Text className={styles.settingArrow}>›</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>隐私与安全</Text>
        <View className={styles.sectionGroup}>
          <View className={styles.settingRow} onClick={handleBlockedUsers}>
            <View className={styles.settingIcon}>🚫</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>屏蔽管理</Text>
            </View>
            <Text className={styles.settingValue}>{blockedUsers.length}人</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>🔒</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>隐私设置</Text>
              <Text className={styles.settingDesc}>谁可以看我的动态、作品</Text>
            </View>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>🛡️</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>账号安全</Text>
            </View>
            <Text className={styles.settingArrow}>›</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>存储与数据</Text>
        <View className={styles.sectionGroup}>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>📦</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>我的草稿</Text>
            </View>
            <Text className={styles.settingValue}>{drafts.length}篇</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>📜</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>浏览历史</Text>
            </View>
            <Text className={styles.settingValue}>{history.length}条</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow} onClick={handleClearCache}>
            <View className={styles.settingIcon}>🧹</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>清除缓存</Text>
            </View>
            <Text className={styles.settingValue}>25.6MB</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>其他</Text>
        <View className={styles.sectionGroup}>
          <View className={styles.settingRow} onClick={handleAbout}>
            <View className={styles.settingIcon}>ℹ️</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>关于我们</Text>
            </View>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>💬</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>意见反馈</Text>
            </View>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>📄</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>用户协议</Text>
            </View>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingRow}>
            <View className={styles.settingIcon}>🔐</View>
            <View className={styles.settingContent}>
              <Text className={styles.settingLabel}>隐私政策</Text>
            </View>
            <Text className={styles.settingArrow}>›</Text>
          </View>
        </View>

        <View className={styles.logoutBtn} onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsPage;
