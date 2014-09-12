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

class AnonUserStrategy(protected override val app: ScalatraBase, realm: String, db:Database) extends ScentryStrategy[User] {

  override def name: String = "AnonUser"
  val logger = LoggerFactory.getLogger(getClass)

  override def isValid(implicit request: HttpServletRequest) = {
    logger.info("AnonUserStrategy: determining isValid")
    true
  }

  def authenticate()(implicit request: HttpServletRequest, response: HttpServletResponse): Option[User] = {
    logger.info("AnonUserStrategy: attempting authentication")
    db withDynSession {
      // TODO: check if already logged in?
      val newUser = User.createAnonymousUser()
      val userId = (users returning users.map(_.id)) += newUser
      val newUserWithId  = newUser.copy(id = Some(userId))
      println(f"New user: $newUserWithId")

      Some(newUserWithId)
    }
  }

  /**
   * What should happen if the user is currently not authenticated?
   */
  override def unauthenticated()(implicit request: HttpServletRequest, response: HttpServletResponse) {
    logger.info("AnonUserStrategy: unauthenticated")
  }
}

class LoginStrategy(protected override val app: ScalatraBase, realm: String, db:Database) extends ScentryStrategy[User] {

  override def name: String = "UserPassword"
  val logger = LoggerFactory.getLogger(getClass)

  /***
    * Determine whether the strategy should be run for the current request.
    */

  def validate(email: String, password: String)
                        (implicit request: HttpServletRequest, response: HttpServletResponse): Option[User] = {
    db withDynSession {
      val userOpt = users.filter(_.email === email).firstOption
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
   *  Called when anonUserAuth() is called
   */
  def authenticate()(implicit request: HttpServletRequest, response: HttpServletResponse): Option[User] = {
    logger.info("UserPasswordStrategy: attempting authentication")
    val username = request.getParameter("username")
    val password = request.getParameter("password")
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
  protected def toSession   = {

    case usr: User => {
      println(f"TO SESSION $usr")
      usr.id.get.toString

    }
  }

  // Session string -> User object
  protected def fromSession = { case id: String =>
    db withDynSession {
      val u = users.filter(_.id === id.toInt).firstOption.get
      println(f"FROM SESSION $u - $id")
      u
    }
  }

  protected def loginAuth()(implicit request: HttpServletRequest, response: HttpServletResponse) = {
    scentry.authenticate("Login")
  }

  protected def anonUserAuth()(implicit request: HttpServletRequest, response: HttpServletResponse) = {
    scentry.authenticate("Anon")
  }

  // Registers our Auth strategy with Scentry
  override protected def registerAuthStrategies = {
    scentry.register("Login", app => new LoginStrategy(app, realm, db))
    scentry.register("Anon", app => new AnonUserStrategy(app, realm, db))
  }

  // Not sure what this does
  // TODO: maybe add the anon strategy here?
  override protected def configureScentry = {
    scentry.unauthenticated {
      scentry.strategies("Login").unauthenticated()
    }
  }


}