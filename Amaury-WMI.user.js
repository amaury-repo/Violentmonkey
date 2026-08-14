// ==UserScript==
// @name        Amaury's optimizations for MilkyWayIdle
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       *://www.milkywayidle.com/*
// @match       *://www.milkywayidlecn.com/*
// @grant       none
// @version     20260814
// @author      Amaury
// @description Amaury's optimizations for MilkyWayIdle
// ==/UserScript==

(function () {
    'use strict';

    // 自动刷新页面优化：增加连续检测机制，防止因临时加载慢导致误刷新
    let failCount = 0;
    setInterval(() => {
        const selectors = [
            'div[class*="Header_displayName"]',
            'div[class*="CharacterName_name"]'
        ];
        const isAlive = selectors.some(s => document.querySelector(s));

        if (!isAlive) {
            failCount++;
            // 连续 3 次检测（共计 3 小时，或可自行调整时间）都未找到元素才真正刷新
            if (failCount >= 3) {
                location.reload();
            }
        } else {
            failCount = 0; // 只要有一次成功检测到，就重置计数器
        }
    }, 60 * 60 * 1000);

    // 屏蔽右键菜单
    const disableContextMenu = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    };
    window.addEventListener('contextmenu', disableContextMenu, true);
    document.addEventListener('contextmenu', disableContextMenu, true);

})();
