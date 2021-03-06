var Tm = Tm || {};

/**
 *  No jQuery using
 *
 * @param  {[type]} global [description]
 * @return {[type]}        [description]
 */
Tm.util = (function(global) {

    // Для Safari
    global.URL = global.URL || global.webkitURL;



    /**
     * Alias of Tm.util.namespace()
     *
     * @return {[type]} [description]
     */
    global.Tm.ns = function() {

        return global.Tm.util.namespace.apply(global, arguments);
    }


    /**
     * Detect browser & os
     *
     * @return {[type]} [description]
     */
    var browser = (function() {
        var ua, engine, vendor, os, mobile;

        ua = navigator.userAgent.toLowerCase();
        engine = ua.match(/(webkit|gecko|presto|trident)/ig);
        vendor = ua.match(/(firefox|safari|chrome|opera|msie)/ig);
        os = ua.match(/(os\sx|windows|linux)/ig);
        mobile = ua.match(/(mobile)/ig);

        try {
            engine = (engine && engine[0].toLowerCase()) || 'unknown';
            vendor = (vendor && vendor[0].toLowerCase()) || 'unknown';
            os = (os && os[0].replace(' ', '').toLowerCase()) || 'unknown';
            mobile = (mobile ? true : false);
        }
        catch(e) {
            global.console && console.log(e, e.message);
        }

        return {
            engine: engine, // webkit | gecko | presto | trident
            vendor: vendor, // firefox | safari | chrome | opera | msie
            os: os,         // windows | linux | osx
            mobile: mobile  // true | false
        }
    })();


    /**
     * Включает загрузку "ленивых" картинок (у которых @src="/i/px.gif" @data-src="/f/image-url.png")
     *
     * body/@data-lazyimageload включает автозагрузку, без принудительного вызова из js
     *
     * Нужен img/@data-ratio="[ w / h ]", для корректного выставления высоты до загрузки
     *
     * @return {[type]} [description]
     */
    var lazyImageLoad = function() {
        var imgs, imgi, len, src, img, ratio, widthReal, heightReal, widthNew, heightNew,
            imgsPending = [];

        function onloadHandler() {
            var i = this.getAttribute('data-i');

            // console.log(this, i);

            imgs[i].src = this.src;
            imgs[i].style.width = 'auto';
            imgs[i].style.height = 'auto';
        }

        imgs = global.document.getElementsByTagName('img');
        len = imgs.length;

        if(len) {
            for(var i = 0; i < len; i++) {
                imgi = imgs[i];
                src = imgi.getAttribute('data-src');
                ratio = imgi.getAttribute('data-ratio');
                // Соотношение есть
                if(ratio) {
                    widthReal = imgi.getAttribute('width');
                    heightReal = imgi.getAttribute('height');
                    widthNew = imgi.parentNode.offsetWidth;
                    // Ширина меньше контейнера, ок, выставим реальное и не паримся
                    if(widthReal <= widthNew) {
                        widthNew = widthReal;
                        heightNew = heightReal;
                    }
                    // Не, картинка шире, надо посчитать высоту
                    else {
                        heightNew = Math.round(widthNew / ratio);
                    }
                }
                // console.log(ratio, imgi.parentNode, widthReal, 'x', heightReal, ' | ', widthNew, 'x', heightNew);
                if(src) {
                    img = new Image();
                    img.onload = onloadHandler;
                    img.setAttribute('data-i', i);

                    imgi.style.width = widthNew + 'px';
                    imgi.style.height = heightNew + 'px';

                    // img.src = src;
                    imgsPending.push({
                        img: img,
                        src: src
                    });
                    // imgi.src = src;
                }
            }
            global.onload = function() {
                var len = imgsPending.length;

                // console.log(imgsPending);
                if(len) {
                    for(var i = 0; i < len; i++) {
                        imgsPending[i].img.src = imgsPending[i].src;
                    }
                }
            }
        }
    };

    // check lazy image load option
    if(global.document.body && global.document.body.getAttribute('data-lazyimageload') !== null) {
        lazyImageLoad();
    }




    return {


        browser: function() {

            return browser;
        },


        /**
         * Create namespaces
         *
         * Usage:
         *     Tm.util.namespace('parent.child.subchild');
         *     Tm.util.namespace('parent.child.subchild', 'ns1.ns2.ns3');
         *
         * @return {[type]} [description]
         */
        namespace: function() {
            var i, j, d,
                arg = arguments,
                o = null;

            for(i = 0; i < arg.length; i = i + 1) {
                d = arg[i].split('.');
                o = window;
                for(j = 0; j < d.length; j = j + 1) {
                    o[ d[j] ] = o[ d[j] ] || {};
                    o = o[ d[j] ];
                }
            }

            return o;
        },


        /**
         * Strip tags from string
         *
         * @param  {string} str [description]
         * @return {[type]}     [description]
         */
        stripTags: function(str) {
            return !str ? str : String(str).replace(/<\/?[^>]+>/gi, '');
        },


        /**
         * [trim description]
         *
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        trim: function(str) {
            return str ? str.replace(/^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g, '') : str;
        },


        /**
         * [nl2br description]
         *
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        nl2br: function(str) {
            return str ? str.replace(/\r?\n/g, '<br/>') : str;
        },


        /**
         * [br2nl description]
         *
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        br2nl: function(str) {
            return str ? str.replace(/<br(\s*\/?)>/g, '\r\n') : str;
        },


        /**
         * Возвращает название месяца
         *
         * @param  {number} monthNum порядковый номер месяца ( 1 .. 12 )
         * @param  {number} type тип названия ( full | full2 )
         * @param  {number} lang на каком языке возвращать ( ru )
         * @return {string} если не нашли, то -1
         */
        getMonthName: function(monthNum, type, lang) {
            var MONTH_NAMES;

            MONTH_NAMES = {
                ru: {
                    full: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
                    full2: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
                }
            };

            type = type || 'full';
            lang = lang || 'ru';

            if(monthNum >= 1 && monthNum <= 12) {
                return MONTH_NAMES[lang][type][monthNum - 1];
            }

            return -1;
        },


        /**
         * [getHumanSize description]
         *
         * @param  {[type]} size [description]
         *
         * @return {[type]}      [description]
         */
        getHumanSize: function(size, type, lang) {
            var SUFFIX;

            SUFFIX = {
                ru: {
                    short: ['байт', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'],
                    long: ['байт', 'Килобай', 'Мегабайт', 'Гигабайт', 'Терабай', 'Петабайт']
                },
                en: {
                    short: ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
                    long: ['bytes', 'Kilobytes', 'Megabytes', 'Gigabytes', 'Terabytes', 'Petabytes']
                }
            },
            c = 0;

            type = type || 'short';
            lang = lang || 'ru';

            while(size >= 1024) {
                size = size / 1024;
                c++;
            }

            return Tm.util.numberFormat(Math.round(size * 10) / 10, 0, ',', ' ') + ' ' + SUFFIX[lang][type][c];
        },


        /**
         * форматирует вывод числа, аналог number_format() в PHP
         *
         * @param  {[type]} number        [description]
         * @param  {[type]} decimals      [description]
         * @param  {[type]} decPoint     [description]
         * @param  {[type]} thousandsSep [description]
         *
         * @return {[type]}               [description]
         */
        numberFormat: function(number, decimals, decPoint, thousandsSep) {
            var i, z, temp, sign, integer, fractional,
                exponent = '',
                numberstr = number.toString(),
                eindex = numberstr.indexOf('e');

            if(number) {
                thousandsSep || (thousandsSep = ' ');

                if(eindex > -1) {
                    exponent = numberstr.substring(eindex);
                    number = parseFloat(numberstr.substring(0, eindex));
                }

                decimals || (decimals = 0);
                if(decimals !== null) {
                    temp = Math.pow(10, decimals);
                    number = Math.round(number * temp) / temp;
                }
                sign = (number < 0 ? '−' : '');
                integer = (number > 0 ? Math.floor(number) : Math.abs(Math.ceil(number))).toString();

                fractional = number.toString().substring(integer.length + sign.length);
                decPoint = (decPoint !== null ? decPoint : '.');
                fractional = (decimals !== null && decimals > 0 || fractional.length > 1 ? decPoint + fractional.substring(1) : '');
                if(decimals !== null && decimals > 0) {
                    for(i = fractional.length - 1, z = decimals; i < z; ++i) {
                        fractional += '0';
                    }
                }

                thousandsSep = ((thousandsSep != decPoint || fractional.length === 0) ? thousandsSep : null);
                if(thousandsSep !== null && thousandsSep !== '') {
                    for (i = integer.length - 3; i > 0; i -= 3) {
                        integer = integer.substring(0, i) + thousandsSep + integer.substring(i);
                    }
                }

                result = sign + integer + fractional + exponent;
            }

            return result;
        },


        /**
         * Extends objects
         *
         * @param  {object} dummy. Любое кол-во расширяемых объектов: obj, obj2, ..., objN
         *
         * @return {[type]} [description]
         */
        extend: function(dummy) {
            var i, key;

            for(i = 1; i < arguments.length; i++) {
                for(key in arguments[i]) {
                    if(arguments[i].hasOwnProperty(key)) {
                        arguments[0][key] = arguments[i][key];
                    }
                }
            }

            return arguments[0];
        },


        /**
         * Вешает варнинг на обновление, закрытие или уход со страницы
         *
         * @param  {[type]} msg если сообщение пустое, то хэндлер прибивается
         * @return {[type]}     [description]
         */
        reloadWarning: function(msg) {
            if(msg) {
                global.onbeforeunload = function() {
                    return msg;
                }
            }
            else {
                global.onbeforeunload = null;
            }
        },


        /**
         * Checking type of JS item
         * http://tech.yandex.ru/events/yac/2013/talks/1116/
         *
         * @param  {[type]} o [description]
         * @return {[type]}   [description]
         */
        typeOf: function(o) {
            var match, type;

            if(o && o.nodeType === 1) {
                type = 'element';
            }

            match = Object.prototype.toString.call(o).match(/\[object (.*?)\]/);
            type = match[1].toLowerCase();

            if(type === 'number' && isNaN(o)) {
                type = 'nan';
            }

            return type;
        },


        /**
         * [parseUrl description]
         *
         * @param  {[type]} url [description]
         *
         * @return window.location (https://developer.mozilla.org/en-US/docs/Web/API/window.location)
         */
        parseUrl: function(url) {
            var a = document.createElement('a');

            a.href = url;

            return a;
        },



        lazyImageLoad: lazyImageLoad

    };

})(window, undefined);
