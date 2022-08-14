const {exec} = require('child_process');
const os = require('os');
const {pingMacSpeed,pingWinSpeed} =require("./ping.js");
const {setMacDns,setWinDns} =require("./setDns.js");


window.exports = {
  "getdns": { // 注意：键对应的是plugin.json中的features.code
    mode: "none", // 用于无需UI显示，执行一些简单的代码
    args: {
      enter: (action) => {
        if (utools.isMacOs()) {
          var cmdStr = "scutil --dns | grep 'nameserver\[[0-9]*\]'| sort |uniq |awk  '{print $3}'"
        }
        if (utools.isWindows()) {
          const dns_type = utools.dbStorage.getItem('dns_type') == null ? 'ipv4' : utools.dbStorage.getItem('dns_type')
          if (dns_type == 'ipv4') {
            var cmdStr = "for /f \"tokens=2,3 delims=:\" %a in ('nslookup host ^|find \"Address\"') do @echo %a"
          } else {
            var cmdStr = "nslookup host ^|find \"Address\""
          }

        }
        exec(cmdStr, (err, stdout, stderr) => {
          if (err) {
            console.log(err);
            return;
          }
          stdout = stdout.replace("\n", " ");
          window.utools.hideMainWindow()
          window.utools.showNotification("当前DNS：" + stdout)
          window.utools.copyText(stdout)
          window.utools.outPlugin()
        })
      }
    }
  },
  "cleandns": { // 注意：键对应的是plugin.json中的features.code
    mode: "none", // 用于无需UI显示，执行一些简单的代码
    args: {
      enter: (action) => {
        window.utools.hideMainWindow()
        if (utools.isMacOs()) {
          exec('dscacheutil -flushcache', (err, stdout, stderr) => {
            if (err) {
              console.log(err);
              return;
            }
          })
        }
        if (utools.isWindows()) {
          exec('ipconfig /flushdns', (err, stdout, stderr) => {
            if (err) {
              console.log(err);
              return;
            }
          })
        }

        window.utools.showNotification("DNS缓存清除成功");

        window.utools.outPlugin()
      }
    }
  },
  "definedns": { // 注意：键对应的是plugin.json中的features.code
    mode: "list", // 用于无需UI显示，执行一些简单的代码
    args: {
      // 进入插件时调用（可选）
      enter: (action, callbackSetList) => {
        // 如果进入插件就要显示列表数据
        var default_set=[{
          title: '新增dns',
          description: '新增dns',
          icon: '' // 图标(可选)
        }]
        if(utools.dbStorage.getItem("denfinedns")!=null){
        for (var i = 0; i < utools.dbStorage.getItem("denfinedns").length; i++) {
          var obj = {}
          obj.other =  utools.dbStorage.getItem("denfinedns")[i]
          obj.title =  utools.dbStorage.getItem("denfinedns")[i]
          default_set.push(obj)
        }
        // let map =new Map();
        // console.log(default_set)
        // for (let item of this.default_set){
        //   map.set(item.id,item)
        // }
        // this.default_set=[...map.values()];
      }
        callbackSetList(default_set)
      },
      // 子输入框内容变化时被调用 可选 (未设置则无搜索)
      search: (action, searchWord, callbackSetList) => {
        // 获取一些数据
        // 执行 callbackSetList 显示出来
        callbackSetList([{
          title: '新增dns',
          description: '新增dns',
          icon: '',
          other: searchWord
        }])
      },
      // 用户选择列表中某个条目时被调用
      select: (action, itemData, callbackSetList) => {
        
        window.utools.hideMainWindow()
        const dns_card = utools.dbStorage.getItem('select_device')
        const denfinedns=utools.dbStorage.getItem("denfinedns")
        const dns = itemData.other
        if (dns==undefined) {
          window.utools.showNotification("请输入Dns")
          return
        }
        if (dns_card==null) {
          window.utools.showNotification("请先选择网卡，dnssetting==>网卡选择")
          return
        }
        console.log(dns)
        console.log(denfinedns)
        if(utools.dbStorage.getItem("denfinedns")==null){
          var listd = []
          var obj = {}
          obj.other = dns
          obj.title = dns
          listd.push(obj)
         var tmparr=[]
         tmparr.push(dns)
          utools.dbStorage.setItem("denfinedns", tmparr)
          callbackSetList(listd)
        }else{
          var listd = []
          var flag=1
          for (var i = 0; i < utools.dbStorage.getItem("denfinedns").length; i++) {
           if(dns==utools.dbStorage.getItem("denfinedns")[i]){
            flag=0
            }
           
            var obj = {}
            obj.other =  utools.dbStorage.getItem("denfinedns")[i]
            obj.title = utools.dbStorage.getItem("denfinedns")[i]
            listd.push(obj)
            
          }
          if(flag==1){
            denfinedns.push(dns)
            utools.dbStorage.setItem("denfinedns",denfinedns)
          }
          
          callbackSetList(listd)
         
        }
       
        if (dns != "") {
          if (utools.isMacOs()) {
            setMacDns(dns,dns_card)
          }
          if (utools.isWindows()) {
            setWinDns(dns,dns_card)
          }

          window.utools.copyText(dns)
          // window.utools.outPlugin()
        } 

      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "搜索"
    }
  },
  "DNS_CONFIG": { // 注意：键对应的是plugin.json中的features.code
    mode: "list", // 用于无需UI显示，执行一些简单的代码
    args: {
      // 进入插件时调用（可选）
      enter: (action, callbackSetList) => {


        // 如果进入插件就要显示列表数据
        const dns_card = utools.dbStorage.getItem('select_device')
        const dns_type = utools.dbStorage.getItem('dns_type') == null ? 'ipv4' : utools.dbStorage.getItem('dns_type')
        callbackSetList([{
          title: '当前设置的dns类型:' + dns_type,
          description: '默认是ipv4，点选切换设置ipv6',
          icon: '', // 图标(可选)
          type: 'dns_type'
        }, {
          title: '当前修改的dns网卡:' + dns_card,
          description: '重新设置网卡',
          icon: '', // 图标(可选)
          type: 'dns_card'
        }, {
          title: '恢复初始化',
          description: '恢复初始化',
          icon: '', // 图标(可选)
          type: 'rebuild'
        }])
      },
      // 子输入框内容变化时被调用 可选 (未设置则无搜索)
      search: (action, searchWord, callbackSetList) => {

      },
      // 用户选择列表中某个条目时被调用
      select: (action, itemData, callbackSetList) => {
        if(itemData.type == "rebuild"){
          utools.dbStorage.removeItem("dns_type");
          utools.dbStorage.removeItem("device")
          utools.dbStorage.removeItem("select_device")
          window.utools.showNotification("dns已恢复初始化，请前往DNS_SET进行相应配置")
          window.utools.hideMainWindow()
        }

        if (itemData.type == "dns_type") {
          dns_type = (utools.dbStorage.getItem('dns_type') == null || utools.dbStorage.getItem('dns_type') == 'ipv6') ? 'ipv4' : 'ipv6'
          utools.dbStorage.setItem('dns_type', dns_type)
          window.utools.showNotification("切换成功" + utools.dbStorage.getItem('dns_type'))
          callbackSetList([{
            title: '当前设置的dns类型:' + dns_type,
            description: '默认是ipv4，点选切换设置ipv6',
            icon: '' // 图标(可选)
          }])
        } else {
          
          let device = utools.dbStorage.getItem('device');
          let select_device= utools.dbStorage.getItem('select_device');
          if (utools.isMacOs()) {
            //获取当前网络设备
            var cmdStr = 'networksetup -listallnetworkservices|grep -v "network servic" |while read -r lines;do echo $lines; done;'
            exec(cmdStr, (err, stdout, stderr) => {
              if (err) {
                console.log(err);
                return;
              }
              x = []
              stdout = stdout.split("\n");
              console.log(stdout);
              for (var i = 0; i < stdout.length - 1; i++) {
                console.log(stdout[i]);
                x.push(stdout[i])
              }

              utools.dbStorage.setItem("device", x)
             
            })
            var listd = []

            for (var i = 0; i < utools.dbStorage.getItem('device').length; i++) {
              var obj = {}
              obj.title = utools.dbStorage.getItem('device')[i]
              listd.push(obj)
            }
            
            callbackSetList(listd)
              utools.dbStorage.setItem('select_device', "");
              if ( itemData.title.indexOf(":")>0){
                utools.dbStorage.setItem('select_device', itemData.title.split(":")[1]);
              }else{
                utools.dbStorage.setItem('select_device', itemData.title);
              }     
              window.utools.showNotification("选择成功")
          }
          if (utools.isWindows()) {
            console.log('*****网卡信息*******');

            const networksObj = os.networkInterfaces();
            utools.dbStorage.setItem("device", Object.keys(networksObj))
            console.log(utools.dbStorage.getItem('device'))

            var listd = []

            for (var i = 0; i < Object.keys(networksObj).length; i++) {
              var obj = {}
              obj.title =  Object.keys(networksObj)[i]
              listd.push(obj)
              // window.utools.showNotification(listd)
            }
            callbackSetList(listd)
            utools.dbStorage.setItem('select_device', "");
            if ( itemData.title.indexOf(":")>0){
              utools.dbStorage.setItem('select_device', itemData.title.split(":")[1]);
            }else{
              utools.dbStorage.setItem('select_device', itemData.title);
            }     
            window.utools.showNotification("选择成功")
          }
        }
      },
      placeholder: ""
    }
  },
  "changedns": { // 注意：键对应的是plugin.json中的features.code
    mode: "list", // 用于无需UI显示，执行一些简单的代码
    args: {
      // 进入插件时调用（可选）
      enter: (action, callbackSetList) => {

        let select_device = utools.dbStorage.getItem('select_device');
        console.log(select_device)
        if (select_device == null) {

          if (utools.isMacOs()) {
            //获取当前网络设备
            var cmdStr = 'networksetup -listallnetworkservices|grep -v "network servic" |while read -r lines;do echo $lines; done;'
            exec(cmdStr, (err, stdout, stderr) => {
              if (err) {
                console.log(err);
                return;
              }
              x = []
              stdout = stdout.split("\n");
              console.log(stdout);
              for (var i = 0; i < stdout.length - 1; i++) {
                console.log(stdout[i]);
                x.push(stdout[i])
              }

              utools.dbStorage.setItem("device", x)
              console.log(utools.dbStorage.getItem('device'))
              // var dlist=utools.dbStorage.getItem('device');
              var listd = []

              for (var i = 0; i < x.length; i++) {
                var obj = {}
                obj.title = x[i]
                listd.push(obj)
                // window.utools.showNotification(listd)
              }
              callbackSetList(listd)
            })
          }
          if (utools.isWindows()) {
            console.log('*****网卡信息*******');

            const networksObj = os.networkInterfaces();
            utools.dbStorage.setItem("device", Object.keys(networksObj))
            console.log(utools.dbStorage.getItem('device'))
            // var dlist=utools.dbStorage.getItem('device');
            var listd = []

            for (var i = 0; i < Object.keys(networksObj).length; i++) {
              var obj = {}
              obj.title = dlist[i]
              listd.push(obj)
              // window.utools.showNotification(listd)
            }
            callbackSetList(listd)
          }
          // getDeivice()

          return
        }

        // window.utools.showNotification(dlist)


        // 如果进入插件就要显示列表数据
        callbackSetList([{
            title: '阿里DNS',
            description: '阿里DNS 223.5.5.5/223.6.6.6',
            // icon: 'res/a.gif',
            other: "223.5.5.5 223.6.6.6",
            ipv6: '2400:3200::1 2400:3200:baba::1'
          },
          {
            title: '谷歌DNS',
            description: '谷歌DNS',
            // icon: 'res/g.gif',
            other: "8.8.8.8 8.8.4.4",
            ipv6: '2001:4860:4860::8888 2001:4860:4860::8844'
          },
          {
            title: 'CFDNS',
            description: 'CloudflareDNS',
            // icon: 'res/c.gif',
            other: "1.1.1.1",
            ipv6: '2606:4700:4700::1111 2606:4700:4700::1001'
          },
          {
            title: '腾讯DNS',
            description: '腾讯DNSpod 119.29.29.29/182.254.116.116',
            // icon: 'res/t.gif',
            other: "119.29.29.29 182.254.116.116",
            ipv6: '2402:4e00::'
          },

          {
            title: '百度DNS',
            description: '百度DNS 180.76.76.76',
            // icon: 'res/b.gif',
            other: "180.76.76.76",
            ipv6: '2400:da00::6666'
          },
          {
            title: '114DNS',
            description: '114DNS',
            // icon: 'res/1.gif',
            other: "114.114.114.114 114.114.115.115",
            ipv6: ''
          },
          {
            title: '默认DNS',
            description: '默认DNS',
            // icon: 'res/default.png',
            other: "empty",
            ipv6: 'empty'
          },
          {
            title: '测速',
            description: '测速',
            // icon: 'res/default.png',
            other: "testSpeed",
            ipv6: 'testSpeed'
          },
        ])
      },
      // 子输入框内容变化时被调用 可选 (未设置则无搜索)
      search: (action, searchWord, callbackSetList) => {
        // 获取一些数据
        // 执行 callbackSetList 显示出来
        callbackSetList()
      },
      // 用户选择列表中某个条目时被调用
      select: (action, itemData, callbackSetList) => {

        let select_device = utools.dbStorage.getItem('select_device');
        if (select_device == null) {
          utools.dbStorage.setItem('select_device', itemData.title);
          window.utools.showNotification("网卡选择成功,重新进入选择")
          window.utools.hideMainWindow()
          window.utools.outPlugin()
          // return
        }
        let changeDnsType = utools.dbStorage.getItem('dns_type');
        if (changeDnsType == null) {
          changeDnsType = 'ipv4'
        }
        if (utools.isMacOs()) {
          pingSpeed = pingMacSpeed
        }
        if (utools.isWindows()) {
          pingSpeed = pingWinSpeed
        }
        if (itemData.other == 'testSpeed') {
          ali = pingSpeed(changeDnsType == 'ipv4' ? '223.5.5.5' : '2400:3200::1', 'ali');
          // window.utools.showNotification(ali)
          oofour = pingSpeed("114.114.114.114", '114');
          gspeed = pingSpeed(changeDnsType == 'ipv4' ? '8.8.8.8' : '2001:4860:4860::8888', 'gspeed')
          tspeed = pingSpeed(changeDnsType == 'ipv4' ? '119.29.29.29' : '2402:4e00::', 'tspeed')
          cspeed = pingSpeed(changeDnsType == 'ipv4' ? '1.1.1.1' : '2606:4700:4700::1111', 'cspeed')
          bspeed = pingSpeed(changeDnsType == 'ipv4' ? '180.76.76.76' : '2400:da00::6666', 'bspeed')
          cspeed = pingSpeed(changeDnsType == 'ipv4' ? '1.1.1.1' : '2606:4700:4700::1111', 'cspeed')
          callbackSetList([{
              title: '阿里DNS,当前延迟' + utools.dbStorage.getItem('ali'),
              description: '阿里DNS 223.5.5.5/223.6.6.6',
              // icon: 'res/a.gif',
              other: "223.5.5.5 223.6.6.6",
              ipv6: '2400:3200::1 2400:3200:baba::1'
            },
            {
              title: '谷歌DNS,当前延迟' + utools.dbStorage.getItem('gspeed'),
              description: '谷歌DNS',
              // icon: 'res/g.gif',
              other: "8.8.8.8 8.8.4.4",
              ipv6: '2001:4860:4860::8888 2001:4860:4860::8844'
            },
            {
              title: 'CFDNS,当前延迟' + utools.dbStorage.getItem('cspeed'),
              description: 'CloudflareDNS',
              // icon: 'res/c.gif',
              other: "1.1.1.1",
              ipv6: '2606:4700:4700::1111 2606:4700:4700::1001'
            },
            {
              title: '腾讯DNS,当前延迟' + utools.dbStorage.getItem('tspeed'),
              description: '腾讯DNSpod 119.29.29.29/182.254.116.116',
              // icon: 'res/t.gif',
              other: "119.29.29.29 182.254.116.116",
              ipv6: '2402:4e00::'
            },

            {
              title: '百度DNS,当前延迟' + utools.dbStorage.getItem('tspeed'),
              description: '百度DNS 180.76.76.76',
              // icon: 'res/b.gif',
              other: "180.76.76.76",
              ipv6: '2400:da00::6666'
            },
            {
              title: '114DNS,当前延迟' + utools.dbStorage.getItem('114'),
              description: '114DNS',
              // icon: 'res/1.gif',
              other: "114.114.114.114 114.114.115.115",
              ipv6: ''
            },
            {
              title: '默认DNS',
              description: '默认DNS',
              // icon: 'res/default.png',
              other: "empty",
              ipv6: 'empty'
            },
            {
              title: '测速',
              description: '测速',
              // icon: 'res/default.png',
              other: "testSpeed",
              ipv6: 'testSpeed'
            },
          ])
          return
        }

        // window.utools.hideMainWindow()
        const dns = changeDnsType == 'ipv4' ? itemData.other : itemData.ipv6
        // window.utools.showNotification("1")
        if (dns != "") {

          if (utools.isMacOs()) {
            // window.utools.showNotification("1")
            setMacDns(dns, select_device)
            window.utools.copyText(dns)
          }
          if (utools.isWindows()) {
            setWinDns(dns, select_device)
            window.utools.copyText(dns)
          }


        } else {

          window.utools.showNotification("请输入Dns,或者不支持改ipv6")

        }
        // window.utools.showNotification("2")
        window.utools.hideMainWindow()
        // window.utools.outPlugin()
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "搜索"
    }
  }

}