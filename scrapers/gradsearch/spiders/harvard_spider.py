import scrapy
import urlparse
from gradsearch.items import Professor

class HbsSpider(scrapy.Spider):
	name = "hbs"
	allowed_domains = ["hbs.edu"]
	start_urls = ["http://www.hbs.edu/faculty/Pages/browse.aspx"]

	def cleanup(self, sel):
		return sel.xpath('normalize-space(text())').extract()

	def parse(self, response):
		for sel in response.xpath("//div[@class='name']/a"):
			name = sel.xpath('normalize-space(text())').extract()[0]
			href = sel.xpath('normalize-space(@href)').extract()[0]
			yield scrapy.Request(urlparse.urljoin(response.url, href), callback = self.parse_prof)

	def parse_prof(self, response):
		name = response.xpath("normalize-space(//h1[@class='author'])").extract()[0]
		keywords = [sel.xpath('normalize-space(text())').extract()[0] for sel in response.xpath("//ul[@class='aoi-list']/li/a")]
		research_summary = ''.join(response.xpath("//div[@class='fullbio']/node()").extract()[:-2])
		image = response.xpath("//div[@class='photo']/a/img/@src").extract()[0]
		department = ', '.join(response.xpath("//div[@class='contact-info']/p[1]/a/node()").extract())

		yield Professor(
			name = name,
		 	keywords = keywords, 
			school = "Harvard Business School", 
			image = image, 
			research_summary = research_summary,
			department = department)

