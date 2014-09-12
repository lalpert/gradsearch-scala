package org.gradschoolsearch.db

import org.gradschoolsearch.models.{DBProfessor, User}

import scala.slick.driver.MySQLDriver.simple._
import scala.slick.lifted.Column


object Tables {
  // Dark magic that allows us to filter queries with full-text search
  def fullTextMatch[T](term: String, wildcard: Boolean, columns: String*): Column[Boolean] = {
    val column = columns mkString ","
    val str = if (wildcard) {
      f"match($column) against ('$term*' in boolean mode)"
    } else {
      f"""match($column) against ('"$term"' in boolean mode)"""
    }
    SimpleExpression.nullary[Boolean] { (qb) =>
      qb.sqlBuilder += str
    }
  }

  // Professor data
  class Professors(tag: Tag) extends Table[DBProfessor](tag, "PROFESSORS") {
    def id      = column[Int]("ID", O.PrimaryKey, O.AutoInc)
    def name    = column[String]("NAME")
    def school  = column[String]("SCHOOL")
    def department    = column[String]("DEPARTMENT")
    def image   = column[Option[String]]("IMAGE")
    def bio     = column[Option[String]]("BIO", O.DBType("TEXT"))
    def * = (id.?, name, school, department, image, bio) <> (DBProfessor.tupled, DBProfessor.unapply)
    def idx1 = index("main_index", name)
    def idx2 = index("dept_index", department)
  }
  val professors = TableQuery[Professors]

  class Keywords(tag: Tag) extends Table[(Int, String)](tag, "KEYWORDS"){
    def id      = column[Int]("ID", O.PrimaryKey, O.AutoInc)
    def keyword = column[String]("KEYWORD")
    def * = (id, keyword)
    def keywordIndex = index("keyword_index", keyword, unique = true)
  }
  val keywords = TableQuery[Keywords]

  class ProfessorKeywords(tag: Tag) extends Table[(Int, Int)](tag, "PROFESSOR_KEYWORDS") {
    def profId = column[Int]("PROF_ID")
    def keywordId = column[Int]("KEYWORD_ID")
    def profIndex = index("prof_index", profId)
    def keywordIndex = index("keyword_index", keywordId)
    def * = (profId, keywordId)
  }
  val professorKeywords = TableQuery[ProfessorKeywords]

  // User data
  class Users(tag: Tag) extends Table[User](tag, "USERS") {
    def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
    def email = column[String]("EMAIL")
    def passwordHash = column[String]("PASSWORD_HASH")
    def anonymous = column[Boolean]("ANONYMOUS")
    def * = (id.?, email, passwordHash, anonymous) <> ((User.apply _).tupled, User.unapply)
    def emailIndex = index("email_index", email)
  }
  val users = TableQuery[Users]

  class StarredProfs(tag:Tag) extends Table[(Int, Int)](tag, "STARRED_PROFS") {
    def userId = column[Int]("USER_ID")
    def profId = column[Int]("PROF_ID")
    def * = (userId, profId)
    def userIndex = index("user_index", userId)
  }
  val starredProfessors = TableQuery[StarredProfs]

  class StarredSearches(tag:Tag) extends Table[(Int, String)](tag, "STARRED_SEARCHES") {
    def userId = column[Int]("USER_ID")
    def searchString = column[String]("SEARCH_STRING")
    def * = (userId, searchString)
    def userIndex = index("user_index", userId)
  }
  val starredSearches = TableQuery[StarredSearches]
}