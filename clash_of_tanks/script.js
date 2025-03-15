
/* Written by Alexey Rudenko at Sololearn playground with some little help from James Long. https://jlongster.com/Making-Sprite-based-Games-with-Canvas  */


var w, h, k, xo, yo,
units = [],
    icons = [],
    bullets = [],
    enemies = [],
    explosions = [],
    dif = [' practice', ' easy', ' medium', ' hard', ' harder', ' hardcore', ' pro', ' deathmatch', ' godlike', ' impossible'],
    gameTime = 0,
    isGameOver,
    nextwave = 0,
    enemydep = 1,
    firstwave = false,
    deployarea = false,
    counter = 0,
    counter2 = 0,
    gameNum = 0,
    game_paused = false,
    lvl = 0,     // 0...9
    inf = function ()
    {
        var popup = document.getElementById('infdiv');
        var btn = document.getElementById('info'); 
        if (popup.style.display !== 'block')
        {
            popup.style.display = 'block';
            info.style.color = 'white';
            info.style.backgroundColor = 'red';
        }
        else
        {
            popup.style.display = 'none';
            info.style.color = 'red';
            info.style.backgroundColor = '#f3f3f3';
        }
    },
    changeLvl = function (op) {
        if (op == 1 && lvl < 9) {
            lvl++;
        }
        if (op == 0 && lvl > 0) {            
            lvl--;
        }
        
        var _dif = document.getElementsByClassName("dif");
            _dif[1].innerHTML = dif[lvl];
    };
    
 

(function ()
{
    function Sprite(url, pos, size, resized, animspeed, frames, _index, once)
    {
        this.pos = pos;
        this.size = size;
        this.resized = resized;
        this.url = url;
        this.animspeed = animspeed;
        this.frames = frames;
        this._index = _index;
        this.once = once;
    }

    Sprite.prototype =
    {

        update: function (dt)
        {

                        this._index += this.animspeed * dt;

                    
        },



                 render: function (ctx)
        {

            var frame;


                        
            if (this.animspeed > 0)
            {                
                var max = this.frames.length;                
                var idx = Math.floor(this._index);                frame = this.frames[idx % max];               
                if (this.once && idx >= max)
                {                    this.done = true;                    
                    return;                
                }            
            }            
            else
            {                frame = 0;            
            }

                           
            var x = this.pos[0];     
            var y = this.pos[1];  

             x += frame * this.size[0];   ctx.drawImage(resources.get(this.url),  x, y,  this.size[0], this.size[1],  0, 0,  this.resized[0], this.resized[1]);

                    
        }

            
    };

        window.Sprite = Sprite;
})();

(function ()
{
    function Unit(status, pos, hp, speed, maxspeed, range, damage, reload, angle, defaultangle, dir, sprite)
    {
        this.status = status;
        this.pos = pos;
        this.hp = hp;
        this.maxhp = hp;
        this.speed = speed;
        this.maxspeed = maxspeed;
        this.range = range;
        this.damage = damage;
        this.reload = reload;
        this.angle = angle;
        this.defaultangle = defaultangle;
        this.dir = dir;
        this.sprite = sprite
    }

    Unit.prototype =
    {

                 getAngle: function (target)
        {

            var x = this.pos[0] - target[0];
            var y = this.pos[1] - target[1];
            if (x < 0)
            {
                return Math.floor(Math.atan(y / x) * (180 / Math.PI));
            }
            else
            {
                return Math.floor(Math.atan(y / x) * (180 / Math.PI) - 180);
            }
        },

        moveAhead: function (dt)
        {
            var rad = this.angle / (180 / Math.PI);
            this.pos[0] += Math.cos(rad) * this.speed * dt * this.dir;
            this.pos[1] += Math.sin(rad) * this.speed * dt * this.dir;
            
        },

        findTarget: function (t)
        {
            for (i = 0; i < t.length; i++)
            {

                var dis = this.getDistance(t[i]);
                if (dis < this.range && !t[i].destroyed && t[i].time > 0.7 && t[i].pos[1] > k)
                {
                    this.target = t[i];
                    this.status = "targetfound";
                    return;
                }
            }

        },

        avoidCollision: function (list, ownindx, dt)
        {

            var l = list;

            for (i = 0; i < l.length; i++)
            {
                if (i == ownindx) continue;
                if (this.getDistance(l[i]) < k * 8)
                {
                  for (var sec = 2; sec > 0; sec--) {

                    var ownfuturepos = [this.pos[0] + (Math.cos(this.angle / (180 / Math.PI)) * this.speed * sec * this.dir), this.pos[1] + (Math.sin(this.angle / (180 / Math.PI)) * this.speed * sec * this.dir)];

                    var allyfuturepos = [l[i].pos[0] + (Math.cos(l[i].angle / (180 / Math.PI)) * l[i].speed * sec * this.dir), l[i].pos[1] + (Math.sin(l[i].angle / (180 / Math.PI)) * l[i].speed * sec * this.dir)];
                    if (getDistance(ownfuturepos, allyfuturepos) < k * 3 && this.pos[1] * this.dir > l[i].pos[1] * l[i].dir && Math.abs(ownfuturepos[0] - allyfuturepos[0]) < this.sprite.resized[0])
                    {
                        this.speed -= 160/Math.pow(sec, 4) * dt;
                    }
                 }

                }
            }


        },

        getDistance: function (t)
        {

            return Math.floor(Math.sqrt(Math.pow(this.pos[0] - t.pos[0], 2) + Math.pow(this.pos[1] - t.pos[1], 2)));
        },

        fireOnTarget: function ()
        {

            var x = Math.floor(this.pos[0] + ((this.sprite.resized[1] / 2 * this.dir) * Math.cos(this.angle / (180 / Math.PI))));
            var y = Math.floor(this.pos[1] + ((this.sprite.resized[0] / 2 * this.dir) * Math.sin(this.angle / (180 / Math.PI))));
            bullets.push(
            {
                pos: [x, y],
                target: this.target,
                speed: k * 12,
                damage: this.damage,
                angle: this.angle + getRandom (-5,3),
                dir: this.dir,

            });

            this.lastshot = 0;

        }    
    };

        window.Unit = Unit;
})();

var getRandom = function (min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var getDistance = function (own, ally)
{

    return Math.floor(Math.sqrt(Math.pow(own[0] - ally[0], 2) + Math.pow(own[1] - ally[1], 2)));
};



var deployUnit = function (unit, pos)
{
    var u = unit;
    units.push(new Unit(u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], u[8], u[9], u[10], u[11], u[12], u[13]));
    units[units.length - 1].pos = pos;
    deployarea = false;
};

var deployEnemy = function (unit, pos)
{
    var u = unit;
    enemies.push(new Unit(u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], u[8], u[9], u[10], u[11], u[12], u[13]));
    enemies[enemies.length - 1].pos = pos;

};



var returnToBase = function (icon)
{
    icon.pos = icon.defaultpos;
    icon.dragable = false;
};

var gameOver = function (a)
{

    var _min = Math.floor(gameTime / 60);
    var _sec = ('0' + Math.floor(gameTime % 60)).slice(-2);


    switch (a)
    {

    case 'win':

        alert("Mission completed! Your time is " + _min + ':' + _sec + '\n\nLosses: ' + counter + ' units.\n\nEnemies destroyed: ' + counter2 + '.');

        var log_item = "<p>Game " + ++gameNum + ": 🏆 Win ⏲" + _min + ':' + _sec + ' /' + dif[lvl] + ' /' + "</p>";
        if (lvl < dif.length - 1) lvl++;
        var log = document.getElementById('log');
        log.innerHTML += log_item;
        document.body.style.paddingTop = 50 - (gameNum * 3) + "%";
        log.style.display = "block";
        loader();
        break;

    case 'loss':
        alert("Mission failed!" + '\n\nLosses: ' + counter + ' units.\n\nEnemies destroyed: ' + counter2 + '.');

        var log_item = "<p>Game " + ++gameNum + ": 💩 Fail ⏲" + _min + ':' + _sec + ' /' + dif[lvl] + ' /' + "</p>";
        if (lvl > 0) lvl--;
        var log = document.getElementById('log');
        log.innerHTML += log_item;
        document.body.style.paddingTop = 50 - (gameNum * 3)+ "%";
        log.style.display = "block";
        loader();
        break;

    }
}

var reset = function ()
{

    units = [];
    icons = [];
    bullets = [];
    enemies = [];
    explosions = [];
    isGameOver = false;
    gameTime = 0;
    enemydep = 1;
    firstwave = false;
    nextwave = 0;
    deployarea = false;
    counter = 0;
    counter2 = 0;
}

var xxx = 0,
    yyy = 0;
var mouse =
{
    x: 0,
    y: 0,
    down: false
}

/////////////////////////////

var startGame = function ()
{

    reset();
    
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    var p = document.getElementsByClassName("modal-text")[0];
    span.onclick = function() {
         modal.style.display = "none";
         game_paused = !game_paused;
    }

    var log = document.getElementById('log');
    var popup = document.getElementById('infdiv');
    
    
    log.style.display = "none";
    popup.style.display = 'none';
    document.body.style.paddingTop = 0;
        
    var maindiv = document.getElementById("main");

    maindiv.innerHTML = '<canvas id="c"></canvas>';

    var c = document.getElementById("c");

    var ctx = c.getContext("2d");

    w = window.innerWidth;
    h = window.innerHeight;
    

    if (w < h) {
        c.width = w - 46;
        c.height = c.width/0.7;
    } else {
        c.height = h - 46;
        c.width = c.height * 0.7;
    }
    
    k = c.width / 26;

    xo = c.offsetLeft;
    yo = c.offsetTop;
    
    
    ////

    icons = [
    {
        active: true,
        pos: [c.width / 28, c.height - c.height / 8],
        defaultpos: [c.width / 28, c.height - c.height / 8],
        respawn: false,
        respawnrate: 1,
        sprite: new Sprite('https://opengameart.org/sites/default/files/tanks_3.png', [55, 76], [194, 134], [c.width / 5.5, c.height / 10.5])
    },
    {
        active: true,
        pos: [c.width / 3.4, c.height - c.height / 8.5],
        defaultpos: [c.width / 3.4, c.height - c.height / 8.5],
        respawn: false,
        respawnrate: 3,
        sprite: new Sprite('https://opengameart.org/sites/default/files/tanks_3.png', [71, 600], [159, 130], [c.width / 6.5, c.height / 12])
    },
    {
        active: true,
        pos: [c.width / 1.85, c.height - c.height / 8.2],
        defaultpos: [c.width / 1.85, c.height - c.height / 8.2],
        respawn: false,
        respawnrate: 0.5,
        sprite: new Sprite('https://opengameart.org/sites/default/files/tanks_3.png', [52, 269], [205, 124], [c.width / 5.8, c.height / 12])
    },
    {
        active: false,
        pos: [c.width / 1.27, c.height - c.height / 8.2],
        defaultpos: [c.width / 1.27, c.height - c.height / 8.2],
        respawn: false,
        respawnrate: 0.5,
        sprite: new Sprite('https://opengameart.org/sites/default/files/tanks_3.png', [68, 434], [230 - 68, 565 - 434], [c.width / 5.8, c.height / 12])
    }];

    ///

    c.addEventListener("touchmove", function (event)
    {

        var touch = event.touches[0];
        xxx = touch.pageX - xo - 3;
        yyy = touch.pageY - yo - 3;

        checkIcons(xxx, yyy);

        event.preventDefault();
    }, false);

    c.addEventListener("touchend", function (event)
    {

        checkDeployment(xxx, yyy);

    }, false);

    c.addEventListener("mousemove", function (event)
    {
        mouse.x = event.pageX - xo - 3;
        mouse.y = event.pageY - yo - 3;
    }, false);

    c.addEventListener("mousedown", function ()
    {
        mouse.down = true;
        checkIcons(mouse.x, mouse.y);

    }, false);

    c.addEventListener("mouseup", function ()
    {
        mouse.down = false;
        checkDeployment(mouse.x, mouse.y);
    }, false);

    function checkIcons(xx, yy)
    {

        if (xx > icons[0].pos[0] && xx < icons[0].pos[0] + (k * 5) && yy > icons[0].pos[1] - (k * 3) && yy < icons[0].pos[1] + (k * 3) && !icons[0].respawn  && !game_paused)
        {
            if (!icons[1].dragable && !icons[2].dragable)
            {
                icons[0].dragable = true;
                basictank[0] = 'readyfordeploy';
                deployarea = true;
            }
        }

        if (xx > icons[1].pos[0] && xx < icons[1].pos[0] + (k * 5) && yy > icons[1].pos[1] - (k * 3) && yy < icons[1].pos[1] + (k * 3) && !icons[1].respawn  && !game_paused)
        {
            if (!icons[0].dragable && !icons[2].dragable)
            {
                icons[1].dragable = true;
                lighttank[0] = 'readyfordeploy';
                deployarea = true;

            }
        }

        if (xx > icons[2].pos[0] && xx < icons[2].pos[0] + (k * 5) && yy > icons[2].pos[1] - (k * 3) && yy < icons[2].pos[1] + (k * 3) && !icons[2].respawn  && !game_paused)
        {
            if (!icons[0].dragable && !icons[1].dragable)
            {
                icons[2].dragable = true;
                ttank[0] = 'readyfordeploy';
                deployarea = true;

            }
        }
        
        if (xx > icons[3].pos[0] && xx < icons[3].pos[0] + (k * 5) && yy > icons[3].pos[1] - (k * 3) && yy < icons[3].pos[1] + (k * 3))
        {
           game_paused = !game_paused;
           
           if(modal.style.display == "block") {
                modal.style.display = "none";
           } else {
              
                p.innerHTML = 'Please, donate 100500 bucks to obtain this fabulous, innovative, wirelessly rechargeable, eco/vegan/gay friendly machine of death! <br/>Thank you!'; 
                modal.style.width = c.width*0.8 + "px";
                modal.style.marginLeft = c.width*0.1 + xo + "px";
                modal.style.display = "block";
           }
           
           
          
        }
    }

    function checkDeployment(xx, yy)
    {

        var inside = false;
     
        if (xx > c.width / 100 && yy > c.height / 2 && xx < c.width - c.width / 100 - 3 && yy < c.height / 2 + c.height / 3.7)
        {
            inside = true;
        }
                
        var allies = false;
        for(var i = 0; i < units.length; i++) {
            if (getDistance([xx,yy], units[i].pos) <  2*k) allies = true;
        }
        
        if (basictank[0] == 'readyfordeploy' && inside && !allies)
        {
            basictank[0] = ' ';
            deployUnit(basictank, [xx, yy]);
            units[units.length - 1].status = 'acceleration';
            icons[0].pos = [icons[0].defaultpos[0], icons[0].defaultpos[1] + c.width / 4];
            icons[0].dragable = false;
            icons[0].respawn = true;
            deployarea = false;
        }
        else if ( basictank[0] == 'readyfordeploy' && (!inside && !icons[0].respawn || allies))
        {
            returnToBase(icons[0]);
            basictank[0] = ' '
        }

        if (lighttank[0] == 'readyfordeploy' && inside && !allies)
        {
            lighttank[0] = ' ';
            deployUnit(lighttank, [xx, yy]);
            units[units.length - 1].status = 'acceleration';
            icons[1].pos = [icons[1].defaultpos[0], icons[1].defaultpos[1] + c.width / 4];;
            icons[1].dragable = false;
            icons[1].respawn = true;

        }
        else if ( lighttank[0] == 'readyfordeploy' && (!inside && !icons[1].respawn || allies))
        {
            returnToBase(icons[1]);
            lighttank[0] = " ";
        }

        if (ttank[0] == 'readyfordeploy' && inside && !allies)
        {
            ttank[0] = ' ';
            deployUnit(ttank, [xx, yy]);
            units[units.length - 1].status = 'acceleration';
            icons[2].pos = [icons[2].defaultpos[0], icons[2].defaultpos[1] + c.width / 4];;
            icons[2].dragable = false;
            icons[2].respawn = true;

        }
        else if ( ttank[0] == 'readyfordeploy' && (!inside && !icons[2].respawn || allies))
        {
            returnToBase(icons[2]);
            ttank[0] = " ";
        }

    }


    lastTime = Date.now();


    // units
    // stats -- status, pos, hp, speed, maxspeed, range, damage, reload, angle, defaultangle , dir, sprite

    var basictank = ['acceleration', [0, 0], 1500, 0, k * 1.5, k * 7, 399, 1.3, - 90, - 90, 1, new Sprite('https://opengameart.org/sites/default/files/tanks_3.png', [55, 76], [194, 135], [c.width / 11, c.height / 21])];

    var lighttank = ['acceleration', [0, 0], 300, 0, k * 5.5, k * 10, 149, 0.9, - 90, - 90, 1, new Sprite("https://opengameart.org/sites/default/files/tanks_3.png", [71, 600], [159, 130], [c.width / 13, c.height / 24])];

    var ttank = ['acceleration', [0, 0], 150, 0, k * 3.5, k * 12.5, 30, 0.05, - 90, - 90, 1, new Sprite("https://opengameart.org/sites/default/files/tanks_3.png", [52, 269], [205, 124], [c.width / 11.6, c.height / 24])];
    //enemy units
    var enemybasic = ['acceleration', [0, 0], 1500, 0, k * 1.5, k * 7, 399, 1.3, - 90, - 90, - 1, new Sprite('https://opengameart.org/sites/default/files/tanks_3.png', [365, 76], [194, 135], [c.width / 11, c.height / 21])];

    var enemylight = ['acceleration', [200, 200], 300, 0, k * 5.5, k * 10, 149, 0.7, - 90, - 90, - 1, new Sprite("https://opengameart.org/sites/default/files/tanks_3.png", [395, 600], [159, 130], [c.width / 13, c.height / 24])];

    var enemyttank = ['acceleration', [0, 0], 150, 0, k * 3.5, k * 12.5, 10, 0.05, - 90, - 90, - 1, new Sprite("https://opengameart.org/sites/default/files/tanks_3.png", [362, 269], [205, 124], [c.width / 11.6, c.height / 24])];



    main()

    // The main game loop



    function main()
    {

            
        var now = Date.now();

        if (!game_paused) { 
            
          var dt = (now - lastTime) / 1000;

          update(dt);

          render();
        
        }

        lastTime = now;

          
        if  (!isGameOver) requestAnimFrame(main);

    };

    function update(dt)
    {

            gameTime += dt;
            
            if (nextwave < 0) {
                nextwave = (enemydep * (18 - lvl)-gameTime + 2).toFixed(0) 
            } else {
               nextwave -= dt;
            }

        if (Math.floor(gameTime) == 1 && firstwave == false)
        {
            
          if (lvl < 3) {
            
            if (lvl >= 0) {
                deployEnemy(enemybasic, [c.width / 4, c.height / 5]);
                deployEnemy(enemybasic, [c.width - (c.width / 4), c.height / 5]);
            }
            
            if (lvl >= 1) {
                deployEnemy(enemyttank, [c.width / 2, c.height / 20]);
            }
            
            if (lvl >= 2) {
                deployEnemy(enemylight, [c.width / 5, c.height / 18]);
                deployEnemy(enemylight, [c.width - (c.width / 5), c.height / 18]);
            }
          }
          
          if (lvl > 2 && lvl < 6) {
              
             if (lvl >= 3) {
                deployEnemy(enemybasic, [c.width / 2, c.height / 4]);
                deployEnemy(enemylight, [c.width / 2 - c.width / 16, c.height / 7]);
                deployEnemy(enemylight, [c.width / 2 + c.width / 16, c.height / 7]);
                deployEnemy(enemyttank, [c.width / 2, c.height / 14]);
                deployEnemy(enemyttank, [c.width / 2 - c.width / 8, c.height / 14]);
                deployEnemy(enemyttank, [c.width / 2 + c.width / 8, c.height / 14]);
                
                if (lvl == 3) {
                    deployEnemy(enemyttank, [c.width / 2 - c.width / 4, c.height / 14]);
                    deployEnemy(enemyttank, [c.width / 2 + c.width / 4, c.height / 14]);
                }
                
