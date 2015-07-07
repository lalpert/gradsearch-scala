package org.gradschoolsearch.www

import org.gradschoolsearch.db.Tables._
import org.gradschoolsearch.db.{DbRoutes, Tables, Match}
import org.gradschoolsearch.models.{DBProfessor, User, Professor, WebProfessor}
import org.gradschoolsearch.www.Auth.AuthenticationSupport
import org.mindrot.jbcrypt.BCrypt

import scala.slick.lifted

// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._

import org.json4s._
import org.json4s.jackson.Serialization
import org.json4s.jackson.Serialization.{read, write}

import scala.slick.driver.MySQLDriver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession

case class ResultCounts(category: String, counts: Map[String, Int])
case class Results(professors: Seq[WebProfessor], counts: Seq[ResultCounts], totalProfessors: Int)

// This format exactly matches the format of the filter configuration in searchpage.js. Don't change it!
case class FilterConfig(Starred: Map[String, Boolean], University: Map[String, Boolean], Department: Map[String, Boolean])

class Gradsearch(val db: Database) extends GradsearchStack
  with JacksonJsonSupport with DbRoutes with LoginRegisterRoutes with AuthenticationSupport {
  // Sets up automatic case class to JSON output serialization, required by
  // the JValueResult trait.
  protected implicit val jsonFormats: Formats = DefaultFormats

  // TODO: move me somewhere proper
  // val defaultImage = "/images/no-photo.jpg"
  val defaultImage = "";

  // Before every action runs, set the content type to be in JSON format.
  before() {
    contentType = formats("json")
  }

  def getCurrentUserEmail = {
    userOption match {
      case Some(currentUser) => currentUser.email
      case None => ""
    }
  }

  // Website routes
  get("/") {
    contentType="text/html"
    ssp("/home", "userEmail" -> getCurrentUserEmail, "currentPage" -> "home")
  }

  get("/autocomplete") {
    db withDynSession {
      val searchString = params.getOrElse("term", "")
      // TODO: sort by most popular?
      val words = keywords.filter(_.keyword.startsWith(searchString)).map(_.keyword)
      words.take(10).run
    }
  }

  get("/search") {
    contentType="text/html"
    val searchString = params.getOrElse("q", "")

    val starredFilter = params.get("Starred") == Some("Starred")
    val schoolFilter = multiParams("University")
    val deptFilter = multiParams("Department")

    def toMap(params: Seq[String]): Map[String, Boolean] = params.map(p => (p, true)).toMap
    val currentPage = if (params.get("clicked") == Some("true")) {
      "starredProfessors"
    } else {
      "search"
    }

    ssp("/search",
      "currentPage" -> currentPage,
      "search" -> searchString, 
      "userEmail" -> getCurrentUserEmail, 
      "loggedIn" -> userOption.isDefined,
      "isFullUser" -> (userOption.isDefined && !user.anonymous),
      "filters" -> write(FilterConfig(Map("Starred" -> starredFilter), toMap(schoolFilter), toMap(deptFilter)))
    )
  }

  get("/about") {
    contentType="text/html"

    implicit val formats = Serialization.formats(NoTypeHints)
    db withDynSession {
      val schoolCounts = professors.groupBy(_.school).map { case (school, profs) => (school, profs.length)}
      val numSchools = professors.map(_.school).countDistinct.run
      val numDepts = professors.map(_.department).countDistinct.run
      val sortedSchools = schoolCounts.sortBy(_._2).map(_._1).run.toList
      ssp("/about",
        "currentPage" -> "about",
        "numProfs" -> professors.length.run,
        "numSchools" -> numSchools,
        "numDepts" -> numDepts,
        "sortedSchools" -> sortedSchools
      )
    }
  }

  def getProfsByKeyword(searchString: String): Query[Professors, DBProfessor, Seq] = {
    // Professors whose keywords match the search string
    val profKeywordJoin = for {
      pk <- professorKeywords
      k <- keywords if k.id === pk.keywordId && (Match(k.keyword) against searchString)
      p <- professors if p.id === pk.profId
    } yield p

    // Professors whose name, school, or department match the search string
    val profFilter = professors.filter(prof => (Match(prof.name, prof.department, prof.school) against f"$searchString*"))

    // Return query for all professors matching the search term
    (profKeywordJoin union profFilter)
  }

  def getProfessors(searchString: String, starred: Boolean, userOpt: Option[User]) = {

    // If there's a search string, get matching profs, else use all profs
    val professorQuery = searchString match {
      case "" => professors
      case _ => getProfsByKeyword(searchString)
    }

    // If starred, filter down to starred profs
    val professorQueryWithStarred = (starred, userOpt) match {
      case (true, Some(currentUser)) => for {
        p <- professorQuery
        sp <- starredProfessors if sp.profId === p.id && sp.userId === currentUser.id.get
      } yield p

      // If there's no user and they clicked starred, there aren't going to be any results.
      // Return a query we know is empty!
      case (true, _) => professors.filter(_.id === -1)

      case _ => professorQuery
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

    // Check if each prof is starred by the user
    val sp = userOpt match {
      case Some(currentUser) => starredProfessors.filter(_.userId === user.id.get).map(_.profId).run.toSet
      case None => Set[Int]()
    }

    val results = idMap.map { case (id, stuffList) =>
      val prof = stuffList.head._1
      val words = stuffList.map(_._2)
      val starred = sp.contains(prof.id.get)
      new WebProfessor(prof, words, starred, prof.image.getOrElse(defaultImage), prof.bio.getOrElse(f"${prof.name} doesn't ha2ve a bio. <a>Add one!</a>"))
    }

    results.toList
  }

  get("/logout") {
    logOut()
    redirect("/")
  }

  get("/results") {
    db withDynSession {
      // Get search params
      val searchString = params.getOrElse("q", "").toLowerCase
      val starredFilter = params.get("Starred") == Some("Starred")
      val schoolFilter = multiParams("University")
      val deptFilter = multiParams("Department")
      val start = params.getOrElse("start", "0").toInt

      def schoolFilterFunc(prof: Professor):Boolean = schoolFilter.isEmpty || schoolFilter.contains(prof.school)
      def deptFilterFunc(prof: Professor):Boolean = deptFilter.isEmpty || deptFilter.contains(prof.department)

      // Get professors who match search string, plus their keywords
      val professorResults = getProfessors(searchString, starredFilter, userOption)

      // Get counts for all possible filters
      type ProfFilter = WebProfessor => Boolean
      def matchesFilters(prof: WebProfessor, filters: Seq[ProfFilter]):Boolean = {
        filters.forall(filter => filter(prof))
      }

      def getCount(category: String, otherFilters: Seq[ProfFilter], lens: WebProfessor => String) = {
        val filteredProfs = professorResults.filter(prof => matchesFilters(prof, otherFilters))
        ResultCounts(category, filteredProfs.groupBy(lens).mapValues(_.length))
      }

      val uniCounts = getCount("University", List(deptFilterFunc _), _.school)
      val deptCounts = getCount("Department", List(schoolFilterFunc _), _.department)
      val starCounts = getCount("Starred", List(deptFilterFunc _, schoolFilterFunc _), _.starred.toString)

      // Actually do the filtering
      val allFilters = List(deptFilterFunc _, schoolFilterFunc _)
      val filteredProfs = professorResults.filter(prof => matchesFilters(prof, allFilters))

      Results(filteredProfs.view.drop(start).take(12), List(uniCounts, deptCounts, starCounts), filteredProfs.length)
    }
  }

  get("/starred-searches") {
    contentType="text/html"

    // If current user is None, make anonymous user so we can save the user's data
    if (!userOption.isDefined) {
      anonUserAuth
    }

    val starred = userOption match {
      case Some(currentUser) =>
      db withDynSession {
        val starredQuery = starredSearches.filter(
          pair => (pair.userId === currentUser.id.get)).map(_.searchString)
        starredQuery.run
      }
      case _ => Seq()
    }

    ssp("/starredSearches", "starredSearches" -> write(starred), "currentPage" -> "starredSearches")
  }

  get("/starred-search") {
    val searchString = params("searchString")
    userOption match {
      case Some(currentUser) => {
        db withDynSession {
          val existingSearch = starredSearches.filter(
            pair => (pair.searchString === searchString && pair.userId === currentUser.id.get))
          existingSearch.length.run > 0
        }
      }
      case None => false
    }
  }

  post("/star-search") {
    // If current user is None, make anonymous user so we can save the user's data
    if (!userOption.isDefined) {
      anonUserAuth
    }

    userOption.foreach { currentUser =>
      db withDynSession {
        // Add or remove prof-user pair to db
        val searchString = params("searchString")
        val starred = params("starred").toBoolean
        val userId = currentUser.id.get
        val existingSearch = starredSearches.filter(
          pair => (pair.searchString === searchString && pair.userId === userId))
        val pairExists = (existingSearch.length.run > 0)

        if (starred && !pairExists) {
          // We need to put this pair in the db
          starredSearches insert (userId, searchString)
        } else if (!starred && pairExists) {
          // We need to remove this pair from the db
          existingSearch.delete
        }
      }
    }
  }

  post("/star-prof") {
    // If current user is None, make anonymous user so we can save the user's data
    if (!userOption.isDefined) {
      anonUserAuth
    }

    userOption.foreach { currentUser =>
      db withDynSession {
        // Add or remove prof-user pair to db
        val profId = params("profId").toInt
        val starred = params("starred").toBoolean
        val userId = currentUser.id.get
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

  notFound {
    findTemplate(requestPath) map { path =>
      contentType = "text/html"
      layoutTemplate(path)
    } orElse serveStaticResource() getOrElse {
      contentType = "text/html"
      <h1>Move along. Nothing to see here</h1>
    }
  }
}
