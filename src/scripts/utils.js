Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}

export function wait(seconds) {
    return new Promise((res) => setTimeout(res, seconds * 1000));
}

export function resize(sprite, spriteHeight, multiplier = 1) {
    const scaleFactor = window.innerHeight / spriteHeight * multiplier;

    sprite.width = window.innerWidth / scaleFactor;
    sprite.scale.set(scaleFactor);

    centerObjects(sprite);
}

export function centerObjects(...toCenter) {
    const center = (obj) => {
        obj.x = window.innerWidth / 2;
        obj.y = window.innerHeight / 2;
    };

    toCenter.forEach(center);
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function calculateRotation(currentRotation, sectorsCount, rewardPos, bonusRotations = 0) {
    const degreesPerReward = 360 / sectorsCount;
    const degrees = degreesPerReward * rewardPos;
    let targetRotation = -degrees * (Math.PI / 180);

    while (targetRotation <= currentRotation) {
        targetRotation += 2 * Math.PI;
    }

    return targetRotation + bonusRotations * 2 * Math.PI;
}