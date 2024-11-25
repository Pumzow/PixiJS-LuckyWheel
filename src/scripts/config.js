import { TextStyle } from "pixi.js";

export const config = {
    FREESPINS: 3,
    SECTORS: ["x2", "x3", "250", "150", "100", "50", "25", "5", "x3", "FREE SPINS", "x2", "x3", "250", "150", "100", "50", "25", "5",],
    POOL_0: [
        { reward: "x2", weight: 1 },
    ],
    POOL_1: [
        { reward: "x3", weight: 1 },
    ],
    POOL_C: [
        { reward: "250", weight: 1 },
        { reward: "150", weight: 1 },
        { reward: "100", weight: 1 },
        { reward: "50", weight: 1 },
        { reward: "25", weight: 1 },
        { reward: "5", weight: 1 },
        { reward: "FREE SPINS", weight: 1 },
    ],
    POOL_FS: [
        { reward: "250", weight: 1 },
        { reward: "150", weight: 1 },
        { reward: "100", weight: 1 },
        { reward: "50", weight: 1 },
        { reward: "25", weight: 1 },
        { reward: "5", weight: 1 },
    ],
    BUCKET_TEMPLATE: () => ["POOL_0", "POOL_0", "POOL_0", "POOL_1", "POOL_1", "POOL_C", "POOL_C", "POOL_C", "POOL_C", "POOL_C"],
    BUCKET_TEMPLATE_FS: () => ["POOL_FS", "POOL_FS", "POOL_FS",],
    MESSAGE_STYLE: new TextStyle({
        dropShadow: true,
        dropShadowAlpha: 1,
        dropShadowAngle: 1.5,
        dropShadowBlur: 36,
        dropShadowColor: "#740d06",
        dropShadowDistance: 2,
        fill: [
            "#fff3e0",
            "#ffffff",
            "#fff3c7",
            "#feeca9"
        ],
        fontSize: 78,
        padding: 26,
        stroke: "#ffc933",
        strokeThickness: 2,
        trim: true
    }),
    WHEEL_SPIN_DURATION : 3,
    INITIAL_BALANCE: 100,
    STAKES: [10 , 20, 50, 100],
    UI: { width: 400, height: 100, roundness: 20 },
    BUTTON_COLOR: {default: 0x444444, selected: 0xccaa4e},
};