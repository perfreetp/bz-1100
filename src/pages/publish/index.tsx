import React, { useState, useCallback } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockModelTags, mockTopics } from '@/data/topics';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const publishTypes = [
  { key: 'prompt', label: '提示词心得' },
  { key: 'work', label: 'AI作品' },
  { key: 'qa', label: '发起问答' }
];

const PublishPage: React.FC = () => {
  const [activeType, setActiveType] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const addDraft = useAppStore(state => state.addDraft);

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

  const handleSaveDraft = useCallback(() => {
    const draft = {
      id: `draft-${Date.now()}`,
      type: publishTypes[activeType].key as 'prompt' | 'work' | 'qa',
      title,
      content,
      images,
      modelTags: mockModelTags.filter(m => selectedModels.includes(m.id)),
      topics: mockTopics.filter(t => selectedTopics.includes(t.id)),
      updatedAt: new Date().toISOString()
    };
    addDraft(draft);
    console.log('[Publish] 保存草稿:', draft);
    Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
  }, [activeType, title, content, images, selectedModels, selectedTopics, addDraft]);

  const handlePublish = useCallback(() => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    console.log('[Publish] 发布内容:', {
      type: publishTypes[activeType].key,
      title,
      content,
      images,
      selectedModels,
      selectedTopics
    });
    Taro.showLoading({ title: '发布中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => {
        setTitle('');
        setContent('');
        setImages([]);
        setSelectedModels([]);
        setSelectedTopics([]);
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1000);
    }, 1500);
  }, [activeType, title, content, images, selectedModels, selectedTopics]);

  const currentType = publishTypes[activeType];

  return (
    <View className={styles.container}>
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

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleSaveDraft}>
          <Text>存草稿</Text>
        </View>
        <View className={styles.primaryBtn} onClick={handlePublish}>
          <Text>立即发布</Text>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
