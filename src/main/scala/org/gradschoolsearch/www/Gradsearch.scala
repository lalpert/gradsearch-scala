package org.gradschoolsearch.www

import org.scalatra._
import scalate.ScalateSupport

// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._


case class Professor(name:String, school:String)

class Gradsearch extends GradsearchStack with JacksonJsonSupport{
  // Sets up automatic case class to JSON output serialization, required by
  // the JValueResult trait.
  protected implicit val jsonFormats: Formats = DefaultFormats

  // Before every action runs, set the content type to be in JSON format.
  before() {
    contentType = formats("json")
  }


  get("/") {
    contentType="text/html"
    ssp("/home")
  }

  get("/search") {
    contentType="text/html"
    val searchString = request.getParameter("q")
    ssp("/search", "search" -> searchString)
  }

  get("/results") {
    // TODO: Get search results from db
    // For now, just use these fake results
    val prof1 = Professor("Leah Alpert", "MIT")
    val prof2 = Professor("Russell Cohen", "MIT")
    val profs = List(prof1, prof2)
    profs
  }
}
