(function() {

    var PLAYER_FADE_INTERVAL = 100;
    var PLAYER_FADE_TRANSITION_TIME = 4;
    var DEFAULT_VOLUME = 0.4;

    var DEFAULT_MEDIA_PATH = '/media/';

    var PlayList = function(xml) {
        var self = this;
        var $dom = $(xml);

        //this.path = $html.find('playlist').attr('path');

        this.items = $dom.find('item').map(function() {
            var item = {
                src: DEFAULT_MEDIA_PATH + $(this).text()
            };

            return item;
        });

        this.index = this.items.length ? 0 : -1;
    };

    PlayList.prototype = {

        isEmpty : function() {
            return this.items.length === 0;
        },

        nextInList : function() {
            if( this.index == -1 ) return null;

            var fullPath = this.items[this.index].src;
            this.index = (this.index+1) % this.items.length;

            return fullPath;
        }
    }

    function initPlayer() {
        var player = document.getElementById('player');
        var playList = null;

        player.fadeIn = function(from, to, step) {
            delete this.fadingOut;
            this.fadingIn = true;

            from = from || 0;
            to = to || this.volume || DEFAULT_VOLUME;

            if( from >= to ) {
                delete this.fadingIn;
                return;
            }

            step = step || (to-from) / ( (PLAYER_FADE_TRANSITION_TIME*1000/PLAYER_FADE_INTERVAL) || 1);

            this.volume = (from + step) > to ? to : from + step;

            var self = this;
            setTimeout(function() {
                if( !self.fadingIn ) return;

                self.fadeIn(self.volume, to, step);
            }, PLAYER_FADE_INTERVAL);
        }

        player.fadeOut = function(from, to, step) {
            delete this.fadingIn;
            this.fadingOut = true;

            from = from || this.volume;
            to = to || 0;

            if( from <= to ) {
                delete this.fadingOut;
                return;
            }

            step = step || (from-to) / ( (PLAYER_FADE_TRANSITION_TIME*1000/PLAYER_FADE_INTERVAL) || 1);

            this.volume = (from - step) < to ? to : from - step;

            var self = this;
            setTimeout(function() {
                if( !self.fadingOut ) return;

                self.fadeOut(self.volume, to, step);
            }, PLAYER_FADE_INTERVAL);
        }

        player.volume = DEFAULT_VOLUME;
        player.controls = true;

//         player.addEventListener('play',function() {
//             this.fadeIn();
//         });

        player.setPlayList = function(newPlayList) {
            playList = newPlayList;
        }

        player.setNext = function() {
            if( !playList ) return false;

            this.src = playList.nextInList();
        }

        player.addEventListener('ended',function() {
            this.setNext();
            this.play();
        });

//         player.addEventListener('timeupdate',function() {
//             if( !this.fadingOut && this.duration - this.currentTime < 5 )  {
//                 this.fadeOut();
//             }
//         });

        player.addEventListener('error',function() {
            if( playList.length > 1 ) {
                this.setNext();
                this.play();
            }
        });

        return player;
    }

    function getPlayList(callback) {

        $.get('playlist.xml',function(html) {
            var playList = new PlayList(html);

            if( !callback ) return;

            callback(playList);
        })

    }

    $(function() {

        var player = initPlayer();

        getPlayList(function(playList) {
        console.log(playList);
            if( playList.isEmpty() ) return;

            player.setPlayList(playList);
            player.setNext();
            player.play();
        });

        //player.gain();
    });

})();