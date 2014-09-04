package org.gradschoolsearch.models

import org.mindrot.jbcrypt.BCrypt;

trait Professor {
  val id:Option[Int]
  val name:String
  val school:String
  val department:String
}

case class DBProfessor(id:Option[Int], name:String, school:String, department:String) extends Professor

case class WebProfessor(id:Option[Int], name:String, school:String, department:String,
                        keywords: Seq[String], starred: Boolean) extends Professor {
  def this(p:Professor, keywords: Seq[String], starred: Boolean) = {
    this(p.id, p.name, p.school, p.department, keywords, starred)
  }
}

case class User(id:Option[Int], email:String, passwordHash:String)

object User {
  def createUser(email:String, password:String) = {
    User(None, email, BCrypt.hashpw(password, BCrypt.gensalt()))
  }
}