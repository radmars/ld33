
var HitEnter = me.Renderable.extend({
    init: function( x, y ) {
        this.cta = me.loader.getImage("introcta");
        this.parent( new me.Vector2d(x,y), this.cta.width, this.cta.height );
        this.floating = true;
        this.z = 5;
        this.ctaFlicker = 0;
    },
    draw: function(context) {
        this.ctaFlicker++;
        if( this.ctaFlicker > 20 )
        {
            context.drawImage( this.cta, this.pos.x, this.pos.y );
            if( this.ctaFlicker > 40 ) this.ctaFlicker = 0;
        }
    },

    update: function(dt) {
        me.game.repaint();
    }
});

var GameOverScreen = me.ScreenObject.extend({
    init: function() {
        // disable HUD here?
        this.parent( true );
    },

    onResetEvent: function()
    {
        //ending_good //ending_bad
        this.gameover = new me.ImageLayer("gameover", screenWidth, screenHeight, LD33.data.beatGame ? "game_win" : "game_over", 0);

        this.hitenter = new HitEnter( 320, LD33.data.beatGame ? 450 : 450 );
        me.game.world.addChild( this.hitenter );

        me.game.world.addChild( this.gameover );
        me.audio.stopTrack();
        me.audio.playTrack( "ld33-win" );

        this.subscription = me.event.subscribe( me.event.KEYDOWN, function (action, keyCode, edge) {
            if( keyCode === me.input.KEY.ENTER ) {
                me.state.change( me.state.INTRO );
            }
        });
    },

    onDestroyEvent: function() {
        me.audio.stopTrack();
        me.game.world.removeChild( this.gameover );
        me.event.unsubscribe( this.subscription );
    }
});

var TitleScreen = me.ScreenObject.extend({
    init: function() {
        this.parent( true );
    },

    onResetEvent: function() {
        this.bg = new me.ImageLayer( "title", screenWidth, screenHeight, "splash", 1 );

        this.hitenter = new HitEnter( 320, 400 );

        me.game.world.addChild( this.bg );
        me.game.world.addChild( this.hitenter);

        me.audio.stopTrack();
        me.audio.playTrack( "ld33-title", 0.7 );
        me.audio.play("micromancer");

        this.subscription = me.event.subscribe( me.event.KEYDOWN, function (action, keyCode, edge) {
            if( keyCode === me.input.KEY.ENTER ) {
                me.state.change( me.state.PLAY );
            }
        });

        goodEnd = false;
    },

    onDestroyEvent: function() {
        me.game.world.removeChild( this.bg );
        me.game.world.removeChild( this.hitenter );
        me.event.unsubscribe( this.subscription );
        me.audio.stopTrack();
    }
});



var RadmarsScreen = me.ScreenObject.extend({
    onResetEvent: function() {
        this.radmars = new RadmarsRenderable();
        me.game.world.addChild( this.radmars );

        this.subscription = me.event.subscribe( me.event.KEYDOWN, function (action, keyCode, edge) {
            if( keyCode === me.input.KEY.ENTER ) {
                me.state.change( me.state.MENU);
            }
        });

        me.audio.playTrack( "radmarslogo" );
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.audio.stopTrack();
        me.game.world.removeChild( this.radmars );
        me.event.unsubscribe( this.subscription );
    }
});

var RadmarsRenderable = me.Renderable.extend({
    init: function() {
        this.parent( 0, screenHeight, screenWidth );
        this.counter = 0;

        this.floating = true;

        if( !this.title ) {
            this.bg= me.loader.getImage("intro_bg");
            this.glasses1 = me.loader.getImage("intro_glasses1"); // 249 229
            this.glasses2 = me.loader.getImage("intro_glasses2"); // 249 229
            this.glasses3 = me.loader.getImage("intro_glasses3"); // 249 229
            this.glasses4 = me.loader.getImage("intro_glasses4"); // 249 229
            this.text_mars = me.loader.getImage("intro_mars"); // 266 317
            this.text_radmars1 = me.loader.getImage("intro_radmars1"); // 224 317
            this.text_radmars2 = me.loader.getImage("intro_radmars2");
        }

        me.input.bindKey( me.input.KEY.ENTER, "enter", true );
    },

    draw: function(context) {
        context.drawImage( this.bg, 0, 0 );
        if( this.counter < 130) context.drawImage( this.text_mars, 266+80+79, 317+60-20 );
        else if( this.counter < 135) context.drawImage( this.text_radmars2, 224+80+79, 317+60-20 );
        else if( this.counter < 140) context.drawImage( this.text_radmars1, 224+80+79, 317+60-20 );
        else if( this.counter < 145) context.drawImage( this.text_radmars2, 224+80+79, 317+60-20 );
        else if( this.counter < 150) context.drawImage( this.text_radmars1, 224+80+79, 317+60-20 );
        else if( this.counter < 155) context.drawImage( this.text_radmars2, 224+80+79, 317+60-20 );
        else if( this.counter < 160) context.drawImage( this.text_radmars1, 224+80+79, 317+60-20 );
        else if( this.counter < 165) context.drawImage( this.text_radmars2, 224+80+79, 317+60-20 );
        else context.drawImage( this.text_radmars1, 224+80+79, 317+60-20 );

        if( this.counter < 100) context.drawImage( this.glasses1, 249+80+79, 229*(this.counter/100)+60-20 );
        else if( this.counter < 105) context.drawImage( this.glasses2, 249+80+79, 229+60-20 );
        else if( this.counter < 110) context.drawImage( this.glasses3, 249+80+79, 229+60-20 );
        else if( this.counter < 115) context.drawImage( this.glasses4, 249+80+79, 229+60-20 );
        else context.drawImage( this.glasses1, 249+80+79, 229+60-20 );
    },

    update: function( dt ) {
        if ( this.counter < 350 ) {
            this.counter++;
        }
        else{
            me.state.change(me.state.MENU);
        }
        // have to force redraw :(
        me.game.repaint();
    }
});
