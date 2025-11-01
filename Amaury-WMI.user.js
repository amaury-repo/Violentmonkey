// ==UserScript==
// @name        Amaury's optimizations for MilkyWayIdle
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       *://www.milkywayidle.com/*
// @grant       none
// @version     20251102.1
// @author      Amaury
// @description Amaury's optimizations for MilkyWayIdle
// ==/UserScript==

(function () {
    'use strict';
    
    // 每小时自动刷新页面
    const refreshInterval = 3600000;
    setInterval(() => {
        window.location.reload();
    }, refreshInterval);
    
    // 修改字体
    const fontName = "Sarasa Fixed SC";
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

    // 库存价格分类累加显示
    let categoryPrices = {};
    let originalCategoryNames = new Set();
    function getClassList(element) {
            if (typeof element.className === 'string') {
                return element.className.split(' ');
            } else if (element.className && typeof element.className.baseVal === 'string') {
                return element.className.baseVal.split(' ');
            }
            return [];
        }
    function parsePrice(priceStr, countValue = '') {
        if (!priceStr && !countValue) return 0;
        const inputStr = countValue || priceStr;
        const cleanStr = inputStr.replace(/[^0-9.kKMB]/gi, '');
        if (!cleanStr) return 0;
        let multiplier = 1;
        let numStr = cleanStr;
        const unit = cleanStr.slice(-1).toUpperCase();
        if (unit === 'K' || unit === 'k') {
            multiplier = 1000;
            numStr = cleanStr.slice(0, -1);
        } else if (unit === 'M') {
            multiplier = 1000000;
            numStr = cleanStr.slice(0, -1);
        } else if (unit === 'B') {
            multiplier = 1000000000;
            numStr = cleanStr.slice(0, -1);
        }
        const num = parseFloat(numStr);
        return isNaN(num) ? 0 : num * multiplier;
    }
    function formatNumber(value) {
        if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        if (value >= 1_000_000)     return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (value >= 1_000)         return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
        return value.toFixed(0);
    }
    function extractOriginalCategories() {
        originalCategoryNames.clear();
        const labelElements = document.querySelectorAll(`[class^="Inventory_label__"] span`);
        labelElements.forEach(label => {
            const text = label.textContent;
            const category = text.includes('：') ? text.split('：')[0] : text;
            originalCategoryNames.add(category);
        });
    }
    function processInventoryData() {
        extractOriginalCategories();
        categoryPrices = {};
        const elements = document.querySelectorAll('[class]');
        elements.forEach(element => {
            getClassList(element).forEach(className => {
                if (className.startsWith('Item_itemContainer__')) {
                    const priceElement = element.querySelector('#script_stack_price');
                    const price = priceElement ? priceElement.textContent : '0';
                    const inventoryItemGridElement = element.closest('[class^="Inventory_itemGrid__"]');
                    const labelElement = inventoryItemGridElement?.querySelector('[class^="Inventory_label__"] span');
                    let category = '未知分类';
                    if (labelElement) {
                        const text = labelElement.textContent;
                        category = text.includes('：') ? text.split('：')[0] : text;
                    }
                    const isCowbell = element.querySelector('svg[aria-label="牛铃"]') !== null;
                    const isGoldCoin = element.querySelector('svg[aria-label="金币"]') !== null;
                    const isD1Coin = element.querySelector('svg[aria-label="奇幻代币"]') !== null;
                    let parsedPrice = 0;
                    if (isGoldCoin) {
                        const countElement = element.querySelector('[class^="Item_count__"]');
                        const countValue = countElement ? countElement.textContent : '';
                        parsedPrice = parsePrice('', countValue);
                    } else {
                        parsedPrice = parsePrice(price);
                    }
                    if (parsedPrice > 0 && originalCategoryNames.has(category) && !isCowbell && !isD1Coin) {
                        categoryPrices[category] = (categoryPrices[category] || 0) + parsedPrice;
                    }
                }
            });
        });
        const labelElements = document.querySelectorAll(`[class^="Inventory_label__"] span`);
        labelElements.forEach(label => {
            const text = label.textContent;
            const category = text.includes('：') ? text.split('：')[0] : text;
            if (originalCategoryNames.has(category)) {
                const value = categoryPrices[category] || 0;
                label.textContent = value > 0 ? `${category}：${formatNumber(value)}` : category;
            }
        });
    }
    processInventoryData();
    document.addEventListener('click', processInventoryData);

})();
