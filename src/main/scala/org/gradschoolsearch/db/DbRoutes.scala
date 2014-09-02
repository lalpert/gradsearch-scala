package org.gradschoolsearch.db

import org.gradschoolsearch.db.DataLoader.ProfWithKeywords
import org.gradschoolsearch.models.DBProfessor

import org.scalatra._

import Tables._
import scala.slick.driver.MySQLDriver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession
import scala.slick.jdbc.meta.MTable
import org.json4s._
import org.json4s.jackson.JsonMethods._
import org.json4s.JsonDSL._

case class OptFoo(foo: String, bar: Option[String])
import scala.slick.jdbc.{GetResult, StaticQuery => Q}
trait DbRoutes extends ScalatraServlet {

  val db: Database

  private def dropAndCreateDb(): Unit = {

    if (!MTable.getTables("PROFESSORS").list.isEmpty) {
      professors.ddl.drop
    }
    professors.ddl.create

    Q.updateNA("ALTER TABLE PROFESSORS ENGINE = MYISAM;").execute
    Q.updateNA("CREATE FULLTEXT INDEX prof_name on PROFESSORS (name, department, school);").execute

    if (!MTable.getTables("KEYWORDS").list.isEmpty) {
      keywords.ddl.drop
    }
    keywords.ddl.create
    Q.updateNA("ALTER TABLE KEYWORDS ENGINE = MYISAM;").execute
    Q.updateNA("CREATE FULLTEXT INDEX keyword_ft on KEYWORDS (keyword);").execute

    if (!MTable.getTables("PROFESSOR_KEYWORDS").list.isEmpty) {
      professorKeywords.ddl.drop
    }
    professorKeywords.ddl.create
  }

  private def addFakeData(): Unit = {
    // Insert some professors
    val fakeProfs = List(
      ProfWithKeywords(DBProfessor(None, "Leah Alpert", "MIT", "CS"), List("robotics")),
      ProfWithKeywords(DBProfessor(None, "Russell Cohen", "MIT", "EE"), List("algorithms", "robotics")),
      ProfWithKeywords(DBProfessor(None, "Fake person", "Stanford", "CS"), List("computer vision"))
    )
    fakeProfs.foreach(insertProfWithKeywords)
  }

  private def addKeywordToProfMap(keyword: String, professorId: Int) = {
    val keywordId = upsertKeyword(keyword)
    professorKeywords insert (professorId, keywordId)
  }

  private def upsertKeyword(keyword: String) = {
    val lowerKeyword = keyword.toLowerCase
    val existingKeyword = keywords.filter(_.keyword === lowerKeyword).map(_.id).run.headOption
    existingKeyword.getOrElse {
      (keywords returning keywords.map(_.id)) += (-1, lowerKeyword)
    }
  }

  private def insertProfWithKeywords(profWithKeywords: ProfWithKeywords) = {
    val profId = professors returning professors.map(_.id) += profWithKeywords.professor
    profWithKeywords.keywords.foreach { keyword =>
      addKeywordToProfMap(keyword, profId)
    }
  }

  private def addRealData(): Unit = {
    val data = DataLoader.loadData()
    data.grouped(100).foreach { list =>
      println("100")
      list.foreach(insertProfWithKeywords)
    }
  }

  get("/db/create-data") {

    db withDynSession {
      dropAndCreateDb()
      addFakeData()
      addRealData()
      <h1>Total professors: {professors.size.run}</h1>
    }
  }

  get("/db/test") {
    implicit val formats = DefaultFormats
    parse("{\"foo\": \"hey\", \"bar\": \"bey\", \"wat\": 5}").extract[OptFoo]
  }
}