// ==UserScript==
// @name         16K Keyboard
// @namespace    https://github.com/amaury-repo/Violentmonkey
// @version      20261006
// @description  使用键盘快捷键浏览
// @author       Amaury
// @match        *://16k.club/*
// @match        *://16knote.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const hostname = window.location.hostname;

    document.addEventListener('keydown', function(event) {
        // 如果用户正在输入框或文本域中打字，不触发快捷键
        if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            return;
        }

        // ==================== 16k.club 网站逻辑 ====================
        if (hostname.includes('16k.club')) {
            const buttons = document.getElementsByClassName('btn btn-outline-secondary');
            if (event.keyCode === 37 && buttons.length > 0) {
                buttons[0].click(); // ← 左
            } else if (event.keyCode === 39 && buttons.length > 2) {
                buttons[2].click(); // → 右
            }
        }

        // ==================== 16knote.com 网站逻辑 ====================
        else if (hostname.includes('16knote.com')) {
            if (event.keyCode === 37) {
                // ← 左
                document.querySelector('#prev')?.click();
            } else if (event.keyCode === 39) {
                // → 右
                document.querySelector('#next')?.click();
            }
        }
    });

    // 鼠标中键点击事件
    document.addEventListener('mousedown', function(event) {
        if (event.button === 1) {
            event.preventDefault();
            
            if (hostname.includes('16k.club')) {
                const buttons = document.getElementsByClassName('btn btn-outline-secondary');
                if (buttons.length > 2) buttons[2].click();
            } else if (hostname.includes('16knote.com')) {
                document.querySelector('#next')?.click();
            }
        }
    });
})();
