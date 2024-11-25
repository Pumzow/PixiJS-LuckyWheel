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
let ui;
let uiButtonsBgs = [];;
let uiBalanceText;
let balance = config.INITIAL_BALANCE;
let stake = config.STAKES[0];

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

    initUI();
    initWheel();

    message = new PIXI.Text("", config.MESSAGE_STYLE);
    message.anchor.set(.5, 3);
    container.addChild(message);

    await wait(.15);

    onResize();
    centerObjects(wheel, startButton, message);
})();

function initUI() {
    ui = new PIXI.Graphics();
    ui.beginFill(0x2c2c2c);
    ui.drawRoundedRect(0, 0, config.UI.width, config.UI.height, config.UI.roundness);
    ui.endFill();
    ui.x = app.screen.width - ui.width - 10;
    ui.y = app.screen.height - ui.height - 10;
    container.addChild(ui);

    updateUIBalanceText();

    config.STAKES.forEach((label, index) => {
        const button = new PIXI.Container();

        const buttonBackground = initButtonBackground(index, index === 0 ? config.BUTTON_COLOR.selected : config.BUTTON_COLOR.default );
        button.addChild(buttonBackground);

        const buttonText = new PIXI.Text(`${label} лв.`, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff,
            align: 'center',
        });
        buttonText.anchor.set(0.5);
        buttonText.x = buttonBackground.width / 2;
        buttonText.y = buttonBackground.height / 2;
        button.addChild(buttonText);

        button.x = 25 + index * 90;
        button.y = 60;

        button.interactive = true;
        button.buttonMode = true;
        button.on('pointerdown', () => {
            stake = label;
            initButtonBackground(index, config.BUTTON_COLOR.selected);
        });

        ui.addChild(button);
    });

    function initButtonBackground(index, color = config.BUTTON_COLOR.default) {
        if (index >= uiButtonsBgs.length) {
            return createNewButtonBackground(color);
        } else {
            updateAllButtonBackgrounds(index, color);
        }
    }

    function createNewButtonBackground(color) {
        const buttonBackground = new PIXI.Graphics();
        drawButtonBackground(buttonBackground, color);
        uiButtonsBgs.push(buttonBackground);
        return buttonBackground;
    }

    function updateAllButtonBackgrounds(index, selectedColor) {
        uiButtonsBgs.forEach((buttonBackground, i) => {
            const color = i === index ? selectedColor : 0x444444;
            drawButtonBackground(buttonBackground, color);
        });
    }

    function drawButtonBackground(buttonBackground, color) {
        buttonBackground.clear();
        buttonBackground.beginFill(color);
        buttonBackground.drawRoundedRect(0, 0, 80, 30, 5);
        buttonBackground.endFill();
    }
}

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
    if (balance < stake) {
        displayMessage("Out of balance!");
        return;
    }
    if (isBusy) return;
    isBusy = true;

    balance -= stake;
    updateUIBalanceText();

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

    if (isNaN(reward)) {
        if (reward === "FREE SPINS") {
            displayMessage(getRewardName(index));
            const oldColor = app.renderer.backgroundColor

            app.renderer.backgroundColor = 0xe8e082;
            await spinWheelFs();
            app.renderer.backgroundColor = oldColor;
        } else {
            displayMessage(`${stake} (${reward})`);
            if(reward === "x2"){
                balance += stake * 2;
            }else if(reward === "x3"){
                balance += stake * 3;
            }
            updateUIBalanceText();
        }
    } else {
        balance += parseInt(reward);
        updateUIBalanceText();
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

    balance += parseInt(totalReward);
    updateUIBalanceText();
    console.log(totalReward);
}

function getRewardName(i) {
    if (!isNaN(config.SECTORS[i])) {
        return `${config.SECTORS[i]} лв.`
    }
    return config.SECTORS[i];
}

async function displayMessage(reward, displayTime = 2) {
    message.text = reward;
    resize(message, message.texture.height, .1);

    await wait(displayTime);

    message.text = "";
}

function updateUIBalanceText() {
    if (!uiBalanceText) {
        uiBalanceText = new PIXI.Text(`Баланс: ${balance} лв.`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center',
        });
        uiBalanceText.anchor.set(0.5);
        uiBalanceText.x = ui.width / 2;
        uiBalanceText.y = 25;
        ui.addChild(uiBalanceText);
    } else {
        uiBalanceText.text = `Баланс: ${balance} лв.`;
    }
}

function onResize() {
    resize(wheel, wheel.texture.height, .8);
    resize(startButton, startButton.texture.height, .1);
    resize(arrow, arrow.texture.height, .05);
    resize(message, message.texture.height, .1);

    const scaleFactor = window.innerWidth / config.UI.width * .3;
    ui.width = config.UI.width * scaleFactor
    ui.height = config.UI.height * scaleFactor
    ui.x = window.innerWidth - ui.width - 10 * scaleFactor;
    ui.y = window.innerHeight - ui.height - 10 * scaleFactor;
}