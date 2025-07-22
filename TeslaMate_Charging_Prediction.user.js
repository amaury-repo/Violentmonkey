// ==UserScript==
// @name        TeslaMate Charging Prediction
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       http://192.168.10.2:9002/
// @grant       none
// @version     20250722
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

    // 未充电提示
    if (!timeEl || !limitEl || !currentEl) {
      showTips("充电停止");
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
    const dayMatch = timeText.match(/(\d+)\s*d/);
    const hourMatch = timeText.match(/(\d+)\s*h/);
    const minMatch = timeText.match(/(\d+)\s*min/);

    let totalMinutes = 0;
    if (dayMatch) totalMinutes += parseInt(dayMatch[1], 10) * 1440;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1], 10);

    // 充电完成提示
    if (currentPercent >= targetPercent) {
      showTips("充电完成");
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

    // 样式
    predictionElement.style.cssText += `
      background-color: #fff;
      border-radius: 0.25rem;
      box-shadow: 0 0.5em 1em -0.125em #0a0a0a1a, 0 0 0 1px #0a0a0a05;
      color: #4a4a4a;
      font-family: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif;
      font-size: 1em;
      padding: 1.5rem;
      z-index: 9999;
      max-width: 200px;
      max-height: 80px;
    `;

    // 标题
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-top: -15px;
      margin-bottom: 5px;
    `;
    titleDiv.innerHTML = `🔋 → ${targetPercent}%`;

    // 内容
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      font-size: 12px;
      line-height: 1.6;
      margin-top: -5px;
    `;
    contentDiv.innerHTML = `
      充电剩余时间&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formatTime(estMinutes)}<br>
      预计完成时间&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${finishTime.toLocaleTimeString()}
    `;

    // 组装
    predictionElement.appendChild(titleDiv);
    predictionElement.appendChild(contentDiv);
    document.body.appendChild(predictionElement);
  }

  // 其他提示
  function showTips(message) {
    const titleEl = getTitleElement();
    if (titleEl) {
      const titleRect = titleEl.getBoundingClientRect();
      errorElement = document.createElement('div');
      errorElement.style.cssText = `
        position: fixed;
        left: ${titleRect.right + 10}px;
        top: ${titleRect.top - 12}px;
        background-color: #fff;
        border-radius: 0.25rem;
        box-shadow: 0 0.5em 1em -0.125em #0a0a0a1a, 0 0 0 1px #0a0a0a05;
        color: #4a4a4a;
        font-family: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif;
        font-size: 1em;
        padding: 1.5rem;
        z-index: 9999;
        max-width: 200px;
        max-height: 80px;
        text-align: center;
      `;

      // 标题
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = `
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-top: -15px;
        margin-bottom: 5px;
      `;
      titleDiv.innerHTML = `🔋 → ${targetPercent}%`;

      // 内容
      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `
        text-align: center;
        font-size: 12px;
        line-height: 1.6;
        margin-top: -5px;
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
