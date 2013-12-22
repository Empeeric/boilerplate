var dust = require('dustjs-linkedin');

// Replaces special characters in a string so that it may be used as part of a pretty URL.
// This will also replace Underscores and the hyphens from start or end of string.
// Supports all languages.
dust.filters.seo = function(value){
    return value.replace(/[\?\'\"\@\!\#\$\%\^\&\*\(\)\+\=\_\~\{\}\[\]\\\|\,\;\:]/g, "")
        .replace(/ +/g, "-")
        .replace(/\-+/g, '-')
        .replace(/(?:^\-|\-$)/g, '')
        .toLowerCase();
};

// Create new br tag for each line in a string
// Join empty multiple lines to one br tag
dust.filters.br = function(value){
    return value.replace('\r', '').replace('\n\n', '\n').split('\n').join('<br />');
};

// Create new br tag for each line in a string
// Join empty multiple lines to one br tag
dust.filters.brs = function(value){
    return value.replace(/\r\n/g, "<br />");
};

// Convert to Lower case
dust.filters.lc = function(value){
    return value.toLowerCase();
};

// Strips all HTML tags from the string.
dust.filters.st = function(value) {
    return value.stripTags().replace(/\&nbsp\;/igm, ' ').compact();
};

// Create new p section from each paragraph in a string
dust.filters.ps = function(value){
    return '<p>' + value.paragraphs().join('</p><p>') + '</p>';
};

// Converts underscores and camel casing to hyphens

dust.filters.dz = function(value){
    return value.dasherize();
};

// Compacts all white space in the string to a single space and trims the ends.
dust.filters.c = function(value){
    return value.compact();
};

// Creates a human readable string. Capitalizes the first word and turns underscores
// into spaces and strips a trailing '_id', if any. Like String#titleize,
// this is meant for creating pretty output.
dust.filters.hz = function(value){
    return value.humanize();
};

// Replaces special characters in a string so that it may be used as part of a pretty URL.
// Don't support other languages than English
dust.filters.pz = function(value){
    return value.parameterize();
};

// Reverses the string.
dust.filters.r = function(value){
    return value.reverse();
};

// Converts camel case, underscores, and hyphens to a properly spaced string.
dust.filters.sy = function(value){
    return value.spacify();
};

// Trim
// Removes leading and/or trailing whitespace from the string.
// Whitespace is defined as line breaks, tabs,
// and any character in the "Space, Separator" Unicode category, conforming to the the ES5 spec.
// The standard trim method is only added when not fully supported natively.
dust.filters.t = function(value){
    return value.trim();
};

// Trim Left
dust.filters.tl = function(value){
    return value.trimLeft();
};

// Trim Right
dust.filters.tr = function(value){
    return value.trimRight();
};

// Restores escaped characters in a URL escaped string
dust.filters.dc = function(value){
    return value.unescapeURL();
};

// format as number.
dust.filters.f = function(value){
    return value.format();
};


