var Unit = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {}
        this.unitType = radmars.assert(settings.unitType, 'Must specify a unitType');
        this.zombie = settings.zombie || false;
        this.baddie = !this.zombie;
        this.player = settings.player;

        console.log("new unit! " + this.unitType + (this.zombie ? '_zombie' : '') );

        this.parent( x, y, {
            image: this.unitType + (this.zombie ? '_zombie' : ''),
            spritewidth: settings.spritewidth,
            spriteheight: settings.spriteheight,
            width: settings.width || 32,
            height: settings.height || 32,
        });

        settings.maxTargetingDist = 150;
        settings.giveUpDist = 225;
        settings.findTargetTimerMax = 100;

        settings.attackCooldownMax = 500;
        settings.attackRange = 32 + 16;

        //settings.maxHP = 5;

        this.alwaysUpdate       = false;
        // some defautls. pick better ones please.
        this.setAttackRange(42);
        this.attackCooldown     = 0;
        this.attackDamage       = 1;

        this.attackCooldownMax  = settings.attackCooldownMax || 750;
        this.attackRange        = settings.attackRange || settings.spritewidth;

        this.clumpDist          = 32;
        this.collidable         = true;
        this.curTarget          = null;
        this.dead               = false;
        this.direction          = 1;
        this.findTargetTimer    = 40;
        this.findTargetTimerMax = settings.findTargetTimerMax || 100;
        this.giveUpDist         = settings.giveUpDistance || 225;
        this.gravity = 0;
        this.maxHP              = radmars.assert(settings.maxHP, "Must specifiy maxHP");
        this.hp                 = this.maxHP;
        this.maxTargetingDist   = settings.maxTargettingDistance || 150;
        this.moveTo             = new me.Vector2d(0,0);
        this.moveToTargetPos    = false;
        this.moveToPlayerPos    = false;
        this.speed              = 4;
        this.targetAccel        = settings.targetAccel || 0.15;
        this.z = 300;
        this.agro               = true;

        if(this.zombie){
            this.maxHP = this.hp = this.maxHP-2;
            if(this.maxHP < 2){
                this.hp = this.maxHP = 2;
            }
            console.log("new zombie! " + this.hp);
        }

        this.followDist         = 32 + Math.round( Math.random() * 32 );

        this.renderable.addAnimation( "attacking", [ 0 ] );
        this.renderable.addAnimation( "idle", [ 0 ] );
        this.renderable.addAnimation( "walk", [ 0 ] );
        this.renderable.animationspeed = 70;
        this.setFriction( 2, 2 );
        this.setVelocity( this.speed , this.speed  );

        // Hacks...
        if(this.baddie) {
            me.state.current().baddies.push(this);
        }
        else {
            this.moveToPlayerPos = true;
            me.state.current().playerArmy.push(this);
        }

        if (this.unitType === "skeleton") {
            me.audio.play("skeletonraise");
        }
        else if (this.zombie) {
            me.audio.play("zombieraise" + GetRandomIndexString(5));
        }
    },

    damage: function(dmg) {
        //console.log("damage! " + dmg + " / hp " + this.hp  +" / " + this.maxHP);

        this.hp -= dmg;

        me.audio.play("hit" + GetRandomIndexString(3));

        if(this.hp <= 0 && !this.dead) {
            this.dead = true;

            this.playDeathSound();

            if(this.zombie) {
                me.state.current().playerArmy.remove(this);
            }
            else {
                me.state.current().baddies.remove(this);
            }
            var unitType = this.unitType;

            if(this.unitType == "skeleton"){
                me.game.world.removeChild(this);
                return;
            }
            if(this.zombie || this.unitType == "civilian"){
                unitType = "skeleton";
            }
            var corpse = new Corpse(this.pos.x, this.pos.y, {unitType:unitType});
            me.game.world.addChild(corpse);
            me.game.world.removeChild(this);
        }
    },

    playDeathSound: function() {
        // play appropriate sound
        var deathSound = "";

        if (this.unitType === "skeleton") {
            deathSound = "skeletondeath";
        }
        else if (this.zombie) {
            deathSound = "zombiedeath" + GetRandomIndexString(6);
        }
        else if (this.unitType === "knight") {
            deathSound = "knightdeath" + GetRandomIndexString(4);
        }
        else if (this.unitType === "musketeer") {
            deathSound = "musketeerdeath" + GetRandomIndexString(4);
        }
        else if (this.unitType === "mage") {
            deathSound = "magedeath" + GetRandomIndexString(5);
        }
        else if (this.unitType === "civilian") {
            if (this.civType === "civilian_1") {
                deathSound = "musketeerdeath" + GetRandomIndexString(4);
            }
            else if (this.civType === "civilian_2") {
                deathSound = "magedeath" + GetRandomIndexString(5);
            }
            else if (this.civType === "civilian_3") {
                deathSound = "knightdeath" + GetRandomIndexString(4);
            }
        }

        if (deathSound !== "") {
            me.audio.play(deathSound);
        }
    },

    playerSummon:function(){
        //console.log("summoned! ");
        this.moveToPlayerPos = true;
        this.moveToTargetPos = false;
        this.curTarget = null;
        this.findTargetTimer = this.findTargetTimerMax;
    },

    moveToPos: function (x,y){
        this.moveToPlayerPos = false;
        this.moveToTargetPos = true;
        this.moveTo.x = x;
        this.moveTo.y = y;
        this.curTarget = null;
        this.findTargetTimer = this.findTargetTimerMax;
    },

    moveToPlayer: function(dt) {
        if(!this.moveToPlayerPos && !this.moveToTargetPos ){
            return;
        }

        var toTarget = new me.Vector2d( this.player.followPos.x, this.player.followPos.y );
        if(this.moveToTargetPos){
            toTarget.x = this.moveTo.x;
            toTarget.y = this.moveTo.y;
        }
        toTarget.sub(this.pos);

        if(toTarget.length() <= this.followDist){
            this.vel.x = this.vel.y = 0;
            this.moveToTargetPos = false;
            this.moveToPlayerPos = false;
            this.findTargetTimer = 0;
        } else {
            toTarget.normalize();
            this.vel.x = toTarget.x * this.speed;
            this.vel.y = toTarget.y * this.speed;
        }
    },

    moveTowardTargetAndAttack: function(dt) {


        if (this.attackCooldown >= 0) {
            this.attackCooldown -= dt;
        }

        if (this.curTarget && this.attackCooldown <= 0) {
            if(this.curTarget.hp <= 0 || this.curTarget.dead){
                this.curTarget = null;
                return;
            }

            var toTarget = new me.Vector2d( this.curTarget.pos.x, this.curTarget.pos.y );
            toTarget.sub(this.pos);

            var dist = toTarget.length();

            if (dist > this.giveUpDist) {
                this.curTarget = null;
                return;
            }

            if (dist < this.attackRange) {
                this.tryAttack(this.curTarget);
            }

            if( dist < this.attackRange-1 ){
                this.vel.x = this.vel.y = 0;
            } else {
                toTarget.normalize();

                if(!this.agro){
                    this.vel.x = toTarget.x * this.speed * -1;
                    this.vel.y = toTarget.y * this.speed * -1;
                }else{
                    this.vel.x = toTarget.x * this.speed;
                    this.vel.y = toTarget.y * this.speed;
                }

            }
        }
    },

    tryAttack: function(target) {
        if(!this.agro){
            return;
        }
        if (this.attackCooldown <= 0) {
            var success = this.attack(target);
            // only reset cooldown if we actually attacked
            if (success) {
                this.attackCooldown = this.attackCooldownMax;
            }
        }
    },

    update: function(dt) {
        this.recheckTarget(dt);
        if(this.curTarget) {
            this.moveTowardTargetAndAttack(dt);
        }
        else if(this.zombie) {
            this.moveToPlayer(dt);
        }

        this.fixDirection();


        this.checkUnitCollision( me.state.current().playerArmy);
        this.checkUnitCollision( me.state.current().baddies );

        /* //fixed checkUnitCollision to not need the flag
        if(this.baddie){
            this.checkUnitCollision( me.state.current().playerArmy, true );
            this.checkUnitCollision( me.state.current().baddies, false );
        }
        else {
            this.checkUnitCollision( me.state.current().playerArmy, false );
            this.checkUnitCollision( me.state.current().baddies, true );
        }
        */

        this.parent(dt);
        this.updateMovement();

        this.checkBulletCollision();
        return true;
    },

    checkBulletCollision: function(){
        me.game.world.collide(this, true);
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
        if(this.zombie) {
            return me.state.current().baddies;
        }
        else {
            return me.state.current().playerArmy;
        }
    },

    attack: function(other) {
        throw "You need to overload this function!";
    },

    checkUnitCollision: function( array ){
        // me.state.current().playerArmy

        for( var i=0; i<array.length; i++){
            var target = array[i];

            if(target != this){
                var targetToMe = new me.Vector2d( this.pos.x, this.pos.y );
                targetToMe.sub(target.pos);

                var distToTarget = targetToMe.length();

                if(distToTarget < this.clumpDist*2.0){
                    var dp = 1 - ( distToTarget / (this.clumpDist*2.0) );
                    //square that shit.
                    dp = dp * dp;

                    targetToMe.normalize();
                    //this just makes it so it really moves em on that one update.
                    targetToMe.x *= this.speed * 1.0;
                    targetToMe.y *= this.speed * 1.0;

                    this.vel.x += targetToMe.x * dp;
                    this.vel.y += targetToMe.y * dp;
                }
            }
        }

        if(this.vel.length() > this.speed){
            this.vel.normalize();
            this.vel.x *= this.speed;
            this.vel.y *= this.speed;
        }

    },

    /*
    checkUnitCollision: function( array ){
        // me.state.current().playerArmy

        var stuck = false;

        var movingToTarget = false;
        var currentMoveTarget = new me.Vector2d( 0,0 );
        var meToMyTarget = new me.Vector2d( 0,0 );
       // var targetAngle =0;
        var targetToMyTarget  = new me.Vector2d( 0,0 );
        var distToMyTarget = 0;

        if( this.curTarget != null){
            // i have an attack target
            currentMoveTarget.x = this.curTarget.x;
            currentMoveTarget.y = this.curTarget.y;
            movingToTarget = true;

        }else if ( this.moveToTargetPos  ){
            // im trying to move to a location
            currentMoveTarget.x = this.moveTo.x;
            currentMoveTarget.y = this.moveTo.y;
            movingToTarget = true;

        }else if(this.moveToPlayerPos){
            currentMoveTarget.x = this.player.pos.x;
            currentMoveTarget.y = this.player.pos.y;
            movingToTarget = true;
            //not doing anything or moving to player as zombie?
        }

        if(movingToTarget){
            meToMyTarget.x = currentMoveTarget.x;
            meToMyTarget.y = currentMoveTarget.y;
            meToMyTarget.sub(this.pos);
            distToMyTarget = meToMyTarget.length();
            meToMyTarget.normalize();

            //targetAngle = Math.atan2(toMoveTarget.y, toMoveTarget.x);
        }

        for( var i=0; i<array.length; i++){
            var target = array[i];

            if(target != this){
                var targetToMe = new me.Vector2d( this.pos.x, this.pos.y );
                targetToMe.sub(target.pos);

                var distToTarget = targetToMe.length();

                if(distToTarget < this.clumpDist*1.0){
                    var dp = 1 - ( distToTarget / (this.clumpDist*1.0) );
                    //square that shit.
                    dp = dp * dp;

                    targetToMe.normalize();
                    //this just makes it so it really moves em on that one update.
                    targetToMe.x *= this.speed * 1.0;
                    targetToMe.y *= this.speed * 1.0;

                    if(this.baddie != target.baddie){
                        this.vel.x += targetToMe.x * dp * 0.5;
                        this.vel.y += targetToMe.y * dp * 0.5;

                    }else if( movingToTarget ){
                        targetToMyTarget.x = currentMoveTarget.x;
                        targetToMyTarget.y = currentMoveTarget.y;
                        targetToMyTarget.sub(target.pos);

                        if( targetToMyTarget.length() > distToMyTarget ){
                            //im in front.
                            //dont do anything?
                            this.vel.x += targetToMe.x * dp;
                            this.vel.y += targetToMe.y * dp;
                            //this.vel.x = targetToMe.x;
                            //this.vel.y = targetToMe.y;
                        }
                        else{
                            //im behind him. try to move around him.
                            this.vel.x += targetToMe.y * dp;
                            this.vel.y += -targetToMe.x * dp;
                            //this.vel.x = targetToMe.y;
                            //this.vel.y = -targetToMe.x;
                        }

                    }else{
                        //im not doing anything, just move away from it.
                        this.vel.x += targetToMe.x;
                        this.vel.y += targetToMe.y;
                        //this.vel.x = targetToMe.x;
                        //this.vel.y = targetToMe.y;
                    }
                }
            }
        }

        if(this.vel.length() > this.speed){
            this.vel.normalize();
            this.vel.x *= this.speed;
            this.vel.y *= this.speed;
        }

    },
    */
    setAttackRange: function(r) {
        this.attackRange = r;
    },

    getAttackRange: function() {
        return this.attackRange;
    }
});


