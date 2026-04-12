// ==UserScript==
// @name        Amaury's optimizations for MilkyWayIdle
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       *://www.milkywayidle.com/*
// @match       *://www.milkywayidlecn.com/*
// @grant       none
// @version     20260413
// @author      Amaury
// @description Amaury's optimizations for MilkyWayIdle
// ==/UserScript==

(function () {
    'use strict';
    
    // 每小时自动刷新页面
    setInterval(() => {
        window.location.reload();
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
