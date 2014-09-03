package org.gradschoolsearch.www.Auth

import org.scalatra._
import scalate.ScalateSupport

import org.scalatra.auth.strategy.{BasicAuthStrategy, BasicAuthSupport}
import org.scalatra.auth.{ScentrySupport, ScentryConfig}
import org.scalatra.{ScalatraBase}
import javax.servlet.http.{HttpServletResponse, HttpServletRequest}
import org.mindrot.jbcrypt.BCrypt;

// Simple user class for testing
case class User2(id: String)


class OurBasicAuthStrategy(protected override val app: ScalatraBase, realm: String)
  extends BasicAuthStrategy[User2](app, realm) {

  // Required method that returns a matching user or None
  protected def validate(userName: String, password: String)(implicit request: HttpServletRequest, response: HttpServletResponse): Option[User2] = {
    if(userName == "scalatra" && password == "scalatra") Some(User2("scalatra"))
    //val correctPwd = BCrypt.checkpw(password, u.passwordHash)

    else None
  }

  protected def getUserId(user: User2)(implicit request: HttpServletRequest, response: HttpServletResponse): String = user.id
}


trait AuthenticationSupport extends ScentrySupport[User2] with BasicAuthSupport[User2] {
  self: ScalatraBase =>

  // What are these vars?
  val realm = "Scalatra Basic Auth Example"
  protected val scentryConfig = (new ScentryConfig {}).asInstanceOf[ScentryConfiguration]

  // Session string -> User object
  protected def fromSession = { case id: String => User2(id)  }

  // User object -> session string
  protected def toSession   = { case usr: User2 => usr.id }

  // Registers our Auth strategy with Scentry
  override protected def configureScentry = {
    scentry.unauthenticated {
      scentry.strategies("Basic").unauthenticated()
    }
  }

  override protected def registerAuthStrategies = {
    scentry.register("Basic", app => new OurBasicAuthStrategy(app, realm))
  }

}