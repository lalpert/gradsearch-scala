package org.gradschoolsearch.db

/**
 * Created by russell on 9/1/14.
 */

import org.gradschoolsearch.models.DBProfessor
import org.json4s._
import org.json4s.jackson.JsonMethods._

import scala.io.Source
object DataLoader {
  case class ProfWithKeywords(professor: DBProfessor, keywords: List[String])
  private case class InternalFormat(school: String, name: String, image: String, source: String,
                                     keywords: List[String], department: String)
  val dataFields = List("src/main/resources/data/yale.dat.json")//, "src/main/resources/data/brown.dat.json")
  implicit val formats = DefaultFormats
  def loadData() = {
    println(new java.io.File(".").getAbsolutePath() + "hello2")
    dataFields.flatMap { fileName =>
      val file = Source.fromFile(fileName).mkString
      val json = parse(file)
      println(file.take(20))
      val professorsInternal = json.extract[List[InternalFormat]]
      professorsInternal.map(internal => ProfWithKeywords(
        DBProfessor(None, internal.name, internal.school, internal.department),
        internal.keywords
      ))
    }
  }
}
