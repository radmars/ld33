var Knight = Unit.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = 'knight';
        this.parent(x, y, settings);

        console.log("new knight");
    },

    attack: function(target) {
        //console.log("attacking! ");
        radmars.maybeSwitchAnimation(this.renderable, 'attacking', true);
        target.damage(this.attackDamage);
        return true;
    },

});

var Musketeer = Unit.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = settings.unitType || 'musketeer';

        console.log("new musketeer");

        this.parent(x, y, settings);

        this.bulletVel = 12;
        // musketeer only shoots in cardinal dirs. width of targeting arc = target width
        this.targetWidth = 32 + 10; //settings.spritewidth + 10;

        this.setVelocity( 0.3, 0.3 );

        this.maxTargetingDist = 350;
        this.giveUpDist = 400;
        this.findTargetTimerMax = 100;
        this.findTargetTimer = 40;

        this.attackCooldownMax = 2500;
        this.attackRange = 300;
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
        var bullet = new MusketBullet(pos.x, pos.y, settings);
        bullet.setDir(velX, velY);

        me.game.world.addChild(bullet);
        me.game.world.sort();
    }
});

var Mage = Musketeer.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.unitType = 'mage';

        console.log("new mage");

        this.parent(x, y, settings);

        this.bulletVel = 7;

        this.setVelocity( 0.25, 0.25 );

        this.maxTargetingDist = 350;
        this.giveUpDist = 400;
        this.findTargetTimerMax = 100;
        this.findTargetTimer = 40;

        this.attackCooldownMax = 3000;
        this.attackRange = 300;
    },

    attack: function(target) {
        var targetVec = new me.Vector2d(target.pos.x, target.pos.y);
        targetVec.sub(this.pos);

        targetVec.normalize();

        var settings = {};
        settings.image = 'magicMissile';
        var killspot = new me.Vector2d(target.pos.x, target.pos.y);
        settings.killspot = killspot;
        this.shoot(targetVec.x * this.bulletVel, targetVec.y * this.bulletVel, settings);

        return true;
    },
});
