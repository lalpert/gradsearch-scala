package org.gradschoolsearch.db

import org.gradschoolsearch.db.Tables._

import scala.slick.driver.MySQLDriver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession

/*class DbUtil {
  val db:Database

  def getUserFromId(email: String) = {
    db withDynSession {
      val userOpt = users.filter(_.email === email).firstOption
    }
  }
}*/
