var MusketBullet = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || "bullet";
        settings.spritewidth = settings.spritewidth || 32;
        settings.spriteheight = settings.spriteheight || 32;
        settings.height = 32;
        settings.width = 32;

        this.bigExplode = settings.bigExplode || false;

        this.killspot = settings.killspot;

        this.parent( x, y, settings );
        this.damage = settings.damage || 1;
        this.caster = radmars.assert(settings.caster,"must specify a caster");

        this.zombie = this.caster.zombie;
        this.baddie = this.caster.baddie;

        this.alwaysUpdate = true;
        this.collidable = true;
        this.z = 300;
        this.gravity = 0;

        this.anchorPoint.set(0.5, 0.5);

        console.log("new bullet: zombie: " + this.zombie +  "/ baddine: "  + this.baddie );
    },

    onCollision: function(pos, obj) {
        //|| (!this.zombie && obj.player)
        if( (obj.zombie != this.zombie && obj.baddie != this.baddie ) ) {
            //console.log("bullet hit! zombie " + this.zombie + " / " + obj.zombie + " / baddinE: "  + this.baddie + " / " + obj.baddie );
            obj.damage(this.damage, this.caster);
            //console.log("bihfgihg");
            this.die();

            if (this.killspot) {
                me.audio.play("magic-hit");
            }
        }
    },

    setDir: function(x, y) {
        this.vel.x = x;
        this.vel.y = y;
        // flip x/y based on direction maybe????
    },

    updateMovement: function() {
        // horrific hack. if this is a mage bullet, don't collide w/ environment
        // (which happens in object entity updatemovement)
        if (this.killspot) {
            this.collidable = false;
        }

        this.parent();

        if (this.killspot) {
            this.collidable = true;
        }
    },

    die: function(){
        this.collidable = false;
        me.game.world.removeChild(this);

        if(this.bigExplode){
            var particle = new ExplodeBigParticle(this.pos.x-32, this.pos.y-32);
            me.game.world.addChild(particle);
        }else{
            var particle = new ExplodeSmallParticle(this.pos.x-8, this.pos.y-8);
            me.game.world.addChild(particle);
        }
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
