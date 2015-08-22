var Player = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings.image        = settings.image        || 'tinyman';
        settings.spritewidth =  16*2;
        settings.spriteheight = 16*2;
        settings.height = 16*2;
        settings.width = 16*2;
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

        this.centerOffsetX = 0;
        this.centerOffsetY = 0;

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
            if( ! this.renderable.isCurrentAnimation("die") ){
                this.renderable.setCurrentAnimation("die");
            }
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
            if( ! this.renderable.isCurrentAnimation("walk") ){
                this.renderable.setCurrentAnimation("walk", function() {
                    self.renderable.setCurrentAnimation("idle");
                })
            }
        } else if (me.input.isKeyPressed('right')) {
            this.vel.x = this.maxVel;
            this.flipX(false);
            this.direction = 1;
            if( ! this.renderable.isCurrentAnimation("walk") ){
                this.renderable.setCurrentAnimation("walk", function() {
                    self.renderable.setCurrentAnimation("idle");
                })
            }
        }
        if (me.input.isKeyPressed('up'))  {
            this.vel.y = -this.maxVel;
            this.direction = -1;
            if( !this.renderable.isCurrentAnimation("walk") ){
                this.renderable.setCurrentAnimation("walk", function() {
                    self.renderable.setCurrentAnimation("idle");
                })
            }
        } else if (me.input.isKeyPressed('down')) {
            this.vel.y = this.maxVel;
            this.direction = 1;
            if( !this.renderable.isCurrentAnimation("walk") ){
                this.renderable.setCurrentAnimation("walk", function() {
                    self.renderable.setCurrentAnimation("idle");
                })
            }
        }

        me.game.world.collide(this, true).forEach(function(col) {
            if(col.obj.corpse) {
                col.obj.convertToZombie();
            }
            else if( this.hitTimer <= 0 && this.collisionTimer <=0 && col && col.obj.baddie && col.obj.isMeleeAttacking() ) {
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

                this.renderable.setCurrentAnimation("hit", function() {
                    self.renderable.setCurrentAnimation("idle");
                });
            }
        }, this);

        this.updateMovement();
        return true;
    }
});
