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
        this.necroMode = true;
        this.overworld = false;

        this.z = 200;
        this.shootDelay = 0;
        this.disableInputTimer = 0;

        var shape = this.getShape();
        shape.pos.x = 44;
        shape.pos.y = 0;
        shape.resize(70, 110);
        me.state.current().player = this;

        this.collisionTimer = 0;
        this.deathTimer = 0;
        this.doubleJumped = false;

        this.animationSuffix = "";

        this.maxVel = 4;

        this.setVelocity( this.maxVel, this.maxVel );
        this.setFriction( 1, 1 );
        this.direction = 1;

        this.gravity = 0;

        this.centerOffsetX = 75;
        this.centerOffsetY = 0;

        this.followPos = new me.Vector2d(
            this.pos.x + this.centerOffsetX,
            this.pos.y + this.centerOffsetY
        );

        me.game.viewport.follow( this.followPos, me.game.viewport.AXIS.BOTH );
        me.game.viewport.setDeadzone( me.game.viewport.width / 10, 1 );

        this.renderable.animationspeed = 150;
        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "double_jump", [ 0 ] );
        this.renderable.addAnimation( "jump", [ 0 ] );
        this.renderable.addAnimation( "jump_extra", [ 0 ] );
        this.renderable.addAnimation( "fall", [ 0 ] );
        this.renderable.addAnimation( "walk", [ 0 ] );
        this.renderable.addAnimation( "shoot", [ 0 ] );
        this.renderable.addAnimation( "shoot_jump", [ 0 ] );
        this.renderable.addAnimation( "hit", [ 0 ] );

        this.renderable.addAnimation( "die", [ 0 ] );

        this.renderable.setCurrentAnimation("idle" + this.animationSuffix);

        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP,   "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");
        me.input.bindKey(me.input.KEY.W,    "up");
        me.input.bindKey(me.input.KEY.S,    "down");
        me.input.bindKey(me.input.KEY.A,    "left");
        me.input.bindKey(me.input.KEY.D,    "right");
    },

    toUnderworld: function(){
        if(this.overworld == true) return;

        this.overworld = true;
        this.necroMode = false;
        this.setVelocity( 7, 20 );
        this.setFriction( 0.7, 0 );

        this.disableInputTimer = 1500;

        LD30.data.collectedSouls += LD30.data.souls;
        this.renderable.animationspeed = 165;
        if(LD30.data.souls > 0){
            for( var i=0; i<LD30.data.souls; i++){
                var b = new EnterPortalParticle(this.pos.x, this.pos.y, {delay:i*50});
                me.game.world.addChild(b);
            }
            me.game.world.sort();
            LD30.data.souls = 0;
        }
        this.animationSuffix = "_normal";
    },

    shoot: function(){
        if(this.necroMode && this.shootDelay <= 0){
            me.audio.play( "shoot", false, null, 0.6 );
            var b = new Bullet(this.pos.x + 30*this.direction, this.pos.y+40, { direction: this.direction });
            me.game.world.addChild(b);
            me.game.world.sort();
            this.shootDelay = 200;
            var self = this;
            if(this.jumping || this.falling){
                this.renderable.setCurrentAnimation("shoot_jump" + this.animationSuffix, function() {
                    self.renderable.setCurrentAnimation("fall" + self.animationSuffix);
                });
            }else{
                this.renderable.setCurrentAnimation("shoot" + this.animationSuffix, function() {
                    self.renderable.setCurrentAnimation("idle" + self.animationSuffix);
                })
            }


        }
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
            if( ! this.renderable.isCurrentAnimation("walk" + this.animationSuffix) ){
                this.renderable.setCurrentAnimation("walk" + this.animationSuffix, function() {
                    self.renderable.setCurrentAnimation("idle" + self.animationSuffix);
                })
            }
        } else if (me.input.isKeyPressed('right')) {
            this.vel.x = this.maxVel;
            this.flipX(false);
            this.direction = 1;
            if( ! this.renderable.isCurrentAnimation("walk" + this.animationSuffix) ){
                this.renderable.setCurrentAnimation("walk" + this.animationSuffix, function() {
                    self.renderable.setCurrentAnimation("idle" + self.animationSuffix);
                })
            }
        }

        if (me.input.isKeyPressed('up'))  {
            this.vel.y = -this.maxVel;
            this.direction = -1;
            if( !this.renderable.isCurrentAnimation("walk" + this.animationSuffix) ){
                this.renderable.setCurrentAnimation("walk" + this.animationSuffix, function() {
                    self.renderable.setCurrentAnimation("idle" + self.animationSuffix);
                })
            }
        } else if (me.input.isKeyPressed('down')) {
            this.vel.y = this.maxVel;
            this.direction = 1;
            if( !this.renderable.isCurrentAnimation("walk" + this.animationSuffix) ){
                this.renderable.setCurrentAnimation("walk" + this.animationSuffix, function() {
                    self.renderable.setCurrentAnimation("idle" + self.animationSuffix);
                })
            }
        }

        me.game.world.collide(this, true).forEach(function(col) {
            if(this.hitTimer <= 0 && this.collisionTimer <=0 && col && col.obj.baddie && (this.overworld == col.obj.overworld) ) {

                //TODO: change character to normal texture here!
                //TODO: if pickups <= 0, die!

                if(LD30.data.souls > 0){
                    me.game.viewport.shake(5, 250);
                    for( var i=0; i<LD30.data.souls; i++){
                        var b = new OnHitPickup(this.pos.x, this.pos.y, {});
                        me.game.world.addChild(b);
                    }
                    me.game.world.sort();
                    LD30.data.souls = 0;
                    //this.necroMode = false;
                    //this.animationSuffix = "_normal";
                    me.audio.play( "hit" );
                    me.audio.play( "lostsouls" );
                }
                else {
                    this.deathTimer = 2000;
                    //intensity, duration
                    me.game.viewport.shake(10, 2000);
                    me.audio.play( "death" );
                }

                this.hitTimer = 250;
                this.collisionTimer = 1000;
                this.renderable.flicker(1000);

                if(this.pos.x - col.obj.pos.x > 0){
                    this.vel.x = this.hitVelX = 50;
                }else{
                    this.vel.x = this.hitVelX = -50;
                }
                this.vel.y = -20;
                this.renderable.setCurrentAnimation("hit" + this.animationSuffix, function() {
                    self.renderable.setCurrentAnimation("idle" + self.animationSuffix);
                });
            }
        }, this);

        this.updateMovement();
        return true;
    }
});