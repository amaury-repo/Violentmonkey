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
        // 获取当前页面的URL
        const currentUrl = window.location.href;

        // 判断页面类型：是否是列表页面或者视频播放页面
        const isListPage = currentUrl.includes('#/list');
        const isVideoPage = currentUrl.includes('#/video');

        if (isVideoPage) {
            console.log("执行视频播放页子程序");
            handleVideoPage();
        } else if (isListPage) {
            console.log("执行视频列表页子程序");
            handleListPage();
        } else {
            console.log("无法识别页面类型");
        }
    }, 10000); // 每10秒运行一次

    // 视频播放页处理
    function handleVideoPage() {
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
                console.log('自动点击了按钮：' + text);
                isPlaying = true;
            }
        });
        // 未播放自动返回上页
        if (!isPlaying) {
            console.log("检测到停止播放，返回上一页...");
            window.history.back();
            setTimeout(() => {
                window.location.reload(); // 延迟一段时间后刷新页面
            }, 1000); // 延迟1秒后刷新，确保页面能够跳转
        }
    }

    // 列表页处理
    function handleListPage() {
        // 自动寻找未看过的视频
        const items = Array.from(document.querySelectorAll('.kng-list-new__tags')).filter(tagDiv => {
            const tagTexts = Array.from(tagDiv.querySelectorAll('.kng-list-new__tag')).map(tag => tag.textContent.trim());
            return tagTexts.includes("视频") && !tagTexts.includes("已学完");
        }).map(tagDiv => tagDiv.closest('li'));

        if (items.length > 0) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            const clickableElement = randomItem?.querySelector('.kng-list-new__cover');
            if (clickableElement && clickableElement.offsetWidth > 0 && clickableElement.offsetHeight > 0) {
                clickableElement.click();
                console.log('随机选择了一个视频');
            }
        }else {
            // 如果没有找到目标，尝试翻页
            const currentPageElement = document.querySelector('li.number.active'); // 获取当前页码元素
            const currentPageNumber = parseInt(currentPageElement?.textContent.trim(), 10) || 1; // 获取当前页码值
            const nextPage = document.querySelector(`li.number:nth-child(${currentPageNumber + 1})`); // 查找下一个页码按钮

            if (nextPage) {
                nextPage.click();
                console.log('没有找到未看过的视频，正在翻页');
            } else {
                console.log('已是最后一页，无法翻页');
            }
        }
    }

})();
