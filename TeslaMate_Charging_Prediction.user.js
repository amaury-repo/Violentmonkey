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
      showError("未在充电");
      return;
    }

    // 当前电量
    let currentText = currentEl.innerText.trim();
    const match = currentText.match(/(\d+)%/);
    const currentPercent = match ? parseFloat(match[1]) : NaN;

    // 上限电量
    const limitPercent = parseFloat(limitEl.textContent.replace('%', '').trim());

    // 剩余时间解析
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

    // 显示结果
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
    predictionElement.style.width = '200px';

    // 标题
    const titleDiv = document.createElement('div');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.fontSize = '18px';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '8px';
    titleDiv.innerHTML = `🔋→ ${targetPercent}%`;

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
  const errorElement = document.createElement('div');
  errorElement.style.position = 'fixed';
  errorElement.style.top = '100px';
  errorElement.style.left = '10px';
  errorElement.style.padding = '12px 16px';
  errorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.85)';
  errorElement.style.color = '#fff';
  errorElement.style.borderRadius = '10px';
  errorElement.style.zIndex = 9999;
  errorElement.style.fontSize = '14px';
  errorElement.style.minWidth = '220px';
  errorElement.style.textAlign = 'center';

  // 标题
  const titleDiv = document.createElement('div');
  titleDiv.style.fontSize = '18px';
  titleDiv.style.fontWeight = 'bold';
  titleDiv.style.marginBottom = '6px';
  titleDiv.innerHTML = `🔋 → ${targetPercent}%`;

  // 内容
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = message;

  // 组装
  errorElement.appendChild(titleDiv);
  errorElement.appendChild(contentDiv);
  document.body.appendChild(errorElement);
}


  // 初始执行一次
  updatePrediction();

  // 设置定时器
  setInterval(updatePrediction, refreshInterval);
})();
