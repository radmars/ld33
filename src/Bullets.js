var MusketBullet = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || "baddieBullet";
        settings.spritewidth = settings.spritewidth || 64;
        settings.spriteheight = settings.spriteheight || 60;
        settings.height = 30;
        settings.width = 30;

        this.killspot = settings.killspot;

        this.parent( x, y, settings );
        this.damage = settings.damage || 1;
        this.caster = radmars.assert(settings.caster,"must specify a caster");
        this.baddie = this.caster.baddie;
        this.zombie = this.caster.zombie;
        this.alwaysUpdate = true;
        this.baddie = true;
        this.collidable = true;
        this.z = 300;
        this.gravity = 0;
    },

    onCollision: function(pos, obj) {
        if( (obj.zombie != this.zombie && obj.baddie != this.baddie )|| this.baddie && obj.player ) {
            obj.damage(this.damage);
            console.log("bihfgihg");
            this.die();
        }
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
        if (this.killspot && this.killspot.distance(this.pos) < 5) {
            this.die();
            // Add explosion here?
        }

        return true;
    }

});
