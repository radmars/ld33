

var BloodSplatParticle = me.ObjectEntity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || 'bloodsplat';
        settings.spritewidth =  settings.spritewidth || 32;
        settings.spriteheight = settings.spriteheight || 32;
        settings.width = settings.width || 32;
        settings.height = settings.height || 32;
        this.life = settings.life || 700;
        this.animationspeed = settings.animationspeed || 200;

        // call the parent constructor
        this.parent(x, y , settings);
        this.gravity = 0;
        this.pickup = false;
        //this.vel.x = Math.random() * 20-10;
        //this.vel.y = -10 - Math.random()*10;
        //this.setFriction( 0.1, 0 );
        var d = settings.delay || 0;

        /*
        var self = this;
        new me.Tween(this.pos).to({x:this.pos.x +Math.random()*100-50, y: this.pos.y+Math.random()*100-50}, d).easing(me.Tween.Easing.Quintic.InOut).onComplete(function(){
            new me.Tween(self.pos).to({x:self.pos.x +225, y: self.pos.y-25}, self.life).easing(me.Tween.Easing.Elastic.InOut).start();
            new me.Tween(self.renderable).to({alpha:0}, self.life*0.25).delay(self.life*0.75).start();
        }).start();
        */

        //
        this.z = 300;
        this.collidable = false;

        // set the renderable position to center
        //this.anchorPoint.set(0.5, 0.5);
    },

    update: function(dt) {
        this.parent(dt);
        this.updateMovement();

        this.life -=dt;

        if(this.life <=0){
            this.collidable = false;
            me.game.world.removeChild(this);
            return true;
        }

        return true;
    }
});


var ExplodeSmallParticle = BloodSplatParticle.extend({
    init: function (x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || 'explode_small';
        settings.spritewidth =  settings.spritewidth || 32;
        settings.spriteheight = settings.spriteheight || 32;
        settings.width = settings.width || 32;
        settings.height = settings.height || 32;
        this.life = settings.life || 200;
        this.animationspeed = settings.animationspeed || 100;

        // call the parent constructor
        this.parent(x, y , settings);
        this.anchorPoint.set(0.5, 0.5);
    }
});

var ExplodeBigParticle = BloodSplatParticle.extend({
    init: function (x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || 'explode_big';
        settings.spritewidth =  settings.spritewidth || 96;
        settings.spriteheight = settings.spriteheight || 96;
        settings.width = settings.width || 96;
        settings.height = settings.height || 96;
        this.life = settings.life || 400;
        this.animationspeed = settings.animationspeed || 100;

        // call the parent constructor
        this.parent(x, y , settings);
        this.anchorPoint.set(0.5, 0.5);
    }
});


var RuneParticle = BloodSplatParticle.extend({
    init: function (x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || 'rune_res';
        settings.spritewidth =  settings.spritewidth || 128;
        settings.spriteheight = settings.spriteheight || 128;
        settings.width = settings.width || 128;
        settings.height = settings.height || 128;
        this.life = settings.life || 200;
        this.animationspeed = settings.animationspeed || 100;
        // call the parent constructor
        this.parent(x, y , settings);
        this.anchorPoint.set(0.5, 0.5);
        this.z = 100;
    }
});


var MoveTargetParticle = me.ObjectEntity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || 'move_target';
        settings.spritewidth =  settings.spritewidth || 32;
        settings.spriteheight = settings.spriteheight || 32;
        settings.width = settings.width || 32;
        settings.height = settings.height || 32;

        this.animationspeed = settings.animationspeed || 25;

        this.showTimer = 0;

        // call the parent constructor
        this.parent(x, y , settings);
        this.gravity = 0;

        this.z = 350;
        this.collidable = false;
        this.anchorPoint.set(0.5, 0.5);

        this.st = false;
        this.renderable.addAnimation( "show1", [ 0,4,8,12,16,20,24,28,32,36 ] );
        this.renderable.addAnimation( "show2", [ 0,4,8,12,16,20,24,28,32,36 ] );
    },

    show: function(x,y){
        this.pos.x = x;
        this.pos.y = y;
        //this.renderable.alpha = 1;
        this.showTimer = 1500;

        this.st = !this.st;

        if(this.st){
            this.renderable.setCurrentAnimation("show1");
        }else{
            this.renderable.setCurrentAnimation("show2");
        }

    },

    update: function(dt) {
        this.parent(dt);
        this.updateMovement();

        this.showTimer-=dt;

        if(this.showTimer <=0){
            this.renderable.alpha = 0;
            return true;
        }else{
            this.renderable.alpha = 1;
        }

        return true;
    }
});