package org.gradschoolsearch.db

import org.gradschoolsearch.models.DBProfessor

import scala.slick.ast.Library.SqlOperator
import scala.slick.driver.MySQLDriver.simple._
import scala.slick.lifted.Column


object Tables {
  def fullTextMatch[T](term: String, columns: String*): Column[Boolean] = {
    val column = columns mkString ","
    SimpleExpression.nullary[Boolean] { (qb) =>
      qb.sqlBuilder += f"match($column) against ('$term*' in boolean mode)"
    }
  }

  class Professors(tag: Tag) extends Table[DBProfessor](tag, "PROFESSORS") {
    def id      = column[Int]("ID", O.PrimaryKey, O.AutoInc) // This is the primary key column
    def name    = column[String]("NAME")
    def school  = column[String]("SCHOOL")
    def department    = column[String]("DEPARTMENT")
    def * = (id.?, name, school, department) <> (DBProfessor.tupled, DBProfessor.unapply)
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
    // TODO: maybe add this:
    //def profId = foreignKey("PROF_ID", id, professors)(_.id)
    def * = (profId, keywordId)
  }
  val professorKeywords = TableQuery[ProfessorKeywords]
}