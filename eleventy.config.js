require('dotenv').config(); // Make env variables available in 11ty global data
const { DateTime } = require('luxon');
const markdownItAnchor = require('markdown-it-anchor');
const eleventyAutoCacheBuster = require("eleventy-auto-cache-buster");
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginBundle = require('@11ty/eleventy-plugin-bundle');
const pluginNavigation = require('@11ty/eleventy-navigation');
const { EleventyHtmlBasePlugin } = require('@11ty/eleventy');

const pluginImages = require('./eleventy.config.images.js');

const postCss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const postcssFilter = (cssCode, done) => {
    const plugins = [
        require('autoprefixer')
    ];
    if (process.env.NODE_ENV === 'production') {
        plugins.push(require('cssnano')({ preset: 'default' }));
    }
    postCss(plugins)
        .process(cssCode, {
            from: './public/css/index.css'
        })
        .then(
            (r) => done(null, r.css),
            (e) => done(e, null)
        );
};

module.exports = function (eleventyConfig) {
    // Copy the contents of the `public` folder to the output folder
    // For example, `./public/css/` ends up in `_site/css/`
    eleventyConfig.addPassthroughCopy({
        './public/': '/',
    });
    eleventyConfig.addPassthroughCopy('CNAME');

    // Run Eleventy when these files change:
    // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget('content/**/*.{svg,webp,png,jpeg}');
    // Watch changes to static assets
    eleventyConfig.addWatchTarget('public/');
    eleventyConfig.addNunjucksAsyncFilter('postcss', postcssFilter);

    // App plugins
    eleventyConfig.addPlugin(pluginImages);

    // Official plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(pluginBundle);

    // Unofficial plugins
    eleventyConfig.addPlugin(eleventyAutoCacheBuster);

    // Add a collection for single-page navigation
    eleventyConfig.addCollection('sections', function(collectionApi) {
        return sections = collectionApi.getFilteredByGlob('content/sections/*.*');
    });

    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
    });

    // Format times from EventBrite API
    eleventyConfig.addFilter("humanizeDate", (dateObj) => {
        console.log(dateObj);
        return DateTime.fromISO(dateObj).toLocaleString(DateTime.DATE_FULL); // October, 13, 2023
    });

    // Format times from EventBrite API
    eleventyConfig.addFilter("humanizeTime", (dateObj) => {
        console.log(dateObj);
        return DateTime.fromISO(dateObj).toLocaleString(DateTime.TIME_SIMPLE); // 3PM
    });

    // Customize Markdown library settings:
    eleventyConfig.amendLibrary('md', (mdLib) => {
        mdLib.use(markdownItAnchor, {
            permalink: markdownItAnchor.permalink.ariaHidden({
                placement: 'after',
                class: 'header-anchor',
                symbol: '#',
                ariaHidden: false,
            }),
            level: [1, 2, 3, 4],
            slugify: eleventyConfig.getFilter('slugify'),
        });
    });

    // Features to make your build faster (when you need them)

    // If your passthrough copy gets heavy and cumbersome, add this line
    // to emulate the file copy on the dev server. Learn more:
    // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

    // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

    eleventyConfig.setServerOptions({
        liveReload: true,
        domDiff: true,
        showVersion: false,
    });

    return {
        // Control which files Eleventy will process
        // e.g.: *.md, *.njk, *.html, *.liquid
        templateFormats: ['md', 'njk', 'html', 'liquid'],

        // Pre-process *.md files with: (default: `liquid`)
        markdownTemplateEngine: 'njk',

        // Pre-process *.html files with: (default: `liquid`)
        htmlTemplateEngine: 'njk',

        // These are all optional:
        dir: {
            input: 'content', // default: "."
            includes: '../_includes', // default: "_includes"
            data: '../_data', // default: "_data"
            output: '_site',
        },

        // -----------------------------------------------------------------
        // Optional items:
        // -----------------------------------------------------------------

        // If your site deploys to a subdirectory, change `pathPrefix`.
        // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

        // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
        // it will transform any absolute URLs in your HTML to include this
        // folder name and does **not** affect where things go in the output folder.
        pathPrefix: '/',
    };
};
