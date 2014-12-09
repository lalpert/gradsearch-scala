import scrapy
import urlparse
import json
from gradsearch.items import Professor

class UcsfSpider(scrapy.Spider):
    name = "ucsf"
    allowed_domains=["profiles.ucsf.edu", "api.profiles.ucsf.edu"]
    start_urls=["http://profiles.ucsf.edu/sitemap.xml"]

    def is_prof_name(self, string):
        return "." in string and string.islower()

    def parse(self, response):
        response.selector.remove_namespaces()
        for link in response.xpath("//loc/text()"):
            link_text = link.extract()
            prof_name = link_text.split("/")[-1]
            if self.is_prof_name(prof_name):
                prof_url = "http://api.profiles.ucsf.edu/json/v2/?ProfilesURLName=%s&source=gradschoolsearch.org" % prof_name
                yield scrapy.Request(prof_url, callback = self.parse_prof, meta={"url_source":link_text})
            

    def parse_prof(self, response):
        info = json.loads(response.body_as_unicode())["Profiles"][0]
        yield Professor(
            name = info["Name"].split(",")[0],
            keywords = info["Keywords"], 
            school = info["School"],
            image = info["PhotoURL"], 
            research_summary = info["Narrative"], # Bio, not actually research summary
            department = info["Department"],
            title = info["Title"],
            source = response.meta["url_source"],
            )
