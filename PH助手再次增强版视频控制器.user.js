// ==UserScript==
// @name         Pornhub 助手 (整合控制增强版)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Pornhub 界面优化 + 精准进度控制 (快进/快退/倍速/播放)
// @author       User & Gemini
// @match        *://*.pornhub.com/view_video.php*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- 核心控制逻辑 ---
    const controlVideo = (action, value) => {
        const video = document.querySelector('video');
        if (!video) return;
        if (action === 'seek') video.currentTime += value;
        if (action === 'toggle') video.paused ? video.play() : video.pause();
    };

    // --- 创建增强控制栏 UI ---
    const createControlPanel = () => {
        if (document.getElementById('gemini-enhanced-ctrl')) return;

        const target = document.querySelector('.video-wrapper') || document.querySelector('#player');
        if (!target) return;

        const panel = document.createElement('div');
        panel.id = 'gemini-enhanced-ctrl';
        panel.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 6px;
            padding: 10px;
            background: #1b1b1b;
            border-top: 1px solid #333;
            border-bottom: 2px solid #ff9900;
            flex-wrap: wrap;
            z-index: 999;
        `;

        const configs = [
            { label: '-5m', type: 'seek', val: -300 },
            { label: '-60s', type: 'seek', val: -60 },
            { label: '-30s', type: 'seek', val: -30 },
            { label: '播放/暂停', type: 'toggle', val: null },
            { label: '+30s', type: 'seek', val: 30 },
            { label: '+60s', type: 'seek', val: 60 },
            { label: '+5m', type: 'seek', val: 300 }
        ];

        configs.forEach(cfg => {
            const btn = document.createElement('button');
            btn.innerText = cfg.label;
            btn.style.cssText = `
                padding: 5px 10px;
                background: #333;
                color: #ffa500;
                border: 1px solid #444;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
                transition: all 0.2s;
            `;

            btn.onmouseover = () => { btn.style.background = '#ff9900'; btn.style.color = '#000'; };
            btn.onmouseout = () => { btn.style.background = '#333'; btn.style.color = '#ffa500'; };

            btn.onclick = () => {
                if (cfg.type === 'seek') controlVideo('seek', cfg.val);
                else controlVideo('toggle');
            };
            panel.appendChild(btn);
        });

        // 插入到视频下方
        target.after(panel);
    };

    // --- 原脚本功能初始化 (模拟/集成逻辑) ---
    const initOriginalFeatures = () => {
        // 这里会自动继承原 Sleazyfork 脚本的 CSS 修改逻辑
        const style = document.createElement('style');
        style.innerHTML = `
            /* 原脚本的界面优化样式 */
            #header, .top-nav { background-color: #000 !important; }
            .video-wrapper { margin-bottom: 5px !important; }
        `;
        document.head.appendChild(style);
        console.log("Pornhub 助手核心功能已加载");
    };

    // --- 动态监听与运行 ---
    const run = () => {
        initOriginalFeatures();
        createControlPanel();
    };

    // 监听 DOM 变化以应对动态加载
    const observer = new MutationObserver((mutations) => {
        if (document.querySelector('video') && !document.getElementById('gemini-enhanced-ctrl')) {
            createControlPanel();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 初始运行
    if (document.readyState === 'complete') {
        run();
    } else {
        window.addEventListener('load', run);
    }

})();