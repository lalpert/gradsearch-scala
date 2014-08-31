package org.gradschoolsearch.db

import scala.slick.driver.H2Driver.simple._

case class Professor(id:Option[Int], name:String, school:String, department:String)

object Tables {
  // Definition of the SUPPLIERS table
  class Professors(tag: Tag) extends Table[Professor](tag, "PROFESSORS") {
    def id      = column[Int]("PROF_ID", O.PrimaryKey, O.AutoInc) // This is the primary key column
    def name    = column[String]("NAME")
    def school  = column[String]("SCHOOL")
    def department    = column[String]("DEPARTMENT")

    // Every table needs a * projection with the same type as the table's type parameter
    def * = (id.?, name, school, department) <> (Professor.tupled, Professor.unapply)

  }
  val professors = TableQuery[Professors]
}