module.exports = function (ctx,req,res) {
  var request = require('request');
  var moment = require('moment');

  var response_url = ctx.body.response_url;
  
  var postToSlack=function(jsonData){
      request.post({
        url: response_url,
        body: jsonData,
        json: true
      }, function (error, response, responseBody) {
      
      });
  };
  
  var color=function(code){
    if(code==="Green"){
      return "#00ff00";
    }
    else{
      return "#ff0000";
    }
  }; 
  
  var envUrl=function(env){
    var url;
    if (env==="tmus"){
      url='https://mina-us.moj.io/status';
    }
    else{
      url='https://mina-eu.moj.io/status';
    }
    return url;    
  };
  
  var getHelp=function(){
        var attachments=[];
        attachments.push({
          "color": "#0000ff",
          "fields": [
              {
                  "title": "/wt stat [tmus|tmcz]]",
                  "value": "Device Info (Total,Driving,Active) and Platform Delay."
              },
              {
                  "title": "/wt stat [tmus|tmcz]-transport",
                  "value": "Transports Info (iOS, Android, WebSocket, HTTPPOST, MQTT)."
              },
              {
                  "title": "/wt stat [tmus|tmcz]-api",
                  "value": "Api Info (Me, Login, Vehicles, Mojios)."
              },
              {
                  "title": "/wt stat [tmus|tmcz]-partitions",
                  "value": "IMEIs (Partitions) Info, including slowest and fastest."
              },
          ]
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Dashboard for TMUS",
          "title_link": "http://tmus.status.moj.io/#/dashboard",
          "text": "http://tmus.status.moj.io/#/dashboard"
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Dashboard for TMCZ",
          "title_link": "http://tmcz.status.moj.io/#/dashboard",
          "text": "http://tmcz.status.moj.io/#/dashboard"
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Mina Status for TMUS in RAW JSON",
          "title_link": "https://mina-us.moj.io/status",
          "text": "https://mina-us.moj.io/status"
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Mina Status for TMCZ in RAW JSON",
          "title_link": "https://mina-eu.moj.io/status",
          "text": "https://mina-eu.moj.io/status"
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Mina Settings for TMUS",
          "title_link": "https://mina-us.moj.io/settings",
          "text": "https://mina-us.moj.io/settings"
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Mina Settings for TMCZ",
          "title_link": "https://mina-eu.moj.io/settings",
          "text": "https://mina-eu.moj.io/settings"
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Mina incidents list for TMUS",
          "title_link": "https://mina-us.moj.io/incident",
          "text": "https://mina-us.moj.io/incident"
        });

        attachments.push({
          "color": "#0000ff",
          "title": "Mina incidents listfor TMCZ",
          "title_link": "https://mina-us.moj.io/incident",
          "text": "https://mina-us.moj.io/incident"
        });

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({response_type: 'in_channel', text: "",attachments: attachments}));

  };
  
  var getGeneral=function(env){
    
    request(envUrl(env), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonObject = JSON.parse(body);
      
      var dataString='';
      var attachments=[];
      
      try{
        var LastContactTime=new Date(jsonObject.Stat.LastContactTime);
        var diff = (new Date()) - LastContactTime;
        if (diff>1000*60){
          dataString="Due to platform delay the below values are for " + moment().add(-diff,'ms').fromNow();
        } 
        
        attachments.push({
            "color": "#0000FF",
            "text": jsonObject.Stat.Mojios.toLocaleString('en-US', {minimumFractionDigits: 0}),
            "footer": "Total Devices",
            "footer_icon": "https://cdn2.iconfinder.com/data/icons/4web-3/139/box-128.png",
        });

        attachments.push({
            "color": "#0000FF",
            "text": jsonObject.Stat.NoLongerActive.toLocaleString('en-US', {minimumFractionDigits: 0}),
            "footer": "No Longer Active",
            "footer_icon": "https://cdn2.iconfinder.com/data/icons/4web-3/139/box-128.png",
        });

        attachments.push({
            "color": "#0000FF",
            "text": jsonObject.Stat.DrivingRightNow.toLocaleString('en-US', {minimumFractionDigits: 0}),
            "footer": "Currently Driving",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/car-silhouettes/1000/city-car-128.png",
        });

        attachments.push({
            "color": "#0000FF",
            "text": jsonObject.Stat.ReportingRecently.toLocaleString('en-US', {minimumFractionDigits: 0}),
            "footer": "Active Vehicles",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/car-silhouettes/1000/city-car-128.png",
        });

        attachments.push({
            "color": color(jsonObject.Status.Title),
            "fields": [
                {
                    "title": "Delay",
                    "value": (jsonObject.Platform.Delay.WeightedAvg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s " +
                    "- last event recieved " +
                    moment().add(-parseInt(jsonObject.Platform.TimeSpanSinceLastEventReceived),'ms').fromNow()
                }
            ],
            "footer": "Platform",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/REALVISTA/database/png/128/database.png",
        });
      
      }
      catch(e){
        
      }
      
      postToSlack({response_type: 'in_channel', text: dataString,attachments: attachments});

    }
  });

};
  
  var getTransport=function(env){
    
    request(envUrl(env), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonObject = JSON.parse(body);
      
      var dataString='';
      var attachments=[];
      
      try{

        attachments.push({
            "color": color(jsonObject.Notification.WebSocket.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": (jsonObject.Notification.WebSocket.Delay.Median/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Avg Delay",
                    "value": (jsonObject.Notification.WebSocket.Delay.Avg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": (jsonObject.Notification.WebSocket.Delay.WeightedAvg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Last Event",
                    "value": moment().add(-parseInt(jsonObject.Notification.WebSocket.TimeSpanSinceLastEventReceived),'ms').fromNow()
                }
            ],
            "footer": "WebSocket",
            "footer_icon": "https://cdn3.iconfinder.com/data/icons/simple-microphone-icon/512/Comment_Icon-2-128.png",
        });
      

        attachments.push({
            "color": color(jsonObject.Notification.HTTPPOST.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": (jsonObject.Notification.HTTPPOST.Delay.Median/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Avg Delay",
                    "value": (jsonObject.Notification.HTTPPOST.Delay.Avg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": (jsonObject.Notification.HTTPPOST.Delay.WeightedAvg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Last Event",
                    "value": moment().add(-parseInt(jsonObject.Notification.HTTPPOST.TimeSpanSinceLastEventReceived),'ms').fromNow()
                }


            ],
            "footer": "HTTPPOST",
            "footer_icon": "https://cdn3.iconfinder.com/data/icons/simple-microphone-icon/512/Comment_Icon-2-128.png",
        });

        attachments.push({
            "color": color(jsonObject.Notification.MQTT.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": (jsonObject.Notification.MQTT.Delay.Median/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Avg Delay",
                    "value": (jsonObject.Notification.MQTT.Delay.Avg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": (jsonObject.Notification.MQTT.Delay.WeightedAvg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Last Event",
                    "value": moment().add(-parseInt(jsonObject.Notification.MQTT.TimeSpanSinceLastEventReceived),'ms').fromNow()
                }


            ],
            "footer": "MQTT",
            "footer_icon": "https://cdn3.iconfinder.com/data/icons/simple-microphone-icon/512/Comment_Icon-2-128.png",
        });

        attachments.push({
            "color": color(jsonObject.Notification.iOS.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": (jsonObject.Notification.iOS.Delay.Median/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Avg Delay",
                    "value": (jsonObject.Notification.iOS.Delay.Avg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": (jsonObject.Notification.iOS.Delay.WeightedAvg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Last Event",
                    "value": moment().add(-parseInt(jsonObject.Notification.iOS.TimeSpanSinceLastEventReceived),'ms').fromNow()
                }


            ],
            "footer": "iOS",
            "footer_icon": "https://cdn3.iconfinder.com/data/icons/simple-microphone-icon/512/Comment_Icon-2-128.png",
        });
        
        attachments.push({
            "color": color(jsonObject.Notification.Android.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": (jsonObject.Notification.Android.Delay.Median/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Avg Delay",
                    "value": (jsonObject.Notification.Android.Delay.Avg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": (jsonObject.Notification.Android.Delay.WeightedAvg/1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + "s"
                },
                {
                    "title": "Last Event",
                    "value": moment().add(-parseInt(jsonObject.Notification.Android.TimeSpanSinceLastEventReceived),'ms').fromNow()
                }


            ],
            "footer": "Android",
            "footer_icon": "https://cdn3.iconfinder.com/data/icons/simple-microphone-icon/512/Comment_Icon-2-128.png",
        });
        
      }
      catch(e){
        
      }

      
      dataString+="";
      
      postToSlack({response_type: 'in_channel', text: dataString,attachments: attachments});

    }
  });

};

  var getAPI=function(env){
    
    request(envUrl(env), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonObject = JSON.parse(body);
      
      var dataString='';
      var attachments=[];
  
      if(typeof(jsonObject.API.Vehicles)!=="undefined"){
        attachments.push({
            "color": color(jsonObject.API.Vehicles.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": jsonObject.API.Vehicles.Delay.Median.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Avg Delay",
                    "value": jsonObject.API.Vehicles.Delay.Avg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": jsonObject.API.Vehicles.Delay.WeightedAvg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                }
            ],
            "footer": "Vehicles",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/web-development-5/500/api-code-window-128.png",
        });

      }

      if(typeof(jsonObject.API.Me)!=="undefined"){
        attachments.push({
            "color": color(jsonObject.API.Me.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": jsonObject.API.Me.Delay.Median.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Avg Delay",
                    "value": jsonObject.API.Me.Delay.Avg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": jsonObject.API.Me.Delay.WeightedAvg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                }
            ],
            "footer": "Me",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/web-development-5/500/api-code-window-128.png",
        });

      }      

      if(typeof(jsonObject.API.Simulator)!=="undefined"){
        attachments.push({
            "color": color(jsonObject.API.Simulator.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": jsonObject.API.Simulator.Delay.Median.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Avg Delay",
                    "value": jsonObject.API.Simulator.Delay.Avg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": jsonObject.API.Simulator.Delay.WeightedAvg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                }
            ],
            "footer": "Simulator",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/web-development-5/500/api-code-window-128.png",
        });

      }      

      if(typeof(jsonObject.API.Mojios)!=="undefined"){
        attachments.push({
            "color": color(jsonObject.API.Mojios.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": jsonObject.API.Mojios.Delay.Median.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Avg Delay",
                    "value": jsonObject.API.Mojios.Delay.Avg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": jsonObject.API.Mojios.Delay.WeightedAvg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                }
            ],
            "footer": "Mojios",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/web-development-5/500/api-code-window-128.png",
        });

      }      

      if(typeof(jsonObject.API.Accounts)!=="undefined"){
        attachments.push({
            "color": color(jsonObject.API.Accounts.Status.Title),
            "fields": [
                {
                    "title": "Median Delay",
                    "value": jsonObject.API.Accounts.Delay.Median.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Avg Delay",
                    "value": jsonObject.API.Accounts.Delay.Avg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                },
                {
                    "title": "Weighted Avg Delay",
                    "value": jsonObject.API.Accounts.Delay.WeightedAvg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
                }
            ],
            "footer": "Accounts",
            "footer_icon": "https://cdn4.iconfinder.com/data/icons/web-development-5/500/api-code-window-128.png",
        });

      }      

      dataString+="";
      
      postToSlack({response_type: 'in_channel', text: dataString,attachments: attachments});

    }
  });

};

  var getPartitions=function(env){

    request({url:  envUrl(env),timeout: 120000}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonObject = JSON.parse(body);
      
      var dataString='';
      var attachments=[];
      
      var keys=Object.keys(jsonObject.IMEI);
      if(keys.length>0)
      {
        var fastest={IMEI:keys[0],WeightedAvg:jsonObject.IMEI[keys[0]].Delay.WeightedAvg};
        var slowest={IMEI:keys[0],WeightedAvg:jsonObject.IMEI[keys[0]].Delay.WeightedAvg}; 
        
        var jpos;
        for(jpos=0;jpos<keys.length;jpos++){
          if(jsonObject.IMEI[keys[jpos]].Delay.WeightedAvg<fastest.WeightedAvg){
            fastest={IMEI:keys[jpos],WeightedAvg:jsonObject.IMEI[keys[jpos]].Delay.WeightedAvg};
          }
          
          if(jsonObject.IMEI[keys[jpos]].Delay.WeightedAvg>slowest.WeightedAvg){
            slowest={IMEI:keys[jpos],WeightedAvg:jsonObject.IMEI[keys[jpos]].Delay.WeightedAvg};
          }
          
        }
        
        attachments.push({
          "color": "#0000ff",
          "fields": [
              {
                  "title": "Fastest (" + fastest.IMEI + ")",
                  "value": fastest.WeightedAvg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
              },
              {
                  "title": "Slowest (" + slowest.IMEI + ")",
                  "value": slowest.WeightedAvg.toLocaleString('en-US', {minimumFractionDigits: 1}) + "ms"
              }
          ],
          "footer": "Partitions",
          "footer_icon": "https://cdn2.iconfinder.com/data/icons/sketchy-icons-v-1-2/128/partition_magic_copy.png",
        });
        
      }

      postToSlack({response_type: 'in_channel', text: dataString,attachments: attachments});

    }

  });

};
  
  //console.log(ctx);
  
  var sec=ctx.body.text;
  
  if(sec.length===0)
    sec="tmus";
  
  if(sec.toLowerCase()!=='help'){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({response_type: 'in_channel', text:":hourglass: Preparing Data For " + sec.split('-')[0].toUpperCase()}));
  }
  
  switch(sec.toLowerCase()){
    case 'help':
        getHelp();

      break;
      
    case 'tmus':
      getGeneral('tmus');
      break;
      
    case 'tmus-transport':
      getTransport('tmus');
      break;

    case 'tmus-api':
      getAPI('tmus');
      break;

    case 'tmus-partitions':
      getPartitions('tmus');
      break;

    case 'tmcz':
      getGeneral('tmcz');
      break;
      
    case 'tmcz-transport':
      getTransport('tmcz');
      break;

    case 'tmcz-api':
      getAPI('tmcz');
      break;

    case 'tmcz-partitions':
      getPartitions('tmcz');
      break;

  }
  
};
