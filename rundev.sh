watchpid=0

control_c()
# run if user hits control-c
{
  echo -en "\n*** Exiting ***\n"
  echo -en "Killing $pypid, $watchpid"
  kill $watchpid
  exit $?
}

trap control_c SIGINT

watchify -t reactify src/main/webapp/js/gradsearch/login-main.js -o src/main/webapp/js/dist/login.js -d -v
watchpid=$!
