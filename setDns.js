const {
  exec
} = require('child_process');


function restore(dns, name) {
  var cmdStr = 'netsh interface ip set dns name="本地连接" source=dhcp&&netsh interface ipv6 set dns name="本地连接" source=dhcp'
  exec(cmdStr, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
  })
}


function setMacDns(dns, select_device) {

  //获取当前网络设备
  // var cmdStr = 'networksetup -listallnetworkservices|grep -v "network servic"' +
  //   '|while read -r lines;do shs=`networksetup getinfo "$lines"|grep -c "IP address:\\W[1-9]"`; ' +
  //   'if [[ $shs -eq 1 ]] ;' +
  //   'then echo $lines;fi;done'
  // exec(cmdStr, (err, stdout, stderr) => {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   stdout = stdout.replace("\n", "");
  cmdStr2 = 'networksetup -setdnsservers ' + '"' + select_device + '" ' + dns
  exec(cmdStr2, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    window.utools.showNotification("DNS设置成功" + dns)
  })
  // })
}

function setWinDns(dns, select_device) {
  //获取当前网络设备
  if (dns == "empty") {
    console.log("500")
    restore()
    return;
  }
  const dns_type = utools.dbStorage.getItem('dns_type') == null ? 'ipv4' : utools.dbStorage.getItem('dns_type')
  if (dns_type == 'ipv4') {
    tdns = 'ip add dns'
  } else {
    tdns = 'ipv6 add dnsservers'
  }
  //先还原dns，改为自动获取
  const cleardns = 'netsh interface ip set dns name="' + select_device + '" source=dhcp'
  exec(cleardns, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
  })
  dns = dns.split(" ");
  for (var i = 0; i < dns.length; i++) {
    //2021-01-04
    // netsh interface ip delete dns name="本地连接" all &&
    //修复window下dns切换不生效问题
    var cmdStr = ' netsh interface ip delete dns name="' + select_device + '" all && netsh interface ' + tdns + ' name="' + select_device + '" addr= ' + dns[i] + " index=" + (i + 1)

    exec(cmdStr, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
    })
  }

  window.utools.showNotification("DNS设置成功" + dns)
}


module.exports={setMacDns,setWinDns}