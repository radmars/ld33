var screenHeight = 560;
var screenWidth = 960;
var goodEnd = true;

var LD33 = function() {

    /**
     * Start stuff when the page loads.
     */
    this.onload = function() {
        if ( !me.video.init( 'canvas', screenWidth, screenHeight ) ) {
            alert ("Yer browser be not workin");
        }

        this.options = {};

        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            this.options[key] = value;
        }.bind(this));

        // add "#debug" to the URL to enable the debug Panel
        if (this.options.debug) {
            me.plugin.register(debugPanel, "debug");
            me.plugin.debug.show();
        }

        me.pool.register( "player", Player );
        me.pool.register( "baddie", Mage);
        me.pool.register( "musketeer", Musketeer );
        me.pool.register( "mage", Mage );
        me.pool.register( "corpse", Corpse );
        me.pool.register( "grave", Grave );
        me.pool.register( "knight", Knight );
        me.pool.register( "pickup", Pickup );
        me.pool.register( "levelchanger", LevelChanger );
        me.pool.register( "gameender", GameEnder );

        me.input.preventDefault = true;

        me.audio.init ("m4a,ogg" );

        // Sync up post loading stuff.
        me.loader.onload = this.loaded.bind( this );

        me.loader.preload( GameResources );

        me.state.change( me.state.LOADING );

        document.getElementById("canvas").addEventListener('contextmenu', this.rightClickProxy.bind(this), false);


        return;
    };

    this.rightClickProxy = function(e){
        if (e.button === 2) {
            e.preventDefault();
            return false;
        }
    }

    /**
     * Do stuff post-resource-load.
     */
    this.loaded = function() {

        me.state.set( me.state.INTRO, new RadmarsScreen() );
        me.state.set( me.state.MENU, new TitleScreen() );
        me.state.set( me.state.PLAY, new PlayScreen() );
        me.state.set( me.state.GAMEOVER, new GameOverScreen() );

        me.state.change(this.options.skipIntro ? me.state.PLAY : me.state.INTRO);


    };
};

LD33.newBaddie = function(x, y, settings) {
    var classes = {
        'knight': 'Knight',
        'mage': 'Mage',
        'musketeer': 'Musketeer',
    };
    // #ProHacks
    return new window[classes[settings.unitType]](x, y, {
        zombie: settings.zombie,
        player: settings.player,

    });
};

LD33.data = {souls:1, collectedSouls:0, collectedSoulsMax:15, beatGame:false};

LD33.HUD = LD33.HUD || {};

LD33.HUD.Container = me.ObjectContainer.extend({
    init: function() {
        // call the constructor
        this.parent();

        this.isPersistent = false;
        this.collidable = false;

        this.boxDisplay = new LD33.HUD.BoxDisplay();

        // make sure our object is always draw first
        this.z = Infinity;
        this.name = "HUD";
    },

    startGame:function(){
        console.log("HUD start game");
        me.game.world.removeChild(this);
        this.removeChild(this.boxDisplay);
        this.boxDisplay.startGame();
        me.game.world.addChild(this);
        this.addChild(this.boxDisplay);
        me.game.world.sort(true);
    },

    endGame: function(){
        console.log("HUD end game");
        this.boxDisplay.endGame();
    }
});

LD33.HUD.BoxDisplay = me.Renderable.extend( {

    init: function() {

        // call the parent constructor
        // (size does not matter here)
        this.parent(new me.Vector2d(0, 0), 0, 0);
        this.alwaysUpdate = true;

        // create a font
        this.font = new me.BitmapFont("32x32_font", 32);
        //this.font.set("right");

        this.box = me.loader.getImage("selectBox");
        this.hpBacking = me.loader.getImage("hp_bar_backing");
        this.hpAlly = me.loader.getImage("hp_bar_ally");
        this.hpBaddie = me.loader.getImage("hp_bar_baddie");
        this.unitSelected = me.loader.getImage("unit_selected");
        this.moveTarget = me.loader.getImage("move_target");

        this.render = false;

        // make sure we use screen coordinates
        this.floating = true;

        this.moveTargetTimer = 0;
        this.moveTargetSin = 0;

        this.mouseLeftDown = false;
        this.mouseDownPos = new me.Vector2d(0, 0);
        this.moveTargetPos = new me.Vector2d(0, 0);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.O, "proxy_mouse_left");
        me.input.bindPointer(me.input.KEY.O);
        me.input.bindPointer(me.input.mouse.LEFT, me.input.KEY.O);

       // me.input.bindKey(me.input.KEY.P, "proxy_mouse_right");
       // me.input.bindPointer(me.input.KEY.P);
       // me.input.bindPointer(me.input.mouse.RIGHT, me.input.KEY.P);

        this.rightClickAdded = false;
    },

    startGame: function(){
        this.render = true;

        if( !this.rightClickAdded  ){
            console.log("[LD33.HUD.BoxDisplay](startGame) adding HUD rightclick proxy");
            this.rightClickAdded = true;
            document.getElementById("canvas").addEventListener('contextmenu', this.rightClick.bind(this), false);
        }

        /*
        var self = this
        new me.Tween(self.findGatePos).to({x:100}, 500).easing(me.Tween.Easing.Quintic.Out).delay(1000).onComplete(function(){
            new me.Tween(self.findGatePos).to({x:1000}, 1000).easing(me.Tween.Easing.Quintic.In).delay(2000).onComplete(function(){
                self.showFindGate = false;
            }).start();
        }).start();
        */
    },

    endGame: function(){
        this.render = false;
        if( this.rightClickAdded  ){
            console.log("[LD33.HUD.BoxDisplay](endGame) removing HUD rightclick proxy");
            this.rightClickAdded = false;
            document.getElementById("canvas").removeEventListener('contextmenu', this.rightClick.bind(this), false);
        }
    },

    rightClick: function(e){
        if (e.button === 2) {
            if(this.render){
                //console.log("right click");
                //me.input.mouse.pos.x - this.mouseDownPos.x, me.input.mouse.pos.y - this.mouseDownPos.y

                //console.log( "viewport " + me.game.viewport.pos.x +" , " + me.game.viewport.pos.y );

                var selected = 0;
                var x = me.input.mouse.pos.x + me.game.viewport.pos.x;
                var y = me.input.mouse.pos.y + me.game.viewport.pos.y;

                this.moveTargetPos.x = me.input.mouse.pos.x;
                this.moveTargetPos.y = me.input.mouse.pos.y;
                this.moveTargetSin = 0;
                this.moveTargetTimer = 2.0;

                me.state.current().playerArmy.forEach(function(target) {
                    if(target.selected){
                        target.moveToPos(x,y);
                        selected++;
                    }

                }.bind(this));


                if(selected == 0){
                   // me.state.current().player.moveToPos(x,y);
                }
            }
        }
    },

    update : function () {
        if(!this.render) return;

        if(this.moveTargetTimer > 0){
            this.moveTargetTimer -= 0.03;
            this.moveTargetSin += 0.1;
            if(this.moveTargetSin >= Math.PI*2){
                this.moveTargetSin -= Math.PI*2;
            }
        }

        if (me.input.isKeyPressed('proxy_mouse_left'))  {
            if( !this.mouseLeftDown ){
                this.mouseLeftDown = true;
                this.mouseDownPos.x = me.input.mouse.pos.x;
                this.mouseDownPos.y = me.input.mouse.pos.y;
            }

        }else{
            if( this.mouseLeftDown ){
                this.mouseLeftDown = false;

                //start of box
                var sx = this.mouseDownPos.x;
                var sy = this.mouseDownPos.y;

                // width and height
                var w = me.input.mouse.pos.x - this.mouseDownPos.x;
                var h = me.input.mouse.pos.y - this.mouseDownPos.y;

                //make inverse work
                if( w < 0){
                    sx += w;
                    w = Math.abs(w);
                }
                if( h < 0){
                    sy += h;
                    h = Math.abs(h);
                }

                //this is a hack to make a 'tiny box' for single click targeting.
                if( w <= 4){ w = 16; sx-=8; };
                if( h <= 4 ){ h = 16; sy-=8; };

                //console.log("box! " + sx + " , " + sy + " / " + w + ", " + h);

                me.state.current().playerArmy.forEach(function(target) {
                    //box select
                    var x = target.pos.x - me.game.viewport.pos.x + 16;
                    var y = target.pos.y - me.game.viewport.pos.y + 16;

                    if( x > sx && x < sx + w && y > sy && y < sy + h ){
                        if(target.player != true){
                            target.selected = true;
                        }
                    }else{
                        target.selected = false;
                    }

                }.bind(this));
            }
        }

        return true;
    },

    draw : function (context) {
        if(!this.render)return;

        //void ctx.drawImage(image, dx, dy, dWidth, dHeight);
        // this.pos.x +
        // this.pos.y +

        // this.mouseDownPos.x = me.input.mouse.pos.x;
        // this.mouseDownPos.y = me.input.mouse.pos.y;

       // this.font.draw (context, this.souls, this.pos.x + 50, this.pos.y + 30);

        if(this.moveTargetTimer > 0){
          //  context.drawImage( this.moveTarget, this.moveTargetPos.x - 16, this.moveTargetPos.y - 16 - Math.sin(this.moveTargetSin) * 8 );
        }




        me.state.current().baddies.forEach(function(target) {
            var x = target.pos.x - me.game.viewport.pos.x;
            var y = target.pos.y - me.game.viewport.pos.y- 5;
            if(target.hp < target.maxHP){
                context.drawImage( this.hpBacking, x, y );
                if(target.hp  > 0) context.drawImage( this.hpBaddie, x, y, 32 * (target.hp / target.maxHP), 4 );
            }
        }.bind(this));

        me.state.current().playerArmy.forEach(function(target) {
            var x = target.pos.x - me.game.viewport.pos.x;
            var y = target.pos.y - me.game.viewport.pos.y- 5;
            if(target.hp < target.maxHP){
                context.drawImage( this.hpBacking, x, y );
                if(target.hp  > 0)  context.drawImage( this.hpAlly, x, y, 32 * (target.hp / target.maxHP), 4 );
            }

            if(target.selected){
                context.drawImage( this.unitSelected, x, y+5 );
            }

        }.bind(this));

        if(this.mouseLeftDown){
            //this.mousePosLocal  = me.input.globalToLocal(me.input.mouse.pos.x, me.input.mouse.pos.y );



            //start of box
            var sx = this.mouseDownPos.x;
            var sy = this.mouseDownPos.y;

            // width and height
            var w = me.input.mouse.pos.x - this.mouseDownPos.x;
            var h = me.input.mouse.pos.y - this.mouseDownPos.y;

            //make inverse work
            if( w < 0){
                sx += w;
                w = Math.abs(w);
            }
            if( h < 0){
                sy += h;
                h = Math.abs(h);
            }

            //console.log( "mouse! " + (me.input.mouse.pos.x + me.game.viewport.pos.x)  + " , " +  (me.input.mouse.pos.y + me.game.viewport.pos.y) + " / player: " + player.pos.x + " , " + player.pos.y );
            //console.log( "mouse! " +  me.input.mouse.pos.x  + " , " +  me.input.mouse.pos.y );
            //var player = me.state.current().player;

            context.drawImage( this.box, sx, sy, w, h );
        }

    }
});


var LevelChanger = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.toLevel = settings.toLevel;
        this.parent( x, y, {
            image: "gateway",
            spritewidth: 200,
            spriteheight: 200,
            width: settings.width,
            height: settings.height,
        });

        this.gravity = 0;
        this.collidable = true;
    },

    opened: function() {
        return me.state.current().baddies.length == 0;
    },

    onCollision: function(dir, obj) {
        if(obj.player && this.opened()) {
            me.state.current().goToLevel(this.toLevel);
        }
    },
});

var GameEnder = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // TODO: Just bake image or attach to obj?
        settings.image = settings.image || 'pickup';
        settings.spritewidth =  69;
        settings.spriteheight = 117;
        this.toLevel = settings.toLevel;
        this.parent( x, y, settings );
        this.gravity = 0;
        this.collidable = true;
        this.flipX(true);
    },
    update: function(dt) {
        // TODO: Just bake image or attach to obj?
        this.parent(dt);
        this.updateMovement();

        me.game.world.collide(this, true).forEach(function(col) {
            if(col && col.obj == me.state.current().player  ) {
                LD33.data.collectedSouls += LD33.data.souls;
                LD33.data.souls = 0;
                me.state.current().endGame();
            }
        }, this);
    }
});

/** The game play state... */
var PlayScreen = me.ScreenObject.extend({
    init: function() {
        this.parent( true );
        me.input.bindKey(me.input.KEY.SPACE, "shoot");
        this.playerArmy = [];
        this.baddies = [];
        this.pickups = [];
        this.subscription = me.event.subscribe(me.event.KEYDOWN, this.keyDown.bind(this));

        this.HUD = new LD33.HUD.Container( );
        LD33.data.beatGame = false;

    },

    endGame: function(){
        LD33.data.beatGame = true;
        me.state.change( me.state.GAMEOVER );
    },

    goToLevel: function( level ) {
        var self = this;
        this.baddies = [];
        this.playerArmy = [];
        me.game.reset();
        me.game.onLevelLoaded = function(l) {
            self.HUD.startGame();
            me.game.viewport.fadeOut( '#000000', 1000, function() { 
            });
        };
        me.levelDirector.loadLevel( level );
    },

    keyDown: function( action ) {
        if(action == "shoot") {
            this.player.shoot();
        }
    },

    getLevel: function() {
        return this.parseLevel( me.levelDirector.getCurrentLevelId() );
    },

    parseLevel: function( input ) {
        var re = /level(\d+)/;
        var results = re.exec( input );
        return results[1];
    },

    reloadLevel: function() {
        this.baddies = [];
        this.pickups = [];
        me.levelDirector.loadLevel( me.levelDirector.getCurrentLevelId() );
    },

    // this will be called on state change -> this
    onResetEvent: function(newLevel) {
        var self = this;
        LD33.data.beatGame = false;
        var level =  newLevel || location.hash.substr(1) || "level1" ;
        this.goToLevel(level);
        me.audio.stopTrack();
        me.audio.play( "ld30-real", true );
        me.audio.play( "ld30-spirit", true );
        me.audio.play( "portalrev" );

    },

    onDestroyEvent: function() {
        this.HUD.endGame();
        me.audio.stop("ld30-real");
        me.audio.stop("ld30-spirit");
    },
});


window.onReady(function() {
    window.app = new LD33();
    window.app.onload();
});
