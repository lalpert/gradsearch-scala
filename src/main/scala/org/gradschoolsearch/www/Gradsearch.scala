package org.gradschoolsearch.www

import org.scalatra._
import scalate.ScalateSupport

class Gradsearch extends GradsearchStack {

  get("/") {
    <html>
      <body>
        <h1>Hello, world!</h1>
        Say <a href="hello-scalate">hello to Scalate</a>.
      </body>
    </html>
  }
  
}
