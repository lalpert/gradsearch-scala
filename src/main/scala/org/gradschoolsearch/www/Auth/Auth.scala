package org.gradschoolsearch.www.Auth

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

import org.gradschoolsearch.db.Tables._
import org.gradschoolsearch.models.User
import org.mindrot.jbcrypt.BCrypt
import org.scalatra.ScalatraBase
import org.scalatra.auth.strategy.{BasicAuthStrategy, BasicAuthSupport}
import org.scalatra.auth.{ScentryConfig, ScentrySupport}

import scala.slick.driver.MySQLDriver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession
import net.iharder.Base64
import scala.io.Codec
import org.scalatra.auth.strategy.BasicAuthStrategy.BasicAuthRequest
import org.gradschoolsearch.www.Auth.OurBasicAuthStrategy.OurBasicAuthRequest

object OurBasicAuthStrategy {
  class OurBasicAuthRequest(r: HttpServletRequest) {

    def username2 = r.getParameter("username")
    def password2 = r.getParameter("password")
  }
}

class OurBasicAuthStrategy(protected override val app: ScalatraBase, realm: String, db:Database)
  extends BasicAuthStrategy[User](app, realm) {

  implicit def request2OurBasicAuthRequest(r: HttpServletRequest) = new OurBasicAuthRequest(r)

  // Why do we need this?
  protected def getUserId(user: User)
                         (implicit request: HttpServletRequest, response: HttpServletResponse): String = {
    user.id.toString
  }

  // Required method that returns a matching user or None
  protected def validate(email: String, password: String)
                        (implicit request: HttpServletRequest, response: HttpServletResponse): Option[User] = {
    db withDynSession {
      val userOpt = users.filter(_.email === email).firstOption
      userOpt match {
        case None => None
        case Some(user) => if (BCrypt.checkpw(password, user.passwordHash)) Some(user) else None
      }
    }
  }

  override def authenticate()(implicit request: HttpServletRequest, response: HttpServletResponse) = {
    println("in authenticate")
    println("request")
    println(request)
    println(request.username2)
    println(request.password2)
    println("response")
    println(response)
    validate(request.username2, request.password2)
  }

  override def unauthenticated()(implicit request: HttpServletRequest, response: HttpServletResponse) {
    println("IN UNAUTH")
  }

}


trait AuthenticationSupport extends ScentrySupport[User] with BasicAuthSupport[User] {
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
    val baReq = new OurBasicAuthStrategy.OurBasicAuthRequest(request)
    /*if(!baReq.providesAuth) {
      response.setHeader("WWW-Authenticate", "Basic realm=\"%s\"" format realm)
      halt(401, "Unauthenticated")
    }
    if(!baReq.isBasicAuth) {
      halt(400, "Bad Request")
    }*/
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