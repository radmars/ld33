var Knight = Unit.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = 'knight';
        settings.maxHP = 6;
        this.parent(x, y, settings);
        this.setAttackRange(42);
    },

    initAnimations: function(){
        if(this.zombie){
            this.renderable.addAnimation( "summon", [ 11,12,11,13,11,14,15,16,17,18,19,20,21,22 ] );
            this.renderable.addAnimation( "res", [ 11,12,11,13,11,14,15,16,17,18,19,20,21,22 ] );
            this.renderable.addAnimation( "attacking", [ 7,8,9,10 ] );
            this.renderable.addAnimation( "idle", [ 23,23,23,24,25,26,26,26,27 ] );
            this.renderable.addAnimation( "walk", [ 0, 1, 2, 3 ] );
            this.renderable.addAnimation( "hit", [ 4 ] );
            this.renderable.animationspeed = 100;
            this.resTimer = 1500;
        }else{
            this.renderable.addAnimation( "attacking", [ 7,8,9,10 ] );
            this.renderable.addAnimation( "idle", [ 11,11,12,12,13,13,14,14] );
            this.renderable.addAnimation( "walk", [ 0,0, 1, 1,2,2, 3 ,3] );
            this.renderable.addAnimation( "hit", [ 4 ] );
            this.renderable.animationspeed = 100;
        }
    },

    attack: function(target) {
        //console.log("attacking! ");
        radmars.maybeSwitchAnimation(this.renderable, 'attacking', true);
        target.damage(this.attackDamage, this);
        return true;
    }
});


var Skeleton = Unit.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = 'skeleton';
        settings.maxHP = 5;
        this.parent(x, y, settings);
        this.setAttackRange(42);
    },

    initAnimations: function(){
        if(this.zombie){
            this.renderable.addAnimation( "summon", [ 19,20,21,22,23,24,25,26,27 ] );
            this.renderable.addAnimation( "res", [ 12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27 ] );
            this.renderable.addAnimation( "attacking", [ 10,11,11,10,9 ] );
            this.renderable.addAnimation( "idle", [ 0,0,1,1,2,2 ] );
            this.renderable.addAnimation( "walk", [ 3,3,4,4,5,5,6,6] );
            this.renderable.addAnimation( "hit", [ 28 ] );
            this.renderable.animationspeed = 100;
            this.resTimer = 1500;
        }else{
            this.renderable.addAnimation( "attacking", [ 5,6,7,8,9,10,8,9,10 ] );
            this.renderable.addAnimation( "idle", [ 13, 14, 15, 16, 17,17,17,17,17,17, 18,18,17,17,17,17, 16, 15, 14] );
            this.renderable.addAnimation( "walk", [ 0,0, 1,1, 2,2, 3,3] );
            this.renderable.addAnimation( "hit", [ 11 ] );
            this.renderable.animationspeed = 100;
        }
    },

    attack: function(target) {
        //console.log("attacking! ");
        radmars.maybeSwitchAnimation(this.renderable, 'attacking', true);
        target.damage(this.attackDamage, this);
        return true;
    },
});


var Civilian = Unit.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = 'civilian';

        settings.maxHP = 4;
        this.civType = "civilian_1";

        this.parent(x, y, settings);
        this.setAttackRange(42);

        if(this.zombie){
            this.speed = 4;
        }else{
            this.speed = 3;
            this.agro = false;
        }
    },

    initAnimations: function(){
        if(this.zombie){
            this.renderable.addAnimation( "summon", [ 0 ] );
            this.renderable.addAnimation( "res", [ 0 ] );
            this.renderable.addAnimation( "attacking", [ 0 ] );
            this.renderable.addAnimation( "idle", [ 0,1,1,2,2,1,1,1,2,2,3,3,4,4,3,3,0,5,6,7,6,7,6,7,5,0,0,0,0] );
            this.renderable.addAnimation( "walk", [8,8,9,9,10,10,11,11] );
            this.renderable.addAnimation( "hit", [ 12 ] );
            this.renderable.animationspeed = 100;
            this.resTimer = 1500;
        }else{
            this.renderable.addAnimation( "attacking", [ 0 ] );
            this.renderable.addAnimation( "idle", [ 0,1,1,2,2,1,1,1,2,2,3,3,4,4,3,3,0,5,6,7,6,7,6,7,5,0,0,0,0] );
            this.renderable.addAnimation( "walk", [8,8,9,9,10,10,11,11] );
            this.renderable.addAnimation( "hit", [ 12 ] );
            this.renderable.animationspeed = 100;
        }
    },

    attack: function(target) {
        //console.log("attacking! ");
        radmars.maybeSwitchAnimation(this.renderable, 'attacking', true);
        target.damage(this.attackDamage, this);
        return true;
    },
});

var Musketeer = Unit.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = settings.unitType || 'musketeer';
        settings.maxHP = 4;

        console.log("new musketeer");

        this.parent(x, y, settings);

        this.bulletVel = 6;
        // musketeer only shoots in cardinal dirs. width of targeting arc = target width
        this.targetWidth = 32 + 10; //settings.spritewidth + 10;

        this.attackDamage = 1;
        //this.setVelocity( 0.3, 0.3 );

        this.maxTargetingDist = 350;
        this.giveUpDist = 400;
        this.findTargetTimerMax = 100;
        this.findTargetTimer = 40;

        this.attackCooldownMax = 2500;
        this.setAttackRange(300);

        this.shootSound = "musket";
    },

    initAnimations: function(){
        if(this.zombie){
            this.renderable.addAnimation( "res", [ 22,23,24,25,26,27,28,29,30,31 ] );
            this.renderable.addAnimation( "summon", [ 22,23,24,25,26,27,28,29,30,31 ] );
            this.renderable.addAnimation( "attacking", [ 16,17,18,19,20,20 ] );
            this.renderable.addAnimation( "idle", [ 0,1,2,3,4,2,2,5,6,7,8,8,7,6,5,4,3,2,1,0,0,0,0,0,0] );
            this.renderable.addAnimation( "walk", [ 11,11,12,12,13,13,14,14] );
            this.renderable.addAnimation( "hit", [ 34 ] );
            this.renderable.animationspeed = 100;
            this.resTimer = 1500;
        }else{
            this.renderable.addAnimation( "attacking", [ 16,17,18,19,20,20 ] );
            this.renderable.addAnimation( "idle", [ 0,1,2,3,4,2,2,5,6,7,8,8,7,6,5,4,3,2,1,0,0,0,0,0,0] );
            this.renderable.addAnimation( "walk", [ 11,11,12,12,13,13,14,14] );
            this.renderable.addAnimation( "hit", [ 22 ] );
            this.renderable.animationspeed = 100;
        }
    },

    attack: function(target) {

        var targetVec = new me.Vector2d(target.pos.x, target.pos.y);
        targetVec.sub(this.pos);
        var success = false;

        if (Math.abs(targetVec.x) < this.targetWidth) {
            this.shoot(0, this.bulletVel * ((target.pos.y > this.pos.y) ? 1 : -1), {});
            success = true;
        }
        else if (Math.abs(targetVec.y) < this.targetWidth) {
            this.shoot(this.bulletVel * ((target.pos.x > this.pos.x) ? 1 : -1), 0, {});
            success = true;
        }

        return success;
    },

    shoot: function(velX, velY, settings) {
        var pos = new me.Vector2d(this.pos.x, this.pos.y);
        settings.caster = this;
        settings.damage = this.attackDamage;
        //console.log("shooting! zombie: " + this.zombie + " / baddie: " + this.baddie);

        var bullet = new MusketBullet(pos.x, pos.y, settings);
        bullet.setDir(velX, velY);

        me.game.world.addChild(bullet);
        me.game.world.sort();

        if (this.shootSound) {
            me.audio.play(this.shootSound);
        }
        else {
            radmars.assert("Units that shoot should have a shoot sound ya dingus!");
        }
    }
});

var Mage = Musketeer.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = 'mage';
        settings.maxHP = 3;

        console.log("new mage");

        this.parent(x, y, settings);

        this.bulletVel = 5;
        this.attackDamage = 1;

        //this.setVelocity( 0.25, 0.25 );

        this.maxTargetingDist = 350;
        this.giveUpDist = 400;
        this.findTargetTimerMax = 100;
        this.findTargetTimer = 40;

        this.attackCooldownMax = 3000;
        this.setAttackRange(230);

        this.shootSound = "magic";
    },

    initAnimations: function(){
        if(this.zombie){
            this.renderable.addAnimation( "summon", [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13 ] );
            this.renderable.addAnimation( "res", [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13 ] );
            this.renderable.addAnimation( "attacking", [ 20,21,22,23,24,25 ] );
            this.renderable.addAnimation( "idle", [ 13,14,15,15,16,17,18,18,19 ] );
            this.renderable.addAnimation( "walk", [ 27,27,28,28,29,29,30,30] );
            this.renderable.addAnimation( "hit", [ 26 ] );
            this.renderable.animationspeed = 100;
            this.resTimer = 1500;
        }else{
            this.renderable.addAnimation( "attacking", [ 5,6,7,8,9,10,8,9,10 ] );
            this.renderable.addAnimation( "idle", [ 13, 14, 15, 16, 17,17,17,17,17,17, 18,18,17,17,17,17, 16, 15, 14] );
            this.renderable.addAnimation( "walk", [ 0,0, 1,1, 2,2, 3,3] );
            this.renderable.addAnimation( "hit", [ 11 ] );
            this.renderable.animationspeed = 100;
        }
    },

    attack: function(target) {
        var targetVec = new me.Vector2d(target.pos.x, target.pos.y);
        targetVec.sub(this.pos);

        targetVec.normalize();

        var settings = {};
        settings.image = 'baddieBullet';
        settings.damage = this.attackDamage;
        settings.bigExplode = true;

        var killspot = new me.Vector2d(target.pos.x, target.pos.y);
        settings.killspot = killspot;
        this.shoot(targetVec.x * this.bulletVel, targetVec.y * this.bulletVel, settings);

        return true;
    },
});
