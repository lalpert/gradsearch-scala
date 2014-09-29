# -*- coding: utf-8 -*-

# Scrapy settings for gradsearch project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/en/latest/topics/settings.html
#


BOT_NAME = 'gradsearch'

SPIDER_MODULES = ['gradsearch.spiders']
NEWSPIDER_MODULE = 'gradsearch.spiders'
#HTTPCACHE_POLICY = 'scrapy.contrib.httpcache.RFC2616Policy'
DOWNLOADER_MIDDLEWARES = {
    'scrapy.contrib.downloadermiddleware.httpcache.HttpCacheMiddleware': 10000
}
# Crawl responsibly by identifying yourself (and your website) on the user-agent
USER_AGENT = 'gradsearch (+http://www.gradschoolsearch.org)'
HTTPCACHE_ENABLED = True
DOWNLOAD_DELAY = 1

