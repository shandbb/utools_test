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
  let binaryEncoding = "binary";
  let iconv = require("iconv-lite");
  let encoding = "cp936";
  utools.dbStorage.setItem('privilege', '0');
  //获取当前网络设备
  if (dns == "empty") {
    console.log("500")
    restore()
    return;
  }
  const dns_type = utools.dbStorage.getItem('dns_type') == null ? 'ipv4' : utools.dbStorage.getItem('dns_type')
  if (dns_type == 'ipv4') {
    tdns = 'ip add dns'
    sdns = 'ip set dns'
  } else {
    tdns = 'ipv6 add dnsservers'
    sdns = 'ipv6 set dnsservers'
  }
  //先还原dns，改为自动获取
  // const cleardns = 'netsh interface ip set dns name="' + select_device + '" source=dhcp'
  // const cleardns = 'netsh interface ip set dns "' + select_device + '" dhcp'
  // exec(cleardns, {
  //   encoding: binaryEncoding
  // }, (err, stdout, stderr) => {
  //   if (err) {
  //     let des = iconv.decode(Buffer.from(stdout, binaryEncoding), encoding);
  //     console.log(des);
  //     privilege = "1"
  //     window.utools.showNotification(des)
  //     window.utools.hideMainWindow()
  //     window.utools.outPlugin()
  //     console.log(err);
  //     return;
  //   }
  // })
  dns = dns.split(" ");
  // for (var i = 0; i < dns.length; i++) {
  //2021-01-04
  // netsh interface ip delete dns name="本地连接" all &&
  //修复window下dns切换不生效问题
  // netsh interface ip delete dns name="以太网" all && netsh interface  ip add dns name="以太网" addr=1.1.1.1 index=0
  if (dns.length > 1) {
    var cmdStr ='netsh interface '+sdns+' "' + select_device + '" dhcp && netsh interface  ' + sdns + ' "' + select_device + '" static ' + dns[0] + ' primary && netsh interface ' + tdns + ' "' + select_device + '" ' + dns[1];
  } else {
    var cmdStr = 'netsh interface '+sdns+' "' + select_device + '" dhcp && netsh interface  ' + sdns + ' "' + select_device + '" static ' + dns[0] + ' primary';
  }
  window.utools.copyText(cmdStr)
  exec(cmdStr, {
    encoding: binaryEncoding
  }, (err, stdout, stderr) => {
    if (err) {
      utools.dbStorage.setItem('privilege', '1');
      let des = iconv.decode(Buffer.from(stdout, binaryEncoding), encoding);
      console.log(des);
      window.utools.hideMainWindow()
      window.utools.outPlugin()
      window.utools.showNotification(des)
      console.log(err);
      return;
    }
    // window.utools.showNotification("DNS设置成功" + dns)
  })

  // }
  console.log(utools.dbStorage.getItem('privilege') )
  if (utools.dbStorage.getItem('privilege') == "0") {
    console.log(utools.dbStorage.getItem('privilege') )
    window.utools.showNotification("DNS设置成功" + dns)
  }
}


module.exports = {
  setMacDns,
  setWinDns
}