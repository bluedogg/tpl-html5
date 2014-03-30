'use strict';


describe('Tm.util.browser', function() {
    it('should return object {engine, vendor, os, mobile} with not empty values', function() {
        expect(Tm.util.browser().vendor).not.toBe('');
        expect(Tm.util.browser().engine).not.toBe('');
        expect(Tm.util.browser().os).not.toBe('');
        expect(Tm.util.browser().mobile).not.toBe('');
    });
    it('should return correct values', function() {
        expect(Tm.util.browser().vendor).toBe('safari');
        expect(Tm.util.browser().engine).toBe('webkit');
        expect(Tm.util.browser().os).toBe('osx');
        expect(Tm.util.browser().mobile).toBe(false);
    });
});





describe('Tm.util.namespace', function() {
    it('should return object with namespace', function() {
        expect(Tm.util.namespace('Ns', 'Parent1.child1.child2', 'Parent2.child1.child2.child3'));
    });
    afterEach(function() {
        expect(window.Ns).toBeDefined();
        expect(window.Parent1.child1.child2).toBeDefined();
        expect(window.Parent2.child1.child2.child3).toBeDefined();
    });
});

describe('Tm.util.stripTags', function() {
    it('should return string without tags', function() {
        expect(Tm.util.stripTags('<b>text</b><script>script</script>')).toBe('textscript');
    });
});

describe('Tm.util.trim', function() {
    it('should return trimmed string', function() {
        expect(Tm.util.trim(' text super   ')).toBe('text super');
    });
});

describe('Tm.util.nl2br', function() {
    it('should return nl, converted to <br/>', function() {
        expect(Tm.util.nl2br("line1\nline2\r\n\nline3")).toBe('line1<br/>line2<br/><br/>line3');
    });
});

describe('Tm.util.getMonthName', function() {
    it('should return month name Январь', function() {
        expect(Tm.util.getMonthName(1, 'full', 'ru')).toBe('Январь');
    });
    it('should return -1 for 13rd month', function() {
        expect(Tm.util.getMonthName(13)).toEqual(-1);
    });
});

describe('Tm.util.getHumanSize', function() {
    it('should return 100 bytes', function() {
        expect(Tm.util.getHumanSize(100, 'short', 'en')).toBe('100 bytes');
    });
    it('should return 2 KB', function() {
        expect(Tm.util.getHumanSize(2048, 'short', 'en')).toBe('2 KB');
    });
    it('should return 2 MB', function() {
        expect(Tm.util.getHumanSize(2097280, 'short', 'en')).toBe('2 MB');
    });
    it('should return 2 GB', function() {
        expect(Tm.util.getHumanSize(2147614720, 'short', 'en')).toBe('2 GB');
    });
    it('should return 2 TB', function() {
        expect(Tm.util.getHumanSize(2199157473280, 'short', 'en')).toBe('2 TB');
    });
    it('should return 2 PB', function() {
        expect(Tm.util.getHumanSize(2199157473280 * 1024, 'short', 'en')).toBe('2 PB');
    });

    it('should return 100 байт', function() {
        expect(Tm.util.getHumanSize(100, 'short', 'ru')).toBe('100 байт');
    });
    it('should return 2 КБ', function() {
        expect(Tm.util.getHumanSize(2048, 'short', 'ru')).toBe('2 КБ');
    });
    it('should return 2 МБ', function() {
        expect(Tm.util.getHumanSize(2097280, 'short', 'ru')).toBe('2 МБ');
    });
    it('should return 2 ГБ', function() {
        expect(Tm.util.getHumanSize(2147614720, 'short', 'ru')).toBe('2 ГБ');
    });
    it('should return 2 ТБ', function() {
        expect(Tm.util.getHumanSize(2199157473280, 'short', 'ru')).toBe('2 ТБ');
    });
    it('should return 2 ПБ', function() {
        expect(Tm.util.getHumanSize(2199157473280 * 1024, 'short', 'ru')).toBe('2 ПБ');
    });
});
