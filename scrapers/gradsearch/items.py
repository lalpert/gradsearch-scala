# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy

#   private case class InternalFormat(school: String, name: String, research_summary: Option[String], image: Option[String], source: Option[String],
#                                     keywords: List[String], department: Option[String]
class Professor(scrapy.Item):
    name = scrapy.Field()
    school = scrapy.Field()
    department = scrapy.Field()
    image = scrapy.Field()
    research_summary = scrapy.Field()
    keywords = scrapy.Field()
    source = scrapy.Field()
    email = scrapy.Field()
    personal_website = scrapy.Field()
    lab_website = scrapy.Field()
    title = scrapy.Field()
