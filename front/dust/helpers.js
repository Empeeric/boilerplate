var dust = require('dustjs-helpers'),
    models = require('../../server/models'),
    cloudinary = require('cloudinary'),
    _ = require('lodash');


// Picture helper,
// path is assumed to be picture in the current context
// {@picture [ path="photo", width="150" height="150" crop="fill" ] /}
dust.helpers.picture = function (chunk, ctx, bodies, params) {
    params || (params = {});

    ctx = params.path
        ? ctx.get(params.path)
        : ctx.current();

    if (ctx.picture)
        ctx = ctx.picture;

    if (!ctx || !ctx.public_id)
        return chunk;

    params.format = params.format || ctx.format;

    return chunk.write(
        cloudinary.url(ctx.public_id, params)
    );
};

dust.helpers.cloudinary = function() {
    console.error('dust helpers: @cloudinary is deprecated, use @picture instead');
    return dust.helpers.picture.apply(this, arguments);
};

dust.helpers.banners = function (chunk, context, bodies, params) {
    return chunk.map(function (chunk) {
        models
            .banners
            .findOne()
            .lean()
            .exec(function (err, banners) {
                context = context.push(banners);
                chunk.render(bodies.block, context).end()
            })
    })
};


//generic helper for content with order and show fields
// filtered by navigation id (page)
['content'].forEach(function (model) {
    dust.helpers[model] = function (chunk, context, bodies, params) {
        return chunk.map(function (chunk) {

            var query = models[model]
                .where('navigation', context.get('page')._id)
                .where('show', 1)
                .sort({order: 1});

            if (params && params.limit) query.limit(params.limit);

            query
                .lean()
                .exec(function (err, items) {
                    context = context.push({items: items});
                    chunk.render(bodies.block, context).end()
                })
        })
    };
});

// generic helper for content with pagination and show fields
// filtered by navigation id (page)
['products'].forEach(function (model) {
    dust.helpers[model] = function (chunk, context, bodies, params) {
        params || (params = {});

        var config = context.get('config'),
            page = context.get('page'),
            items = [];

        return chunk.map(function (chunk) {
            var query = models[model]
                .where('show', true)
                .where('navigation', page._id)
                .sort({order: 1})
                .lean();

            models[model].paginate(query, page.query.page, params.records, function (err, content, count, pages) {
                params.records || (params.records = count);
                content.forEach(function (item, i) {
                    if (item.text) {
                        dust.loadSource(dust.compile(item.text, "content_template"));
                        dust.render('content_template', config, function (err, text) {
                            item.text = text;
                            items.push(item);
                        });
                    } else {
                        items.push(item);
                    }
                });

                context = context.push({pages: pages || 0, count: count, items: items, records: params.records});
                chunk.render(bodies.block, context);

                chunk.end();

            });
        })
    };
});

dust.helpers.menu = function (chunk, context, bodies) {
    var page = context.get('page'),
        crumbs = context.get('crumbs');

    return chunk.map(function (chunk) {
        models.navigation.findRecursive(function (err, menu) {
            menu.forEach(function (item, i) {
                item.dock = (crumbs && crumbs[0] && crumbs[0]._id.toString() === item._id.toString());
                item.last = (i + 1 == menu.length);
            });

            context = context.push({items: menu});
            chunk.render(bodies.block, context).end();
        });
    })
};

// Truncates a string. from can be 'right', 'left', or 'middle'.
// If the string is shorter than length, ellipsis will not be added.
dust.helpers.truncate = function (chunk, context, bodies, params) {
    var options = {
        length: 20,
        from: 'right',
        ellipsis: '...'
    };

    Object.merge(options, params);

    return chunk.tap(function (data) {
        return data.truncate(options.length, options.from, options.ellipsis);
    }).render(bodies.block, context).untap();
};

// Strips all HTML tags from the string.
// Tags to strip may be enumerated in the parameters, otherwise will strip all.
// example:
//  {@stripTags tags="p,br"}
//      <p>this is some<br>text</p>
//      <p><a href="http://site.com">with</><br> a link</p>
//  {/stripTags}
// result:
//  this is some text <a href="http://site.com">with</a> a link
dust.helpers.stripTags = function (chunk, context, bodies, params) {
    var tags = params.tags || '';

    return chunk.tap(function (data) {
        return data.stripTags(tags);
    }).render(bodies.block, context).untap();
};

// TODO: it's ugly now
dust.helpers.paging = function (chunk, context, bodies, params) {
    params || (params = {});
    var page = context.get('page');

    var count = params.count;
    var display = params.display || 5;
    var records = params.records;
    var current = page.query.page && page.query.page.toNumber().abs() || 1;
    var start, end, pages;
    var old_display = (display % 2 == 0) ? 1 : 0, i, half;
    var result = {
        prelink: params.link || '?page=',
        current: current,
        previous: null,
        next: null,
        first: null,
        last: null,
        range: [],
        from: null,
        to: null,
        total: count,
        pages: null
    };
    /* zero division; negative */
    if (records <= 0) {
        return chunk.render(bodies.block, context.push(result));
    }
    pages = (count / records).ceil();
    result.pages = pages;
    if (pages < 2) {
        result.from = 1;
        result.to = count;
        return chunk.render(bodies.block, context.push(result));
    }

    if (current > pages) {
        current = pages;
        result.current = current;
    }
    half = (display / 2).floor();
    start = current - half;
    end = current + half - old_display;

    if (start < 1) {
        start = 1;
        end = start + display;
        if (end > pages) {
            end = pages;
        }
    }

    if (end > pages) {
        end = pages;
        start = end - display + 1;
        if (start < 1) {
            start = 1;
        }
    }

    for (i = start; i <= end; i++) {
        result.range.push(i);
    }

    if (current > 1) {
        result.first = 1;
        result.previous = current - 1;
    }

    if (current < pages) {
        result.last = pages;
        result.next = current + 1;
    }

    result.from = (current - 1) * records + 1;
    if (current == pages) {
        result.to = count;
    } else {
        result.to = result.from + records - 1;
    }

    return chunk.render(bodies.block, context.push(result));
};


