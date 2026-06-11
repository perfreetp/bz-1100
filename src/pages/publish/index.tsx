import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Input, Textarea, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { mockModelTags, mockTopics } from '@/data/topics';
import useAppStore from '@/store/useAppStore';
import { defaultCurrentUser } from '@/data/users';
import type { ModelTag, Topic, User } from '@/types';
import styles from './index.module.scss';

const publishTypes = [
  { key: 'prompt', label: '提示词心得' },
  { key: 'work', label: 'AI作品' },
  { key: 'qa', label: '发起问答' }
];

const PublishPage: React.FC = () => {
  const routerParams = Taro.getCurrentInstance().router?.params || {};
  const draftId = routerParams?.draftId as string | undefined;

  const {
    addDraft,
    getDraft,
    removeDraft,
    updateDraft,
    addPost,
    addWork,
    addQuestion,
    currentUser
  } = useAppStore();

  const user: User = currentUser || defaultCurrentUser;

  const [activeType, setActiveType] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (draftId) {
      const draft = getDraft(draftId);
      if (draft) {
        const typeIndex = publishTypes.findIndex(t => t.key === draft.type);
        if (typeIndex >= 0) setActiveType(typeIndex);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setImages(draft.images || []);
        setSelectedModels(draft.modelTags?.map(m => m.id) || []);
        setSelectedTopics(draft.topics?.map(t => t.id) || []);
        setEditingDraftId(draftId);
        Taro.setNavigationBarTitle({ title: '编辑草稿' });
      }
    } else {
      Taro.setNavigationBarTitle({ title: '发布' });
    }
  }, [draftId, getDraft]);

  useDidShow(() => {
    if (draftId) {
      const draft = getDraft(draftId);
      if (draft) {
        const typeIndex = publishTypes.findIndex(t => t.key === draft.type);
        if (typeIndex >= 0) setActiveType(typeIndex);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setImages(draft.images || []);
        setSelectedModels(draft.modelTags?.map(m => m.id) || []);
        setSelectedTopics(draft.topics?.map(t => t.id) || []);
        setEditingDraftId(draftId);
      }
    }
  });

  const handleImageAdd = useCallback(() => {
    console.log('[Publish] 添加图片');
    Taro.chooseImage({
      count: 9 - images.length,
      success: (res) => {
        setImages(prev => [...prev, ...res.tempFilePaths].slice(0, 9));
      },
      fail: (err) => {
        console.error('[Publish] 选择图片失败:', err);
        const demoImages = [
          'https://picsum.photos/id/1/300/300',
          'https://picsum.photos/id/2/300/300',
          'https://picsum.photos/id/3/300/300'
        ];
        setImages(prev => [...prev, ...demoImages].slice(0, 9));
      }
    });
  }, [images.length]);

  const handleImageRemove = useCallback((idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const toggleModel = useCallback((id: string) => {
    setSelectedModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  }, []);

  const toggleTopic = useCallback((id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }, []);

  const getSelectedModelsData = (): ModelTag[] => {
    return mockModelTags.filter(m => selectedModels.includes(m.id));
  };

  const getSelectedTopicsData = (): Topic[] => {
    return mockTopics.filter(t => selectedTopics.includes(t.id));
  };

  const validateContent = (): boolean => {
    const typeKey = publishTypes[activeType].key;

    if (typeKey !== 'prompt' && !title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return false;
    }

    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return false;
    }

    if (typeKey === 'work' && images.length === 0) {
      Taro.showToast({ title: '请上传至少一张作品图片', icon: 'none' });
      return false;
    }

    return true;
  };

  const handleSaveDraft = useCallback(() => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容后再保存', icon: 'none' });
      return;
    }

    const now = new Date().toISOString();
    const draftData = {
      id: editingDraftId || `draft-${Date.now()}`,
      type: publishTypes[activeType].key as 'prompt' | 'work' | 'qa',
      title,
      content,
      images,
      modelTags: getSelectedModelsData(),
      topics: getSelectedTopicsData(),
      savedAt: now,
      updatedAt: now
    };

    if (editingDraftId) {
      updateDraft(draftData);
    } else {
      addDraft(draftData);
    }

    console.log('[Publish] 保存草稿:', draftData);
    Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
  }, [activeType, title, content, images, selectedModels, selectedTopics, editingDraftId, addDraft, updateDraft]);

  const handlePublish = useCallback(() => {
    if (!validateContent()) return;

    const typeKey = publishTypes[activeType].key as 'prompt' | 'work' | 'qa';
    const now = new Date().toISOString();
    const author = user;
    const modelTags = getSelectedModelsData();
    const topics = getSelectedTopicsData();

    Taro.showLoading({ title: '发布中...' });

    try {
      const contentId = editingDraftId || `p-${Date.now()}`;

      if (typeKey === 'work') {
        addWork({
          id: contentId,
          author,
          title: title.trim(),
          description: content.trim(),
          cover: images[0] || '',
          images,
          modelTags,
          prompt: '',
          process: '',
          topics,
          likes: 0,
          comments: 0,
          shares: 0,
          collects: 0,
          isLiked: false,
          isCollected: false,
          createdAt: now
        });
      } else if (typeKey === 'qa') {
        addQuestion({
          id: contentId,
          author,
          title: title.trim(),
          content: content.trim(),
          answers: [],
          modelTags,
          topics,
          likes: 0,
          views: 0,
          isLiked: false,
          createdAt: now
        });
      } else {
        addPost({
          id: contentId,
          type: 'prompt',
          author,
          title: title.trim() || undefined,
          content: content.trim(),
          images: images.length > 0 ? images : undefined,
          modelTags: modelTags.length > 0 ? modelTags : undefined,
          topics: topics.length > 0 ? topics : undefined,
          likes: 0,
          comments: 0,
          shares: 0,
          collects: 0,
          isLiked: false,
          isCollected: false,
          createdAt: now
        });
      }

      if (editingDraftId) {
        removeDraft(editingDraftId);
      }

      setTimeout(() => {
        Taro.hideLoading();
        Taro.showToast({ title: '发布成功', icon: 'success' });

        setTitle('');
        setContent('');
        setImages([]);
        setSelectedModels([]);
        setSelectedTopics([]);
        setEditingDraftId(undefined);

        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' });
        }, 800);
      }, 800);
    } catch (err) {
      console.error('[Publish] 发布失败:', err);
      Taro.hideLoading();
      Taro.showToast({ title: '发布失败，请重试', icon: 'none' });
    }
  }, [activeType, title, content, images, selectedModels, selectedTopics, editingDraftId, currentUser, addPost, addWork, addQuestion, removeDraft]);

  const currentType = publishTypes[activeType];

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.typeTabs}>
          {publishTypes.map((type, idx) => (
            <View
              key={type.key}
              className={classnames(styles.typeTab, idx === activeType && styles.activeType)}
              onClick={() => setActiveType(idx)}
            >
              <Text className={styles.typeText}>{type.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.form}>
          {currentType.key !== 'prompt' && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                标题
                <Text className={styles.required}>*</Text>
              </Text>
              <Input
                className={styles.titleInput}
                placeholder={
                  currentType.key === 'work' ? '给你的作品起个名字' : '写下你的问题'
                }
                placeholderClass={styles.placeholder}
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
                maxlength={50}
              />
            </View>
          )}

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              {currentType.key === 'qa' ? '问题描述' : '内容'}
              <Text className={styles.required}>*</Text>
            </Text>
            <Textarea
              className={styles.contentInput}
              placeholder={
                currentType.key === 'prompt'
                  ? '分享你的提示词心得、使用技巧...'
                  : currentType.key === 'work'
                  ? '描述你的创作思路、使用的工具和参数...'
                  : '详细描述你遇到的问题，让大家更好地帮助你...'
              }
              placeholderClass={styles.placeholder}
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={5000}
              autoHeight
            />
          </View>

          {currentType.key === 'work' && (
            <View className={styles.imagesSection}>
              <Text className={styles.sectionTitle}>
                上传作品图片
                <Text style={{ fontSize: '24rpx', color: '#94A3B8', fontWeight: 'normal', marginLeft: 8 }}>
                  （最多9张）
                </Text>
              </Text>
              <View className={styles.imagesGrid}>
                {images.map((img, idx) => (
                  <View key={idx} className={styles.imageItem}>
                    <Image
                      className={styles.previewImg}
                      src={img}
                      mode="aspectFill"
                      onError={(e) => console.error('[Publish] 图片预览失败:', e)}
                    />
                    <View className={styles.removeBtn} onClick={() => handleImageRemove(idx)}>
                      <Text>×</Text>
                    </View>
                  </View>
                ))}
                {images.length < 9 && (
                  <View className={styles.addBtn} onClick={handleImageAdd}>
                    <Text className={styles.addIcon}>+</Text>
                    <Text className={styles.addText}>添加图片</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>选择模型标签</Text>
            <View className={styles.tagsWrap}>
              {mockModelTags.slice(0, 8).map(tag => (
                <View
                  key={tag.id}
                  className={classnames(styles.tagItem, selectedModels.includes(tag.id) && styles.selected)}
                  onClick={() => toggleModel(tag.id)}
                >
                  <Text>{tag.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>选择话题</Text>
            <View className={styles.tagsWrap}>
              {mockTopics.slice(0, 6).map(topic => (
                <View
                  key={topic.id}
                  className={classnames(styles.tagItem, selectedTopics.includes(topic.id) && styles.selected)}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <Text>#{topic.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleSaveDraft}>
          <Text>{editingDraftId ? '更新草稿' : '存草稿'}</Text>
        </View>
        <View className={styles.primaryBtn} onClick={handlePublish}>
          <Text>{editingDraftId ? '发布更新' : '立即发布'}</Text>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
