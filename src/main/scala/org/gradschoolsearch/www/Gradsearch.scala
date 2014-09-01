package org.gradschoolsearch.www

import org.gradschoolsearch.db.{DbRoutes, Tables}
import Tables._
import org.gradschoolsearch.models.Professor

import org.scalatra._
import scalate.ScalateSupport

// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._

import scala.slick.driver.H2Driver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession

case class ResultCounts(category: String, counts: Map[String, Int])
case class Results(professors: Seq[Professor], counts: Seq[ResultCounts])

class Gradsearch(val db: Database) extends GradsearchStack
  with JacksonJsonSupport with DbRoutes {
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
      val searchString = params("q").toLowerCase
      val schoolFilter = multiParams("University")
      val deptFilter = multiParams("Department")

      def schoolFilterFunc(prof: Professor):Boolean = schoolFilter.isEmpty || schoolFilter.contains(prof.school)
      def deptFilterFunc(prof: Professor):Boolean = deptFilter.isEmpty || deptFilter.contains(prof.department)

      def matches(field: Column[String]) = field.toLowerCase.startsWith(searchString) || field.toLowerCase.endsWith(searchString)

      val profKeywordJoin = for {
        pk <- professorKeywords
        k <- keywords if k.id === pk.keywordId && matches(k.keyword)
        p <- professors if p.id === pk.profId
      } yield p

      val profFilter = for {
        p <- professors if matches(p.name) || matches(p.school) || matches(p.department)
      } yield p

      // All professors matching the search term
      val professorResults = (profKeywordJoin union profFilter).run

      // Get counts for all possible filters
      type ProfFilter = Professor => Boolean

      def matchesFilters(prof: Professor, filters: Seq[ProfFilter]):Boolean = {
        filters.forall(filter => filter(prof))
      }

      def getCount(category: String, otherFilters: Seq[ProfFilter], lens: Professor => String) = {
        val filteredProfs = professorResults.filter(prof => matchesFilters(prof, otherFilters))
        ResultCounts(category, filteredProfs.groupBy(lens).mapValues(_.length))
      }

      val uniCounts = getCount("University", List(deptFilterFunc _), _.school)
      val deptCounts = getCount("Department", List(schoolFilterFunc _), _.department)

      // Actually do the filtering
      val allFilters = List(deptFilterFunc _, schoolFilterFunc _)
      val filteredProfs = professorResults.filter(prof => matchesFilters(prof, allFilters))

      Results(filteredProfs, List(uniCounts, deptCounts))
    }
  }


}
