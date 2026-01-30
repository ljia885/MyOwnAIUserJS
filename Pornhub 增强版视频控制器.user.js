// ==UserScript==
// @name         Pornhub 增强版视频控制器
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  增加快进、快退、播放/暂停以及多档倍速控制
// @author       Gemini
// @match        *://*.pornhub.com/view_video.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const init = () => {
        const video = document.querySelector('video');
        // 尝试寻找 PH 视频下方的交互栏容器
        const container = document.querySelector('.video-wrapper') || document.querySelector('#player');

        if (!video || !container) {
            setTimeout(init, 1000);
            return;
        }

        const btnBar = document.createElement('div');
        btnBar.style.cssText = `
            display: flex;
            gap: 8px;
            padding: 12px;
            background: #1b1b1b;
            justify-content: center;
            flex-wrap: wrap;
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid #333;
        `;

        // 配置按钮 [显示文字, 功能类型, 数值]
        const configs = [
            { label: '-5m', type: 'seek', val: -300 },
            { label: '-60s', type: 'seek', val: -60 },
            { label: '-30s', type: 'seek', val: -30 },
            { label: '播放/暂停', type: 'toggle', val: null },
            { label: '+30s', type: 'seek', val: 30 },
            { label: '+60s', type: 'seek', val: 60 },
            { label: '+5m', type: 'seek', val: 300 },
            { label: '1.0x', type: 'speed', val: 1.0 },
            { label: '1.5x', type: 'speed', val: 1.5 },
            { label: '2.0x', type: 'speed', val: 2.0 }
        ];

        configs.forEach(cfg => {
            const btn = document.createElement('button');
            btn.innerText = cfg.label;
            btn.style.cssText = `
                padding: 6px 12px;
                background: ${cfg.type === 'speed' ? '#555' : '#ff9900'};
                color: ${cfg.type === 'speed' ? 'white' : 'black'};
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                font-size: 13px;
                transition: opacity 0.2s;
            `;

            btn.onmouseover = () => btn.style.opacity = '0.8';
            btn.onmouseout = () => btn.style.opacity = '1.1';

            btn.onclick = () => {
                if (cfg.type === 'seek') {
                    video.currentTime += cfg.val;
                } else if (cfg.type === 'toggle') {
                    video.paused ? video.play() : video.pause();
                } else if (cfg.type === 'speed') {
                    video.playbackRate = cfg.val;
                    // 高亮当前倍速按钮
                    btnBar.querySelectorAll('button').forEach(b => {
                        if (b.innerText.includes('x')) b.style.border = 'none';
                    });
                    btn.style.border = '2px solid #ff9900';
                }
            };

            btnBar.appendChild(btn);
        });

        container.after(btnBar);
    };

    window.addEventListener('load', init);
})();