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

       // me.input.bindPointer( me.input.mouse.LEFT )

        me.input.registerPointerEvent('pointerdown', this, this.click.bind(this));

        // enable the keyboard
        me.input.bindKey(me.input.KEY.O, "proxy_mouse");
        me.input.bindPointer(me.input.KEY.O);
        me.input.bindPointer(me.input.mouse.RIGHT, me.input.KEY.O);


       // me.input.registerMouseEvent('mousedown', me.game.viewport, this.click);
       // me.input.registerMouseEvent('mousemove', me.game.viewport, this.hover);
    },

    shoot: function(){

    },

    click: function(){
        console.log( "mouse! " +  me.input.mouse.pos.x  + " , " +  me.input.mouse.pos.y );
    },

    hover: function(){

    },

    update: function(dt) {
        var self = this;
        this.parent(dt);

        if (me.input.isKeyPressed('proxy_mouse'))  {
            this.click();
        }


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
            if( this.hitTimer <= 0 && this.collisionTimer <=0 && col && col.obj.baddie ) {

                //TODO: change character to normal texture here!
                //TODO: if pickups <= 0, die!

                if( true ){
                    me.game.viewport.shake(5, 250);
                    for( var i=0; i<LD30.data.souls; i++){
                        var b = new OnHitPickup(this.pos.x, this.pos.y, {});
                        me.game.world.addChild(b);
                    }
                    me.game.world.sort();
                  //  me.audio.play( "hit" );
                  //  me.audio.play( "lostsouls" );
                }
                else {
                    this.deathTimer = 2000;
                    //intensity, duration
                    me.game.viewport.shake(10, 2000);
                 //   me.audio.play( "death" );
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
                this.renderable.setCurrentAnimation("hit", function() {
                    self.renderable.setCurrentAnimation("idle");
                });
            }
        }, this);

        this.updateMovement();
        return true;
    }
});