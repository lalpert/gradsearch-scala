package org.gradschoolsearch.www

import org.gradschoolsearch.db.Tables._
import org.gradschoolsearch.db.{DbRoutes, Tables}
import org.gradschoolsearch.models.{User, Professor, WebProfessor}
import org.gradschoolsearch.www.Auth.AuthenticationSupport
import org.mindrot.jbcrypt.BCrypt

// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._

import scala.slick.driver.MySQLDriver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession

case class ResultCounts(category: String, counts: Map[String, Int])
case class Results(professors: Seq[WebProfessor], counts: Seq[ResultCounts])

class Gradsearch(val db: Database) extends GradsearchStack
  with JacksonJsonSupport with DbRoutes with AuthenticationSupport {
  // Sets up automatic case class to JSON output serialization, required by
  // the JValueResult trait.
  protected implicit val jsonFormats: Formats = DefaultFormats

  // Before every action runs, set the content type to be in JSON format.
  before() {
    contentType = formats("json")
  }

  get("/auth-test") {
    basicAuth
    <html>
      <body>
        <h1>Hello from Scalatra</h1>
        <p>You are authenticated.</p>
      </body>
    </html>
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

  def getProfessors(searchString: String, starred: Boolean) = {

    // Professors whose keywords match the search string
    val profKeywordJoin = for {
      pk <- professorKeywords
      k <- keywords if k.id === pk.keywordId && fullTextMatch(searchString, "keyword")
      p <- professors if p.id === pk.profId
    } yield p

    // Professors whose name, school, or department match the search string
    val profFilter = professors.filter(prof => fullTextMatch(searchString, "name", "department", "school"))

    // All professors matching the search term
    val professorQuery = (profKeywordJoin union profFilter)

    // If starred, filter down to starred profs
    val professorQueryWithStarred = if (starred) {
      for {
        p <- professorQuery
        sp <- starredProfessors if sp.profId === p.id && sp.userId === user.id.get
      } yield p
    } else {
      professorQuery
    }

    // Get all research interests for those profs
    val profKeywordQuery = for {
      pk <- professorKeywords
      k <- keywords if k.id === pk.keywordId
      p <- professorQueryWithStarred if p.id === pk.profId
    } yield (p, k.keyword)

    val profKeywords = profKeywordQuery.run
    // Group by prof, then extract the keywords for each prof
    val idMap = profKeywords.groupBy(_._1.id)

    val sp = starredProfessors.filter(_.userId === user.id.get).map(_.profId).run.toSet
    println("sp")
    println(sp)

    val results = idMap.map { case (id, stuffList) =>
      val prof = stuffList.head._1
      val words = stuffList.map(_._2)
      val starred = sp.contains(prof.id.get)
      new WebProfessor(prof, words, starred)
    }

    results.toList
  }

  get("/results") {
    db withDynSession {
      // Get search params
      val searchString = params("q").toLowerCase
      val starredFilter = params.get("Starred") == Some("Starred")
      val schoolFilter = multiParams("University")
      val deptFilter = multiParams("Department")

      def schoolFilterFunc(prof: Professor):Boolean = schoolFilter.isEmpty || schoolFilter.contains(prof.school)
      def deptFilterFunc(prof: Professor):Boolean = deptFilter.isEmpty || deptFilter.contains(prof.department)

      // Get professors who match search string, plus their keywords
      val professorResults = getProfessors(searchString, starredFilter)

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

      // Check if each prof is starred by the user
      if (user != null) {
        val sps = starredProfessors.filter(_.userId === user.id.get).run

      }

      Results(filteredProfs, List(uniCounts, deptCounts))
    }
  }

  post("/star-prof") {
    if (user == null) {
      // TODO: Make anonymous user so we can save the user's data
    } else {
      db withDynSession {
        // Add or remove prof-user pair to db
        val profId = params("profId").toInt
        val starred = params("starred").toBoolean
        val userId = user.id.get
        val existingPairs = starredProfessors.filter(
          pair => (pair.profId === profId && pair.userId === userId))
        val pairExists = (existingPairs.length.run > 0)

        if (starred && !pairExists) {
          // We need to put this pair in the db
          starredProfessors insert (userId, profId)
        } else if (!starred && pairExists) {
          // We need to remove this pair from the db
          existingPairs.delete
        }
      }
    }
  }


}
