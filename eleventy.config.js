const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	// RSS plugin
	eleventyConfig.addFilter("dateToRfc3339", pluginRss.dateToRfc3339);
	eleventyConfig.addFilter("getNewestCollectionItemDate", pluginRss.getNewestCollectionItemDate);

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(typeof format == "string" ? format : "LLLL dd, yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for(let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "post", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("concat", function() {
		var arg = Array.prototype.slice.call(arguments, 0);
		arg.pop();
		return arg.join('');
	});

	eleventyConfig.addFilter("encodeURI", (uri) => encodeURIComponent(uri));
	eleventyConfig.addFilter("slice", (arr, start, end) => arr.slice(start, typeof end == "number" ? end : undefined));
	eleventyConfig.addFilter("getNavHrefs", (hrefs, currentPage) => {
		var start = Math.max(0, currentPage - 4 + Math.min(2, hrefs.length - currentPage - 1));
		var end = currentPage + 5 - Math.min(2, currentPage);
		return hrefs.slice(start, end).map((v, i) => [v, start + i + 1]);
	});
	eleventyConfig.addFilter("inc", value => value + 1);
	eleventyConfig.addFilter("gt", (v1, v2) => v1 > v2);
	eleventyConfig.addFilter("eq", (v1, v2) => v1 == v2);
	eleventyConfig.addFilter("neq", (v1, v2) => v1 != v2);
	eleventyConfig.addHandlebarsHelper("reverse", arr => arr.slice().reverse());

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor material-symbols-outlined",
				symbol: "\ue157",
				ariaHidden: false,
			}),
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		});
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		templateFormats: [ "hbs", "md" ],
		markdownTemplateEngine: "hbs",
		htmlTemplateEngine: "hbs",
		dir: {
			input: "blog",
            includes: "partials"
		}
	};
};