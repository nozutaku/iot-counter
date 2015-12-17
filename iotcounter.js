var http = require('http');
var request = require('request');
var fs = require('fs');

var server = http.createServer();
server.on('request', doRequest);
server.listen(process.env.PORT, process.env.IP);
console.log('Server running!');


var last_update;

// リクエストの処理
function doRequest(req, res) {

	// KintoneDBから取得
	var options = {
		url: 'https://v2urc.cybozu.com/k/v1/records.json?app=17',
		headers: {'X-Cybozu-API-Token': 'hide.listen to nozu'},
		json: true
	};
	request.get(options, function(error, response, body){
		if(!error && response.statusCode == 200){
				console.log("get success!");


				//ファイルを同期型で読む
				var data = fs.readFileSync('./index.html', 'UTF-8');

				var num = Object.keys(body.records).length;
				console.log("num = " + num);
				var total_count=0;
				var today_count=0;

				for (var i = 0; i < num; i++){

					var today_is = isToday(body.records[i].time.value);
//					console.log(body.records[i].time.value + " is " + today_is );
					if(today_is == 1){
						today_count = today_count + parseInt(body.records[i].count.value);
					}


					total_count = total_count + parseInt(body.records[i].count.value);
					last_update = body.records[i].time.value;

//					console.log("count = " + body.records[i].count.value);
//					console.log("time = " + body.records[i].time.value);
				}

				console.log("total_count = " + total_count);
				
				//出力！

				var string1 = "today = " + String(today_count);
				var string2 = "total = " + String(total_count);

	            var data2 = data.
	                replace(/@content1@/g, string1).
	                replace(/@content2@/g, string2);

				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(data2);
				res.end();


		}else{
			console.log('error: ' + response.statusCode);
		    res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('sorry, I can NOT get DB.\n');
			res.end();

		}
	});





/*********** DB読み出しが非同期処理のためうまくいかない(ここから) *****
	fs.readFile('./index.html', 'UTF-8',
		function(err, data){

			var count = getDB();
			console.log("before show count = " + count);

			if( count != 0){
				var string1 = "today = xx  <- coming soon";
				var string2 = "total = " + String(count);


	            var data2 = data.
	                replace(/@content1@/g, string1).
	                replace(/@content2@/g, string2);

				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(data2);
				res.end();
			}
		});
********** DB読み出しが非同期処理のためうまくいかない(ここまで) ******/

}

// kintone databaseから情報を取り出す（本処理をメイン処理doRequestに入れるので下記利用しない）
function getDB(){


	// KintoneDBから取得
	var options = {
		url: 'https://v2urc.cybozu.com/k/v1/records.json?app=17',
		headers: {'X-Cybozu-API-Token': '4DRIq9OCEiwk8pqAkYN5WG5tmQ41QZ5Mak8FRBli'},
		json: true
	};
	request.get(options, function(error, response, body){
		if(!error && response.statusCode == 200){
				console.log("get success!");

				var num = Object.keys(body.records).length;
				console.log("num = " + num);
				var total_count=0;

				for (var i = 0; i < num; i++){

					total_count = total_count + parseInt(body.records[i].count.value);
					last_update = body.records[i].time.value;

//					console.log("count = " + body.records[i].count.value);
//					console.log("time = " + body.records[i].time.value);
				}

				console.log("total_count = " + total_count);
				return(parseInt(total_count));

/*
				console.log("lat = " + body.records[0].latitude.value);
				console.log("lon = " + body.records[0].longitude.value);
				console.log("count = " + body.records[0].count.value);
				console.log("time = " + body.records[0].time.value);
*/

		}else{
			console.log('error: ' + response.statusCode);

		}
	});

return(0);

}

function isToday( iso_date ){	// "2015-12-16T20:29:00Z"というString
	var ret;

	iso_date_formatted = new Date( iso_date );
	nowDate = new Date();
	
//	console.log("iso_date_formatted = " + iso_date_formatted.getDate() );
//	console.log("nowDate = " + nowDate.getDate() );

	if( iso_date_formatted.getDate() == nowDate.getDate() ){
		ret = 1;
	}else{
		ret = 0;
	}
	
	return( ret );

}
