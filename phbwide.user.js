// ==UserScript==
// @name         PHB视频快进快退+自动宽屏
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  为phb.com网站视频添加15秒/1分钟/5分钟快进快退按键，并自动让视频进入宽屏模式
// @author       自定义
// @match        *://*.pornhub.com/view_video.php?viewkey=*
// @match        *://*.pornhubpremium.com/view_video.php?viewkey=*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 样式：快进快退按钮样式
    const buttonStyle = `
        .video-control-btn {
            padding: 6px 12px;
            margin: 0 4px;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        .video-control-btn:hover {
            background: #0056b3;
        }
        .video-control-btn.rewind {
            background: #dc3545;
        }
        .video-control-btn.rewind:hover {
            background: #c82333;
        }
        .video-control-container {
            margin: 10px 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;

    // 注入样式到页面
    function injectStyle() {
        const style = document.createElement('style');
        style.textContent = buttonStyle;
        document.head.appendChild(style);
    }

    // 视频自动宽屏处理
    function setVideoWideScreen(video) {
        // 移除视频可能的宽高限制，设置宽屏样式
        video.style.width = '100%';
        video.style.maxWidth = '1200px';
        video.style.height = 'auto';
        // 如果有父容器，也调整父容器样式适配宽屏
        const parent = video.parentElement;
        if (parent) {
            parent.style.width = '100%';
            parent.style.maxWidth = '1200px';
            parent.style.margin = '0 auto';
        }
        // 尝试触发视频自带的宽屏/全屏相关逻辑（如果有）
        if (video.requestFullscreen) {
            // 这里不强制全屏，仅宽屏，如需全屏可取消注释：
            // video.requestFullscreen().catch(err => console.log('全屏失败:', err));
        }
    }

    // 创建快进快退控制按钮容器
    function createControlButtons(video) {
        // 避免重复创建按钮
        if (document.querySelector('.video-control-container')) return;

        const container = document.createElement('div');
        container.className = 'video-control-container';

        // 快退按钮配置：[文本, 秒数]
        const rewindBtns = [
            ['快退15秒', -15],
            ['快退1分钟', -60],
            ['快退5分钟', -300]
        ];

        // 快进按钮配置：[文本, 秒数]
        const forwardBtns = [
            ['快进15秒', 15],
            ['快进1分钟', 60],
            ['快进5分钟', 300]
        ];

        // 创建快退按钮
        rewindBtns.forEach(([text, sec]) => {
            const btn = document.createElement('button');
            btn.className = 'video-control-btn rewind';
            btn.textContent = text;
            btn.onclick = () => {
                video.currentTime = Math.max(0, video.currentTime + sec);
            };
            container.appendChild(btn);
        });

        // 创建快进按钮
        forwardBtns.forEach(([text, sec]) => {
            const btn = document.createElement('button');
            btn.className = 'video-control-btn';
            btn.textContent = text;
            btn.onclick = () => {
                video.currentTime = Math.min(video.duration, video.currentTime + sec);
            };
            container.appendChild(btn);
        });

        return container;
    }

    // 找到视频元素并初始化功能
    function initVideoControls() {
        // 获取页面所有视频元素
        const videos = document.querySelectorAll('video');
        if (!videos.length) {
            // 若初始未找到视频，监听DOM变化（应对动态加载的视频）
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.tagName === 'VIDEO' || (node.querySelector && node.querySelector('video'))) {
                            initVideoControls();
                            observer.disconnect();
                        }
                    });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return;
        }

        videos.forEach(video => {
            // 1. 自动设置宽屏
            setVideoWideScreen(video);

            // 2. 创建控制按钮
            const controlContainer = createControlButtons(video);

            // 3. 插入按钮到标题和视频中间
            // 查找视频的标题元素（适配常见的标题标签，可根据实际页面调整）
            const titleTags = ['h1', 'h2', 'h3', 'h4', '.title', '.video-title'];
            let titleElement = null;
            for (const tag of titleTags) {
                titleElement = video.closest('div, section, article').querySelector(tag);
                if (titleElement) break;
            }

            if (titleElement) {
                // 插入到标题之后、视频之前
                titleElement.after(controlContainer);
            } else {
                // 若未找到标题，插入到视频父容器的最前面
                video.parentElement.insertBefore(controlContainer, video);
            }

            // 监听视频尺寸变化，保持宽屏
            video.addEventListener('loadedmetadata', () => {
                setVideoWideScreen(video);
            });
        });
    }

    // 初始化执行
    injectStyle();
    initVideoControls();

    // 监听页面路由变化（应对单页应用）
    window.addEventListener('popstate', initVideoControls);
    window.addEventListener('hashchange', initVideoControls);
})();