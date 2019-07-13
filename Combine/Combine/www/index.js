var wg = window.innerWidth;
var hg = window.innerHeight;
var dpr = window.devicePixelRatio;

var game = new Phaser.Game(wg, hg, Phaser.CANVAS, "game", false, false);//opacityBG, anti-alias

//JS receives Android
var hasFocus = null;
var hasInternet = null;
var isPaused = false;
var rewardsNum = 0;//teste




//calcs
var gapSizes, rectSize, marginSpace, gridPos = 0;

//colors
var BGcolors = ["f6f6f6", "333333"];
var FGcolors = ["333333", "f6f6f6"];
var darkColor = ["F62459", "2F6C66", "054F77", "674172", "7C0404"];
var lightColor = ["D0FF00", "90EEEE", "FFB6C1", "87D37C", "E6A56D"];
var paintBmp, rndFGColor = null;
var auxLight = 0, chooseColorBG = 0, auxDark = 0;
var numColor = parseInt(localStorage.getItem("bgCombine") || 0);

//sound
var numSound = 0, bgSound = 0, fxSound = 0, soundFXTaps = 0;

//game screen
var isGame = false;
var hiScore = parseInt(localStorage.getItem("hiScoreCombine") || 0);//salvar local storage
var hiScoreTxt = String(hiScore);
var score = 0;
var counterContinue = 0;//numero de continues usados na rodada

//itens
var bgRectL, bgRectR, bgTxture = null;
var leftHandGame, itemBaseLeftHandGame, rightHandGame, itemBaseRightHandGame = null;
var itemBaseGame, itemFallGameGroup, itensEffects = null;
var scoreTxtGame, hiScoreTxtGame, crownGame = null;

var level = 0;//nivel (< 2 (0), 3 ~ 15 (1), 16 ~ 45 (2), 46 ~ 80 (3), 81 ~ 120 (4), 121 ~ 200 (5), > 200 (6))
//var fpsAux = (game.time.fps < 30) ? 2 : 1;
var velItem = 100;// * fpsAux;//velocidade (100(0), 250(1), 350(2), 450(3), 500(4), 600(5), 700(6))
var currentItemBase = 1;//index do item da base
var currentItemFall = 0;//index do item que cai
var firstItem = 0;//index 1 item
var levelItem = 2;//index do item max por level || (2(0), 5(1), 8(2), 11(3), 14(5), 17(5), 19(6))//level range
var lastItem = 19;//index do ultimo item

var auxScoreTimer = 0, auxLevelTimerToScore = 0;//tempo pra marcar ponto//valor por level de tempo pra marcar ponto

var modalBox, modalTxtGame, modalBtnReward, modalBtnCancel = null;


//foco?
function isFocused (focus) {
    hasFocus = focus;

    if (hasFocus === "play") {
        isPaused = false;
    } else if (hasFocus === "pause"){
        isPaused = true;
    }

    if (navigator.userAgent.match(/Android/i)) {//is focus android
        Android.focus(hasFocus);

    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {//is focus ios
        window.location = "focus://fcs?"+hasFocus;
    }
}

//online?
function isOnLine (online) {
    hasInternet = online;

    if (hasInternet === "online") {
        $('#mask').css("display", "none");
        $('#inter').css("display", "none");

    } else if (hasInternet === "offline") {
    }
}

//video recompença
function rewarded (adsrew) {
    rewardsNum = parseInt(adsrew);

    if (navigator.userAgent.match(/Android/i)) {//android
        window.location = "reward://";
        Android.reward(rewardsNum);

    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {//ios
        window.location = "reward://rew?"+rewardsNum;
    }
}


//boot screen
var boot_state = {
    init: function () {
        'use strict';
        game.physics.startSystem(Phaser.Physics.ARCADE);//fisica
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;//resize
        game.stage.disableVisibilityChange = false;//no focus
        game.input.touch.preventDefault = true;//duplo click//false-base
        game.time.advancedTiming = true;//fps
        game.canvas.id = 'myCanvas';//id
        game.input.maxPointers = 1;//toques

        //start BG sound
        if (game.device.desktop) {
        } else if (game.device.android) {
            Android.snd(numSound);
        } else if (game.device.iOS) {
            window.location = "bgsound://bgsnd?"+numSound;
        } else {
        }
    },

    //precarrega os assets do jogo
    preload: function () {
        'use strict';
        //game.load.script('WebFont', 'lib/webfont.js');
        game.load.image('logo', 'img/logo.png');
        game.load.spritesheet('icons', 'img/img-btn.png', 100, 100, 21);
        game.load.spritesheet('itens', 'img/itens-game.png', 100, 100, 24);
    },

    //cria os itens bases do jogo
    create: function () {
        'use strict';
        //calcs
        gapSizes = (wg < 500) ? 6 : 8;
        rectSize =  Math.round(wg / gapSizes);
        marginSpace =  Math.round(rectSize / gapSizes);
        gridPos =  Math.round(marginSpace + rectSize/2);

        if (numColor > 1) {
            chooseColorBG = game.rnd.integerInRange(0, 1);

            if (chooseColorBG === 0) {
                if (auxLight === 0) {
                    auxLight = game.rnd.integerInRange(0, lightColor.length - 1);
                }
                if (auxDark === 0) {
                    auxDark = game.rnd.integerInRange(0, darkColor.length - 1);
                }
            } else {
                if (auxLight === 0) {
                    auxLight = game.rnd.integerInRange(0, lightColor.length - 1);
                }
                if (auxDark === 0) {
                    auxDark = game.rnd.integerInRange(0, darkColor.length - 1);
                }
            }
        }

        game.state.start('inMenu');
    }
};


//menu screen
var menu_state = {

    init: function () {
        'use strict';
    },

    //precarrega os assets do jogo
    preload: function () {
        'use strict';
    },

    //cria os itens bases do jogo
    create: function () {
        'use strict';


        //logo
        var logoMenu = game.add.sprite(game.world.centerX, game.world.height * 0.2, 'logo');
        logoMenu.width = rectSize * 3.5;
        logoMenu.height = rectSize * 1.5;
        logoMenu.anchor.set(0.5);


        //coroa
        var crownMenu = game.add.sprite(game.world.centerX, game.world.height * 0.4, 'icons', 10);
        crownMenu.width = crownMenu.height = rectSize * 1.5;
        crownMenu.anchor.set(0.5);
        crownMenu.tint = '0xdaa520';


        //texto hiScore
        var hiScoreTxtMenu = game.add.text(game.world.centerX, game.world.centerY, hiScore, { font: rectSize + "px SirinStencil-Regular", fill: "#fff", align: "center" });
        hiScoreTxtMenu.anchor.set(0.5);


        //play
        var playBtnMenu = game.add.button(game.world.width * 0.7, game.world.height * 0.7, 'icons', function () {
            //game.state.start('inGame');
            game.state.start('inGame', Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);

            logoMenu.kill();
            hiScoreTxtMenu.kill();
            playBtnMenu.kill();
            configBtnMenu.kill();

            //envia hiscore
            if (game.device.desktop) {
            } else if (game.device.android) {
                //var openLeaderboard = "sendrank://";
                //window.location = openLeaderboard;
                Android.hiscr(hiScore);

            } else if (game.device.iOS) {
                //game.time.events.add(Phaser.Timer.SECOND * 2, function () {
                    window.location = "score://scrr?"+hiScore;
                //});
            } else {
            }

        }, this, 1, 1, 1);
        playBtnMenu.width = playBtnMenu.height = rectSize * 1.5;
        playBtnMenu.anchor.set(0.5);


        //configuração
        var configBtnMenu = game.add.button(game.world.width * 0.3, game.world.height * 0.7, 'icons', function () {
            //game.state.start('inConfig');
            game.state.start('inConfig', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);

            logoMenu.kill();
            hiScoreTxtMenu.kill();
            playBtnMenu.kill();
            configBtnMenu.kill();

        }, this, 0, 0, 0);
        configBtnMenu.width = configBtnMenu.height = rectSize;
        configBtnMenu.anchor.set(0.5);


        //ajuste cores
        if (numColor > 1) {
            if (chooseColorBG === 0) {

                game.stage.backgroundColor = '#'+lightColor[auxLight];

                logoMenu.tint = '0x'+darkColor[auxDark];
                hiScoreTxtMenu.tint = '0x'+darkColor[auxDark];
                playBtnMenu.tint = '0x'+darkColor[auxDark];
                configBtnMenu.tint = '0x'+darkColor[auxDark];

            } else {
                game.stage.backgroundColor = '#'+darkColor[auxDark];

                logoMenu.tint = '0x'+lightColor[auxLight];
                hiScoreTxtMenu.tint = '0x'+lightColor[auxLight];
                playBtnMenu.tint = '0x'+lightColor[auxLight];
                configBtnMenu.tint = '0x'+lightColor[auxLight];
            }

        } else {
            game.stage.backgroundColor = '#'+BGcolors[numColor];

            logoMenu.tint = '0x'+FGcolors[numColor];
            hiScoreTxtMenu.tint = '0x'+FGcolors[numColor];
            playBtnMenu.tint = '0x'+FGcolors[numColor];
            configBtnMenu.tint = '0x'+FGcolors[numColor];
        }

    },

    update: function () {
        'use strict';
    },

    render: function () {
        'use strict';
        //game.debug.text("FPS: " + game.time.fps || '--', 10, 14, "#0f0");
        //game.debug.text("foco: " + hasFocus + " ,online: " + hasInternet + " ,recompença: " + rewardsNum, 10, 40, "#0f0");

    }
};


//config screen
var config_state = {

    init: function () {
        'use strict';
    },

    //precarrega os assets do jogo
    preload: function () {
        'use strict';
    },


    //cria os itens bases do jogo
    create: function () {
        'use strict';

        //texto settings
        var settingsTxtConfig = game.add.text(game.world.centerX, game.world.height * 0.1, "Settings", { font: gridPos + "px SirinStencil-Regular", fill: "#fff", align: "center" });
        settingsTxtConfig.anchor.set(0.5);
        settingsTxtConfig.tint = '0x'+FGcolors[numColor];


        //musica
        var musicBtnConfig = game.add.button(game.world.width * 0.25, game.world.height * 0.3, 'icons', function () {
            bgSound += 2;
            if (bgSound > 2) {
                bgSound = 0;
            }

            numSound = bgSound + fxSound;
            if (numSound === 0 || numSound === 1) {
                musicBtnConfig.setFrames(2, 2, 2);
            } else {
                musicBtnConfig.setFrames(3, 3, 3);
            }

            //start BG sound
            if (game.device.desktop) {
            } else if (game.device.android) {
                Android.snd(numSound);
            } else if (game.device.iOS) {
                window.location = "bgsound://bgsnd?"+numSound;
            } else {
            }

        }, this, 2, 2, 2);
        musicBtnConfig.width = musicBtnConfig.height = rectSize;
        musicBtnConfig.anchor.set(0.5);


        //efeitos
        var sfxBtnConfig = game.add.button(game.world.width * 0.5, game.world.height * 0.3, 'icons', function () {
            fxSound += 1;
            if (fxSound > 1) {
                fxSound = 0;
            }

            numSound = bgSound + fxSound;
            if (numSound === 0 || numSound === 2) {
                sfxBtnConfig.setFrames(4, 4, 4)
            } else {
                sfxBtnConfig.setFrames(5, 5, 5);
            }

            //start BG sound
            if (game.device.desktop) {
            } else if (game.device.android) {
                Android.snd(numSound);
            } else if (game.device.iOS) {
                window.location = "bgsound://bgsnd?"+numSound;
            } else {
            }

        }, this, 4, 4, 4);
        sfxBtnConfig.width = sfxBtnConfig.height = rectSize;
        sfxBtnConfig.anchor.set(0.5);


        //cores
        //cor gradient pincel
        paintBmp = game.add.bitmapData(rectSize, rectSize);
        var grdPaintBmp = paintBmp.ctx.createLinearGradient(rectSize, 0, 0, rectSize);
        grdPaintBmp.addColorStop(0.25, "#879AF2");
        grdPaintBmp.addColorStop(0.5, "#D3208B");
        grdPaintBmp.addColorStop(0.75, "#FDA000");
        var lineX = 5;
        var lineY = 2;
        paintBmp.copy('icons', lineX * 100, lineY * 100, 100, 100, 0, 0, rectSize, rectSize);
        paintBmp.ctx.globalCompositeOperation = 'source-atop';
        paintBmp.ctx.fillStyle = grdPaintBmp;//'rgba(255, 0, 0, 0.75)';
        paintBmp.ctx.fillRect(0, 0, rectSize, rectSize);
        paintBmp.ctx.globalCompositeOperation = 'source-over';

        //cor salva
        numColor = parseInt(localStorage.getItem("bgCombine") || 0);
        //botao cor
        var colorBtnConfig = game.add.button(game.world.width * 0.75, game.world.height * 0.3, 'icons', function () {

            numColor += 1;
            parseInt(localStorage.setItem("bgCombine", numColor));
            if (numColor > 2) {
                numColor = 0;
                parseInt(localStorage.setItem("bgCombine", numColor));
            }

            if (numColor > 1) {
                chooseColorBG = game.rnd.integerInRange(0, 1);

                auxLight = game.rnd.integerInRange(0, lightColor.length - 1);
                auxDark = game.rnd.integerInRange(0, darkColor.length - 1);

                if (chooseColorBG === 0) {
                    game.stage.backgroundColor = '#'+lightColor[auxLight];

                    settingsTxtConfig.tint = '0x'+darkColor[auxDark];
                    musicBtnConfig.tint = '0x'+darkColor[auxDark];
                    sfxBtnConfig.tint = '0x'+darkColor[auxDark];
                    rateBtnConfig.tint = '0x'+darkColor[auxDark];
                    rankBtnConfig.tint = '0x'+darkColor[auxDark];
                    aeBtnConfig.tint = '0x'+darkColor[auxDark];
                    menuBtnConfig.tint = '0x'+darkColor[auxDark];
                    colorBtnConfig.tint = '0x'+FGcolors[1];

                } else {
                    game.stage.backgroundColor = '#'+darkColor[auxDark];

                    settingsTxtConfig.tint = '0x'+lightColor[auxLight];
                    musicBtnConfig.tint = '0x'+lightColor[auxLight];
                    sfxBtnConfig.tint = '0x'+lightColor[auxLight];
                    rateBtnConfig.tint = '0x'+lightColor[auxLight];
                    rankBtnConfig.tint = '0x'+lightColor[auxLight];
                    aeBtnConfig.tint = '0x'+lightColor[auxLight];
                    menuBtnConfig.tint = '0x'+lightColor[auxLight];
                    colorBtnConfig.tint = '0x'+FGcolors[1];
                }

                paintBmp.ctx.clearRect(0, 0, rectSize, rectSize);

            } else {

                game.stage.backgroundColor = '#'+BGcolors[numColor];

                settingsTxtConfig.tint = '0x'+FGcolors[numColor];
                musicBtnConfig.tint = '0x'+FGcolors[numColor];
                sfxBtnConfig.tint = '0x'+FGcolors[numColor];
                rateBtnConfig.tint = '0x'+FGcolors[numColor];
                rankBtnConfig.tint = '0x'+FGcolors[numColor];
                aeBtnConfig.tint = '0x'+FGcolors[numColor];
                menuBtnConfig.tint = '0x'+FGcolors[numColor];

                /*var auxPaint = game.rnd.integerInRange(0, 1);
                var colorPaint = (auxPaint === 0) ? '0x'+darkColor[auxPaint] : '0x'+lightColor[auxPaint];
                colorBtnConfig.tint = (numColor === 0) ? '0x'+FGcolors[0] : colorPaint;*/

                if (numColor === 0) {
                    colorBtnConfig.tint = '0x'+FGcolors[0];

                } else {
                    paintBmp = game.add.bitmapData(rectSize, rectSize);
                    var grdPaintBmp = paintBmp.ctx.createLinearGradient(rectSize, 0, 0, rectSize);
                    grdPaintBmp.addColorStop(0.25, "#879AF2");
                    grdPaintBmp.addColorStop(0.5, "#D3208B");
                    grdPaintBmp.addColorStop(0.75, "#FDA000");
                    var lineX = 5;
                    var lineY = 2;
                    paintBmp.copy('icons', lineX * 100, lineY * 100, 100, 100, 0, 0, rectSize, rectSize);
                    paintBmp.ctx.globalCompositeOperation = 'source-atop';
                    paintBmp.ctx.fillStyle = grdPaintBmp;//'rgba(255, 0, 0, 0.75)';
                    paintBmp.ctx.fillRect(0, 0, rectSize, rectSize);
                    paintBmp.ctx.globalCompositeOperation = 'source-over';
                    paintBmp.addToWorld(game.world.width * 0.75, game.world.height * 0.3, 0.5, 0.5, 1, 1);
                }
            }

        }, 19, 19, 19);
        colorBtnConfig.width = colorBtnConfig.height = rectSize;
        colorBtnConfig.anchor.set(0.5);


        //rate
        var rateBtnConfig = game.add.button(game.world.width * 0.25, game.world.height * 0.5, 'icons', function () {
            if (game.device.desktop) {
                window.open("https://alesefs.github.io/#combine", "_blank");

            } else if (game.device.android) {
                window.open("market://details?id=apps.alesefs.com.combine", "_system");

            } else if (game.device.iOS) {
                window.parent.location.href = "site://?" + "itms-apps://itunes.apple.com/app/id1395084295";

            } else {
                window.open("https://alesefs.github.io/#combine", "_blank", "", false);
            }
        }, this, 9, 9, 9);
        rateBtnConfig.width = rateBtnConfig.height = rectSize;
        rateBtnConfig.anchor.set(0.5);


        //rank
        var rankBtnConfig = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'icons', function () {
            if (game.device.desktop) {
                window.open("https://alesefs.github.io/#combine", "_blank");

            } else if (game.device.android) {
                var openLeaderboard = "open://";
                window.location = openLeaderboard;

            } else if (game.device.iOS) {
                window.location = "open://rnk?"+hiScore;

            } else {
                window.open("https://alesefs.github.io/#combine", "_blank", "", false);
            }
        }, this, 10, 10, 10);
        rankBtnConfig.width = rankBtnConfig.height = rectSize;
        rankBtnConfig.anchor.set(0.5);



        //AE site
        var aeBtnConfig = game.add.button(game.world.width * 0.75, game.world.height * 0.5, 'icons', function () {
            if (game.device.desktop) {
                window.open("https://alesefs.github.io", "_blank");

            } else if (game.device.android) {
                window.open("https://alesefs.github.io", "_system");

            } else if (game.device.iOS) {
                window.parent.location.href = "site://?" + "https://alesefs.github.io";

            } else {
                window.open("https://alesefs.github.io", "_blank", "", false);
            }
        }, this, 11, 11, 11);
        aeBtnConfig.width = aeBtnConfig.height = rectSize;
        aeBtnConfig.anchor.set(0.5);


        //voltar menu
        var menuBtnConfig = game.add.button(game.world.width * 0.5, game.world.height * 0.7, 'icons', function () {
            //game.state.start('inMenu');
            game.state.start('inMenu', Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);

            settingsTxtConfig.kill();
            musicBtnConfig.kill();
            sfxBtnConfig.kill();
            colorBtnConfig.kill();
            rateBtnConfig.kill();
            rankBtnConfig.kill();
            aeBtnConfig.kill();
            menuBtnConfig.kill();
            paintBmp.destroy();

        }, this, 12, 12, 12);
        menuBtnConfig.width = menuBtnConfig.height = rectSize * 1.5;
        menuBtnConfig.anchor.set(0.5);


        //ajuste cores
        if (numColor > 1) {
            if (chooseColorBG === 0) {
                game.stage.backgroundColor = '#'+lightColor[auxLight];

                settingsTxtConfig.tint = '0x'+darkColor[auxDark];
                musicBtnConfig.tint = '0x'+darkColor[auxDark];
                sfxBtnConfig.tint = '0x'+darkColor[auxDark];
                rateBtnConfig.tint = '0x'+darkColor[auxDark];
                rankBtnConfig.tint = '0x'+darkColor[auxDark];
                aeBtnConfig.tint = '0x'+darkColor[auxDark];
                menuBtnConfig.tint = '0x'+darkColor[auxDark];
                colorBtnConfig.tint = '0x'+FGcolors[1];

            } else {
                game.stage.backgroundColor = '#'+darkColor[auxDark];

                settingsTxtConfig.tint = '0x'+lightColor[auxLight];
                musicBtnConfig.tint = '0x'+lightColor[auxLight];
                sfxBtnConfig.tint = '0x'+lightColor[auxLight];
                rateBtnConfig.tint = '0x'+lightColor[auxLight];
                rankBtnConfig.tint = '0x'+lightColor[auxLight];
                aeBtnConfig.tint = '0x'+lightColor[auxLight];
                menuBtnConfig.tint = '0x'+lightColor[auxLight];
                colorBtnConfig.tint = '0x'+FGcolors[1];
            }

            paintBmp.ctx.clearRect(0, 0, rectSize, rectSize);

        } else {

            game.stage.backgroundColor = '#'+BGcolors[numColor];

            settingsTxtConfig.tint = '0x'+FGcolors[numColor];
            musicBtnConfig.tint = '0x'+FGcolors[numColor];
            sfxBtnConfig.tint = '0x'+FGcolors[numColor];
            rateBtnConfig.tint = '0x'+FGcolors[numColor];
            rankBtnConfig.tint = '0x'+FGcolors[numColor];
            aeBtnConfig.tint = '0x'+FGcolors[numColor];
            menuBtnConfig.tint = '0x'+FGcolors[numColor];

            /*var auxPaint = game.rnd.integerInRange(0, 1);
            var colorPaint = (auxPaint === 0) ? '0x'+darkColor[auxPaint] : '0x'+lightColor[auxPaint];*/
            //colorBtnConfig.tint = (numColor === 0) ? '0x'+FGcolors[0] : colorPaint;

            if (numColor === 0) {
                colorBtnConfig.tint = '0x'+FGcolors[0];

            } else {
                paintBmp = game.add.bitmapData(rectSize, rectSize);
                var grdPaintBmp = paintBmp.ctx.createLinearGradient(rectSize, 0, 0, rectSize);
                grdPaintBmp.addColorStop(0.25, "#879AF2");
                grdPaintBmp.addColorStop(0.5, "#D3208B");
                grdPaintBmp.addColorStop(0.75, "#FDA000");
                var lineX = 5;
                var lineY = 2;
                paintBmp.copy('icons', lineX * 100, lineY * 100, 100, 100, 0, 0, rectSize, rectSize);
                paintBmp.ctx.globalCompositeOperation = 'source-atop';
                paintBmp.ctx.fillStyle = grdPaintBmp;//'rgba(255, 0, 0, 0.75)';
                paintBmp.ctx.fillRect(0, 0, rectSize, rectSize);
                paintBmp.ctx.globalCompositeOperation = 'source-over';
                paintBmp.addToWorld(game.world.width * 0.75, game.world.height * 0.3, 0.5, 0.5, 1, 1);
            }
        }

    },


    update: function () {
        'use strict';
    },


    render: function () {
        'use strict';
        //game.debug.text("FPS: " + game.time.fps || '--', 10, 20, "#0f0");
        //game.debug.text("foco: " + hasFocus + " ,online: " + hasInternet + " ,recompença: " + rewardsNum, 10, 40, "#0f0");
        //game.debug.text("numSound: " + numSound, 10, 60, "#0f0");

    }
};


//game screen
var game_state = {

    init: function () {
        'use strict';
    },

    //precarrega os assets do jogo
    preload: function () {
        'use strict';
    },

    //cria os itens bases do jogo
    create: function () {
        'use strict';

        isGame = true;

        //bg right side
        this.createBGGame();
        bgRectL = game.add.button(0, 0, bgTxture, function () {
            currentItemBase -= 1;
            if (currentItemBase > levelItem) {
                currentItemBase = firstItem;
            }
            if (currentItemBase < firstItem) {
                currentItemBase = levelItem;
            }

            itemBaseGame.frame = currentItemBase;
            itemBaseGame.number = currentItemBase;
            itemBaseRightHandGame.frame = (currentItemBase === levelItem) ? firstItem : currentItemBase + 1;
            itemBaseLeftHandGame.frame = (currentItemBase === firstItem) ? levelItem : currentItemBase - 1;
        }, this);

        //bg right side
        bgRectR = game.add.button(game.world.centerX, 0, bgTxture, function () {
            currentItemBase += 1;

            if (currentItemBase > levelItem) {
                currentItemBase = firstItem;
            }
            if (currentItemBase < firstItem) {
                 currentItemBase = levelItem;
            }

            itemBaseGame.frame = currentItemBase;
            itemBaseGame.number = currentItemBase;
            itemBaseRightHandGame.frame = (currentItemBase === levelItem) ? firstItem : currentItemBase + 1;
            itemBaseLeftHandGame.frame = (currentItemBase === firstItem) ? levelItem : currentItemBase - 1;
        }, this);


        //coroa
        crownGame = game.add.sprite(game.world.width * 0.1, game.world.height * 0.05, 'icons', 10);
        crownGame.width = crownGame.height = rectSize * 0.75;
        crownGame.anchor.set(0.5);
        crownGame.tint = '0xdaa520';

        //texto hiScore base
        hiScoreTxtGame = game.add.text(crownGame.x + crownGame.width / 2, game.world.height * 0.05, hiScore, { font: ((rectSize - gridPos) + marginSpace) + "px SirinStencil-Regular", fill: "#fff", align: "left" });
        hiScoreTxtGame.anchor.set(0, 0.5);
        hiScoreTxtGame.tint = '0xdaa520';

        //transforma hiScore de Int em String
        hiScoreTxt = String(hiScore);

        //texto score base
        var scoreTxtX = (hiScoreTxt.length === 1) ? hiScoreTxtGame.x + (hiScoreTxt.length * (rectSize - gridPos) + marginSpace) : hiScoreTxtGame.x + (hiScoreTxt.length * (rectSize - gridPos) + marginSpace / 2);
        scoreTxtGame = game.add.text(scoreTxtX, game.world.height * 0.05, "/ " + score, { font: ((rectSize - gridPos) + marginSpace) + "px SirinStencil-Regular", fill: "#fff", align: "left" });
        scoreTxtGame.anchor.set(0, 0.5);



        //left hand
        leftHandGame = game.add.sprite(game.world.width * 0.2, game.world.height * 0.8, 'icons', 17);
        leftHandGame.width = leftHandGame.height = rectSize * 2;
        leftHandGame.anchor.set(0.5);

        //right hand
        rightHandGame = game.add.sprite(game.world.width * 0.8, game.world.height * 0.8, 'icons', 18);
        rightHandGame.width = rightHandGame.height = rectSize * 2;
        rightHandGame.anchor.set(0.5);


        //item example base left hand
        itemBaseLeftHandGame = game.add.sprite(game.world.width * 0.2, game.world.height * 0.675, 'itens', currentItemBase - 1);
        itemBaseLeftHandGame.width = itemBaseLeftHandGame.height = rectSize * 0.75;
        itemBaseLeftHandGame.anchor.set(0.5);

        //item example base right hand
        itemBaseRightHandGame = game.add.sprite(game.world.width * 0.8, game.world.height * 0.675, 'itens', currentItemBase + 1);
        itemBaseRightHandGame.width = itemBaseRightHandGame.height = rectSize * 0.75;
        itemBaseRightHandGame.anchor.set(0.5);


        //item "base game
        itemBaseGame = game.add.sprite(game.world.centerX, game.world.height * 0.75, 'itens', currentItemBase);
        itemBaseGame.width = itemBaseGame.height = rectSize * 1.5;
        itemBaseGame.anchor.set(0.5);
        itemBaseGame.number = currentItemBase;


        //1 spawn
        game.time.events.add(Phaser.Timer.SECOND * 2, this.createItensGame, this);

        //grupo de itens que cai
        itemFallGameGroup = game.add.group();
        game.physics.arcade.enable(itemFallGameGroup);
        itemFallGameGroup.enableBody = true;


        //itens pra efeitos de score
        itensEffects = game.add.group();


        //ajuste cores
        if (numColor > 1) {
            if (chooseColorBG === 0) {
                game.stage.backgroundColor = '#'+lightColor[auxLight];
                scoreTxtGame.tint = '0x'+darkColor[auxDark];
                leftHandGame.tint = '0x'+darkColor[auxDark];
                rightHandGame.tint = '0x'+darkColor[auxDark];
                itemBaseLeftHandGame.tint = '0x'+darkColor[auxDark];
                itemBaseRightHandGame.tint = '0x'+darkColor[auxDark];
                itemBaseGame.tint = '0x'+darkColor[auxDark];

            } else {
                game.stage.backgroundColor = '#'+darkColor[auxDark];
                scoreTxtGame.tint = '0x'+lightColor[auxLight];
                leftHandGame.tint = '0x'+lightColor[auxLight];
                rightHandGame.tint = '0x'+lightColor[auxLight];
                itemBaseLeftHandGame.tint = '0x'+lightColor[auxLight];
                itemBaseRightHandGame.tint = '0x'+lightColor[auxLight];
                itemBaseGame.tint = '0x'+lightColor[auxLight];
            }

        } else {

            game.stage.backgroundColor = '#'+BGcolors[numColor];
            scoreTxtGame.tint = '0x'+FGcolors[numColor];
            leftHandGame.tint = '0x'+FGcolors[numColor];
            rightHandGame.tint = '0x'+FGcolors[numColor];
            itemBaseLeftHandGame.tint = '0x'+FGcolors[numColor];
            itemBaseRightHandGame.tint = '0x'+FGcolors[numColor];
            itemBaseGame.tint = '0x'+FGcolors[numColor];
        }
    },


    //bg
    createBGGame: function () {
        bgTxture = game.add.bitmapData(game.world.width / 2, game.world.height);
        bgTxture.ctx.clearRect(0, 0, rectSize, rectSize);
        bgTxture.ctx.beginPath();
        bgTxture.ctx.rect(0, 0, game.world.width, game.world.height);
        bgTxture.ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        bgTxture.ctx.fill();
    },


    //nascem os itens q caem
    createItensGame: function () {
        currentItemFall = game.rnd.integerInRange(firstItem, levelItem);

        var itemGame = itemFallGameGroup.create(game.world.centerX, 0, 'itens', currentItemFall);
        itemGame.width = itemGame.height = rectSize * 0.5;
        itemGame.anchor.set(0.5);
        itemGame.number = currentItemFall;
        itemGame.body.velocity.y = velItem;

        //item extra quando acerta
        var itemCollide = itensEffects.create(itemBaseGame.x, itemBaseGame.y, 'itens', currentItemFall);
        itemCollide.width = itemCollide.height = 0;//rectSize * 1.5;
        itemCollide.anchor.set(0.5);
        itemCollide.number = currentItemFall;
        itemCollide.alpha = 0;



        if (numColor > 1) {
            if (score === 0) {
                if (chooseColorBG === 0) {
                    rndFGColor = darkColor[auxDark];
                } else {
                    rndFGColor = lightColor[auxLight];
                }

            } else {
                auxLight = game.rnd.integerInRange(0, lightColor.length - 1);
                auxDark = game.rnd.integerInRange(0, darkColor.length - 1);

                if (chooseColorBG === 0) {
                    rndFGColor = darkColor[auxDark];
                } else {
                    rndFGColor = lightColor[auxLight];
                }

            }
        } else {

            rndFGColor = FGcolors[numColor];
            itemGame.tint = '0x'+rndFGColor;
        }

        scoreTxtGame.tint = '0x'+rndFGColor;
        leftHandGame.tint = '0x'+rndFGColor;
        rightHandGame.tint = '0x'+rndFGColor;
        itemBaseLeftHandGame.tint = '0x'+rndFGColor;
        itemBaseRightHandGame.tint = '0x'+rndFGColor;
        itemBaseGame.tint = '0x'+rndFGColor;
        itemGame.tint = '0x'+rndFGColor;
    },


    update: function () {
        'use strict';
        if (isGame) {
            //tratamento individual para cada bloco q cai
            itemFallGameGroup.forEachAlive(function(item){


                //tamanho dinamico do bloco
                item.width = item.y / 5;
                if (item.width > rectSize * 1.5) { item.width = rectSize * 1.5 }
                item.height = item.width;


                //overlap fall x base
                //if (item.y >= itemBaseGame.y && item.y <= itemBaseGame.y + itemBaseGame.height) {
                if (item.y >= itemBaseGame.y - itemBaseGame.height * 0.25 && item.y <= itemBaseGame.y + itemBaseGame.height) {

                    if (item.number === itemBaseGame.number) {

                        //score
                        auxScoreTimer += 1;
                        if (auxScoreTimer >= auxLevelTimerToScore) {
                            //atualiza score
                            score += 1;

                            var scoreTxtX = (hiScoreTxt.length === 1) ? hiScoreTxtGame.x + (hiScoreTxt.length * (rectSize - gridPos) + marginSpace) : hiScoreTxtGame.x + (hiScoreTxt.length * (rectSize - gridPos) + marginSpace / 2);
                            scoreTxtGame.text = "/ " +score;
                            scoreTxtGame.x = scoreTxtX;

                            //elimina o itemFall
                            item.kill();

                            auxScoreTimer = 0;

                            //troca bg/fg se tiver no colorido
                            if (numColor > 1) {
                                if (chooseColorBG === 0) {
                                    chooseColorBG = 1;
                                } else {
                                    chooseColorBG = 0;
                                }
                                game.stage.backgroundColor = rndFGColor;
                            }

                            soundFXTaps = 0;
                            if (game.device.desktop) {
                            } else if (game.device.android) {
                                Android.sndFXTaps(soundFXTaps);
                            } else if (game.device.iOS) {
                                window.location = "sndfxtaps://fxs?"+soundFXTaps;
                            } else {
                            }


                            //efeito scale score + 1
                            itensEffects.forEachAlive( function (itemCollide) {
                                itemCollide.tint = rndFGColor;
                                itemCollide.alpha = 1;

                                game.add.tween(itemCollide).to( { alpha: 0, width: rectSize * 3, height: rectSize * 3 }, 250, "Linear", true).onComplete.add( function() {
                                    itemCollide.kill();
                                }, this);
                            }, this);


                            //cria novo item
                            this.createItensGame();
                        }

                    } else {
                        auxScoreTimer = 0;
                    }
                }

                //fim de jogo
                if (item.y > itemBaseGame.y + itemBaseGame.height * 0.75) {
                    this.itsOver();
                
                    soundFXTaps = 1;
                    if (game.device.desktop) {
                    } else if (game.device.android) {
                        Android.sndFXTaps(soundFXTaps);
                    } else if (game.device.iOS) {
                        window.location = "sndfxtaps://fxs?"+soundFXTaps;
                    } else {
                    }
                                           
                   //game.time.events.add(Phaser.Timer.SECOND, this.itsOver, this);
                }

            }, this);



            //pausa
            if (isPaused) {
                //velocidade dos itens
                velItem = 0;

            } else { //em jogo
                //velocidade dos itens
                if (score < 3) {
                    level = 0;
                    levelItem = 2;
                    velItem = 100;
                    auxLevelTimerToScore = 20;

                } else if (score <= 15) {
                    level = 1;
                    levelItem = 4;
                    velItem = 200;
                    auxLevelTimerToScore = 15;

                    if (leftHandGame.alpha !== 0) {
                        game.add.tween(leftHandGame).to( { alpha: 0 }, 200, "Linear", true);
                        game.add.tween(itemBaseLeftHandGame).to( { alpha: 0 }, 200, "Linear", true);
                        game.add.tween(rightHandGame).to( { alpha: 0 }, 200, "Linear", true);
                        game.add.tween(itemBaseRightHandGame).to( { alpha: 0 }, 200, "Linear", true);
                    }

                } else if (score <= 45) {
                    level = 2;
                    levelItem = 6;
                    velItem = 275;
                    auxLevelTimerToScore = 12.5;

                } else if (score <= 80) {
                    level = 3;
                    levelItem = 9;
                    velItem = 350;
                    auxLevelTimerToScore = 10;

                } else if (score <= 120) {
                    level = 4;
                    levelItem = 12;
                    velItem = 450;
                    auxLevelTimerToScore = 7.5;

                } else if (score <= 200) {
                    level = 5;
                    levelItem = 15;
                    velItem = 525;
                    auxLevelTimerToScore = 5;

                } else {
                    level = 6;
                    levelItem = 19;
                    velItem = 600;
                    auxLevelTimerToScore = 2.5;
                }
            }
            //velocidade dos itens
            itemFallGameGroup.setAll('body.velocity.y', velItem);

        } else {
        }



        //volta pro jogo
        if (rewardsNum === 2) {
            modalBox.kill();
            modalTxtGame.kill();
            modalBtnReward.kill();
            modalBtnCancel.kill();

            counterContinue = 1;

            rewardsNum = 3;

            isGame = true;

            bgRectL.inputEnabled = true;
            bgRectR.inputEnabled = true;

            //se level = 0, reaparece as instruçoes
            if (level === 0) {
                game.add.tween(leftHandGame).to( { alpha: 1 }, 200, "Linear", true);
                game.add.tween(itemBaseLeftHandGame).to( { alpha: 1 }, 200, "Linear", true);
                game.add.tween(rightHandGame).to( { alpha: 1 }, 200, "Linear", true);
                game.add.tween(itemBaseRightHandGame).to( { alpha: 1 }, 200, "Linear", true);
            }

            //item base
            game.add.tween(itemBaseGame).to( { alpha: 1 }, 200, "Linear", true);

            //itens HUD
            game.add.tween(crownGame).to( { alpha: 1 }, 200, "Linear", true);
            game.add.tween(hiScoreTxtGame).to( { alpha: 1 }, 200, "Linear", true);
            game.add.tween(scoreTxtGame).to( { alpha: 1 }, 200, "Linear", true);

            /*
            //video reward
            if (game.device.desktop) {
            } else if (game.device.android) {
                window.location = "reward://";
                Android.reward(rewardsNum);
            } else if (game.device.iOS) {
                window.location = "reward://rew?"+rewardsNum;
            } else {
            }
            */

            //continua o game
            game.time.events.add(Phaser.Timer.SECOND * 2, this.createItensGame, this);
        }


        //se cancelar video durante video vai pra game over
        if (rewardsNum === -1) {
            modalBox.kill();
            modalTxtGame.kill();
            modalBtnReward.kill();
            modalBtnCancel.kill();

            //game over screen
            counterContinue = 1;
            this.gameOver();

            rewardsNum = 3;
        }

    },


    //fim de jogo
    itsOver: function () {
        'use strict';
        //em jogo?
        isGame = false;

        //remove eventos de click;
        bgRectL.inputEnabled = false;
        bgRectR.inputEnabled = false;

        //teste
        itemFallGameGroup.forEachAlive(function(item){
            item.kill();
        }, this);

        //item base
        game.add.tween(itemBaseGame).to( { alpha: 0 }, 200, "Linear", true);

        //itens tutorial
        if (leftHandGame.alpha !== 0) {
            game.add.tween(leftHandGame).to( { alpha: 0 }, 200, "Linear", true);
            game.add.tween(itemBaseLeftHandGame).to( { alpha: 0 }, 200, "Linear", true);
            game.add.tween(rightHandGame).to( { alpha: 0 }, 200, "Linear", true);
            game.add.tween(itemBaseRightHandGame).to( { alpha: 0 }, 200, "Linear", true);
        }

        //itens HUD
        game.add.tween(crownGame).to( { alpha: 0 }, 200, "Linear", true);
        game.add.tween(hiScoreTxtGame).to( { alpha: 0 }, 200, "Linear", true);
        game.add.tween(scoreTxtGame).to( { alpha: 0 }, 200, "Linear", true);



        //carrega o video recompença
        game.time.events.add(Phaser.Timer.SECOND * 0.5, function () {
            if (counterContinue === 0 && hasInternet === "online") {
                rewardsNum = 0;
                if (game.device.desktop) {
                } else if (game.device.android) {
                    window.location = "reward://";
                    Android.reward(rewardsNum);
                } else if (game.device.iOS) {
                    window.location = "reward://rew?"+rewardsNum;
                } else {
                }
            }
         });


        //explode item base
        var explodeItemBase = game.add.emitter(itemBaseGame.x, itemBaseGame.y + itemBaseGame.height / 2, 50);
        explodeItemBase.makeParticles('itens', currentItemFall, 50);
        explodeItemBase.gravity = 200;
        explodeItemBase.minParticleScale = 1;
        explodeItemBase.maxParticleScale = 0.25;
        explodeItemBase.start(true, 2500, null, 25);
        explodeItemBase.forEach(function (particle) {
            particle.tint = Math.random() * 0xffffff;//rndFGColor;
            game.add.tween(particle.scale).to( { x: 0, y: 0 }, 3000, "Linear", true, 0).onComplete.add(function() {
                particle.kill();
            }, this);
        });

        //cria o modal
        game.time.events.add(Phaser.Timer.SECOND * 3, this.modalState, this);
    },



    //telas de game over e continue
    modalState: function () {
        'use strict';

        //flash to sinalize
        //game.camera.flash(0xff0000, 2500);

        if (counterContinue === 1 || hasInternet === "offline" || hasInternet === null) {
            this.gameOver();

        } else {
            this.gameContinue();

        }

    },


    //game over
    gameOver: function () {

        //mata itens do jogo
        bgRectL.kill();
        bgRectR.kill();
        itemBaseGame.kill();
        leftHandGame.kill();
        itemBaseLeftHandGame.kill();
        rightHandGame.kill();
        itemBaseRightHandGame.kill();
        crownGame.kill();
        hiScoreTxtGame.kill();
        scoreTxtGame.kill();


        //itens do modal
        var modalTxt = "GAME OVER";
        var modalW = rectSize * 5;
        var modalH = rectSize * 4;

        //texture modal
        var modal = game.add.bitmapData(modalW, modalH);
        modal.ctx.clearRect(0, 0, modalW, modalH);
        modal.ctx.beginPath();
        modal.ctx.rect(0, 0, modalW, modalH);
        modal.ctx.fillStyle = (numColor != 1) ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)';
        modal.ctx.fill();

        modalBox = game.add.sprite(game.world.centerX, game.world.centerY, modal);
        modalBox.anchor.set(0.5);

        //titulo modal
        modalTxtGame = game.add.text(modalBox.x, modalBox.y - modalBox.height * 0.3, modalTxt, { font: (gridPos - marginSpace) + "px SirinStencil-Regular", fill: "#fff", align: "center" });
        modalTxtGame.anchor.set(0.5);
        modalTxtGame.tint = '0x'+rndFGColor;


        //texto best
        var bestTxt = game.add.text(modalBox.x - modalBox.width / 2 + rectSize / 3.25, modalBox.y - rectSize / 1.75, "Best:", { font: (rectSize - gridPos) + "px SirinStencil-Regular", fill: "#daa520"});
        //texto score
        var bestTxtNum = game.add.text(bestTxt.x, bestTxt.y + rectSize / 1.5, hiScore, { font: (gridPos - marginSpace) + "px SirinStencil-Regular", fill: "#daa520"});
        bestTxtNum.anchor.set(0, 0.5);

        //texto last
        var currentTxt = game.add.text(modalBox.x + modalBox.width / 2 - rectSize, bestTxt.y, "Last:", { font: (rectSize - gridPos) + "px SirinStencil-Regular", fill: "#fff", align: "right" });
        currentTxt.tint = '0x'+rndFGColor;
        //texto hiscore
        var currentTxtNum = game.add.text(currentTxt.x + currentTxt.width, bestTxtNum.y, score, { font: (gridPos - marginSpace) + "px SirinStencil-Regular", fill: "#fff", align: "right" });
        currentTxtNum.anchor.set(1, 0.5);
        currentTxtNum.tint = '0x'+rndFGColor;



        //new hiscore
        if (score > 0 && score > hiScore) {
            hiScore = score;
            parseInt(localStorage.setItem("hiScoreCombine", hiScore));

            //centraliza Best e vira record
            bestTxt.text = "NEW RECORD!";
            bestTxt.x = game.world.centerX;
            bestTxt.y = modalBox.y - rectSize / 1.5;
            bestTxt.anchor.set(0.5, 0);
            bestTxtNum.text = hiScore;
            bestTxtNum.x = bestTxt.x;//modalGO.x - modalGO.width / 2;
            bestTxtNum.y = bestTxt.y + rectSize;
            bestTxtNum.fontSize = rectSize;
            bestTxtNum.anchor.set(0.5);

            //apaga last score
            currentTxt.alpha = 0;
            currentTxtNum.alpha = 0;

            //particulas de fogos de artificio
            var partc = game.add.bitmapData(5, 5);
            partc.ctx.beginPath();
            partc.ctx.rect(0, 0, 5, 5);
            partc.ctx.fillStyle = '#ffffff';
            partc.ctx.fill();

            //cria fogos de artificio
            var emitter = game.add.emitter(0, 0, 50);
            emitter.makeParticles(partc);
            emitter.forEach(function (particle) {
                particle.tint = Math.random() * 0xffffff;
                game.add.tween(particle.scale).to( { x: 0, y: 0 }, 200, "Linear", true, 0).onComplete.add(function() {
                    particle.kill();
                }, this);
            });
            emitter.gravity = 150;
            emitter.minParticleScale = 2;
            emitter.maxParticleScale = 0.5;
            //disparador de fogos
            game.time.events.repeat(Phaser.Timer.SECOND, 60, function () {
                emitter.x = game.world.randomX;
                emitter.y = game.world.randomY;
                emitter.start(true, 2500, null, 25);
            }, this);


            game.time.events.add(Phaser.Timer.SECOND * 3, function () {
            //envia hiscore
                if (game.device.desktop) {
                } else if (game.device.android) {
                    var openLeaderboard = "sendrank://";
                    window.location = openLeaderboard;
                    Android.hiscr(hiScore);

                } else if (game.device.iOS) {
                        window.location = "score://scrr?"+hiScore;
                } else {
                }
            });

            //som efeito rank
            soundFXTaps = 2;

        } else {
            //som efeito game over
            soundFXTaps = 3;
        }

        //envia som final game over (3) ou rank (2)
        game.time.events.add(Phaser.Timer.SECOND * 2, function () {
            if (game.device.desktop) {
            } else if (game.device.android) {
                Android.sndFXTaps(soundFXTaps);
            } else if (game.device.iOS) {
                window.location = "sndfxtaps://fxs?"+soundFXTaps;
            } else {
            }
         });

        //botoes
        //configuraçoes
        var modalBtnConfig = game.add.button(modalBox.x - modalBox.width * 0.25, modalBox.y + modalBox.height * 0.3, 'icons', function () {
            //kill itens
            modalBox.kill();
            modalTxtGame.kill();
            bestTxt.kill();
            bestTxtNum.kill();
            currentTxt.kill();
            currentTxtNum.kill();
            modalBtnConfig.kill();
            modalBtnPlay.kill();
            modalBtnShare.kill();

            //reset markers
            currentItemBase = 1;
            currentItemFall = 0;
            levelItem = 2;
            score = 0;
            auxScoreTimer = 0;
            level = 0;
            auxLevelTimerToScore = 0;
            velItem = 100;
            counterContinue = 0;

            game.state.start('inConfig', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);//certo

        }, this, 0, 0, 0);
        modalBtnConfig.width = modalBtnConfig.height = rectSize;
        modalBtnConfig.anchor.set(0.5);
        modalBtnConfig.tint = '0x'+rndFGColor;


        //jogar
        var modalBtnPlay = game.add.button(modalBox.x + marginSpace / 2, modalBox.y + modalBox.height * 0.3, 'icons', function () {
            //kill itens
            modalBox.kill();
            modalTxtGame.kill();
            bestTxt.kill();
            bestTxtNum.kill();
            currentTxt.kill();
            currentTxtNum.kill();
            modalBtnConfig.kill();
            modalBtnPlay.kill();
            modalBtnShare.kill();

            //reset markers
            currentItemBase = 1;
            currentItemFall = 0;
            levelItem = 2;
            score = 0;
            auxScoreTimer = 0;
            level = 0;
            auxLevelTimerToScore = 0;
            velItem = 100;
            counterContinue = 0;

            game.state.start(game.state.current);

        }, this, 15, 15, 15);
        modalBtnPlay.width = modalBtnPlay.height = rectSize;
        modalBtnPlay.anchor.set(0.5);
        modalBtnPlay.tint = '0x'+rndFGColor;


        //compartilhar
        var modalBtnShare = game.add.button(modalBox.x + modalBox.width * 0.25, modalBox.y + modalBox.height * 0.3, 'icons', function () {
            //share
            var canvas2 = document.createElement('canvas');
            var ctx2 = canvas2.getContext('2d');
            var d = 400;
            canvas2.width = d;
            canvas2.height = d;
            var GS = 6;
            var RS2 = Math.round(d/GS);
            var MS2 = Math.round(RS2 / GS);
            var grid2 = Math.round(MS2 + RS2 / 2);
            ctx2.clearRect(0, 0, d, d);

            var auxBGColor;
            if (numColor > 1) {
                if (chooseColorBG === 0) {
                    auxBGColor = '#'+lightColor[auxLight];
                } else {
                    auxBGColor = '#'+darkColor[auxDark];
                }
            } else {
                auxBGColor = '#'+BGcolors[numColor];
            }


            //bg color
            ctx2.beginPath();
            ctx2.rect(0, 0, d, d);
            ctx2.fillStyle = auxBGColor;
            ctx2.fill();

            //record txt
            ctx2.font = "30px SirinStencil-Regular";
            ctx2.textAlign = "center";
            ctx2.fillStyle = '#'+rndFGColor;
            ctx2.fillText("My record is:", d / 2, 180);

            //hi score txt
            ctx2.font = "80px SirinStencil-Regular";
            ctx2.textAlign = "center";
            ctx2.fillStyle = '#'+rndFGColor;
            ctx2.fillText(hiScore, d / 2, d / 2 + 60);

            //try txt
            ctx2.font = "30px SirinStencil-Regular";
            ctx2.textAlign = "center";
            ctx2.fillStyle = '#'+rndFGColor;
            ctx2.fillText("Try beat me!", d / 2, d / 2 + 100);

            //try txt
            ctx2.font = "20px SirinStencil-Regular";
            ctx2.textAlign = "center";
            ctx2.fillStyle = '#'+rndFGColor;
            ctx2.fillText("#Tapple     #AlesefsApps", d / 2, d / 2 + 150);


            //logo
            var imageLogo = new Image();
            imageLogo.src = 'img/logo.png';
            imageLogo.crossOrigin = "anonymous";
            var dyedLogo = dyeImageWithColor(imageLogo, '#'+rndFGColor, 1.0);
            ctx2.drawImage(dyedLogo, 0, 0, 360, 152, 89, 37, 222, 83);


            //randons fireworks
            for (var i = 0; i <= 100; i++) {
                // Get random positions for stars.
                var ww = Math.floor(Math.random() * 7) + 3;
                var hh = ww;
                var xx = Math.floor(Math.random() * d);
                var yy = Math.floor(Math.random() * d);

                ctx2.beginPath();
                ctx2.fillStyle = '#'+Math.floor(Math.random()*16777215).toString(16);
                ctx2.rect(xx, yy, ww, hh);
                ctx2.fill();
            }


            //envio
            var meta = canvas2.toDataURL("image/png");
            if (game.device.desktop) {
                //desktop
                canvas2.toBlob(function(blob) {
                    saveAs(blob, "Combine.png");
                });

            } else if (game.device.android) {
                Android.imgs(meta);
                window.location = "Tapple.png";//nova forma de upload de img

            } else if (game.device.iOS) {
                window.location = "shared://shrd?"+meta;

            } else {
                window.external.notify(meta);
            }


        }, this, 16, 16, 16);
        modalBtnShare.width = modalBtnShare.height = rectSize;
        modalBtnShare.anchor.set(0.5);
        modalBtnShare.tint = '0x'+rndFGColor;




        //interstitial
        var inter = game.rnd.integerInRange(0, 2);
        if (hasInternet === "online") {
            if (game.device.desktop) {
            } else if (game.device.android) {
                window.location = "inter://";
                Android.inter(inter);
            } else if (game.device.iOS) {
                window.location = "inter://intr?"+inter;
            } else {
            }

        } else {
            if (inter === 0) {
                var interImg480 = ['img/ads/TAPPLEint480.png', 'img/ads/AEint480.png'];
                var interImg600 = ['img/ads/TAPPLEint600.png', 'img/ads/AEint600.png'];
                var interCor = ['#114EA0', '#111111'];
                var interADS = 0;
                interADS = game.rnd.integerInRange(0,  interCor.length - 1);

                $('#mask').css("display", "block");
                $('#inter').css("display", "block");


                if (game.world.width >= 600) {
                    $('#inter').css({
                        'background': '' + interCor[interADS] + ' url(' + interImg600[interADS] + ') center no-repeat'
                    });
                } else {
                    $('#inter').css({
                        'background': '' + interCor[interADS] + ' url(' + interImg480[interADS] + ') center no-repeat'
                    });
                }

                $('.ads2').on('click', function() {
                    if (navigator.userAgent.match(/Windows Phone|IEMobile|Lumia/i)) {
                        $(".ads2").attr("href", "https://alesefs.github.io/");
                        $(".ads2").attr("target","_blank");

                    } else if (navigator.userAgent.match(/Android/i)) {
                        if (interADS == 0) {
                            $(".ads2").attr("href", "https://play.google.com/store/apps/details?id=apps.alesefs.com.tapple");
                            $(".ads2").attr("target","_blank");
                        } else {
                            $(".ads2").attr("href", "https://alesefs.github.io/");
                            $(".ads2").attr("target","_blank");
                        }

                    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {

                        if (interADS == 0) {
                            $(".ads2").attr("href", "https://itunes.apple.com/us/app/tapple/id1385043642?l=pt&ls=1&mt=8");
                            $(".ads2").attr("target","_blank");
                        } else {
                            $(".ads2").attr("href", "https://alesefs.github.io/");
                            $(".ads2").attr("target","_blank");
                        }

                    } else {
                        $(".ads2").attr("href", "http://alesefs.github.io/");
                        $(".ads2").attr("target","_blank");
                    }
                });
            }
        }

    },



    //game continue
    gameContinue: function () {
        //modal
        var modalTxt = "CONTINUE";
        var modalW = rectSize * 5;
        var modalH = rectSize * 3;

        //texture modal
        var modal = game.add.bitmapData(modalW, modalH);
        modal.ctx.clearRect(0, 0, modalW, modalH);
        modal.ctx.beginPath();
        modal.ctx.rect(0, 0, modalW, modalH);
        modal.ctx.fillStyle = (numColor != 1) ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)';
        modal.ctx.fill();

        modalBox = game.add.sprite(game.world.centerX, game.world.centerY, modal);
        modalBox.anchor.set(0.5);

        //titulo modal
        modalTxtGame = game.add.text(modalBox.x, modalBox.y - modalBox.height * 0.25, modalTxt, { font: (gridPos - marginSpace) + "px SirinStencil-Regular", fill: "#fff", align: "center" });
        modalTxtGame.anchor.set(0.5);
        modalTxtGame.tint = '0x'+rndFGColor;

        //botoes
        //video
        modalBtnReward = game.add.button(modalBox.x - modalBox.width * 0.25, modalBox.y + modalBox.height * 0.25, 'icons', function () {
            //dispara video recompença
            rewardsNum = 1;
            //video reward
            if (game.device.desktop) {
            } else if (game.device.android) {
                window.location = "reward://";
                Android.reward(rewardsNum);
            } else if (game.device.iOS) {
                window.location = "reward://rew?"+rewardsNum;
            } else {
            }

        }, this, 13, 13, 13);
        modalBtnReward.width = modalBtnReward.height = rectSize;
        modalBtnReward.anchor.set(0.5);
        modalBtnReward.tint = '0x'+rndFGColor;


        //game over
        modalBtnCancel = game.add.button(modalBox.x + modalBox.width * 0.25, modalBox.y + modalBox.height * 0.25, 'icons', function () {
            modalBox.kill();
            modalTxtGame.kill();
            modalBtnReward.kill();
            modalBtnCancel.kill();

            //game over screen
            counterContinue = 1;
            this.gameOver();

        }, this, 14, 14, 14);
        modalBtnCancel.width = modalBtnCancel.height = rectSize;
        modalBtnCancel.anchor.set(0.5);
        modalBtnCancel.tint = '0x'+rndFGColor;

    },


    render: function () {
        'use strict';
        //game.debug.text("auxScoreTimer: " + auxScoreTimer + " hasInternet: " + hasInternet, 20, 20, "#0f0", "20px arial");
        //game.debug.text("frameFall: " + currentItemFall + " -frameBase " + currentItemBase + " -isGame: " + isGame, 10, game.world.height * 0.85, "#0f0", "20px arial");
        //game.debug.text("Hi-Score: " + hiScore + " -score " + score + " -level: " + level, 10, game.world.height * 0.80, "#0f0", "20px arial");
        //game.debug.text("FPS: " + game.time.fps || '--', 10, game.world.height * 0.85, "#0f0");
        //game.debug.text("foco: " + hasFocus + " ,online: " + hasInternet + " ,recompença: " + rewardsNum, 10, game.world.height * 0.9, "#0f0");
    }
};




this.game.state.add('inBoot', boot_state);
this.game.state.add('inMenu', menu_state);
this.game.state.add('inConfig', config_state);
this.game.state.add('inGame', game_state);
this.game.state.start('inBoot');

