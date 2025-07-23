// ==UserScript==
// @name        Disable Right-Click on MilkyWayIdle
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       *://www.milkywayidle.com/*
// @grant       none
// @version     20250724
// @author      Amaury
// @description 完全屏蔽右键
// ==/UserScript==

(function () {
    'use strict';

    // 屏蔽右键菜单
    const disableContextMenu = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    };

    window.addEventListener('contextmenu', disableContextMenu, true);
    document.addEventListener('contextmenu', disableContextMenu, true);

    // 每小时自动刷新页面
    const refreshInterval = 3600000;
    
    // 计时并刷新页面
    setInterval(() => {
        window.location.reload();
    }, refreshInterval);

    console.log('右键菜单已禁用，页面将每小时自动刷新一次');

})();
