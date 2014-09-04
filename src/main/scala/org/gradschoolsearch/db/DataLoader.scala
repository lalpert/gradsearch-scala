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
  private case class InternalFormat(school: String, name: String, image: Option[String], source: Option[String],
                                     keywords: List[String], department: Option[String])
  val schools = List("yale", "mit", "cmu", "penn")
  val dataFields = schools.map(school => f"src/main/resources/data/$school.dat.json")
  implicit val formats = DefaultFormats
  def loadData() = {
    println(new java.io.File(".").getAbsolutePath() + "hello2")
    dataFields.flatMap { fileName =>
      val file = Source.fromFile(fileName).mkString
      val json = parse(file)
      val professorsInternal = json.extract[List[InternalFormat]]
      professorsInternal.map(cleanData).toSet.toList
    }
  }

  def cleanData(incoming: InternalFormat): ProfWithKeywords = {
     ProfWithKeywords(
      DBProfessor(None, incoming.name, incoming.school, incoming.department.getOrElse("No Department Known")),
        incoming.keywords.map(_.take(250))
     )
  }
}
