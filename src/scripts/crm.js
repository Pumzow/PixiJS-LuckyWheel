import { config } from "./config";

let queue = [];
let fsQueue = [];

export function draw() {
    if (queue.length === 0) {
        queue = generateBucket();
    }

    console.log(queue);
    const nextPool = queue.shift();
    return selectWeightedRandom(config[nextPool]).reward;
}

export function drawFs() {
    if (fsQueue.length === 0) {
        fsQueue = generateFsBucket();
    }

    const nextPool = fsQueue.shift();
    return selectWeightedRandom(config[nextPool]).reward;
}

function generateBucket() {
    return shuffleAndFix(config.BUCKET_TEMPLATE(), "POOL_C");
}

function generateFsBucket() {
    return config.BUCKET_TEMPLATE_FS();
}

function selectWeightedRandom(pool) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0);
    const rand = Math.random() * total;
    let cumulative = 0;

    for (let reward of pool) {
        cumulative += reward.weight;
        if (rand < cumulative) {
            return reward;
        }
    }
}

function shuffleAndFix(queue, repeateableValue, maxAttempts = 500) {
    const shuffled = [...queue];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let attempts = 0;
    while (attempts < maxAttempts) {
        let fixed = true;
        for (let i = 1; i < shuffled.length; i++) {
            if (shuffled[i] === shuffled[i - 1] && shuffled[i] !== repeateableValue) {
                fixed = false;

                let swapped = false;
                for (let j = i + 1; j < shuffled.length; j++) {
                    if (shuffled[j] === repeateableValue || (shuffled[j] !== shuffled[i] && shuffled[j] !== shuffled[i - 1])) {
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                        swapped = true;
                        break;
                    }
                }

                if (!swapped) {
                    break;
                }
            }
        }

        if (fixed) {
            break;
        }

        attempts++;
    }

    if (attempts === maxAttempts) {
        console.warn("Could not completely resolve repetitions within max attempts.");
    }

    return shuffled;
}