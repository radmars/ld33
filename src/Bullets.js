
var Bullet = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || "zap";
        settings.spritewidth =  111;
        settings.spriteheight = 42;
        settings.width = 111;
        settings.height = 42;
        this.parent( x, y, settings );
        this.bullet = true;
        this.alwaysUpdate = true;
        this.collidable = true;
        this.z = 300;
        this.gravity = 0;

        this.renderable.animationspeed = 10;

        this.lifetime = 1200;
    },

    onCollision: function() {

    },

    die: function(){
        this.collidable = false;
        me.game.world.removeChild(this);
    },

    update: function( dt ) {
        this.parent( dt );
        this.updateMovement();
        this.lifetime -= dt;

        if (!this.inViewport && (this.pos.y > me.video.getHeight())) {
            // if yes reset the game
            me.game.world.removeChild(this);
        }
        if( this.vel.x == 0 ) {
            // we hit a wall?
            me.game.world.removeChild(this);
        }
        if (this.lifetime <= 0) {
            me.game.world.removeChild(this);
        }

        return true;
    }

});

var MusketBullet = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = "baddieBullet";
        settings.spritewidth = 64;
        settings.spriteheight = 60;
        settings.height = 30;
        settings.width = 30;

        this.parent( x, y, settings );
        this.baddie = true;
        this.collidable = true;
        this.z = 300;
        this.gravity = 0;
    },

    setDir: function(x, y) {
        this.vel.x = x;
        this.vel.y = y;
        // flip x/y based on direction maybe????
    },

    die: function(){
        this.collidable = false;
        me.game.world.removeChild(this);
    },

    update: function( dt ) {
        this.parent( dt );
        this.updateMovement();

        if (!this.inViewport && (this.pos.y > me.video.getHeight())) {
            // if yes reset the game
            this.die();
        }
        if( this.vel.x == 0 && this.vel.y ==0 ) {
            // we hit a wall?
            this.die();
        }

        return true;
    }

});
