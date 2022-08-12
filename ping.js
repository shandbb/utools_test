
const {
  exec
} = require('child_process');
function pingMacSpeed(dns, name) {
  var cmdStr = "ping " + dns + " -c 5 | awk -F'=' '/time=/ {n++; sum+=$NF+0 } END{print sum/n}'"
  exec(cmdStr, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    utools.dbStorage.setItem(name, stdout)
  })
}
function pingWinSpeed(dns, name) {
  var cmdStr = "for /f \"tokens=1 delims=:\" %a in (' ping -n 5 -w 5 " + dns + " ^|findstr \"平均\" ') do @echo %a"
  exec(cmdStr, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    var suffix = "";
    if (/([^\=]+)$/.test(stdout)) {
      suffix = RegExp.$1;
    }
    utools.dbStorage.setItem(name, suffix)
  })
}

module.exports={pingMacSpeed,pingWinSpeed}