package org.gradschoolsearch.www

import org.gradschoolsearch.db.Tables._
import org.gradschoolsearch.models.User
import org.gradschoolsearch.www.Auth.AuthenticationSupport
import org.scalatra.ScalatraServlet
import scala.slick.driver.MySQLDriver.simple._
import scala.slick.jdbc.JdbcBackend.Database.dynamicSession

trait LoginRegisterRoutes extends GradsearchStack with AuthenticationSupport{
  get("/login") {
    contentType="text/html"
    val failed = (params.get("failed") == Some("true"))
    ssp("/login", "failed" -> failed)
  }

  post("/login") {
    loginAuth
    redirect("/")
  }

  post("/register") {
    db withDynSession {

      // TODO: Pull this logic into a separate function
      val usernameOpt = params.get("username")
      val passwordOpt = params.get("password")
      val passwordRepeatOpt = params.get("passwordRepeat")

      // Find errors or success
      val UserInfoOrError = (usernameOpt, passwordOpt, passwordRepeatOpt) match {
        case (Some(username), Some(password), Some(passwordRepeat)) => {
          lazy val existingUser = users.filter(_.email === username).firstOption
          if (passwordRepeat != password) {
            Left("Passwords don't match")
          } else if (existingUser != None) {
            Left("User with that email already exists")
          } else {
            Right((username, password))
          }
        }
        case _ => Left("Please fill in all fields")
      }

      UserInfoOrError match {
        case Left(error) => {
          contentType = "text/html"
          ssp("/login", "error" -> error)
        }
        case Right((username, password)) => {

          // If anon user, update
          userOption match {

            // Upgrade anon user to real user
            case Some(currentUser) if currentUser.anonymous => {

              println("ALREADY logged in as anonymous user")
              val u = users.filter(_.id === currentUser.id).map {
                uu => (uu.email, uu.passwordHash, uu.anonymous)
              }
              u.update(username, User.hashPassword(password), false)
            }

            // They're already logged in as a full user.
            // TODO: Throw an error or something
            case Some(currentUser) => {
              println("ALREADY logged in as FULL user")
            }

            // No current user: Create new user + log in
            case _ => {
              println("Not logged in yet; creating new user")
              users insert User.createUser(username, password)
              loginAuth
            }
          }

          // TODO: Where should we redirect to?
          redirect("/")
        }
      }
    }
  }

}
