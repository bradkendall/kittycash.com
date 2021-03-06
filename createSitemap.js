//Make babel-register ignore .svg and .png files
require.extensions['.svg'] = () => {};
require.extensions['.png'] = () => {};

require('babel-core/register');
require('babel-polyfill');

const fs = require('fs');
const hostname = 'https://www.kittycash.com';

//Load in the React Routes Config to create the main page sitemap
const RouteConfig = require('./src/components/Routes/Config.js').default;

const urls = []
for (var i = 0; i < RouteConfig.routes.length; i++)
{
	var route = RouteConfig.routes[i];
	var obj = {url: '/' + route.path + '/', changefreq: 'daily', priority: 0.4};
	urls.push(obj);
}

//Load the rss feed from the blog to make the sitemap for all blog posts
const Parser = require('rss-parser');
const parser = new Parser();
 
(async () => {
 
  const feed = await parser.parseURL(hostname + '/blog/index.xml');
 
  feed.items.forEach(item => {
  	//Strip the protocol and hostname from the rss url.
    var path = item.link.replace(hostname,"");
    var obj = {url: path, changefreq: 'monthly', priority: 0.5};
    urls.push(obj);
  });

  writeSitemap(hostname, urls);
  writeRobots(hostname);
 
})();

function writeSitemap(hostname, urls)
{
	const sm = require('sitemap');

	const sitemap = sm.createSitemap ({
	      hostname: hostname,
	      cacheTime: 600000,  // 600 sec cache period 
	      urls: urls
	    });

	fs.writeFileSync("./public/sitemap.xml", sitemap.toString());
}

function writeRobots(hostname)
{
	const robotstxt = require("generate-robotstxt").default;

	robotstxt({
	  policy: [
	    {
	      userAgent: "*",
	      allow: "/"
	    }
	  ],
	  sitemap: hostname + "/sitemap.xml",
	  host: hostname
	}).then(content => {
	  fs.writeFileSync("./public/robots.txt", content);
	});
}
