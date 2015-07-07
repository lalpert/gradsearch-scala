# Re:search #

## About ##
Re:search is a website that lets you enter your research interests (such as "robotics", "mechanical engineering", or "systems biology") and find professors who are researching similar things.

To use Re:search, enter a research interest, department, university, or professor's name into the search bar. Re:search will display professors who match your query. Click on a professor to see their full profile, including a research summary, awards, and publications. If you register for the site, you can bookmark professors and save searches to view later.

See it in action at [gradschoolsearch.org](http://www.gradschoolsearch.org)

## Tech Stack ##

* Backend: [Scala](http://www.scala-lang.org/), [Scalatra](http://www.scalatra.org)
* Database: [MySQL](http://www.mysql.com/)
* Frontend: [React](http://facebook.github.io/react/)

Professor data was scraped from university websites. We're in the process of updating our data and scraping tools.

## Contributing ##

We'd love help with:
* Building new features. Take a look at [the current issues](https://github.com/lalpert/gradsearch-scala/issues) to see things we know are missing.
* Scrape data. We load data in a pretty straightforward JSON format. Ping us personally if you want more info.
* File an issue. If it's broken or something you want to see, let us know!

## Build & Run ##
Re:search requires a locally running mysql. Install mysql onto your local system for running gradsearch. Use the Scala build tool (sbt) to run Re:search locally.

```sh
$ cd gradsearch
$ ./prep-db.sh   (enter password)
$ brew install nodejs # or however you install node
$ npm install -g browserify
$ npm install -g watchify
$ ./sbt
> container:start
> browse
```

If `browse` doesn't launch your browser, manually open [http://localhost:8080/](http://localhost:8080/) in your browser.
