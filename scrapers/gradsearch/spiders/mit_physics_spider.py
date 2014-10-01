import scrapy
import urlparse
from gradsearch.items import Professor

class MitPhysicsSpider(scrapy.Spider):
	name = "mit_physics"
	allowed_domains = ["mit.edu"]
	start_urls = ["http://web.mit.edu/Physics/people/faculty/index_ie.html"]

	def cleanup(self, sel):
		return sel.xpath('normalize-space(text())').extract()

	def parse(self, response):
		urls = [url for url in response.xpath('//div[@id="col2"]').xpath('.//a/@href').extract() if not url.startswith('http')]
		
		for href in urls:
			yield scrapy.Request(urlparse.urljoin(response.url, href), callback = self.parse_prof)
					
	
	def parse_prof(self, response):		
		name = response.xpath('//td/p/text()')[0].extract().strip()
		keywords =  response.xpath('//h3[1]/following-sibling::p[1]/a/text()').extract()
		image = urlparse.urljoin(response.url, response.xpath('//td[@width="200"]/img/@src').extract()[0])
		
		research_summary = ''.join(response.xpath("//h3[2]/following-sibling::node()[count(.|//h3[3]/preceding-sibling::node())=count(//h3[3]/preceding-sibling::node())]").extract())

		department = "Physics"

		yield Professor(
			name = name,
		 	keywords = keywords, 
			school = "MIT", 
			image = image, 
			research_summary = research_summary,
			department = department)
