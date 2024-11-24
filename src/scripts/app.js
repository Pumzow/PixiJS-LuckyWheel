import * as PIXI from "pixi.js";
import * as CRM from "./crm";
import { config } from "./config";
import { gsap } from "gsap";
import { centerObjects, resize, wait, calculateRotation } from "./utils";

let app;
let container;
let wheel;
let startButton;
let arrow;
let message;
let isBusy;

(async () => {
    app = new PIXI.Application({
        view: document.querySelector("#app"),
        autoDensity: true,
        resizeTo: window,
        powerPreference: "high-performance",
        backgroundColor: 0x23272a,
    });
    window.__PIXI_APP__ = app;

    container = new PIXI.Container();
    app.stage.addChild(container);

    window.addEventListener("resize", () => {
        onResize();
    });

    initWheel();

    message = new PIXI.Text("", config.MESSAGE_STYLE);
    message.anchor.set(.5, 3);
    container.addChild(message);

    await wait(.15);

    onResize();
    centerObjects(wheel, startButton, message);
})();

function initWheel() {
    wheel = PIXI.Sprite.from("/Game/Images/wheel.png");
    wheel.anchor.set(0.5);
    wheel.position.set(window.innerWidth / 2, window.innerHeight / 2);
    container.addChild(wheel);

    startButton = PIXI.Sprite.from("/Game/Images/btnStart.png");
    startButton.anchor.set(0.5);
    startButton.interactive = true;
    startButton.position.set(window.innerWidth / 2, window.innerHeight / 2);
    container.addChild(startButton);

    arrow = PIXI.Sprite.from("/Game/Images/arrow.png");
    arrow.anchor.set(0.5, 8.2);
    arrow.position.set(window.innerWidth / 2, window.innerHeight / 2);
    arrow.rotation = 80 * (Math.PI / 180);
    container.addChild(arrow);

    for (let i = 0; i < config.SECTORS.length; i++) {
        const rewardName = getRewardName(i);
        const reward = new PIXI.Text(rewardName, {
            fontFamily: "Comic Sans MS",
            fontSize: 32,
            fill: "white",
        });

        reward.pivot.set(-300, 0);
        reward.anchor.set(.5, .5);
        const degrees = 360 / config.SECTORS.length * i - 10;
        reward.rotation = degrees * (Math.PI / 180);

        wheel.addChild(reward);
    }

    startButton.on("pointerdown", (event) => {
        spinWheel();
    });
}

async function spinWheel() {
    if (isBusy) return;
    isBusy = true;
    
    const reward = CRM.draw();
    const availableSectors = [];
    for (let i = 0; i < config.SECTORS.length; i++) {
        if (reward !== config.SECTORS[i]) continue;
        availableSectors.push(i);
    }

    const index = availableSectors.random();

    await gsap.to(wheel, {
        rotation: calculateRotation(wheel.rotation, config.SECTORS.length, index, 2),
        duration: config.WHEEL_SPIN_DURATION,
        ease: "power1.inOut",
    });

    console.log(reward);

    if (reward === "FREE SPINS") {
        displayMessage(getRewardName(index));

        const oldColor = app.renderer.backgroundColor

        app.renderer.backgroundColor = 0xe8e082;
        await spinWheelFs();
        app.renderer.backgroundColor = oldColor;
    } else {
        displayMessage(getRewardName(index), 1.8);
    }

    isBusy = false;
}

async function spinWheelFs() {
    let totalReward = 0;

    for (let i = 0; i < config.FREESPINS; i++) {
        const reward = CRM.drawFs();
        const availableRewards = [];

        for (let i = 0; i < config.SECTORS.length; i++) {
            if (reward !== config.SECTORS[i]) continue;
            availableRewards.push(i);
        }

        const index = availableRewards.random();

        await gsap.to(wheel, {
            rotation: calculateRotation(wheel.rotation, config.SECTORS.length, index, 2),
            duration: config.WHEEL_SPIN_DURATION,
            ease: "power1.inOut",
        });

        totalReward += parseInt(reward);
        displayMessage(`${totalReward} лв.`);
    }
    console.log(totalReward);
}

function getRewardName(i) {
    return config.SECTORS[i] === "FREE SPINS" ? config.SECTORS[i] : `${config.SECTORS[i]} лв.`;
}

async function displayMessage(reward, displayTime = 2) {
    message.text = reward;
    resize(message, message.texture.height, .1);

    await wait(displayTime);

    message.text = "";
}

function onResize() {
    resize(wheel, wheel.texture.height, .8);
    resize(startButton, startButton.texture.height, .1);
    resize(arrow, arrow.texture.height, .05);
    resize(message, message.texture.height, .1);
}