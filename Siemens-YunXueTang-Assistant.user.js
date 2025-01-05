// ==UserScript==
// @name         Siemens YunXueTang Assistant
// @namespace    https://github.com/Amaury-GitHub/Tampermonkey
// @version      1.1
// @description  西门子云学堂自学习助手
// @author       Amaury
// @match        *://siemens.yunxuetang.cn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 定时任务，10秒循环
    setInterval(() => {
        // 判断当前页是播放页还是列表页
        const currentUrl = window.location.href;
        const isVideoPage = currentUrl.includes('#/video');
        const isListPage = currentUrl.includes('#/list');

        if (isVideoPage) {
            console.log("执行播放页子程序");
            handleVideoPage();
        } else if (isListPage) {
            console.log("执行列表页子程序");
            handleListPage();
        } else {
            console.log("无法识别页面类型");
        }
    }, 10000);

    // 播放页子程序
    function handleVideoPage() {
        // 检测是否已完成
        const completedElement = document.querySelector('span.opacity8.ml8');
        if( completedElement && completedElement.textContent.trim() === "已完成学习") {
            console.log("检测到已完成，返回上一页");
            window.history.back();
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
        // 自动静音
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(media => {
            if (!media.muted) {
                media.muted = true;
                console.log('自动静音');
            }
        });
        // 检测播放是否停止
        let isPlaying = false;
        mediaElements.forEach(media => {
            if (!media.paused && !media.ended && media.readyState > 2) {
                isPlaying = true;
            }
        });
        // 自动点击按钮
        const buttons = Array.from(document.getElementsByTagName('button'));
        buttons.forEach(button => {
            const text = button.textContent.trim();
            if ((text === "开始学习" || text === "继续学习") && button.offsetWidth > 0) {
                button.click();
                console.log('自动点击' + text);
                isPlaying = true;
            }
        });
        // 未播放自动返回上页
        if (!isPlaying) {
            console.log("检测到未播放，返回上一页");
            window.history.back();
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    }

    // 列表页子程序
    function handleListPage() {
        // 自动查找未学习的视频
        const items = Array.from(document.querySelectorAll('.kng-list-new__tags')).filter(tagDiv => {
            const tagTexts = Array.from(tagDiv.querySelectorAll('.kng-list-new__tag')).map(tag => tag.textContent.trim());
            return tagTexts.includes("视频") && !tagTexts.includes("已学完");
        }).map(tagDiv => tagDiv.closest('li'));
        // 找到视频自动播放
        if (items.length > 0) {
            const firstItem = items[0];
            const clickableElement = firstItem?.querySelector('.kng-list-new__cover');
            if (clickableElement && clickableElement.offsetWidth > 0 && clickableElement.offsetHeight > 0) {
                clickableElement.click();
                console.log('自动选择未学习的视频');
            }}else {
                // 未找到视频自动翻页
                const currentPageElement = document.querySelector('li.number.active');
                const currentPageNumber = parseInt(currentPageElement?.textContent.trim(), 10) || 1;
                const nextPage = document.querySelector(`li.number:nth-child(${currentPageNumber + 1})`);
                if (nextPage) {
                    nextPage.click();
                    console.log('没有找到未学习的视频，自动翻页');
                } else {
                    console.log('已是最后一页，无法翻页');
                }
            }
    }
})();
