let score = 0;

// Loading animation
let i = 1;
let loadingDone = false;
let pause = true;
let speed = 0.1;
let assetsLoaded = 0;
const assetLoader = document.querySelector('a-assets');
const totalAssets = parseInt(assetLoader.getAttribute('data-total-assets'));

function updateLoadingProgress() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        initializeGame();
    }
}

function enableStartButton() {
    loadingBar.style = 'width: 100%';
    document.getElementById('start-button').setAttribute('class', 'activeButton');
}

assetLoader.addEventListener('asset-loaded', updateLoadingProgress);

document.addEventListener('DOMContentLoaded', () => {
    const loadingText = document.getElementById('loading-text');
    loadingText.innerHTML = 'Loading' + '.'.repeat(0);
    
    let loadingInterval = setInterval(() => {
        loadingText.innerHTML = 'Loading' + '.'.repeat(i % 4);
        i++;
        if (!pause || loadingDone) {
            loadingText.innerHTML = 'Everything ready!';
            loadingBar.style.width = '100%'
            enableStartButton();
            clearInterval(loadingInterval);
        }
    }, 500);
});

function lerp(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}

function getPos(object) {
    const positionAttr = object.getAttribute('position');
    return typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
}

const loadingBar = document.getElementById('loading-bar');

function start() {
    if (document.getElementById('start-button').getAttribute('class') !== 'activeButton') return;
    document.getElementById('start').style.display = 'none';
    document.getElementById('score').parentElement.style.display = 'flex';
    pause = false;
}

function pauseGame() {
    document.getElementById('pause').style.display = 'flex';
    document.getElementById('score').parentElement.style.display = 'none';
    pause = true;
}

function unpause() {
    document.getElementById('pause').style.display = 'none';
    document.getElementById('score').parentElement.style.display = 'flex';
    pause = false;
}

function restart() {
    location.reload();
}

function updateScore() {
    score++;
    document.getElementById('score').innerHTML = score;
}

const obstacle_names = ['cactus_big_1', 'cactus_big_2', 'cactus_big_3', 'cactus_small_1', 'cactus_small_2', 'pteranodon', 'pteranodon', 'pteranodon']
// const obstacle_names = ['pteranodon', 'pteranodon', 'pteranodon']
let lost = false;

function createPool() {
    return new Promise((resolve) => {
        let obstaclePromises = [];
        for (let i = 0; i < 30; i++) {
            obstaclePromises.push(spawnObstacle(i));
        }
        let floorPromises = [];
        for (let i = 0; i < 10; i++) {
            floorPromises.push(spawnFloor(index = i));
        }
        return Promise.all([...obstaclePromises, ...floorPromises]).then(() => {
            resolve();
        });
    });
}

function spawnObstacle(index = 0) {
    return new Promise((resolve) => {
        console.log("Spawning obstacle", index)
        choice = obstacle_names[Math.floor(Math.random() * obstacle_names.length)]
        const obstacle = document.getElementById(choice).cloneNode(true);
        obstacle.removeAttribute('id');
        obstacle.setAttribute('class', 'obstacle inactive');
        obstacle.setAttribute('visible', 'true')

        if (choice === 'pteranodon') {
            obstacle.setAttribute('class', 'obstacle inactive pteranodon');
            if (Math.random() > 0.5) {
                obstacle.setAttribute('data-obstacle_type', 'pteranodon_l');
                obstacle.setAttribute('position', { x: 0, y: 1, z: -80 });
            }
            else {
                obstacle.setAttribute('position', { x: 0, y: 4, z: -80 });
            }
        }
        else {
            obstacle.setAttribute('position', { x: 0, y: -0.9, z: -80 });
            obstacle.setAttribute('rotation', { x: 0, y: Math.random() * 360, z: 0 });
        }

        obstacle.addEventListener('loaded', () => resolve(obstacle));
        document.getElementById('scene').appendChild(obstacle);
        loadingBar.style.width = `${index * 2}%`;
    });
}

function activateObstacle() {
    inactive = document.getElementsByClassName('inactive');
    console.log(inactive.length)
    obstacle = inactive[Math.floor(Math.random() * inactive.length)];
    obstacle.setAttribute('class', obstacle.getAttribute('class').replace('inactive', 'active'));
}

function deactivateObstacle(obstacle) {
    position = getPos(obstacle);
    obstacle.setAttribute('position', {x: 0, y: position.y, z: -80})
    obstacle.setAttribute('class', obstacle.getAttribute('class').replace('active', 'inactive'));
}

function spawnFloor(origin = false, index = 0) {
    return new Promise((resolve) => {
        console.log("Spawning floor", index)
        const floor = document.getElementById('floor_' + (Math.floor(Math.random() * 3) + 1)).cloneNode(true);
        floor.removeAttribute('id');
        floor.setAttribute('class', origin ? 'floor_active' : 'floor_inactive');
        floor.setAttribute('visible', 'true')

        floor.setAttribute('position', { x: 0, y: -1, z: origin ? 0 : -100 });

        floor.addEventListener('loaded', () => resolve(floor));
        document.getElementById('scene').appendChild(floor);
        loadingBar.style.width = `${60 + (index * 4)}%`;
    });
}

function activateFloor() {
    inactive = document.getElementsByClassName('floor_inactive');
    floor = inactive[Math.floor(Math.random() * inactive.length)];
    floor.setAttribute('class', floor.getAttribute('class').replace('inactive', 'active'));
}

function deactivateFloor(floor) {
    position = getPos(floor);
    floor.setAttribute('position', {x: position.x, y: position.y, z: -100})
    floor.setAttribute('class', floor.getAttribute('class').replace('active', 'inactive'));
}

heights = {
    'short_cactus': 2.31,
    'tall_cactus': 5.82
}

function getPosY(posZ, type) {
    height = heights[type];
    maxPosY = -0.9;
    if (posZ < 25 && posZ > -25) return maxPosY;
    offset = posZ < 0 ? -45 : 45;
    maxHeight = -Math.sqrt(Math.pow(25, 2) - Math.pow((posZ - offset), 2)) + 25;
    if (height < maxHeight) return maxPosY;
    return maxPosY - (height - maxHeight);
}

function getPosX(posZ) {
    offset = posZ < 0 ? -25 : 25;
    coefficient = posZ < 0 ? -0.5 : 0.5;
    // Formula: L / (1 + ℯ^(-(k (x - 25))))
    posX = 10 / (1 + Math.exp(-coefficient * (posZ - offset)));
    // posX = 0.5 * Math.sqrt(Math.pow(10, 2) - Math.pow((posZ - offset), 2)) - 5;
    if (posZ <= 40 && posZ >= -40) return posX;

    offset = posZ < 0 ? -75 : 75;
    coefficient = posZ < 0 ? 0.5 : -0.5;
    posX = 10 / (1 + Math.exp(-coefficient * (posZ - offset)));
    return posX;
}

function getRotation(diffX, diffZ) {
    tan = diffX / diffZ;
    // console.log(diffX, diffZ, tan)
    return Math.atan(tan) * 180 / Math.PI;
}

function moveObstacles() {
    const obstacles = document.getElementsByClassName('active');
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const position = getPos(obstacle);
        // console.log(obstacle);
        oldZ = position.z;
        oldX = position.x;
        obstacle.setAttribute('position', { x: 0, y: position.y, z: position.z + speed });
        type = obstacle.getAttribute('data-obstacle_type');

        if (type === 'tall_cactus' || type === 'short_cactus') {
            obstacle.setAttribute('position', { x: 0, y: getPosY(position.z + 0.1, type), z: position.z });
        }
        else if (type === 'pteranodon' || type === 'pteranodon_l') {
            obstacle.setAttribute('position', { x: getPosX(position.z + 0.1), y: position.y, z: position.z });
            newPos = getPos(obstacle);
            // console.log(`New position: ${newPos.x}, ${newPos.z}`);
            rotation = getRotation(newPos.x - oldX, newPos.z - oldZ);
            obstacle.setAttribute('rotation', { x: 0, y: rotation, z: 0 });
        }
        if (position.z > 80) {
            deactivateObstacle(obstacles[i]);
        }
    }
}

function animatePteros(duration) {
    const pteranodons = document.getElementsByClassName('pteranodon');
    for (let i = 0; i < pteranodons.length; i++) {
        const pteranodon = pteranodons[i];
        const leftWing = pteranodon.children[1];
        const rightWing = pteranodon.children[2];
        const rotationL = parseFloat(leftWing.getAttribute('rotation').z);
        const rotationR = parseFloat(rightWing.getAttribute('rotation').z);
        const targetRotation = Math.floor(rotationL) >= 9 ? -25 : 10;

        const startTime = performance.now();
        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;
            const alpha = Math.min(elapsedTime / duration, 1);
            leftWing.setAttribute('rotation', {
                x: leftWing.getAttribute('rotation').x,
                y: leftWing.getAttribute('rotation').y,
                z: lerp(rotationL, targetRotation, alpha)
            });
            rightWing.setAttribute('rotation', {
                x: rightWing.getAttribute('rotation').x,
                y: rightWing.getAttribute('rotation').y,
                z: lerp(rotationR, -targetRotation, alpha)
            });
            if (alpha < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }
}

function animateRolls() {
    const floorRolls = document.getElementsByClassName('floor_roll');
    const duration = 5000;

    for (let i = 0; i < floorRolls.length; i++) {
        const roll = floorRolls[i];
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;
            const alpha = Math.min(elapsedTime / duration, 1);
            const newRotation = lerp(0, -360, alpha);
            roll.setAttribute('rotation', {
                x: newRotation,
                y: roll.getAttribute('rotation').y,
                z: roll.getAttribute('rotation').z
            });

            if (alpha < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }
}

function checkCollisions() {
    const camera = document.getElementById('camera');
    const cameraPosition = getPos(camera);
    const obstacles = document.getElementsByClassName('active');
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const position = getPos(obstacle);
        if (position.z > cameraPosition.z + 2 || position.z < cameraPosition.z - 2 || lost) continue;
        type = obstacle.getAttribute('data-obstacle_type');
        if ((type === 'short_cactus' || type === 'pteranodon_l') && cameraPosition.y < 5) {
            lost = true;
            return;
        }
        else if (type === 'tall_cactus' && cameraPosition.y < 8) {
            lost = true;
            return;
        }
        else if (type === 'pteranodon' && cameraPosition.y > 2) {
            lost = true;
            return;
        }
    }
}

assetLoader.addEventListener('loaded', function () {
    console.log('All assets have been loaded.');
    initializeGame();
});

// Initialization
async function initializeGame() {
    await createPool();
    console.log("Activating obstacles")
    activateObstacle();
    console.log("Activating floors")
    initializeFloors();
    loadingDone = true;
}

function initializeFloors() {
    spawnFloor(true);
    activateFloor();
}

let lastSpawned = 0;
let obstacleTimer = Math.floor(Math.random() * 1000) + 1500;
setInterval(() => {
    if (pause) return;
    if (lost) {
        pause = true;
        document.getElementById('lost').style.display = 'flex';
        document.getElementById('score').parentElement.style.display = 'none';
        document.getElementById('score-menu').innerHTML = Math.floor(score);
        return;
    }
    score += 0.01;
    document.getElementById('score').innerHTML = Math.floor(score);
    if (score % 30 === 0) speed += 0.01;

    // Spawning obstacles
    obstacleTimer -= 10;
    if (obstacleTimer <= 0) {
        activateObstacle();
        obstacleTimer = Math.floor(Math.random() * 1000) + 1500;
    }

    // Moving floors
    floors = document.getElementsByClassName('floor_active');
    let spawn = false;
    lastSpawned += 0.1;
    for (let i = 0; i < floors.length; i++) {
        const position = getPos(floors[i]);
        floors[i].setAttribute('position', { x: 0, y: -1, z: position.z + 0.1 });
        if (Math.floor(position.z) === 0 && lastSpawned >= 2) {
            spawn = true;
            lastSpawned = 0;
        } else if (position.z > 100) {
            deactivateFloor(floors[i]);
        }
    }

    // Spawning floors
    if (spawn) {
        activateFloor();
    }

    // Moving obstacles
    moveObstacles();
}, 10);

// Animations
setInterval(() => {
    animatePteros(300);
}, 300);

animateRolls();
setInterval(() => {
    animateRolls();
}, 5000)