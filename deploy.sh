#!/bin/bash
./sbt package
rsync ./target/scala-2.11/gradsearch_2.11-0.1.0-SNAPSHOT.war gradsearch@gradschoolsearch.org:ROOT.war
rsync -r -L ./src/main/resources/data gradsearch@gradschoolsearch.org:data
