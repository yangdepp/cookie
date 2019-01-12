var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.argv[2];

if (!port) {
  console.log('请指定端口号\n例如node server.js 8888');
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = '';
  if (pathWithQuery.indexOf('?') >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/

  console.log('含查询字符串的路径\n' + pathWithQuery);

  if (path === '/') {
    let string = fs.readFileSync('./ajax/index3.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html;charset=utf-8');
    response.write(string);
    response.end()
  } else if (path === '/signup' && method === 'GET') {
    let string = fs.readFileSync('./signup.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string);
    response.end()
  } else if (path === '/signup' && method === 'POST') {
    let hash = {};
    readBody(request).then((body) => {
      let strings = body.split('&')
      strings.forEach((string) => {
        let parts = string.split('=')
        let key = parts[0];
        let value = parts[1];
        hash[key] = value;
      });
      console.log(hash)
      let { email, password, password_confirm } = hash;
      if (email.indexOf('@') === -1) {
        response.statusCode = 400
        response.write('email is bad')
      } else if (password != password_confirm) {
        response.statusCode = 400
        response.write('password is not same')
      } else {
        response.statusCode = 200;
      }
      response.end()
    })

  } else if (path === '/main3.js') {
    let string = fs.readFileSync('./ajax/main3.js', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/javascript;charset=utf-8');
    response.write(string);
    response.end()
  } else if (path === '/xxx') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/json;charset=utf-8');
    response.write(`
      {
        "note":{
          "to": "小谷",
          "from": "方方",
          "heading": "打招呼",
          "content": "hi"
        }
      }
    `);
    response.end()
  } else {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/html;charset=utf-8');
    response.write('出错了');
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
});

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}

server.listen(port);
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port);