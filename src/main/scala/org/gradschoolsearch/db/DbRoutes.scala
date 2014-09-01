package org.gradschoolsearch.db

import org.scalatra._

import Tables._
import scala.slick.driver.H2Driver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession
import scala.slick.jdbc.meta.MTable

trait DbRoutes extends ScalatraServlet {

  val db: Database

  get("/db/create-data") {
    db withDynSession {
      // Create table

      if (!MTable.getTables("PROFESSORS").list.isEmpty) {
        professors.ddl.drop
      }
      professors.ddl.create

      // Insert some professors
      professors.insertAll(
        Professor(Some(1), "Leah Alpert", "MIT", "CS"),
        Professor(Some(2), "Russell Cohen", "MIT", "EE"),
        Professor(Some(3), "Fake person", "Stanford", "CS"),
        Professor(Some(4), "Pretend person", "Stanford", "CS"),
        Professor(Some(4), "CS person", "MIT", "CS"),
        Professor(Some(4), "EE person", "MIT", "EE")
      )

      if (!MTable.getTables("KEYWORDS").list.isEmpty) {
        keywords.ddl.drop
      }
      keywords.ddl.create
      keywords.insertAll(
        (1, "robotics"),
        (2, "science"),
        (3, "potatoes"),
        (4, "computers")
      )

      if (!MTable.getTables("PROFESSOR_KEYWORDS").list.isEmpty) {
        professorKeywords.ddl.drop
      }
      professorKeywords.ddl.create
      professorKeywords.insertAll(
        (1, 1),
        (1, 2),
        (1, 4),
        (2, 2),
        (3, 3),
        (3, 2),
        (4, 2),
        (5, 2),
        (6, 2)
      )
    }
  }
}