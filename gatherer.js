var BASE_URL = 'https://www.amazon.co.jp/gp/css/order-history';

var Gatherer = (function () {
    function Gatherer() {
        this.year = new Date().getFullYear();
        this.page = 1;
        this.result = [];
    }
    Gatherer.prototype.start = function () {
        var d = $.Deferred();
        this.onePage(d);
        return d;
    };

    Gatherer.prototype.onePage = function (d) {
        var _this = this;
        console.log('onePage: year=' + this.year + '; page=' + this.page);

        $.get(BASE_URL, { orderFilter: 'year-' + this.year, startIndex: (this.page - 1) * 10 }).then(function (html) {
            var $html = $($.parseHTML(html));
            return _this.extractResult($html, function (item) {
                console.log(item.title);
                _this.result.push(item);
            });
        }).then(function (foundAny) {
            if (foundAny) {
                _this.page++;
            } else if (_this.page == 1) {
                return true;
            } else {
                _this.page = 1;
                _this.year--;
            }

            return false;
        }).then(function (allDone) {
            if (allDone) {
                console.log('all done.');
                d.resolve(_this.result);
            } else {
                setTimeout(function () {
                    return _this.onePage(d);
                }, 1000);
            }
        }).fail(function (e) {
            console.log('FAIL ' + e);
            d.reject(e);
        });
    };

    Gatherer.prototype.extractResult = function ($html, cb) {
        var foundAny = false;

        $html.find('.action-box').each(function () {
            var date = $(this).find('.order-level h2').text();

            $(this).find('ul.shipment li').each(function () {
                foundAny = true;

                cb({
                    date: date,
                    url: $(this).find('a').attr('href'),
                    title: $.trim($(this).find('a .item-title').text()),
                    imageURL: $(this).find('a img').attr('src'),
                    author: $.trim($(this).find('.author').text()),
                    productGroup: $.trim($(this).find('.product-group-name').text())
                });
            });
        });

        return foundAny;
    };
    return Gatherer;
})();

var s = document.createElement('script');
s.src = '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js';
s.onload = function () {
    new Gatherer().start().done(function (items) {
        var tsv = items.map(function (item) {
            return [item.date, item.title, item.url, item.author, item.imageURL].join("\t");
        }).join("\n");
        location.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(tsv);
    });
};

document.documentElement.appendChild(s);
