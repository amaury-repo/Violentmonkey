// ==UserScript==
// @name        Amaury's optimizations for MilkyWayIdle
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       *://www.milkywayidle.com/*
// @match       *://www.milkywayidlecn.com/*
// @grant       none
// @version     20260423
// @author      Amaury
// @description Amaury's optimizations for MilkyWayIdle
// ==/UserScript==

(function () {
    'use strict';
    
    // 每小时自动刷新页面
    setInterval(() => {
        window.location.reload();
    }, 60 * 60 * 1000);

    // 修改字体
    const fontName = "等距更纱黑体 SC";
    const style = document.createElement('style');
    style.innerHTML = `
        * {
            font-family: '${fontName}', sans-serif !important;
        }
    `;
    document.head.appendChild(style);

    // 屏蔽右键菜单
    const disableContextMenu = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    };
    window.addEventListener('contextmenu', disableContextMenu, true);
    document.addEventListener('contextmenu', disableContextMenu, true);

})();
