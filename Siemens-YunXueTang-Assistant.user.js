// ==UserScript==
// @name         Siemens YunXueTang Assistant
// @namespace    https://github.com/Amaury-GitHub/Tampermonkey
// @version      1.2
// @description  西门子云学堂自动学习
// @author       Amaury
// @match        *://siemens.yunxuetang.cn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 10s执行一次
    const workerCode = `
        let interval = 10000;
        self.onmessage = (e) => {
            if (e.data === 'start') {
                setInterval(() => {
                    self.postMessage('tick');
                }, interval);
            }
        };
    `;

    // 创建 Worker Blob
    const workerBlob = new Blob([workerCode], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    // 启动 Worker 定时任务
    worker.postMessage('start');

    // 监听 Worker 消息
    worker.onmessage = () => {
        const currentUrl = window.location.href;
        const isVideoPage = currentUrl.includes('#/video');
        const isListPage = currentUrl.includes('#/list');

        if (isVideoPage) {
            handleVideoPage();
        } else if (isListPage) {
            handleListPage();
        } else {
            console.log("无法识别页面类型");
        }
    };

    // 播放页子程序
    function handleVideoPage() {
        // 检测是否已完成学习
        const completedElement = document.querySelector('span.opacity8.ml8');
        if (completedElement && completedElement.textContent.trim() === "已完成学习") {
            console.log("检测到已学完，返回上一页");
            window.history.back();
            setTimeout(() => {
                window.location.reload();
            }, 5000);
            return;
        }

        // 自动静音
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(media => {
            if (!media.muted) {
                media.muted = true;
            }
        });

        // 检测是否正在播放
        let isPlaying = false;
        mediaElements.forEach(media => {
            if (!media.paused && !media.ended && media.readyState > 2) {
                isPlaying = true;
            }
        });

        // 自动点击播放按钮
        const buttons = Array.from(document.getElementsByTagName('button'));
        buttons.forEach(button => {
            const text = button.textContent.trim();
            if ((text === "开始学习" || text === "继续学习") && button.offsetWidth > 0) {
                button.click();
                console.log('自动点击按钮：' + text);
                isPlaying = true;
            }
        });

        // 检测未播放的情况并尝试重新播放
        if (!isPlaying) {
            setInterval(() => {
                document.querySelectorAll("video, audio").forEach(media => {
                    if (media.paused || media.ended) {
                        console.log("检测到未播放，尝试恢复播放");
                        const event = new MouseEvent("click", { bubbles: true, cancelable: true });
                        document.body.dispatchEvent(event);
                        media.play().catch(err => {
                            console.log("播放失败：", err);
                        });
                    }
                });
            }, 1000);
        }
    }


    // 列表页子程序
    function handleListPage() {
        const items = Array.from(document.querySelectorAll('.kng-list-new__tags')).filter(tagDiv => {
            const tagTexts = Array.from(tagDiv.querySelectorAll('.kng-list-new__tag')).map(tag => tag.textContent.trim());
            return tagTexts.includes("视频") && !tagTexts.includes("已学完");
        }).map(tagDiv => tagDiv.closest('li'));

        if (items.length > 0) {
            const firstItem = items[0];
            const clickableElement = firstItem?.querySelector('.kng-list-new__cover');
            if (clickableElement && clickableElement.offsetWidth > 0 && clickableElement.offsetHeight > 0) {
                clickableElement.click();
                console.log('自动播放未学完的视频');
            }
        } else {
            const nextPage = document.querySelector('li.number.active + li.number');
            if (nextPage && nextPage.offsetWidth > 0) {
                nextPage.click();
                console.log('自动翻页');
                setTimeout(() => {
                }, 5000);
            } else {
                console.log('自动翻页失败');
            }
        }
    }
})();
