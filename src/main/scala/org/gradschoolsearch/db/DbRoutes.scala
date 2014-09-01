package org.gradschoolsearch.db

import org.gradschoolsearch.db.DataLoader.ProfWithKeywords
import org.gradschoolsearch.models.DBProfessor

import org.scalatra._

import Tables._
import scala.slick.driver.H2Driver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession
import scala.slick.jdbc.meta.MTable

trait DbRoutes extends ScalatraServlet {

  val db: Database

  private def dropAndCreateDb(): Unit = {
    if (!MTable.getTables("PROFESSORS").list.isEmpty) {
      professors.ddl.drop
    }
    professors.ddl.create

    if (!MTable.getTables("KEYWORDS").list.isEmpty) {
      keywords.ddl.drop
    }
    keywords.ddl.create

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
    data.foreach(insertProfWithKeywords)
  }

  get("/db/create-data") {
    db withDynSession {
      dropAndCreateDb()
      addFakeData()
      addRealData()
      "Sucess!"
    }
  }
}