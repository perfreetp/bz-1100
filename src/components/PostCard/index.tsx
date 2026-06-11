import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Post } from '@/types';
import { formatTime } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import ModelTag from '@/components/ModelTag';
import TopicTag from '@/components/TopicTag';
import ActionBar from '@/components/ActionBar';
import styles from './index.module.scss';

interface PostCardProps {
  post: Post;
  onDetail?: () => void;
}

const typeLabels: Record<string, string> = {
  prompt: '提示词',
  work: '作品',
  qa: '问答'
};

const PostCard: React.FC<PostCardProps> = ({ post, onDetail }) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [collected, setCollected] = useState(post.isCollected);
  const [followed, setFollowed] = useState(post.author.isFollowed);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [collectCount, setCollectCount] = useState(post.collects);

  const handleCardClick = () => {
    console.log('[PostCard] 点击卡片:', post.id);
    if (onDetail) {
      onDetail();
    } else if (post.type === 'work') {
      Taro.navigateTo({ url: `/pages/work-detail/index?id=${post.id}` });
    } else if (post.type === 'qa') {
      Taro.navigateTo({ url: `/pages/qa-detail/index?id=${post.id}` });
    } else {
      Taro.navigateTo({ url: `/pages/work-detail/index?id=${post.id}` });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    console.log('[PostCard] 点赞:', post.id, !liked);
  };

  const handleCollect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollected(!collected);
    setCollectCount(collected ? collectCount - 1 : collectCount + 1);
    console.log('[PostCard] 收藏:', post.id, !collected);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowed(!followed);
    console.log('[PostCard] 关注:', post.author.id, !followed);
    Taro.showToast({
      title: followed ? '已取消关注' : '关注成功',
      icon: 'none',
      duration: 1500
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[PostCard] 分享:', post.id);
    Taro.showToast({ title: '分享功能', icon: 'none' });
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[PostCard] 评论:', post.id);
    Taro.showToast({ title: '评论功能', icon: 'none' });
  };

  const getImageClass = () => {
    const len = post.images?.length || 0;
    if (len === 1) return styles.single;
    if (len === 2) return styles.double;
    return '';
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <View className={styles.header}>
        <UserAvatar src={post.author.avatar} size="md" />
        <View className={styles.userInfo}>
          <Text className={styles.userName}>{post.author.name}</Text>
          <View className={styles.meta}>
            <Text className={styles.time}>{formatTime(post.createdAt)}</Text>
            <View className={classnames(styles.typeBadge, styles[post.type])}>
              <Text>{typeLabels[post.type]}</Text>
            </View>
          </View>
        </View>
        <View
          className={classnames(styles.followBtn, followed && styles.followed)}
          onClick={handleFollow}
        >
          <Text>{followed ? '已关注' : '关注'}</Text>
        </View>
      </View>

      <View className={styles.content}>
        {post.title && <Text className={styles.title}>{post.title}</Text>}
        <Text className={styles.desc}>{post.content}</Text>
      </View>

      {post.images && post.images.length > 0 && (
        <View className={styles.images}>
          {post.images.slice(0, 3).map((img, idx) => (
            <View key={idx} className={classnames(styles.imageWrap, getImageClass())}>
              <Image
                className={styles.image}
                src={img}
                mode="aspectFill"
                onError={(e) => console.error('[PostCard] 图片加载失败:', img, e)}
              />
            </View>
          ))}
        </View>
      )}

      {post.modelTags && post.modelTags.length > 0 && (
        <View className={styles.tags}>
          {post.modelTags.map((tag) => (
            <ModelTag key={tag.id} name={tag.name} />
          ))}
        </View>
      )}

      {post.topics && post.topics.length > 0 && (
        <View className={styles.topics}>
          {post.topics.map((topic) => (
            <TopicTag
              key={topic.id}
              name={topic.name}
              onClick={(e) => {
                e?.stopPropagation?.();
                Taro.navigateTo({ url: `/pages/topic-detail/index?id=${topic.id}` });
              }}
            />
          ))}
        </View>
      )}

      <View className={styles.divider} />
      <ActionBar
        likes={likeCount}
        comments={post.comments}
        shares={post.shares}
        collects={collectCount}
        isLiked={liked}
        isCollected={collected}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onCollect={handleCollect}
      />
    </View>
  );
};

export default PostCard;
