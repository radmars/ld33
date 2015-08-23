var Unit = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {}
        this.unitType = radmars.assert(settings.unitType, 'Must specify a unitType');
        this.zombie = settings.zombie;
        this.baddie = !this.zombie;
        this.player = settings.player;

        this.parent( x, y, {
            image: this.unitType + (this.zombie ? '_zombie' : ''),
            spritewidth: settings.spritewidth,
            spriteheight: settings.spriteheight,
            width: settings.width || 32,
            height: settings.height || 32,
        });

        settings.maxTargetingDist = 150;
        settings.giveUpDist = 225;
        settings.findTargetTimerMax = 100;
        settings.attackCooldownMax = 30;
        settings.attackRange = settings.spritewidth + 10;
        settings.maxHP = 5;

        // some defautls. pick better ones please.
        this.alwaysUpdate = false;
        this.attackCooldown     = 0;
        this.attackDamage       = 1;
        this.attackCooldownMax  = settings.attackCooldownMax || 30;
        this.attackRange        = settings.attackRange || settings.spritewidth;
        this.clumpDist          = 32;
        this.collidable         = true;
        this.curTarget          = null;
        this.dead               = false;
        this.direction          = 1;
        this.findTargetTimer    = 40;
        this.findTargetTimerMax = settings.findTargetTimerMax || 100;
        this.giveUpDist         = settings.giveUpDistance || 225;
        this.gravity = 0;
        this.hp                 = settings.hp || this.maxHP;
        this.maxHP              = radmars.assert(settings.maxHP, "Must specifiy maxHP");
        this.maxTargetingDist   = settings.maxTargettingDistance || 150;
        this.moveTo             = new me.Vector2d(0,0);
        this.moveToTargetPos    = false;
        this.speed              = 2;
        this.targetAccel        = settings.targetAccel || 0.15;
        this.z = 300;


        this.renderable.addAnimation( "attacking", [ 0 ] );
        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "walk", [ 0 ] );
        this.renderable.animationspeed = 70;
        this.setFriction( 0.05, 0.05 );
        this.setVelocity( 1, 1 );

        // Hacks...
        if(this.baddie) {
            me.state.current().baddies.push(this);
        }
        else {
            me.state.current().playerArmy.push(this);
        }

    },

    damage: function(dmg) {
        this.hp -= dmg;
        if(this.hp <= 0 && !this.dead) {
            this.dead = true;
            if(this.zombie) {
                me.state.current().playerArmy.remove(this);
            }
            else {
                me.state.current().baddies.push(this);
            }
            var corpse = new Corpse(this.pos.x, this.pos.y);
            me.game.world.addChild(corpse);
            me.game.world.removeChild(this);
        }
    },

    moveToPos: function (x,y){
        this.moveToTargetPos = true;
        this.moveTo.x = x;
        this.moveTo.y = y;
    },

    moveToPlayer: function(dt) {
        var toTarget = new me.Vector2d( this.player.followPos.x, this.player.followPos.y );
        if(this.moveToTargetPos){
            toTarget.x = this.moveTo.x;
            toTarget.y = this.moveTo.y;
        }
        toTarget.sub(this.pos);

        if(toTarget.length() <= this.followDist ){
            this.vel.x = this.vel.y = 0;
        } else {
            toTarget.normalize();
            this.vel.x = toTarget.x * this.speed;
            this.vel.y = toTarget.y * this.speed;
        }
    },

    update: function(dt) {
        this.recheckTarget(dt);
        if(this.curTarget) {
            this.moveTowardTargetAndAttack(dt);
        }
        else if(this.zombie) {
            this.moveToPlayer(dt);
        }

       this.checkUnitCollision( me.state.current().playerArmy, false );
       this.checkUnitCollision( me.state.current().baddies, true );

       this.fixDirection();

       this.parent(dt);
       this.updateMovement();

       this.checkUnitCollision( me.state.current().playerArmy, true );
       this.checkUnitCollision( me.state.current().baddies, false );

       //this.checkBulletCollision();
       return true;
    },

    checkBulletCollision: function(){
        me.game.world.collide(this, true).forEach(function(col) {
            if(col && col.obj.bullet) {
                col.obj.die();
                me.state.current().baddies.remove(this);
                me.game.viewport.shake(2, 250);
                //TODO: spawn death particle?
                this.collidable = false;
                me.game.world.removeChild(this);

                var p = new Pickup(this.pos.x, this.pos.y-150, {});
                me.game.world.addChild(p);

                // #ProHacks
                var b = new window[this.unitType](this.pos.x, this.pos.y, {
                    skel: 1,
                    x: this.pos.x,
                    y: this.pos.y,
                    width: 80, // TODO This controls patrol???
                    height: 80
                });
                b.z = 300;
                me.game.world.addChild(b);
                me.game.world.sort();

                me.audio.play( "enemydeath" + Math.round(1+Math.random()*3) );
            }
        }, this);
    },

    fixDirection: function() {
        this.flipX(this.vel.x < 0 );
    },

    recheckTarget: function(dt) {
        this.findTargetTimer--;
        if (this.findTargetTimer <= 0) {
            this.curTarget = radmars.findTarget(this.pos, this.getTargetList(), this.maxTargetingDist);
            this.findTargetTimer = this.findTargetTimerMax;
        }
    },

    getTargetList: function() {
        if(this.zombie) {
            return me.state.current().baddies;
        }
        else {
            return me.state.current().playerArmy;
        }
    },

    attack: function(other) {
        throw "You need to overload this function!";
    },


    checkUnitCollision: function( array, stopOnCollide ){
        // me.state.current().playerArmy
        array.forEach(function(target) {
            if(target != this){
                var targetToMe = new me.Vector2d( this.pos.x, this.pos.y );
                targetToMe.sub(target.pos);

                if(targetToMe.length() < this.clumpDist){
                    targetToMe.normalize();
                    targetToMe.x *= this.clumpDist;
                    targetToMe.y *= this.clumpDist;
                    this.pos.x = target.pos.x + targetToMe.x;
                    this.pos.y = target.pos.y + targetToMe.y;

                    if(stopOnCollide){
                        this.vel.x = this.vel.y = 0;
                    }
                }
            }
        }.bind(this));
    },

    moveTowardTargetAndAttack: function(dt) {
        if (this.attackCooldown >= 0) {
            this.attackCooldown -= dt;
        }

        if (this.curTarget) {
            var distVec = new me.Vector2d(this.curTarget.pos.x, this.curTarget.pos.y);
            distVec.sub(this.pos);
            var distance = distVec.length();

            // give up if too far away
            if (distance > this.giveUpDist) {
                this.curTarget = null;
                return;
            }

            if (distance < this.attackRange) {
                this.tryAttack(this.curTarget);
            }

            distVec.normalize();
            this.vel.x += distVec.x * this.targetAccel;
            this.vel.y += distVec.y * this.targetAccel;
        }
    },

    tryAttack: function(target) {
        if (this.attackCooldown <= 0) {
            var success = this.attack(target);
            // only reset cooldown if we actually attacked
            if (success) {
                this.attackCooldown = this.attackCooldownMax;
            }
        }
    }
});


