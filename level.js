function lerp(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}

const obstacle_names = ['cactus_big_1', 'cactus_big_2', 'cactus_big_3', 'cactus_small_1', 'cactus_small_2', 'pteranodon', 'pteranodon', 'pteranodon']
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
            obstacle.setAttribute('position', { x: 0, y: 1, z: -50 });
        }
        else {
            obstacle.setAttribute('position', { x: 0, y: 4, z: -50 });
        }
    }
    else {
        obstacle.setAttribute('position', { x: 0, y: -0.9, z: -50 });
        obstacle.setAttribute('rotation', { x: 0, y: Math.random() * 360, z: 0 });
    }

    document.getElementById('scene').appendChild(obstacle);
}

function spawnFloor(origin = false) {
    console.log('floor_' + (Math.floor(Math.random() * 3)+1));
    const floor = document.getElementById('floor_' + (Math.floor(Math.random() * 3)+1)).cloneNode(true);
    floor.removeAttribute('id');
    floor.setAttribute('class', 'floor');

    floor.setAttribute('position', {x: 0, y: -1, z: origin ? 0 : -100});

    document.getElementById('scene').appendChild(floor);
}

// heights of obstacles
// small cactus 2.31
// tall cactus 5.82

function moveObstacles() {
    const obstacles = document.getElementsByClassName('obstacle');
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const positionAttr = obstacle.getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
        obstacle.setAttribute('position', { x: 0, y: position.y, z: position.z + 0.1 });
        type = obstacle.getAttribute('data-obstacle_type');
        if (type === 'tall_cactus') {
            obstacles[i].setAttribute('scale',  { x: 0.7, y: Math.min(0.7, (-Math.abs(position.z)/32+2)*0.7), z: 0.7 });
        }
        if (position.z > 50) {
            obstacles[i].remove();
        }
    }
}

function animatePteros() {
    const pteranodons = document.getElementsByClassName('pteranodon');
    for (let i = 0; i < pteranodons.length; i++) {
        const pteranodon = pteranodons[i];
        const leftWing = pteranodon.children[1];
        const rightWing = pteranodon.children[2];
        const rotationL = parseFloat(leftWing.getAttribute('rotation').z);
        const rotationR = parseFloat(rightWing.getAttribute('rotation').z);
        const targetRotation = Math.floor(rotationL) >= 9 ? -25 : 10;
        let alpha = 0;
        
        console.log(leftWing.getAttribute('rotation'), targetRotation, rightWing.getAttribute('rotation'));

        function animate() {
            if (alpha < 1) {
                alpha += 0.03;
                const newRotationL = lerp(rotationL, targetRotation, alpha);
                leftWing.setAttribute('rotation', {
                    x: leftWing.getAttribute('rotation').x,
                    y: leftWing.getAttribute('rotation').y,
                    z: newRotationL
                });
                const newRotationR = lerp(rotationR, -targetRotation, alpha);
                rightWing.setAttribute('rotation', {
                    x: rightWing.getAttribute('rotation').x,
                    y: rightWing.getAttribute('rotation').y,
                    z: newRotationR
                });
                requestAnimationFrame(animate);
            }
        }
        animate();
    }
}

function animateRolls() {
    const floorRolls = document.getElementsByClassName('floor_roll');
    console.log(floorRolls);
    for (let i = 0; i < floorRolls.length; i++) {
        const roll = floorRolls[i];
        let alpha = 0;

        function animate() {
            if (alpha < 1) {
                alpha += 0.0018;
                const newRotation = lerp(0, -360, alpha);
                roll.setAttribute('rotation', {
                    x: newRotation,
                    y: roll.getAttribute('rotation').y,
                    z: roll.getAttribute('rotation').z
                });
                requestAnimationFrame(animate);
            }
        }
        animate();
    }
}

function checkCollisions() {
    const camera = document.getElementById('camera');
    const cameraPositionAttr = camera.getAttribute('position');
    const cameraPosition = typeof cameraPositionAttr === 'string' ? AFRAME.utils.coordinates.parse(cameraPositionAttr) : cameraPositionAttr;
    const obstacles = document.getElementsByClassName('obstacle');
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const positionAttr = obstacle.getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
        if (position.z > cameraPosition.z + 1 || position.z < cameraPosition.z - 1 || reload) continue;
        // console.log(cameraPosition, position)
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
    animatePteros();
}, 400);

animateRolls();
setInterval(() => {
    animateRolls();
}, 5000)

let lastSpawned = 0;
setInterval(() => {
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
        const positionAttr = floors[i].getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
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