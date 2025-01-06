// ==UserScript==
// @name         Reader Custom
// @namespace    https://github.com/amaury-repo/Violentmonkey
// @version      0.1
// @description  屏蔽左右键，自动重设尺寸
// @author       Amaury
// @match        *://reader.amaury.eu.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var initialWidth = 100;
    var initialHeight = 1000;

    document.onselectstart = function () { return false; }
    document.oncontextmenu = function () { return false; }
    window.resizeTo(initialWidth, initialHeight);
    window.addEventListener('resize', function(event) {
        window.resizeTo(initialWidth, initialHeight);
    });

})();
