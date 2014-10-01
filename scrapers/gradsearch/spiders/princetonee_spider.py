import scrapy
import urlparse
from gradsearch.items import Professor

class PrincetonEESpider(scrapy.Spider):
	name = "princeton_ee"
	allowed_domains = ["princeton.edu"]
	start_urls = ["http://ee.princeton.edu/people/faculty"]

	def cleanup(self, sel):
		return sel.xpath('normalize-space(text())').extract()

	def parse(self, response):
		for prof_box in response.css(".views-row"):
			href = prof_box.xpath('./div/span/a/@href').extract()
			if href:
				yield scrapy.Request(urlparse.urljoin(response.url, href[0]), callback = self.parse_prof)
					
	
	def parse_prof(self, response):
		name = response.css('.node').xpath('.//h1/text()').extract()[0]
		keywords = response.css('h4.core-areas').xpath('./a/text()').extract() # TODO: can also get "application thrusts"
		research_summary = ''.join(response.css('.field').xpath('./div/div/node()').extract()[1:])
		image = response.css('.node').xpath('.//img/@src').extract()[0]
		department = "Electrical Engineering"

		yield Professor(
			name = name,
		 	keywords = keywords, 
			school = "Princeton", 
			image = image, 
			research_summary = research_summary,
			department = department)

