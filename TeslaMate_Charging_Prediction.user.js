// ==UserScript==
// @name        TeslaMate Charging Prediction
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       http://192.168.10.2:9002/
// @grant       none
// @version     20250720
// @author      Amaury
// @description 额外充电预测
// ==/UserScript==

(function() {
  // 配置参数
  const targetPercent = 70;
  const refreshInterval = 10000; // 10秒刷新间隔
  let predictionElement = null;
  let errorElement = null;

  // 获取表格右侧字段（根据左侧字段名）
  function getValueByLabel(labelText) {
    const tds = Array.from(document.querySelectorAll('td.has-text-weight-medium'));
    for (let i = 0; i < tds.length; i++) {
      const label = tds[i].textContent.trim();
      if (label === labelText && tds[i].nextElementSibling) {
        return tds[i].nextElementSibling;
      }
    }
    return null;
  }

  // 获取 标题元素，用于定位提示位置
  function getTitleElement() {
    return document.querySelector("#car_1 > div > div.card-content > div.media.is-flex.mb-5 > div.media-content > p.title.is-5");
  }

  // 主函数：计算并显示预测结果
  function updatePrediction() {
    // 清除之前的元素
    if (predictionElement && predictionElement.parentNode) {
      predictionElement.parentNode.removeChild(predictionElement);
    }
    if (errorElement && errorElement.parentNode) {
      errorElement.parentNode.removeChild(errorElement);
    }

    const timeEl = getValueByLabel("充电剩余时间");
    const limitEl = getValueByLabel("充电上限");
    const currentEl = getValueByLabel("当前电量");

    if (!timeEl || !limitEl || !currentEl) {
      showError("充电停止");
      return;
    }

    // 当前电量
    let currentText = currentEl.innerText.trim();
    const match = currentText.match(/(\d+)%/);
    const currentPercent = match ? parseFloat(match[1]) : NaN;

    // 充电上限
    const limitPercent = parseFloat(limitEl.textContent.replace('%', '').trim());

    // 充电剩余时间
    const timeText = timeEl.textContent.replace(/\u00A0/g, ' ').trim();
    const hourMatch = timeText.match(/(\d+)\s*h/);
    const minMatch = timeText.match(/(\d+)\s*min/);

    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1], 10);

    // 校验数据
    if (currentPercent >= targetPercent) {
      showError("充电完成");
      return;
    }

    // 线性计算
    const portion = (targetPercent - currentPercent) / (limitPercent - currentPercent);
    const estMinutes = Math.round(totalMinutes * portion);
    const finishTime = new Date(Date.now() + estMinutes * 60000);

    // 格式化剩余时间为 h, min
    function formatTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} h, ${mins} min`;
    }

    // 显示结果
    const titleEl = getTitleElement();
    if (!titleEl) return;

    predictionElement = document.createElement('div');
    const titleRect = titleEl.getBoundingClientRect();

    // 调整位置到标题右侧
    predictionElement.style.position = 'fixed';
    predictionElement.style.left = titleRect.right + 20 + 'px';
    predictionElement.style.top = titleRect.top - 12 + 'px';

    // 核心：与错误提示框完全一致的样式
    predictionElement.style.cssText += `
      background-color: #fff; /* 与错误框背景一致 */
      border-radius: 0.25rem; /* 与错误框圆角一致 */
      box-shadow: 0 0.5em 1em -0.125em #0a0a0a1a, 0 0 0 1px #0a0a0a05; /* 与错误框阴影一致 */
      color: #4a4a4a; /* 与错误框文字颜色一致 */
      font-family: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif; /* 与错误框字体一致 */
      font-size: 1em; /* 与错误框文字大小一致 */
      padding: 1.5rem; /* 与错误框内边距一致 */
      z-index: 9999;
      min-width: 200px; /* 与错误框宽度一致 */
      max-height: 80px; /* 与错误框最大高度一致 */
    `;

    // 标题样式与错误框标题完全一致
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-top: -15px; /* 与错误框标题上移一致 */
      margin-bottom: 5px; /* 与错误框标题间距一致 */
    `;
    titleDiv.innerHTML = `🔋 → ${targetPercent}%`;

    // 内容样式与错误框内容完全一致
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      text-align: center;
      font-size: 12px; /* 与错误框内容文字大小一致 */
      line-height: 1.6;
      margin-top: -5px; /* 与错误框内容上移一致 */
    `;
    contentDiv.innerHTML = `
      充电剩余时间: ${formatTime(estMinutes)}<br>
      预计完成时间: ${finishTime.toLocaleTimeString()}
    `;

    // 组装
    predictionElement.appendChild(titleDiv);
    predictionElement.appendChild(contentDiv);
    document.body.appendChild(predictionElement);
  }

  // 错误提示框同步应用原页面卡片样式（可微调阴影/颜色区分状态）
  function showError(message) {
    const titleEl = getTitleElement();
    if (titleEl) {
      const titleRect = titleEl.getBoundingClientRect();
      errorElement = document.createElement('div');
      // 错误框基础样式与 .card 一致，微调背景/阴影区分状态
      errorElement.style.cssText = `
        position: fixed;
        left: ${titleRect.right + 10}px;
        top: ${titleRect.top - 12}px;
        background-color: #fff; /* 原页面卡片背景 */
        border-radius: 0.25rem; /* 与原页面一致 */
        box-shadow: 0 0.5em 1em -0.125em #0a0a0a1a, 0 0 0 1px #0a0a0a05; /* 原页面卡片阴影 */
        color: #4a4a4a; /* 原页面文字颜色 */
        font-family: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif; /* 与原页面一致 */
        font-size: 1em; /* 与原页面一致 */
        padding: 1.5rem; /* 与原页面一致 */
        z-index: 9999;
        min-width: 200px;
        max-height: 80px; /* 限制最大高度 */
        text-align: center;
      `;

      // 调整错误标题位置（上移）
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = `
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-top: -15px; /* 负值使标题上移 */
        margin-bottom: 5px; /* 减少标题与内容的间距 */
      `;
      titleDiv.innerHTML = `🔋 → ${targetPercent}%`;

      // 调整错误内容位置（上移）
      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `
        text-align: center;
        font-size: 12px;
        line-height: 1.6;
        margin-top: -5px; /* 内容整体上移 */
      `;
      contentDiv.innerHTML = `&nbsp;<br>${message}`;

      errorElement.appendChild(titleDiv);
      errorElement.appendChild(contentDiv);
      document.body.appendChild(errorElement);
    }
  }

  // 初始执行一次
  updatePrediction();

  // 设置定时器
  setInterval(updatePrediction, refreshInterval);
})();
