// ==UserScript==
// @name        Disable Right-Click on MilkyWayIdle
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       *://www.milkywayidle.com/*
// @grant       none
// @version     0.1
// @author      Amaury
// @description 完全屏蔽右键
// ==/UserScript==

(function () {
    'use strict';

    const disableContextMenu = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    };

    window.addEventListener('contextmenu', disableContextMenu, true);
    document.addEventListener('contextmenu', disableContextMenu, true);

})();
