import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import { formatTime } from '@/utils';
import EmptyState from '@/components/EmptyState';
import type { User } from '@/types';
import styles from './index.module.scss';

const typeNameMap: Record<string, string> = {
  prompt: '提示词心得',
  work: '作品',
  qa: '问答'
};

const DraftsPage: React.FC = () => {
  const { drafts, removeDraft, getDraft, addPost, addWork, addQuestion, currentUser } = useAppStore();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const user: User = currentUser || defaultCurrentUser;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === drafts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(drafts.map(d => d.id));
    }
  };

  const handleEdit = (draftId: string) => {
    console.log('[Drafts] 继续编辑草稿:', draftId);
    Taro.navigateTo({
      url: `/pages/publish/index?draftId=${draftId}`
    });
  };

  const handleDelete = (draftId: string) => {
    Taro.showModal({
      title: '删除草稿',
      content: '确定要删除这篇草稿吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          removeDraft(draftId);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    Taro.showModal({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedIds.length} 篇草稿吗？`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          selectedIds.forEach(id => removeDraft(id));
          setSelectedIds([]);
          setSelectMode(false);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handlePublish = (draftId: string) => {
    const draft = getDraft(draftId);
    if (!draft) return;

    Taro.showModal({
      title: '发布草稿',
      content: '确定要发布这篇草稿吗？',
      confirmColor: '#7C3AED',
      success: (res) => {
        if (!res.confirm) return;

        const now = new Date().toISOString();
        const author = user;

        if (draft.type === 'work') {
          addWork({
            id: draft.id,
            author,
            title: draft.title || '未命名作品',
            description: draft.content || '',
            cover: draft.images?.[0] || '',
            images: draft.images || [],
            modelTags: draft.modelTags || [],
            prompt: '',
            process: '',
            topics: draft.topics || [],
            likes: 0,
            comments: 0,
            shares: 0,
            collects: 0,
            isLiked: false,
            isCollected: false,
            createdAt: now
          });
        } else if (draft.type === 'qa') {
          addQuestion({
            id: draft.id,
            author,
            title: draft.title || '未命名问题',
            content: draft.content || '',
            answers: [],
            modelTags: draft.modelTags || [],
            topics: draft.topics || [],
            likes: 0,
            views: 0,
            isLiked: false,
            createdAt: now
          });
        } else {
          addPost({
            id: draft.id,
            type: 'prompt',
            author,
            title: draft.title,
            content: draft.content || '',
            images: draft.images,
            modelTags: draft.modelTags,
            topics: draft.topics,
            likes: 0,
            comments: 0,
            shares: 0,
            collects: 0,
            isLiked: false,
            isCollected: false,
            createdAt: now
          });
        }

        removeDraft(draftId);
        Taro.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' });
        }, 800);
      }
    });
  };

  return (
    <View className={styles.container}>
      {selectMode && (
        <View className={styles.selectBar}>
          <View className={styles.selectBarLeft}>
            <View
              className={classnames(
                styles.checkbox,
                selectedIds.length === drafts.length && drafts.length > 0 && styles.checkboxChecked
              )}
              onClick={handleSelectAll}
            >
              {selectedIds.length === drafts.length && drafts.length > 0 && (
                <Text className={styles.checkIcon}>✓</Text>
              )}
            </View>
            <Text>已选 {selectedIds.length} / {drafts.length}</Text>
          </View>
          <View className={styles.actions}>
            <View
              className={classnames(styles.actionBtn, selectedIds.length > 0 && styles.actionBtnDanger)}
              onClick={handleBatchDelete}
            >
              <Text>删除</Text>
            </View>
            <View
              className={classnames(styles.selectBtn, styles.selectBtnActive)}
              onClick={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
            >
              <Text>取消</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView scrollY>
        {drafts.length > 0 ? (
          <View className={styles.draftList}>
            {drafts.map(draft => (
              <View key={draft.id} className={styles.draftCardWrap}>
                {selectMode && (
                  <View
                    className={classnames(
                      styles.checkbox,
                      selectedIds.includes(draft.id) && styles.checkboxChecked
                    )}
                    onClick={() => toggleSelect(draft.id)}
                  >
                    {selectedIds.includes(draft.id) && (
                      <Text className={styles.checkIcon}>✓</Text>
                    )}
                  </View>
                )}
                <View className={styles.draftCard} style={{ flex: 1 }}>
                  <View className={styles.draftHeader}>
                    <View className={styles.typeTag}>
                      <Text>{typeNameMap[draft.type] || '动态'}</Text>
                    </View>
                    <Text className={styles.draftTime}>{formatTime(draft.savedAt)}</Text>
                  </View>
                  {draft.title && (
                    <Text className={styles.draftTitle}>{draft.title}</Text>
                  )}
                  {draft.content && (
                    <Text className={styles.draftContent}>{draft.content}</Text>
                  )}
                  {draft.images && draft.images.length > 0 && (
                    <View className={styles.draftImgs}>
                      {draft.images.slice(0, 3).map((img, idx) => (
                        <Image
                          key={idx}
                          className={styles.draftImg}
                          src={img}
                          mode="aspectFill"
                          onError={(e) => console.error('[Drafts] 图片加载失败:', e)}
                        />
                      ))}
                    </View>
                  )}
                  <View className={styles.draftFooter}>
                    <View className={styles.tags}>
                      {draft.modelTags?.map(tag => (
                        <View key={tag.id} className={styles.miniTag}>
                          <Text>{tag.name}</Text>
                        </View>
                      ))}
                      {draft.topics?.slice(0, 2).map(topic => (
                        <View key={topic.id} className={styles.miniTag}>
                          <Text>#{topic.name}</Text>
                        </View>
                      ))}
                    </View>
                    {!selectMode && (
                      <View className={styles.actions}>
                        <View
                          className={styles.actionBtn}
                          onClick={() => handleDelete(draft.id)}
                        >
                          <Text>删除</Text>
                        </View>
                        <View
                          className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                          onClick={() => handleEdit(draft.id)}
                        >
                          <Text>编辑</Text>
                        </View>
                        <View
                          className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                          onClick={() => handlePublish(draft.id)}
                        >
                          <Text>发布</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {!selectMode && (
              <View style={{ padding: '32rpx 0', textAlign: 'center' }}>
                <View
                  className={classnames(styles.selectBtn)}
                  onClick={() => setSelectMode(true)}
                >
                  <Text>管理草稿</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState icon="📝" title="暂无草稿" desc="快去创作点内容吧" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DraftsPage;
