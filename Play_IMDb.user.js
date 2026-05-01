// ==UserScript==
// @name         Play IMDb
// @namespace    https://github.com/amaury-repo/Violentmonkey
// @version      20260501
// @description  IMDb 添加播放按钮
// @author       Amaury
// @match        *://www.imdb.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. 注入 CSS 样式：定义按钮的外观、交互动画以及标题栏的布局
    const style = document.createElement('style');
    style.textContent = `
        #play-imdb-btn {
            /* 居中图标，设置为行内弹性盒模型 */
            display: inline-flex; 
            align-items: center; 
            justify-content: center;
            /* 宽高相等配合 50% 圆角实现正圆 */
            width: 34px; 
            height: 34px; 
            background: #f5c518; /* IMDb 官方黄色 */
            border-radius: 50%;
            margin-right: 12px; 
            flex-shrink: 0; /* 防止在标题过长时被挤压变形 */
            transition: 0.2s; /* 设置平滑过渡效果 */
        }
        /* 鼠标悬停效果：稍微变暗并放大 */
        #play-imdb-btn:hover { 
            filter: brightness(0.9); 
            transform: scale(1.1); 
        }
        /* 强制标题容器使用 flex 布局，确保按钮和文字垂直居中对齐 */
        h1[data-testid="hero__pageTitle"] { 
            display: flex !important; 
            align-items: center; 
        }
    `;
    document.head.appendChild(style);

    // 2. 定义注入函数：将按钮插入到页面指定位置
    function injectButton() {
        // 尝试定位 IMDb 电影详情页的主标题 H1
        const titleH1 = document.querySelector('h1[data-testid="hero__pageTitle"]');
        
        // 性能保护：如果没找到标题，或者按钮已经存在，则不重复执行
        if (!titleH1 || document.getElementById('play-imdb-btn')) return;

        // 创建按钮元素 (a 标签)
        const btn = document.createElement('a');
        btn.id = 'play-imdb-btn';
        // 核心功能：将当前网址中的 imdb.com 替换为 playimdb.com
        btn.href = window.location.href.replace('www.imdb.com', 'www.playimdb.com');
        btn.target = '_blank'; // 新窗口打开
        
        // 插入黑色播放图标 (SVG)
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="black"><path d="M8 5v14l11-7z"/></svg>`;

        // 将按钮添加到标题文字的最前面
        titleH1.prepend(btn);
    }

    // 3. 动态监测：IMDb 是单页应用，切换影片时页面不会整体刷新
    // 使用 MutationObserver 监测 body 的变化，一旦页面更新就再次尝试注入按钮
    new MutationObserver(injectButton).observe(document.body, { 
        childList: true, 
        subtree: true 
    });

    // 4. 首次进入页面时执行一次注入
    injectButton();
})();
