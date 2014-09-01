package org.gradschoolsearch.models

trait Professor {
  val id:Option[Int]
  val name:String
  val school:String
  val department:String
}


case class DBProfessor(id:Option[Int], name:String, school:String, department:String) extends Professor

case class WebProfessor(id:Option[Int], name:String, school:String, department:String, keywords: Seq[String]) extends Professor {
  def this(p:Professor, keywords: Seq[String]) = {
    this(p.id, p.name, p.school, p.department, keywords)
  }
}