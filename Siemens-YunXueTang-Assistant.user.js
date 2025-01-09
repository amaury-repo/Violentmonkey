// ==UserScript==
// @name         Siemens YunXueTang Assistant
// @namespace    https://github.com/amaury-repo/Violentmonkey
// @version      1.2
// @description  西门子云学堂自动学习
// @author       Amaury
// @match        *://siemens.yunxuetang.cn/*/video*
// @match        *://siemens.yunxuetang.cn/*/list*
// @grant        none
// ==/UserScript==
//
// 浏览器快捷方式加上下面的参数, 禁用windows的效能模式
// "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --disable-features=UseEcoQoSForBackgroundProcess
// 浏览器的设置中关闭效率模式
// 设置 ---> 系统和性能 ---> 效率模式
// 浏览器添加组策略防止暂停
// reg add HKEY_CURRENT_USER\SOFTWARE\Policies\Microsoft\Edge /v WindowOcclusionEnabled /t REG_DWORD /d 0 /f
//

(function () {
    'use strict';

    // 定时任务，10秒循环
    setInterval(() => {
        // 判断当前页是播放页还是列表页
        const currentUrl = window.location.href;
        const isVideoPage = currentUrl.includes('/video');
        const isListPage = currentUrl.includes('/list');

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
        // 已学完自动返回上页
        const completedElement = document.querySelector('span.opacity8.ml8');
        if( completedElement && completedElement.textContent.trim() === "已完成学习") {
            console.log("检测到已学完，返回上一页");
            window.history.back();
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
        // 自动静音
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(media => {
            if (!media.muted) {
                media.muted = true;
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
            if ((text === "开始学习" || text === "继续学习" || text === "立即兑换" || text === "确认兑换" || text === "立即学习") && button.offsetWidth > 0) {
                button.click();
                console.log('自动点击' + text);
                isPlaying = true;
            }
        });
        // 检测到未播放尝试重新播放
        if (!isPlaying) {
            document.querySelectorAll("video, audio").forEach(media => {
                    console.log("检测到未播放，尝试恢复播放");
                    media.play().catch(err => {
                        console.log("播放失败：", err);
                    });
            });
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
                }, 2000);
            } else {
                console.log('自动翻页失败');
            }
        }
    }
})();
