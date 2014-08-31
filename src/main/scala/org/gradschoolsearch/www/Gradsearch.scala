package org.gradschoolsearch.www

import org.gradschoolsearch.db.{DbRoutes, Tables}
import Tables._

import org.scalatra._
import scalate.ScalateSupport

// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._

import scala.slick.driver.H2Driver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession



class Gradsearch(val db: Database) extends GradsearchStack
  with JacksonJsonSupport with DbRoutes{
  // Sets up automatic case class to JSON output serialization, required by
  // the JValueResult trait.
  protected implicit val jsonFormats: Formats = DefaultFormats

  // Before every action runs, set the content type to be in JSON format.
  before() {
    contentType = formats("json")
  }

  // Website routes
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
    db withDynSession {
      // Iterate through all profs and output them
      val searchString = request.getParameter("q").toLowerCase

      val profKeywordJoin = for {
        pk <- professorKeywords
        k <- keywords if k.id === pk.keywordId && k.keyword === searchString
        p <- professors if p.id === pk.profId
      } yield (p)

      profKeywordJoin.run
    }
  }


}
