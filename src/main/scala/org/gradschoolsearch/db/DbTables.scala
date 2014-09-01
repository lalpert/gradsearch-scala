package org.gradschoolsearch.db

import org.gradschoolsearch.models.DBProfessor

import scala.slick.driver.H2Driver.simple._



object Tables {
  class Professors(tag: Tag) extends Table[DBProfessor](tag, "PROFESSORS") {
    def id      = column[Int]("ID", O.PrimaryKey, O.AutoInc) // This is the primary key column
    def name    = column[String]("NAME")
    def school  = column[String]("SCHOOL")
    def department    = column[String]("DEPARTMENT")
    def * = (id.?, name, school, department) <> (DBProfessor.tupled, DBProfessor.unapply)
  }
  val professors = TableQuery[Professors]

  class Keywords(tag: Tag) extends Table[(Int, String)](tag, "KEYWORDS"){
    def id      = column[Int]("ID", O.PrimaryKey, O.AutoInc)
    def keyword = column[String]("KEYWORD")
    def * = (id, keyword)
  }
  val keywords = TableQuery[Keywords]

  class ProfessorKeywords(tag: Tag) extends Table[(Int, Int)](tag, "PROFESSOR_KEYWORDS") {
    def profId = column[Int]("PROF_ID")
    def keywordId = column[Int]("KEYWORD_ID")
    // TODO: maybe add this:
    //def profId = foreignKey("PROF_ID", id, professors)(_.id)
    def * = (profId, keywordId)
  }
  val professorKeywords = TableQuery[ProfessorKeywords]
}