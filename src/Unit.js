var Unit = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        function fatal(str) { throw str; }
        this.parent( x, y, settings );
        this.curTarget = null;

        // some defautls. pick better ones please.
        this.findTargetTimerMax = settings.findTargetTimerMax || 100;
        this.giveUpDist         = settings.giveUpDistance || 225;
        this.maxHP              = settings.maxHP || fatal("Must specifiy maxHP");
        this.hp                 = settings.hp || this.maxHP;
        this.maxTargetingDist   = settings.maxTargettingDistance || 150;
        this.attackRange        = settings.attackRange || settings.spritewidth;
        this.targetAccel        = settings.targetAccel || 0.15;
        this.attackCooldownMax  = settings.attackCooldownMax || 30;
        this.attackCooldown     = 0;
        this.findTargetTimer    = 40;
        this.dead = false;
    },

    damage: function(dmg) {
        this.hp -= dmg;
        if(this.hp <= 0) {
            this.dead = true;
            this.die();
            var corpse = new Corpse(this.pos.x, this.pos.y);
            me.game.world.addChild(corpse);
            me.game.world.removeChild(this);
        }
    },

    fixDirection: function() {
        this.flipX(this.vel.x < 0 );
    },

    recheckTarget: function(dt) {
        this.findTargetTimer--;
        if (this.findTargetTimer <= 0) {
            this.curTarget = radmars.findTarget(this.pos, this.getTargetList(), this.maxTargetingDist);
            this.findTargetTimer = this.findTargetTimerMax;
        }
    },

    getTargetList: function() {
        throw "You need to overload this function!";
    },

    attack: function(other) {
        throw "You need to overload this function!";
    },

    die: function() {
        throw "So sad!";
    },

    moveTowardTargetAndAttack: function(dt) {
        if (this.attackCooldown >= 0) {
            this.attackCooldown -= dt;
        }

        if (this.curTarget) {
            var distVec = new me.Vector2d(this.curTarget.pos.x, this.curTarget.pos.y);
            distVec.sub(this.pos);
            var distance = distVec.length();

            // give up if too far away
            if (distance > this.giveUpDist) {
                this.curTarget = null;
                return;
            }

            if (distance < this.attackRange) {
                this.tryAttack(this.curTarget);
            }

            distVec.normalize();
            this.vel.x += distVec.x * this.targetAccel;
            this.vel.y += distVec.y * this.targetAccel;
        }
    },

    tryAttack: function(target) {
        if (this.attackCooldown <= 0) {
            var success = this.attack(target);
            // only reset cooldown if we actually attacked
            if (success) {
                this.attackCooldown = this.attackCooldownMax;
            }
        }
    },
});


