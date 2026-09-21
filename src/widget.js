/**
 * CofferCard Gamification Embed Widget
 * https://coffercard.com
 *
 * Usage:
 * <script
 *   src="https://coffercard.com/widget.js"
 *   data-campaign="YOUR_CAMPAIGN_UUID"
 *   data-position="bottom-right"
 *   data-theme-color="#4F46E5"
 *   data-trigger="bubble"
 *   async>
 * </script>
 */

(function () {
    if (window.__CofferCardWidgetInitialized) return;
    window.__CofferCardWidgetInitialized = true;

    // Detect the script element and its configuration attributes
    var currentScript = document.currentScript || document.querySelector('script[data-campaign]');
    if (!currentScript) {
        console.warn('[CofferCard] Widget script tag missing data-campaign attribute.');
        return;
    }

    var campaignCode = currentScript.getAttribute('data-campaign');
    if (!campaignCode) {
        console.warn('[CofferCard] data-campaign UUID is required.');
        return;
    }

    var position = currentScript.getAttribute('data-position') || 'bottom-right'; // 'bottom-right' | 'bottom-left'
    var themeColor = currentScript.getAttribute('data-theme-color') || '#4F46E5';
    var buttonText = currentScript.getAttribute('data-button-text') || '🎁 Spin & Win!';
    var triggerType = currentScript.getAttribute('data-trigger') || 'bubble'; // 'bubble' | 'auto' | 'exit-intent'
    var baseUrl = currentScript.getAttribute('data-host');
    if (!baseUrl) {
        try {
            if (currentScript.src) {
                var urlObj = new URL(currentScript.src);
                baseUrl = urlObj.origin;
            }
        } catch (e) {}
    }
    if (!baseUrl) {
        baseUrl = 'https://coffercard.com';
    }

    var embedUrl = baseUrl + '/campaign/' + campaignCode + '?embed=true';

    // Inject Widget Styles
    var style = document.createElement('style');
    style.id = 'coffercard-widget-styles';
    style.textContent = `
        .cc-widget-launcher {
            position: fixed;
            bottom: 24px;
            ${position === 'bottom-left' ? 'left: 24px;' : 'right: 24px;'}
            z-index: 999998;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            background: ${themeColor};
            color: #ffffff;
            border-radius: 9999px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            border: none;
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: cc-bounce-pulse 3s infinite;
        }
        .cc-widget-launcher:hover {
            transform: scale(1.06) translateY(-2px);
            box-shadow: 0 14px 28px rgba(0,0,0,0.3);
        }
        .cc-widget-launcher:active {
            transform: scale(0.96);
        }
        @keyframes cc-bounce-pulse {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
        .cc-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.25s ease, visibility 0.25s ease;
            padding: 16px;
        }
        .cc-modal-backdrop.cc-active {
            opacity: 1;
            visibility: visible;
        }
        .cc-modal-container {
            position: relative;
            background: #ffffff;
            width: 100%;
            max-width: 580px;
            height: 90vh;
            max-height: 720px;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transform: scale(0.92) translateY(20px);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cc-modal-backdrop.cc-active .cc-modal-container {
            transform: scale(1) translateY(0);
        }
        .cc-close-button {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.08);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #374151;
            cursor: pointer;
            z-index: 10;
            transition: background 0.2s, transform 0.2s;
        }
        .cc-close-button:hover {
            background: rgba(0, 0, 0, 0.18);
            transform: rotate(90deg);
        }
        .cc-iframe-frame {
            width: 100%;
            height: 100%;
            border: none;
            background: #ffffff;
        }
        @media (max-width: 640px) {
            .cc-widget-launcher {
                bottom: 16px;
                ${position === 'bottom-left' ? 'left: 16px;' : 'right: 16px;'}
                padding: 10px 16px;
                font-size: 14px;
            }
            .cc-modal-container {
                height: 95vh;
                max-height: 95vh;
                border-radius: 16px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create Modal Elements
    var backdrop = document.createElement('div');
    backdrop.className = 'cc-modal-backdrop';

    var container = document.createElement('div');
    container.className = 'cc-modal-container';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'cc-close-button';
    closeBtn.setAttribute('aria-label', 'Close Game');
    closeBtn.innerHTML = '&times;';

    var iframe = document.createElement('iframe');
    iframe.className = 'cc-iframe-frame';
    iframe.title = 'CofferCard Gamification';
    iframe.setAttribute('allow', 'camera; accelerometer; gyroscope; web-share; clipboard-write');

    container.appendChild(closeBtn);
    container.appendChild(iframe);
    backdrop.appendChild(container);
    document.body.appendChild(backdrop);

    var isLoaded = false;
    function openModal() {
        if (!isLoaded) {
            iframe.src = embedUrl;
            isLoaded = true;
        }
        backdrop.classList.add('cc-active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        backdrop.classList.remove('cc-active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) closeModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && backdrop.classList.contains('cc-active')) {
            closeModal();
        }
    });

    // Create Floating Launcher Bubble if requested
    if (triggerType === 'bubble' || triggerType === 'both') {
        var launcher = document.createElement('button');
        launcher.className = 'cc-widget-launcher';
        launcher.setAttribute('aria-label', buttonText);
        launcher.innerHTML = '<span>' + buttonText + '</span>';
        launcher.addEventListener('click', openModal);
        document.body.appendChild(launcher);
    }

    // Auto-Trigger Delay
    if (triggerType === 'auto' || triggerType === 'both') {
        setTimeout(function () {
            if (!sessionStorage.getItem('cc_auto_opened_' + campaignCode)) {
                sessionStorage.setItem('cc_auto_opened_' + campaignCode, 'true');
                openModal();
            }
        }, delaySeconds * 1000);
    }

    // Exit Intent Trigger (desktop mouse leaves top)
    if (triggerType === 'exit-intent') {
        var exitHandled = false;
        document.addEventListener('mouseleave', function (e) {
            if (e.clientY <= 0 && !exitHandled) {
                if (!sessionStorage.getItem('cc_exit_opened_' + campaignCode)) {
                    exitHandled = true;
                    sessionStorage.setItem('cc_exit_opened_' + campaignCode, 'true');
                    openModal();
                }
            }
        });
    }

    // Global helper object for programmatic trigger
    window.CofferCardWidget = {
        open: openModal,
        close: closeModal
    };
})();
