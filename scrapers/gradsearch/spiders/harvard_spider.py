import scrapy

class HarvardSpider(scrapy.Spider):
	name = "harvard"
	allowed_domains = "http://www.hbs.edu"
	start_urls = ["http://www.hbs.edu/faculty/Pages/browse.aspx"]

	def parse(self, response):
		for sel in response.xpath("//div[@class='name']/a"):
			name = sel.xpath('normalize-space(text())').extract()
			link = sel.xpath('normalize-space(@href)').extract()
			print name, link
