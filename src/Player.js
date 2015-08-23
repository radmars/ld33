var Corpse = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = 'corpse';
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.height = 16;
        settings.width = 16;
        this.unitType = radmars.assert(settings.unitType || 'knight', "Must specify a corpse unitType");
        this.parent(x, y, settings);
        this.z = 300;
        this.corpse = true;
        this.gravity = 0;
    },

    convertToZombie: function(player) {
        me.game.world.removeChild(this);
        var z = LD33.newBaddie(this.pos.x, this.pos.y, {
            unitType: this.unitType,
            zombie:true,
            player: player
        });
        me.game.world.addChild(z);
    },
});

var Grave = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = 'grave_' + Math.round(Math.random()*2 + 1);
        settings.spritewidth = 32;
        settings.spriteheight = 64;
        settings.height = 32;
        settings.width = 32;
        this.parent(x, y, settings);
        this.z = 5;
        this.corpse = true;
        this.gravity = 0;

        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "dead", [ 1 ] );
        this.renderable.setCurrentAnimation("idle");

        this.converted = false;
    },

    convertToZombie: function(player) {

        if(!this.converted){
            this.converted = true;
            this.corpse = false;

            this.renderable.setCurrentAnimation("dead");

            var z = LD33.newBaddie(this.pos.x, this.pos.y, {
                unitType: 'knight', //(Math.random() < .66 ? (Math.random < .33 ? 'knight' : 'mage') : 'musketeer'),
                player: player,
                zombie: true,
            });
            me.game.world.addChild(z);
        }

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
        this.hp = this.maxHP = 1;

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

        this.moveToTargetPos = false;
        this.moveTo = new me.Vector2d( 0, 0 );
        this.moveTo.x = 0;
        this.moveTo.y = 0;

        me.game.viewport.follow( this.followPos, me.game.viewport.AXIS.BOTH );
        me.game.viewport.setDeadzone( me.game.viewport.width / 10, 1 );

        this.renderable.animationspeed = 150;
        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "walk", [ 0 ] );
        this.renderable.addAnimation( "hit", [ 0 ] );
        this.renderable.addAnimation( "die", [ 0 ] );

        this.renderable.setCurrentAnimation("idle");

        /*
        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP,   "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");

        me.input.bindKey(me.input.KEY.W,    "up");
        me.input.bindKey(me.input.KEY.S,    "down");
        me.input.bindKey(me.input.KEY.A,    "left");
        me.input.bindKey(me.input.KEY.D,    "right");
        */
    },

    moveToPos: function (x,y){
        this.moveToTargetPos = true;
        this.moveTo.x = x;
        this.moveTo.y = y;
    },

    damage: function(dmg) {
        this.hp -= dmg;
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
            this.moveToTargetPos = false;
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
            this.moveToTargetPos = false;
            this.updateMovement();
            return true;
        }

        if( this.moveToTargetPos ){
            var toTarget = new me.Vector2d( this.moveTo.x, this.moveTo.y );
            toTarget.sub(this.pos);

            if(toTarget.length() <= 8 ){
                this.vel.x = this.vel.y = 0;
                radmars.maybeSwitchAnimation(this.renderable, "idle", true);
            }else{
                radmars.maybeSwitchAnimation(this.renderable, "walk", true);
                toTarget.normalize();
                this.vel.x = toTarget.x * this.maxVel;
                this.vel.y = toTarget.y * this.maxVel;

                if(this.vel.x > 0){
                    this.flipX(false);
                    this.direction = 1;
                }else{
                    this.flipX(true);
                    this.direction = -1;
                }
            }
        }

        /*
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
        */

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
            /*
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
            */
        }
    },
});
