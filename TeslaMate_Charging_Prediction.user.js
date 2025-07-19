// ==UserScript==
// @name        TeslaMate Charging Prediction
// @namespace   https://github.com/amaury-repo/Violentmonkey
// @match       http://192.168.10.2:9002/*
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
      showError("页面缺少必要字段：充电剩余时间 / 上限 / 当前电量");
      return;
    }

    // ✅ 当前电量
    let currentText = currentEl.innerText.trim();
    const match = currentText.match(/(\d+)%/);
    const currentPercent = match ? parseFloat(match[1]) : NaN;

    // ✅ 上限电量
    const limitPercent = parseFloat(limitEl.textContent.replace('%', '').trim());

    // ✅ 剩余时间解析
    const timeText = timeEl.textContent.replace(/\u00A0/g, ' ').trim();
    const hourMatch = timeText.match(/(\d+)\s*h/);
    const minMatch = timeText.match(/(\d+)\s*min/);

    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1], 10);

    // 校验数据
    if (
      isNaN(currentPercent) ||
      isNaN(limitPercent) ||
      isNaN(totalMinutes) ||
      totalMinutes === 0 ||
      currentPercent >= targetPercent ||
      currentPercent >= limitPercent
    ) {
      showError("⚠️ 无法估算：电量过高或时间不可用");
      return;
    }

    // ⏳ 线性计算
    const portion = (targetPercent - currentPercent) / (limitPercent - currentPercent);
    const estMinutes = Math.round(totalMinutes * portion);
    const finishTime = new Date(Date.now() + estMinutes * 60000);

    // ✅ 格式化剩余时间为 h, min
    function formatTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} h, ${mins} min`;
    }

    // ✅ 格式化日期为 YYYY-MM-DD HH:MM:SS
    function formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // ✅ 页面显示结果
    predictionElement = document.createElement('div');
    predictionElement.style.position = 'fixed';
    predictionElement.style.top = '100px';
    predictionElement.style.left = '10px';
    predictionElement.style.padding = '12px';
    predictionElement.style.backgroundColor = 'rgba(0,0,0,0.85)';
    predictionElement.style.color = '#fff';
    predictionElement.style.borderRadius = '8px';
    predictionElement.style.zIndex = 9999;
    predictionElement.style.fontSize = '14px';
    predictionElement.style.width = '250px';

    // 居中标题
    const titleDiv = document.createElement('div');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.fontSize = '18px';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '8px';
    titleDiv.innerHTML = `${targetPercent}% 充电`;

    // 内容区域
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = `
      充电剩余时间&nbsp;&nbsp;&nbsp;${formatTime(estMinutes)}<br>
      预计完成时间&nbsp;&nbsp;&nbsp;${formatDateTime(finishTime)}
    `;

    // 组装
    predictionElement.appendChild(titleDiv);
    predictionElement.appendChild(contentDiv);

    document.body.appendChild(predictionElement);
  }

  // 显示错误信息
  function showError(message) {
    errorElement = document.createElement('div');
    errorElement.style.position = 'fixed';
    errorElement.style.top = '100px';
    errorElement.style.left = '10px';
    errorElement.style.padding = '12px';
    errorElement.style.backgroundColor = 'rgba(255,0,0,0.8)';
    errorElement.style.color = '#fff';
    errorElement.style.borderRadius = '8px';
    errorElement.style.zIndex = 9999;
    errorElement.style.fontSize = '14px';
    errorElement.style.width = '250px';
    errorElement.innerText = message;
    document.body.appendChild(errorElement);
  }

  // 初始执行一次
  updatePrediction();

  // 设置定时器
  setInterval(updatePrediction, refreshInterval);
})();    
