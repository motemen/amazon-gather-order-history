/// <reference path="../d.ts/DefinitelyTyped/jquery/jquery.d.ts" />

var BASE_URL = 'https://www.amazon.co.jp/gp/css/order-history';

interface Item {
    date:         string;
    url:          string;
    title:        string;
    imageURL:     string;
    author:       string;
    productGroup: string;
}

class Gatherer {
    year : number;
    page : number;
    result : Array<Item>;

    constructor () {
        this.year = new Date().getFullYear();
        this.page = 1;
        this.result = [];
    }

    start () : JQueryDeferred<Array<Item>> {
        var d = $.Deferred();
        this.onePage(d);
        return d;
    }

    onePage (d : JQueryDeferred<Array<Item>>) {
        console.log('onePage: year=' + this.year + '; page=' + this.page);

        $.get(BASE_URL, { orderFilter: 'year-' + this.year, startIndex: (this.page - 1) * 10 })

        .then(html => {
            var $html = $($.parseHTML(html));
            return this.extractResult($html, (item : Item) => { console.log(item.title); this.result.push(item) });
        })
        .then((foundAny : Boolean) => {
            if (foundAny) {
                this.page++;
            } else if (this.page == 1) {
                return true;
            } else {
                this.page = 1;
                this.year--;
            }

            return false;
        })
        .then((allDone : Boolean) => {
            if (allDone) {
                console.log('all done.');
                d.resolve(this.result);
            } else {
                setTimeout(() => this.onePage(d), 1000);
            }
        })
        .fail((e) => {
            console.log('FAIL ' + e);
            d.reject(e);
        })
    }

    extractResult ($html : JQuery, cb : (item : Item) => void) {
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
    }
}

var s = document.createElement('script');
    s.src = '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js'
    s.onload = () => {
        new Gatherer().start().done(items => {
            var tsv = items.map((item : Item) => {
                return [ item.date, item.title, item.url, item.author, item.imageURL ].join("\t");
            }).join("\n");
            location.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(tsv);
        });
    };

document.documentElement.appendChild(s);
