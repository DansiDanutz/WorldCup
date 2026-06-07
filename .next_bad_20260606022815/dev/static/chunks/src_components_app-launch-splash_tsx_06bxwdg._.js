(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/app-launch-splash.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppLaunchSplash",
    ()=>AppLaunchSplash
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const launchStars = [
    {
        x: "10%",
        y: "18%",
        size: "3px",
        delay: "0s"
    },
    {
        x: "22%",
        y: "30%",
        size: "2px",
        delay: "0.45s"
    },
    {
        x: "35%",
        y: "14%",
        size: "4px",
        delay: "0.9s"
    },
    {
        x: "49%",
        y: "24%",
        size: "2px",
        delay: "1.2s"
    },
    {
        x: "63%",
        y: "16%",
        size: "3px",
        delay: "0.25s"
    },
    {
        x: "78%",
        y: "28%",
        size: "2px",
        delay: "0.7s"
    },
    {
        x: "88%",
        y: "20%",
        size: "4px",
        delay: "1.45s"
    },
    {
        x: "16%",
        y: "62%",
        size: "2px",
        delay: "1.1s"
    },
    {
        x: "30%",
        y: "70%",
        size: "3px",
        delay: "0.35s"
    },
    {
        x: "52%",
        y: "76%",
        size: "2px",
        delay: "1.65s"
    },
    {
        x: "70%",
        y: "66%",
        size: "3px",
        delay: "0.55s"
    },
    {
        x: "84%",
        y: "74%",
        size: "2px",
        delay: "1.85s"
    }
];
function isInstalledAppLaunch() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const audioWindow = window;
    return window.matchMedia("(display-mode: standalone)").matches || audioWindow.navigator.standalone === true || document.referrer.startsWith("android-app://");
}
async function playCrowdRoar() {
    const audioWindow = window;
    const AudioContextConstructor = window.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextConstructor) {
        return;
    }
    const context = new AudioContextConstructor();
    const duration = 1.55;
    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    let rumble = 0;
    for(let index = 0; index < data.length; index += 1){
        const time = index / sampleRate;
        const attack = Math.min(1, time / 0.28);
        const release = Math.min(1, (duration - time) / 0.72);
        const envelope = Math.max(0, Math.min(attack, release));
        const wave = Math.sin(time * 65) * 0.22 + Math.sin(time * 117) * 0.14;
        rumble = rumble * 0.985 + (Math.random() * 2 - 1) * 0.015;
        data[index] = (Math.random() * 2 - 1 + wave + rumble * 7) * envelope * 0.42;
    }
    const source = context.createBufferSource();
    const lowCrowd = context.createBiquadFilter();
    const highCrowd = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    lowCrowd.type = "bandpass";
    lowCrowd.frequency.value = 520;
    lowCrowd.Q.value = 0.8;
    highCrowd.type = "peaking";
    highCrowd.frequency.value = 1800;
    highCrowd.gain.value = 4;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, context.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    source.connect(lowCrowd);
    lowCrowd.connect(highCrowd);
    highCrowd.connect(gain);
    gain.connect(context.destination);
    try {
        if (context.state === "suspended") {
            await context.resume();
        }
        source.start();
        window.setTimeout(()=>void context.close(), Math.ceil(duration * 1000) + 250);
    } catch  {
        void context.close();
        throw new Error("crowd-audio-blocked");
    }
}
function AppLaunchSplash() {
    _s();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const crowdStarted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppLaunchSplash.useEffect": ()=>{
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const standaloneLaunch = isInstalledAppLaunch();
            async function startCrowdAudio() {
                if (!standaloneLaunch || prefersReducedMotion || crowdStarted.current) {
                    return;
                }
                crowdStarted.current = true;
                try {
                    await playCrowdRoar();
                } catch  {
                    crowdStarted.current = false;
                }
            }
            void startCrowdAudio();
            const unlockAudio = {
                "AppLaunchSplash.useEffect.unlockAudio": ()=>{
                    void startCrowdAudio();
                }
            }["AppLaunchSplash.useEffect.unlockAudio"];
            window.addEventListener("pointerdown", unlockAudio, {
                once: true,
                passive: true
            });
            window.addEventListener("keydown", unlockAudio, {
                once: true
            });
            const hideDelay = prefersReducedMotion ? 650 : 1650;
            const hideTimer = window.setTimeout({
                "AppLaunchSplash.useEffect.hideTimer": ()=>setVisible(false)
            }["AppLaunchSplash.useEffect.hideTimer"], hideDelay);
            return ({
                "AppLaunchSplash.useEffect": ()=>{
                    window.clearTimeout(hideTimer);
                    window.removeEventListener("pointerdown", unlockAudio);
                    window.removeEventListener("keydown", unlockAudio);
                }
            })["AppLaunchSplash.useEffect"];
        }
    }["AppLaunchSplash.useEffect"], []);
    if (!visible) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "aria-label": "WorldCup26 loading",
        className: "app-launch-splash",
        role: "status",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "app-launch-splash__stars",
                "aria-hidden": "true",
                children: launchStars.map((star, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "app-launch-splash__star",
                        style: {
                            "--star-x": star.x,
                            "--star-y": star.y,
                            "--star-size": star.size,
                            "--star-delay": star.delay
                        },
                        children: index % 3 === 0 ? "+" : ""
                    }, `${star.x}-${star.y}`, false, {
                        fileName: "[project]/src/components/app-launch-splash.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/app-launch-splash.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "app-launch-splash__lights",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/src/components/app-launch-splash.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "app-launch-splash__badge",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        alt: "",
                        className: "app-launch-splash__icon",
                        height: 72,
                        priority: true,
                        src: "/icons/maskable-512.png",
                        width: 72
                    }, void 0, false, {
                        fileName: "[project]/src/components/app-launch-splash.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: [
                                    "WorldCup26",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: ".world"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/app-launch-splash.tsx",
                                        lineNumber: 174,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/app-launch-splash.tsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: "Prediction Game"
                            }, void 0, false, {
                                fileName: "[project]/src/components/app-launch-splash.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/app-launch-splash.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/app-launch-splash.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/app-launch-splash.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_s(AppLaunchSplash, "9mJe28S5wzftHh2Yo0OCMRIdw7w=");
_c = AppLaunchSplash;
var _c;
__turbopack_context__.k.register(_c, "AppLaunchSplash");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_app-launch-splash_tsx_06bxwdg._.js.map