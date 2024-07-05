function lerp(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}

function getPos(object) {
    const positionAttr = object.getAttribute('position');
    return typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
}

const obstacle_names = ['cactus_big_1', 'cactus_big_2', 'cactus_big_3', 'cactus_small_1', 'cactus_small_2', 'pteranodon', 'pteranodon', 'pteranodon']
// const obstacle_names = ['pteranodon', 'pteranodon', 'pteranodon']
let reload = false;

function spawnObstacle() {
    choice = obstacle_names[Math.floor(Math.random() * obstacle_names.length)]
    const obstacle = document.getElementById(choice).cloneNode(true);
    obstacle.removeAttribute('id');
    obstacle.setAttribute('class', 'obstacle');

    if (choice === 'pteranodon') {
        obstacle.setAttribute('class', 'obstacle pteranodon');
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

    document.getElementById('scene').appendChild(obstacle);
}

function spawnFloor(origin = false) {
    const floor = document.getElementById('floor_' + (Math.floor(Math.random() * 3)+1)).cloneNode(true);
    floor.removeAttribute('id');
    floor.setAttribute('class', 'floor');

    floor.setAttribute('position', {x: 0, y: -1, z: origin ? 0 : -100});

    document.getElementById('scene').appendChild(floor);
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
    if (posZ <= 20 && posZ >= -20) return 0;
    offset = posZ < 0 ? -50 : 50;
    posX = 0.33 * -Math.sqrt(Math.pow(30, 2) - Math.pow((posZ - offset), 2));
    if (posX === NaN) console.log(posZ, offset);
    return posX;
}

function getRotation(diffX, diffZ) {
    tan = diffX / diffZ;
    // console.log(diffX, diffZ, tan)
    return Math.atan(tan) * 180 / Math.PI;
}

function moveObstacles() {
    const obstacles = document.getElementsByClassName('obstacle');
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const position = getPos(obstacle);
        oldZ = position.z;
        oldX = position.x;
        obstacle.setAttribute('position', { x: 0, y: position.y, z: position.z + 0.1 });
        type = obstacle.getAttribute('data-obstacle_type');

        if (type === 'tall_cactus' || type === 'short_cactus') {
            obstacle.setAttribute('position', { x: 0, y: getPosY(position.z + 0.1, type), z: position.z });
        }
        else if (type === 'pteranodon' || type === 'pteranodon_l') {
            obstacle.setAttribute('position', { x: getPosX(position.z + 0.1), y: position.y, z: position.z });
            newPos = getPos(obstacle);
            console.log(`New position: ${newPos.x}, ${newPos.z}`);
            rotation = getRotation(newPos.x - oldX, newPos.z - oldZ);
            obstacle.setAttribute('rotation', { x: 0, y: rotation, z: 0 });
        }
        if (position.z > 50) {
            obstacles[i].remove();
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
    const obstacles = document.getElementsByClassName('obstacle');
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const position = getPos(obstacle);
        if (position.z > cameraPosition.z + 1 || position.z < cameraPosition.z - 1 || reload) continue;
        type = obstacle.getAttribute('data-obstacle_type');
        if ((type === 'short_cactus' || type === 'pteranodon_l') && cameraPosition.y < 5) {
            alert('Game over!');
            reload = true;
            return;
        }
        else if (type === 'tall_cactus' && cameraPosition.y < 8) {
            alert('Game over!');
            reload = true;
            return;
        }
        else if (type === 'pteranodon' && cameraPosition.y > 2) {
            alert('Game over!');
            reload = true;
            return;
        }
    }
}

function spawnObstacleRandomly() {
    spawnObstacle();
    setTimeout(spawnObstacleRandomly, Math.floor(Math.random() * 1000) + 1500);
}
setTimeout(spawnObstacleRandomly, 1000);

function initializeFloors() {
    spawnFloor(true);
    spawnFloor(false);
}
setTimeout(() => {
    initializeFloors();
}, 500);

setInterval(() => {
    animatePteros(300);
}, 300);

animateRolls();
setInterval(() => {
    animateRolls();
}, 5000)

let lastSpawned = 0;
setInterval(() => {
    // return;
    checkCollisions();
    if (reload) {
        location.reload();
        return;
    }
    moveObstacles();
    floors = document.getElementsByClassName('floor');
    let spawn = false;
    lastSpawned += 0.1;
    for (let i = 0; i < floors.length; i++) {
        const position = getPos(floors[i]);
        floors[i].setAttribute('position', { x: 0, y: -1, z: position.z + 0.1 });
        if (Math.floor(position.z) === 0 && lastSpawned >= 2) {
            spawn = true;
            lastSpawned = 0;
        } else if (position.z > 100) {
            floors[i].remove();
        }
    }
    if (spawn) {
        spawnFloor();
    }
    return;
}, 10);