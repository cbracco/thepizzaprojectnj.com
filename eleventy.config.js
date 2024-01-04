require('dotenv').config(); // Make env variables available in 11ty global data
const { DateTime } = require('luxon');
const markdownItAnchor = require('markdown-it-anchor');
const eleventyAutoCacheBuster = require('eleventy-auto-cache-buster');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginBundle = require('@11ty/eleventy-plugin-bundle');
const pluginNavigation = require('@11ty/eleventy-navigation');
const { EleventyHtmlBasePlugin } = require('@11ty/eleventy');

const pluginImages = require('./eleventy.config.images.js');

const postcss = require('postcss');
const postcssrc = require('postcss-load-config');
const htmlmin = require('html-minifier');

module.exports = function (eleventyConfig) {
    // Copy static files to the output folder
    eleventyConfig.addPassthroughCopy({
        './src/static': '/',
    });
    eleventyConfig.addPassthroughCopy('CNAME');

    // Run Eleventy when these files change:
    // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget('src/**/*.{svg,webp,png,jpeg}');
    // Watch changes to static assets
    eleventyConfig.addWatchTarget('src/static');
    eleventyConfig.addNunjucksAsyncFilter('postcss', async (content, callback) => {
        let { plugins } = await postcssrc();
        console.log(plugins);
        let result = await postcss(plugins).process(content, {
            from: './src/styles/index.css',
        });
        callback(null, result.css);
    });

    // App plugins
    eleventyConfig.addPlugin(pluginImages);

    // Official plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(pluginBundle);

    eleventyConfig.addTransform('htmlmin', function (content) {
        // Prior to Eleventy 2.0: use this.outputPath instead
        if (this.page.outputPath && this.page.outputPath.endsWith('.html')) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true,
            });
            return minified;
        }

        return content;
    });

    // Unofficial plugins
    eleventyConfig.addPlugin(eleventyAutoCacheBuster);

    // Format times from EventBrite API
    eleventyConfig.addFilter('humanizeDate', (dateObj) => {
        console.log(dateObj);
        return DateTime.fromISO(dateObj).toLocaleString(DateTime.DATE_FULL); // October, 13, 2023
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

    // Revert back to browser-sync to get true hot reloading for CSS
    eleventyConfig.setServerOptions({
        module: '@11ty/eleventy-server-browsersync',
        files: ['_site/styles'],
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
            input: 'src', // default: "."
            includes: '_includes', // default: "_includes"
            data: '_data', // default: "_data"
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
