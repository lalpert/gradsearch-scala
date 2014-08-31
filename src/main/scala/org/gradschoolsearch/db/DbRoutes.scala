package org.gradschoolsearch.db

import org.scalatra._

import Tables._
import scala.slick.driver.H2Driver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession

trait DbRoutes extends ScalatraServlet {

  val db: Database

  get("/db/create-data") {
    db withDynSession {
      // Create table
      (professors.ddl).create

      // Insert some professors
      professors.insertAll(
        Professor(Some(1), "Leah Alpert", "MIT", "CS"),
        Professor(Some(2), "Russell Cohen", "MIT", "EECS"),
        Professor(Some(3), "Fake person", "Stanford", "CS"),
        Professor(Some(4), "Pretend person", "Stanford", "CS")
      )
    }
  }

  get("/db/drop-tables") {
    db withDynSession {
      (professors.ddl).drop
    }
  }
}