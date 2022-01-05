var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
enemyInfo = {
    width: 40,
    height: 20,
    count: {
        row: 5,
        col: 9
    },
    offset: {
        top: 100,
        left: 60
    },
    padding: 5
};

var move = new Howl({
    src: ['assets/move.mp3']
});

var shootSound = new Howl({
    src: ['assets/shoot.mp3']
});

var explosionSound = new Howl({
    src: ['assets/explosion.mp3']
});

var saucerSound = new Howl({
    src: ['assets/saucer.mp3'],
    loop: true
});

function preload() {
    this.load.image("shooter", "assets/cannon.png")
    this.load.image("alien", "assets/enemy.svg")
    this.load.image("bullet", "assets/bullet.svg")
    this.load.image("saucer", "assets/saucer.svg")
}

var score = 0;
var lives = 3;
var isStarted = false;
var barriers = [];
var ufoCount = 0;
function create() {
    scene = this;
    cursors = scene.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    isShooting = false;
    this.input.keyboard.addCapture('SPACE');
    enimies = this.physics.add.staticGroup();
    playerLava = scene.add.rectangle(0, 0, 800, 10, 0x000).setOrigin(0)
    enemyLava = scene.add.rectangle(0, 590, 800, 10, 0x000).setOrigin(0)
    saucerLava = scene.add.rectangle(790, 0, 10, 600, 0x000).setOrigin(0)
    scene.physics.add.existing(playerLava)
    scene.physics.add.existing(enemyLava)
    scene.physics.add.existing(saucerLava)

    shooter = scene.physics.add.sprite(400, 560, 'shooter');
    shooter.setCollideWorldBounds(true)

    scoreText = scene.add.text(16, 16, "Score: " + score, { fontSize: '18px', fill: '#FFF' })
    livesText = scene.add.text(696, 16, "Lives: " + lives, { fontSize: '18px', fill: '#FFF' })
    startText = scene.add.text(400, 300, "Click to Play", { fontSize: '18px', fill: '#FFF' }).setOrigin(0.5)

    this.input.keyboard.on('keydown-SPACE', shoot);

    barriers.push(new Barrier(scene, 50, 450))
    barriers.push(new Barrier(scene, 370, 450))
    barriers.push(new Barrier(scene, 690, 450))

    this.input.on('pointerdown', function () {
        if (isStarted == false) {
            isStarted = true;
            startText.destroy()
            setInterval(makeSaucer, 15000)

        } else {
            shoot()
        }
    });
    initEnemys()
}

function update() {
    if (isStarted == true) {
        if (cursors.left.isDown || keyA.isDown) {
            shooter.setVelocityX(-160);

        }
        else if (cursors.right.isDown || keyD.isDown) {
            shooter.setVelocityX(160);

        }
        else {
            shooter.setVelocityX(0);

        }
    }
}

function shoot() {
    if (isStarted == true) {
        if (isShooting === false) {
            manageBullet(scene.physics.add.sprite(shooter.x, shooter.y, "bullet"))
            isShooting = true;
            shootSound.play()
        }
    }
}

function initEnemys() {
    for (c = 0; c < enemyInfo.count.col; c++) {
        for (r = 0; r < enemyInfo.count.row; r++) {
            var enemyX = (c * (enemyInfo.width + enemyInfo.padding)) + enemyInfo.offset.left;
            var enemyY = (r * (enemyInfo.height + enemyInfo.padding)) + enemyInfo.offset.top;
            enimies.create(enemyX, enemyY, 'alien').setOrigin(0.5);
        }
    }
}

setInterval(moveEnimies, 1000)
var xTimes = 0;
var yTimes = 0;
var dir = "right"
function moveEnimies() {
    if (isStarted === true) {
        move.play()
        if (xTimes === 20) {
            if (dir === "right") {
                dir = "left"
                xTimes = 0
            } else {
                dir = "right"
                xTimes = 0
            }
        }
        if (dir === "right") {
            enimies.children.each(function (enemy) {

                enemy.x = enemy.x + 10;
                enemy.body.reset(enemy.x, enemy.y);

            }, this);
            xTimes++;
        } else {
            enimies.children.each(function (enemy) {

                enemy.x = enemy.x - 10;
                enemy.body.reset(enemy.x, enemy.y);

            }, this);
            xTimes++;

        }
    }
}

function manageBullet(bullet) {
    bullet.setVelocityY(-380);


    var i = setInterval(function () {
        enimies.children.each(function (enemy) {

            if (checkOverlap(bullet, enemy)) {
                bullet.destroy();
                clearInterval(i)
                isShooting = false
                enemy.destroy()
                score++;
                scoreText.setText("Score: " + score);

                explosionSound.play()

                if ((score - ufoCount) === (enemyInfo.count.col * enemyInfo.count.row)) {
                    end("Win")
                }
            }

        }, this);
        for (var step = 0; step < barriers.length; step++) {
            if (barriers[step].checkCollision(bullet)) {
                bullet.destroy();
                clearInterval(i)
                isShooting = false

                scoreText.setText("Score: " + score);


                explosionSound.play()

                if ((score - ufoCount) === (enemyInfo.count.col * enemyInfo.count.row)) {
                    end("Win")
                }


            }
        }

        for (var step = 0; step < saucers.length; step++) {
            var saucer = saucers[step];
            if (checkOverlap(bullet, saucer)) {
                bullet.destroy();
                clearInterval(i)
                isShooting = false

                scoreText.setText("Score: " + score);


                explosionSound.play()

                if ((score - ufoCount) === (enemyInfo.count.col * enemyInfo.count.row)) {
                    end("Win")
                }

                saucer.destroy()
                saucer.isDestroyed = true;
                saucerSound.stop();
                score++;
                ufoCount++;
            }
        }
    }, 10)
    scene.physics.add.overlap(bullet, playerLava, function () {
        bullet.destroy();
        clearInterval(i);
        explosionSound.play();
        isShooting = false
    })

}
var enemyBulletVelo = 200;
function manageEnemyBullet(bullet, enemy) {
    var angle = Phaser.Math.Angle.BetweenPoints(enemy, shooter);
    scene.physics.velocityFromRotation(angle, enemyBulletVelo, bullet.body.velocity);
    enemyBulletVelo = enemyBulletVelo + 2
    var i = setInterval(function () {

        if (checkOverlap(bullet, shooter)) {
            bullet.destroy();
            clearInterval(i);
            lives--;
            livesText.setText("Lives: " + lives);
            explosionSound.play()

            if (lives == 0) {
                end("Lose")
            }
        }
        for (var step = 0; step < barriers.length; step++) {
            if (barriers[step].checkCollision(bullet)) {
                bullet.destroy();
                clearInterval(i)
                isShooting = false

                scoreText.setText("Score: " + score);


                explosionSound.play()

                if (score === (enemyInfo.count.col * enemyInfo.count.row)) {
                    end("Win")
                }
            }
        }
    }, 10)
    scene.physics.add.overlap(bullet, enemyLava, function () {
        bullet.destroy();
        explosionSound.play();
        clearInterval(i);
    })

}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
}

//Enemy Fire
setInterval(enemyFire, 3000)

function enemyFire() {
    if (isStarted === true) {
        var enemy = enimies.children.entries[Phaser.Math.Between(0, enimies.children.entries.length - 1)];
        manageEnemyBullet(scene.physics.add.sprite(enemy.x, enemy.y, "bullet"), enemy)
    }
}

//Flying Saucers



var saucers = [];
function makeSaucer() {
    if (isStarted == true) {
        manageSaucer(scene.physics.add.sprite(0, 60, "saucer"));
    }
}

setInterval(function () {
    if (isStarted == true) {
        for (var i = 0; i < saucers.length; i++) {
            var saucer = saucers[i];
            if (saucer.isDestroyed == false) {
                manageEnemyBullet(scene.physics.add.sprite(saucer.x, saucer.y, "bullet"), saucer)

            } else {
                saucers.splice(i, 1);
            }
        }
    }

}, 2000)

function manageSaucer(saucer) {
    saucers.push(saucer);
    saucer.isDestroyed = false;
    saucer.setVelocityX(100);
    scene.physics.add.overlap(saucer, saucerLava, function () {
        saucer.destroy()
        saucer.isDestroyed = true;
        saucerSound.stop()
    })
    saucerSound.play()
}

//Barriers
class Barrier {
    constructor(scene, gx, y) {
        var x = gx;
        var y = y;
        this.children = [];
        this.scene = scene;

        for (var r = 0; r < 3; r++) {
            for (var c = 0; c < 3; c++) {
                var child = scene.add.rectangle(x, y, 30, 20, 0x1ff56);
                scene.physics.add.existing(child);
                child.health = 2;
                this.children.push(child)
                x = x + child.displayWidth;
            }
            x = gx;
            y = y + child.displayHeight;
        }

        this.children[this.children.length-2].destroy();
        this.children.splice(this.children.length-2, 1);        
    }
    checkCollision(sprite) {
        var isTouching = false;
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            if (checkOverlap(sprite, child)) {
                isTouching = true;

                if (this.children[i].health === 1) {
                    child.destroy();
                    this.children.splice(i, 1);

                } else {
                    this.children[i].health--;

                }
                break;
            }
        }
        return isTouching;
    }
}

function end(con) {
    explosionSound.stop();
    saucerSound.stop();
    shootSound.stop();
    move.stop()

    alert(`You ${con}! Score: ` + score);
    location.reload()

}