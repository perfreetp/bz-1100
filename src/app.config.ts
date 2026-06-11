export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/topic/index',
    'pages/publish/index',
    'pages/message/index',
    'pages/profile/index',
    'pages/work-detail/index',
    'pages/qa-detail/index',
    'pages/topic-detail/index',
    'pages/chat/index',
    'pages/edit-profile/index',
    'pages/settings/index',
    'pages/history/index',
    'pages/drafts/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'AI Creator Hub',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F8FAFC'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#7C3AED',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/topic/index',
        text: '话题'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
