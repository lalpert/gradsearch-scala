package org.gradschoolsearch.www.Auth

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

import org.gradschoolsearch.db.Tables._
import org.gradschoolsearch.models.User
import org.mindrot.jbcrypt.BCrypt
import org.scalatra.{Unauthorized, ScalatraBase}
import org.scalatra.auth.strategy.{BasicAuthStrategy, BasicAuthSupport}
import org.scalatra.auth.{ScentryStrategy, ScentryConfig, ScentrySupport}

import scala.slick.driver.MySQLDriver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession
import net.iharder.Base64
import scala.io.Codec
import org.scalatra.auth.strategy.BasicAuthStrategy.BasicAuthRequest
import org.slf4j.LoggerFactory

class OurBasicAuthStrategy(protected override val app: ScalatraBase, realm: String, db:Database) extends ScentryStrategy[User] {

  override def name: String = "UserPassword"
  val logger = LoggerFactory.getLogger(getClass)

  /***
    * Determine whether the strategy should be run for the current request.
    */

  def validate(email: String, password: String)
                        (implicit request: HttpServletRequest, response: HttpServletResponse): Option[User] = {
    db withDynSession {
      val userOpt = users.filter(_.email === email).firstOption
      println(f"UserOpt: $userOpt")
      userOpt match {
        case None => None
        case Some(user) => if (BCrypt.checkpw(password, user.passwordHash)) Some(user) else None
      }
    }
  }

  override def isValid(implicit request: HttpServletRequest) = {
    val login = request.getParameter("username")
    val password = request.getParameter("password")
    logger.info("UserPasswordStrategy: determining isValid: " + (login != "" && password != "").toString())
    login != "" && password != ""
  }

  /**
   *  In real life, this is where we'd consult our data store, asking it whether the user credentials matched
   *  any existing user. Here, we'll just check for a known login/password combination and return a user if
   *  it's found.
   */
  def authenticate()(implicit request: HttpServletRequest, response: HttpServletResponse): Option[User] = {
    logger.info("UserPasswordStrategy: attempting authentication")
    val username = request.getParameter("username")
    val password = request.getParameter("password")
    println(f"Username and password: $username, $password")
    validate(username, password)
  }

  /**
   * What should happen if the user is currently not authenticated?
   */
  override def unauthenticated()(implicit request: HttpServletRequest, response: HttpServletResponse) {
    app.redirect("/login?failed=true")
  }
}

trait AuthenticationSupport extends ScentrySupport[User] {
  self: ScalatraBase =>

  val db:Database

  // What are these vars?
  val realm = "Scalatra Basic Auth Example"
  protected val scentryConfig = (new ScentryConfig {}).asInstanceOf[ScentryConfiguration]

  // User object -> session string
  protected def toSession   = { case usr: User => usr.id.get.toString }

  // Session string -> User object
  protected def fromSession = { case id: String =>
    db withDynSession {
      users.filter(_.id === id.toInt).firstOption.get
    }
  }

  protected def ourBasicAuth()(implicit request: HttpServletRequest,
                                                                 response: HttpServletResponse) = {

    scentry.authenticate("Basic")
  }

  // Registers our Auth strategy with Scentry
  override protected def registerAuthStrategies = {
    scentry.register("Basic", app => new OurBasicAuthStrategy(app, realm, db))
  }

  // Not sure what this does
  override protected def configureScentry = {
    scentry.unauthenticated {
      scentry.strategies("Basic").unauthenticated()
    }
  }


}