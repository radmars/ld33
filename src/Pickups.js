
var Pickup = me.ObjectEntity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        settings.collidable = true;
        settings.image = settings.image || 'pickup';
        settings.spritewidth =  69;
        settings.spriteheight = 117;
        settings.width = 60;
        settings.height = 100;
        // call the parent constructor
        this.parent(x, y , settings);

        //var shape = this.getShape();
        //shape.pos.x = 0;
        //shape.pos.y = 40;

        this.gravity = 0;
        this.pickup = true;
        this.z = 300;
        this.overworld = true;

        // Hack...
        me.state.current().pickups.push(this);

        // set the renderable position to center
        this.anchorPoint.set(0.5, 0.5);
    },

    update: function(dt) {
        this.parent(dt);
        this.updateMovement();

        if(me.state.current().player.overworld){
            me.game.world.collide(this, true).forEach(function(col) {
                if(col && col.obj.player && col.obj.collisionTimer <= 0 && this.collidable) {
                    me.state.current().pickups.remove(this);
                    this.collidable = false;
                    me.game.world.removeChild(this);
                    me.audio.play( "pickup" );
                }
            }, this);
        }

        return true;
    }

});
