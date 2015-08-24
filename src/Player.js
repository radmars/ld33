var Corpse = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};

        this.unitType = radmars.assert(settings.unitType || 'knight', "Must specify a corpse unitType");

        //settings.image = image;
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.height = 32;
        settings.width = 32;
        this.parent(x, y, settings);
        this.z =  100 + this.pos.y * 0.1;
        this.corpse = true;
        this.gravity = 0;

        me.state.current().corpses.push(this);

        console.log("corpse! " + this.unitType);
    },

    convertToZombie: function(player) {

        me.game.world.removeChild(this);
        //removed after loop.
        //me.state.current().corpses.remove(this);

        var z = LD33.newBaddie(this.pos.x, this.pos.y, {
            unitType: this.unitType,
            zombie:true,
            baddie:false,
            player: player
        });
        me.game.world.addChild(z);

        if(this.unitType == "skeleton"){
            var bloodParticle = new BloodSplatParticle(this.pos.x, this.pos.y);
            me.game.world.addChild(bloodParticle);
        }
    }
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
        this.z =  100 + this.pos.y * 0.1;
        this.corpse = true;
        this.gravity = 0;

        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "dead", [ 1 ] );
        this.renderable.setCurrentAnimation("idle");

        this.converted = false;

        me.state.current().corpses.push(this);
    },

    convertToZombie: function(player) {

        if(!this.converted){
            this.converted = true;
            this.corpse = false;

            this.renderable.setCurrentAnimation("dead");

            var z = LD33.newBaddie(this.pos.x, this.pos.y, {
                unitType: 'skeleton', //skeleton
                //(Math.random() < .66 ? (Math.random < .33 ? 'knight' : 'mage') : 'musketeer'),
                player: player,
                zombie: true,
            });
            me.game.world.addChild(z);
            //removed after loop.
            //me.state.current().corpses.remove(this);
        }

    },
});

var Player = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings.image        = settings.image        || 'player';
        settings.spritewidth =  32*2;
        settings.spriteheight = 32*2;
        settings.height = 16*2;
        settings.width = 16*2;
        this.colChecker = this.checkCollisions.bind(this);
        this.parent( x, y, settings );
        this.alwaysUpdate = true;
        this.player = true;
        this.hitTimer = 0;
        this.hitVelX = 0;

        this.baddie = false;
        this.zombie = true;

        this.z =  100 + this.pos.y * 0.1;
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

        this.speed = 3.5;

        this.setFriction( 1.0, 1.0 );
        this.setVelocity( this.speed , this.speed  );
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

        this.summonCooldown = this.summonCooldownMax = 1000;
        this.raiseCooldown = this.raiseCooldownMax = 2000;

        me.game.viewport.follow( this.followPos, me.game.viewport.AXIS.BOTH );
        me.game.viewport.setDeadzone( me.game.viewport.width / 10, 1 );

        this.renderable.animationspeed = 150;
        this.renderable.addAnimation( "idle", [ 0,1,2,3 ] );
        this.renderable.addAnimation( "walk", [ 4,5,6,7 ] );
        this.renderable.addAnimation( "cast", [ 8,9,10,11 ] );

        //its 4am and this is a hack that works.
        this.renderable.addAnimation( "die", [ 12,13,14,15,16,17,18,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19 ] );

        this.renderable.setCurrentAnimation("idle");


        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP,   "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");

        me.input.bindKey(me.input.KEY.W,    "up");
        me.input.bindKey(me.input.KEY.S,    "down");
        me.input.bindKey(me.input.KEY.A,    "left");
        me.input.bindKey(me.input.KEY.D,    "right");


        me.input.bindKey(me.input.KEY.Q,    "summon");
        me.input.bindKey(me.input.KEY.L,    "summon");
        me.input.bindKey(me.input.KEY.E,    "raise");
        me.input.bindKey(me.input.KEY.M,    "raise");
        /**/
    },

    playerSummon:function(){
        radmars.maybeSwitchAnimation(this.renderable, "cast", true);
        var summoned = false;
        me.state.current().playerArmy.forEach(function(target) {
            if(target.player != true){
                console.log("summon!");
                target.playerSummon();
                summoned = true;
            }
        }.bind(this));

        var rune = new RuneParticle(this.pos.x-48, this.pos.y-32, {image:"rune_summon"});
        me.game.world.addChild(rune);

        if(summoned) me.game.viewport.shake(3, 250);
        me.audio.play("recall");
    },

    ressurect:function(){

        radmars.maybeSwitchAnimation(this.renderable, "cast", true);
        var remove = [];

        me.state.current().corpses.forEach(function(target) {
            var dist = new me.Vector2d(target.pos.x, target.pos.y);
            dist.sub(this.pos);
            if(dist.length() <= 100){
                target.convertToZombie(this);
                remove.push(target);
            }
        }.bind(this));

        var rune = new RuneParticle(this.pos.x-48, this.pos.y-32, {image:"rune_res"});
        me.game.world.addChild(rune);

        if(remove.length == 0){
            //nothing was ressurected.
            // be a little nicer with the cooldown
            this.raiseCooldown = this.raiseCooldownMax * 0.5;
            me.audio.play("rezfail");
        }else{
            //ressurection was a success!
            //remove all expended corpses
            me.game.viewport.shake(4, 250);

            remove.forEach(function(target) {
                me.state.current().corpses.remove(target);
            }.bind(this));
            me.audio.play("rez");
        }
    },

    moveToPos: function (x,y){
        //this.moveToTargetPos = true;
        //this.moveTo.x = x;
        //this.moveTo.y = y;
    },

    damage: function(dmg) {
        this.hp -= dmg;

        if(!this.dead && this.hp <= 0) {

            me.game.viewport.shake(10, 2000);

            this.dead = true;
            this.deathTimer = 2000;
            this.renderable.setCurrentAnimation("idle");
            me.audio.play("hit" + GetRandomIndexString(3));
            me.audio.play("playerdeath" + GetRandomIndexString(4));

        }
    },

    shoot: function(){

    },

    update: function(dt) {
        var self = this;
        this.parent(dt);

        this.z =  100 + this.pos.y * 0.1;

        if(this.shootDelay >0){
            this.shootDelay-=dt;
        }

        if(this.summonCooldown > 0){
            this.summonCooldown-=dt;
        }

        if(this.raiseCooldown > 0){
            this.raiseCooldown-=dt;
        }

        if(this.deathTimer > 0){
            this.deathTimer-=dt;
            this.moveToTargetPos = false;
            radmars.maybeSwitchAnimation(this.renderable, "die", false);
            this.updateMovement();
            if(this.deathTimer<=0){
                (function(e) {
                    me.state.change(me.state.PLAY);
                }).defer();
               // me.state.change( me.state.GAMEOVER);
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

        /*
        if( this.moveToTargetPos ){
            var toTarget = new me.Vector2d( this.moveTo.x, this.moveTo.y );
            toTarget.sub(this.pos);

            if(toTarget.length() <= 8 ){
                this.vel.x = this.vel.y = 0;
                radmars.maybeSwitchAnimation(this.renderable, "idle", true);
            }else{
                radmars.maybeSwitchAnimation(this.renderable, "walk", true);
                toTarget.normalize();
                this.vel.x = toTarget.x * this.speed;
                this.vel.y = toTarget.y * this.speed;

                if(this.vel.x > 0){
                    this.flipX(false);
                    this.direction = 1;
                }else{
                    this.flipX(true);
                    this.direction = -1;
                }
            }
        }
        */

        ///*
        if (me.input.isKeyPressed('left'))  {
            this.vel.x = -this.speed;
            this.flipX(true);
            this.direction = -1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        } else if (me.input.isKeyPressed('right')) {
            this.vel.x = this.speed;
            this.flipX(false);
            this.direction = 1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        }
        if (me.input.isKeyPressed('up'))  {
            this.vel.y = -this.speed;
            this.direction = -1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        } else if (me.input.isKeyPressed('down')) {
            this.vel.y = this.speed;
            this.direction = 1;
            radmars.maybeSwitchAnimation(this.renderable, "walk", true);
        }

        if (me.input.isKeyPressed('summon')&& this.summonCooldown <= 0){
            this.summonCooldown = this.summonCooldownMax;
            this.playerSummon();
            //console.log("summon!");
        }

        if (me.input.isKeyPressed('raise') && this.raiseCooldown <= 0){
            this.raiseCooldown = this.raiseCooldownMax;
            this.ressurect();
        }

        if(this.vel.length > this.speed){
            this.vel.normalize();
            this.vel.x *= this.speed;
            this.vel.y *= this.speed;
        }

       // */

        // Col checker is bound to checkCollisions.
        me.game.world.collide(this, true).forEach(this.colChecker);

        this.updateMovement();
        return true;
    },

    checkCollisions: function( col ) {
        // BLAH
        // other shit handles collision w/ player but we need to call collide above to collide with level changer
    }
});
