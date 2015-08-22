

var Baddie = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {}
        settings.image = settings.image || 'knight';
        settings.spritewidth = settings.spritewidth || 32;
        settings.spriteheight = settings.spriteheight || 32;

        this.type = settings.type;

        this.parent( x, y, settings );
        this.alwaysUpdate = false;
        this.baddie = true;

        this.gravity = 0;

        this.setVelocity( 1, 1 );
        this.setFriction( 0.05, 0.05 );
        this.targetAccel = 0.15;

        this.maxTargetingDist = 150;
        this.giveUpDist = 225;
        this.findTargetTimerMax = 100;
        this.findTargetTimer = 40;

        this.attackCooldownMax = 30;
        this.attackRange = settings.spritewidth;

        this.attackCooldown = 0;

        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "walk", [ 0 ] );
        this.renderable.addAnimation( "attacking", [ 0 ] );

        this.direction = 1;
        this.collidable = true;

        this.hp = this.hpMax = 5;
        // Hack...
        me.state.current().baddies.push(this);

        this.renderable.animationspeed = 70;
    },

    moveTowardTargetAndAttack: function() {
        if (this.curTarget) {
            var distVec = new me.Vector2d(this.curTarget.pos.x, this.curTarget.pos.y);
            distVec.sub(this.pos);
            var distance = distVec.length();

            // give up if too far away
            if (distance > this.giveUpDist) {
                console.log('giving up');
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
    },

    attack: function(target) {
        console.log("attack!!!");
        var self = this;
        this.renderable.setCurrentAnimation("attacking", function() {
            self.renderable.setCurrentAnimation("idle");
        });

        return true;
    },

    isMeleeAttacking: function() {
        return this.renderable.isCurrentAnimation("attacking");
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
                var b = new window[this.type](this.pos.x, this.pos.y, {
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
    update: function(dt) {
        this.parent(dt);

        this.findTargetTimer--;
        if (this.findTargetTimer <= 0) {
            this.curTarget = radmars.findTarget(this.pos, me.state.current().playerArmy, this.maxTargetingDist);
            this.findTargetTimer = this.findTargetTimerMax;
        }

        this.moveTowardTargetAndAttack();

        if (this.attackCooldown >= 0) {
            this.attackCooldown -= dt;
        }

        this.updateMovement();
        //this.checkBulletCollision();
        return true;
    }
});

var Musketeer = Baddie.extend({
    init: function(x, y, settings) {
        settings.image = 'knight_zombie';
        settings.spritewidth = 32;
        settings.spriteheight = 32;

        this.parent(x, y, settings);

        this.bulletVel = 12;
        // musketeer only shoots in cardinal dirs. width of targeting arc = target width
        this.targetWidth = settings.spritewidth + 10;

        this.setVelocity( 0.3, 0.3 );

        this.maxTargetingDist = 350;
        this.giveUpDist = 400;
        this.findTargetTimerMax = 100;
        this.findTargetTimer = 40;

        this.attackCooldownMax = 2500;
        this.attackRange = 300;
    },

    isMeleeAttacking: function() {
        return false;
    },

    attack: function(target) {
        var targetVec = new me.Vector2d(target.pos.x, target.pos.y);
        targetVec.sub(this.pos);
        var success = false;

        if (Math.abs(targetVec.x) < this.targetWidth) {
            this.shoot(0, this.bulletVel * ((target.pos.y > this.pos.y) ? 1 : -1));
            success = true;
        }
        else if (Math.abs(targetVec.y) < this.targetWidth) {
            this.shoot(this.bulletVel * ((target.pos.x > this.pos.x) ? 1 : -1), 0);
            success = true;
        }

        return success;
    },

    shoot: function(x, y) {
        var settings = {};
        var pos = new me.Vector2d(this.pos.x, this.pos.y);
        var bullet = new MusketBullet(pos.x, pos.y, settings);
        bullet.setDir(x, y);

        me.game.world.addChild(bullet);
        me.game.world.sort();
    }
});


var Fish = Baddie.extend({
    init: function(x, y, settings) {
        settings.image = 'fish';
        settings.spritewidth = 141;
        settings.spriteheight = 141;
        settings.type = 'Fish';

        this.patrolWidth = settings.width;
        settings.height = 50;
        settings.width = 70;
        this.parent( x, y, settings );


        var shape = this.getShape();
        if( !shape ) {
            this.addShape(new me.Rect(-14, 10, 100, 64 ));
            shape = this.getShape();
        }
        shape.pos.x = 0;
        shape.pos.y = 20;
        shape.resize(70, 50);

        this.renderable.addAnimation( "walk", [ 0, 1 ] );
        this.renderable.setCurrentAnimation("walk");

        this.startX = this.pos.x;
        this.baseSpeed = this.speed = 2.0;
        this.setVelocity( 5, 15 );
        this.flipX(true);
        this.direction = 1;
        this.renderable.animationspeed = 70;
    },

    update: function(dt) {
        this.parent(dt);

        this.vel.x = this.speed;

        if(this.pos.x > this.startX + this.patrolWidth){
            this.pos.x = this.startX + this.patrolWidth;
            this.speed = this.baseSpeed* -1;
            this.flipX(false);
            this.direction = -1;
        }
        if(this.pos.x < this.startX ){
            this.pos.x = this.startX;
            this.speed = this.baseSpeed;
            this.flipX(true);
            this.direction = 1;
        }

        return true;
    }
});

var Wasp = Baddie.extend({
    init: function(x, y, settings) {
        settings.image = 'wasp';
        settings.spritewidth = 141;
        settings.spriteheight = 141;
        settings.type = 'Wasp';

        this.patrolWidth = settings.width;
        settings.height = 80;
        settings.width = 80;
        this.parent( x, y, settings );

        this.renderable.addAnimation( "walk", [ 0, 1, 0, 2 ] );
        this.renderable.addAnimation( "shoot", [ 4 ] );
        this.renderable.setCurrentAnimation("walk");

        if( settings.skel == null || !settings.skel ) {
            this.renderable.addAnimation( "walk", [ 0, 1, 0, 2 ] );
            this.renderable.setCurrentAnimation("walk");
        }else{
            this.renderable.addAnimation( "walk", [ 0, 1] );
            this.renderable.setCurrentAnimation("walk");
        }

        this.startX = this.pos.x;
        this.baseSpeed = this.speed = 3.0;
        this.setVelocity( 5, 15 );
        this.gravity = 0;
        this.shootCooldown = 0;
        this.renderable.animationspeed = 70;
        this.pausePatrol = 0;

        this.flipX(true);
        this.direction = 1;
    },

    update: function(dt) {
        this.parent(dt);

        if(this.shootCooldown > 0) this.shootCooldown-=dt;

        if(this.shootCooldown <= 0){
            var d = me.state.current().player.pos.x - this.pos.x;
            if( (Math.abs(d) < 350 && Math.abs(d) > 150) && ((d > 0 && this.direction > 0)||(d < 0 && this.direction < 0))){
                this.pausePatrol = 500;
                this.shootCooldown = 2000;
                var b = new  WaspBullet(this.pos.x, this.pos.y, {direction:this.direction });
                me.audio.play("enemyshoot");
                me.game.world.addChild(b);
                me.game.world.sort();
            }
        }

        if(this.pausePatrol > 0){
            this.pausePatrol-=dt;
            return true;
        }

        this.vel.x = this.speed;
        if(this.pos.x > this.startX + this.patrolWidth){
            this.pos.x = this.startX + this.patrolWidth;
            this.speed = this.baseSpeed* -1;
            this.pausePatrol = 500;
            this.flipX(false);
            this.direction = -1;
        }
        if(this.pos.x < this.startX ){
            this.pos.x = this.startX;
            this.speed = this.baseSpeed;
            this.pausePatrol = 500;
            this.flipX(true);
            this.direction = 1;
        }

        return true;
    }
});
