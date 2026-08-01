export const createChartContext = (type) => {
    const chartContainer = document.querySelector('.chart_container');
    chartContainer.innerHTML = "";
    const CANVAS = document.createElement('canvas');
    CANVAS.setAttribute('id', `${type}-chart`);
    chartContainer.appendChild(CANVAS);
};
