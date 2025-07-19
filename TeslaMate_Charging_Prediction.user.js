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
      showError(`电量已到达 ${targetPercent}%`);
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

    // 显示结果 - 调整位置与错误提示一致
    const titleEl = getTitleElement();
    if (!titleEl) return; // 如果找不到标题元素，则不显示预测结果

    predictionElement = document.createElement('div');
    const titleRect = titleEl.getBoundingClientRect();

    // 调整位置到标题右侧
    predictionElement.style.position = 'fixed';
    predictionElement.style.left = titleRect.right + 20 + 'px';
    predictionElement.style.top = titleRect.top - 12 + 'px';

    // 保持与错误提示一致的样式风格
    predictionElement.style.padding = '12px 16px';
    predictionElement.style.backgroundColor = '#f5f5f5'; // 浅灰色背景
    predictionElement.style.color = '#333'; // 深色文字
    predictionElement.style.border = '1px solid #ddd'; // 浅灰色边框
    predictionElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'; // 柔和阴影
    predictionElement.style.borderRadius = '8px';
    predictionElement.style.zIndex = 9999;
    predictionElement.style.fontSize = '14px';
    predictionElement.style.minWidth = '200px';

    // 标题
    const titleDiv = document.createElement('div');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.fontSize = '18px';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '8px';
    titleDiv.innerHTML = `🔋 → ${targetPercent}%`;

    // 内容
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = `
      充电剩余时间&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formatTime(estMinutes)}<br>
      预计完成时间&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${finishTime.toLocaleTimeString()}
    `;

    // 组装
    predictionElement.appendChild(titleDiv);
    predictionElement.appendChild(contentDiv);

    document.body.appendChild(predictionElement);
  }

  // 显示错误信息
  function showError(message) {
    const titleEl = getTitleElement();
    if (titleEl) {
        const titleRect = titleEl.getBoundingClientRect();
        errorElement = document.createElement('div');
        // 保持与预测结果一致的样式风格
        errorElement.style.position = 'fixed';
        errorElement.style.left = titleRect.right + 20 + 'px';
        errorElement.style.top = titleRect.top - 12 + 'px';
        errorElement.style.padding = '12px 16px';
        errorElement.style.backgroundColor = '#f5f5f5';
        errorElement.style.color = '#333';
        errorElement.style.border = '1px solid #ddd';
        errorElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
        errorElement.style.borderRadius = '8px';
        errorElement.style.zIndex = 9999;
        errorElement.style.fontSize = '14px';
        errorElement.style.minWidth = '200px';
        errorElement.style.textAlign = 'center';

        // 居中标题（与预测结果一致）
        const titleDiv = document.createElement('div');
        titleDiv.style.textAlign = 'center';
        titleDiv.style.fontSize = '18px';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '8px';
        titleDiv.innerHTML = `🔋 → ${targetPercent}%`;

        // 错误消息内容
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = message;

        // 组装错误元素
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
