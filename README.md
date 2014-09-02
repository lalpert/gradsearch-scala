# gradsearch #

Gradsearch requires a locally running mysql. Install mysql onto your local system for running gradsearch. Using JRebel
significantly improves reload times.
## Build & Run ##

```sh
$ cd gradsearch
$ ./prep-db.sh   (enter password)
$ ./sbt
> container:start
> browse
```

If `browse` doesn't launch your browser, manually open [http://localhost:8080/](http://localhost:8080/) in your browser.
