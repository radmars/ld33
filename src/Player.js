var Zombie = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = 'knight_zombie';
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.height = 32;
        settings.width = 32;
        this.parent(x, y, settings);
        this.setVelocity( 1, 1 );
        this.z = 300;
        this.gravity = 0;
        this.zombie = true;
        this.player = settings.player;
        this.collidable = true;

        this.hp = this.hpMax = 5;
        this.selected = false;

        this.followDist = Math.round(Math.random() * 32 + 32);

        // Hack...
        me.state.current().playerArmy.push(this);
    },

    

    update: function(dt) {
        if(false) {
            // TODO: Chase enemies
        }
        else {
            var toPlayer = new me.Vector2d( this.player.followPos.x, this.player.followPos.y );
            toPlayer.sub(this.pos);

            if(toPlayer.length() <= this.followDist ){
                this.vel.x = this.vel.y = 0;
            }else{
                toPlayer.normalize();
                this.vel.x = toPlayer.x;
                this.vel.y = toPlayer.y;
            }

            me.state.current().playerArmy.forEach(function(target) {
                if(target != this){
                    var targetToMe = new me.Vector2d( this.pos.x, this.pos.y );
                    targetToMe.sub(target.pos);

                    if(targetToMe.length() < 32){
                        targetToMe.normalize();
                        targetToMe.x *= 32;
                        targetToMe.y *= 32;
                        this.pos.x = target.pos.x + targetToMe.x;
                        this.pos.y = target.pos.y + targetToMe.y;
                    }
                }

            }.bind(this));

        }

       this.parent(dt);
       this.updateMovement();
       return true;
    }
});


var Corpse = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = 'corpse';
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.height = 16;
        settings.width = 16;
        this.parent(x, y, settings);
        this.z = 300;
        this.corpse = true;
        this.gravity = 0;
    },

    convertToZombie: function(player) {
        me.game.world.removeChild(this);
        var z = new Zombie(this.pos.x, this.pos.y, {
            player: player,
        });
        player.addZombie(z);
        me.game.world.addChild(z);
    },
});

var Player = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings.image        = settings.image        || 'tinyman';
        settings.spritewidth =  16*2;
        settings.spriteheight = 16*2;
        settings.height = 16*2;
        settings.width = 16*2;
        this.colChecker = this.checkCollisions.bind(this);
        this.parent( x, y, settings );
        this.alwaysUpdate = true;
        this.player = true;
        this.hitTimer = 0;
        this.hitVelX = 0;
        this.image =  me.loader.getImage('tinyman');

        this.z = 200;
        this.disableInputTimer = 0;

        var shape = this.getShape();
        shape.pos.x = 0;
        shape.pos.y = 0;
        shape.resize(32, 32);
        me.state.current().player = this;
        me.state.current().playerArmy.push(this);

        this.collisionTimer = 0;
        this.deathTimer = 0;

        this.maxVel = 4;

        this.setVelocity( this.maxVel, this.maxVel );
        this.setFriction( 1, 1 );
        this.direction = 1;

        this.gravity = 0;

        this.centerOffsetX = 8;
        this.centerOffsetY = 8;

        this.followPos = new me.Vector2d(
            this.pos.x + this.centerOffsetX,
            this.pos.y + this.centerOffsetY
        );

        me.game.viewport.follow( this.followPos, me.game.viewport.AXIS.BOTH );
        me.game.viewport.setDeadzone( me.game.viewport.width / 10, 1 );

        this.renderable.animationspeed = 150;
        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "walk", [ 0 ] );
        this.renderable.addAnimation( "hit", [ 0 ] );
        this.renderable.addAnimation( "die", [ 0 ] );

        this.renderable.setCurrentAnimation("idle");

        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP,   "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");

        me.input.bindKey(me.input.KEY.W,    "up");
        me.input.bindKey(me.input.KEY.S,    "down");
        me.input.bindKey(me.input.KEY.A,    "left");
        me.input.bindKey(me.input.KEY.D,    "right");
    },

    addZombie: function(z) {
        me.state.current().playerArmy.push(z);
    },

    shoot: function(){

    },

    update: function(dt) {
        var self = this;
        this.parent(dt);

        if(this.shootDelay >0){
            this.shootDelay-=dt;
        }

        if(this.deathTimer > 0){
            this.deathTimer-=dt;
            radmars.maybeSwitchAnimation(this.renderable, "die", false);
            this.updateMovement();
            if(this.deathTimer<=0){
                me.state.change( me.state.GAMEOVER);
            }
            return true;
        }

        this.followPos.x = this.pos.x + this.centerOffsetX;
        this.followPos.y = this.pos.y + this.centerOffsetY;

        if(this.disableInputTimer > 0){
            this.disableInputTimer-=dt;
            this.vel.x = 0;
            this.vel.y = 0;
            this.updateMovement();
            return true;
        }

        if(this.collisionTimer > 0){
            this.collisionTimer-=dt;
        }

        if(this.hitTimer > 0){
            this.hitTimer-=dt;
            this.vel.x = this.hitVelX;
            this.updateMovement();
            return true;
        }

        // TODO acceleration
        if (me.input.isKeyPressed('left'))  {
            this.vel.x = -this.maxVel;
            this.flipX(true);
            this.direction = -1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        } else if (me.input.isKeyPressed('right')) {
            this.vel.x = this.maxVel;
            this.flipX(false);
            this.direction = 1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        }
        if (me.input.isKeyPressed('up'))  {
            this.vel.y = -this.maxVel;
            this.direction = -1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        } else if (me.input.isKeyPressed('down')) {
            this.vel.y = this.maxVel;
            this.direction = 1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        }

        // Col checker is bound to checkCollisions.
        me.game.world.collide(this, true).forEach(this.colChecker);

        this.updateMovement();
        return true;
    },

    checkCollisions: function( col ) {
        if(col.obj.corpse) {
            col.obj.convertToZombie(this);
        }
        else if( this.hitTimer <= 0 && this.collisionTimer <= 0 && col.obj.baddie ) {
            // die here?

            me.game.viewport.shake(5, 250);

            this.hitTimer = 250;
            this.collisionTimer = 1000;
            this.renderable.flicker(1000);

            if (this.pos.x - col.obj.pos.x > 0){
                this.vel.x = this.hitVelX = 5;
            } else {
                this.vel.x = this.hitVelX = -5;
            }
            if (this.pos.y - col.obj.pos.y > 0){
                this.vel.y = this.hitVelY = 5;
            } else{
                this.vel.y = this.hitVelY = -5;
            }

            radmars.playAnimation(this.renderable, "hit");
        }
    },
});
