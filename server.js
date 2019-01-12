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
    let string = fs.readFileSync('./index.html', 'utf-8');
    let cookies = request.headers.cookie.split('; ');
    let hash = {}
    cookies.forEach((item) =>{
      let parts = item.split('=');
      let key = parts[0];
      let value = parts[1];
      hash[key] = value
    })
    let email = hash[sign_in_email]

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
        hash[key] = decodeURIComponent(value);
      });
      let { email, password, password_confirm } = hash;
      if (email.indexOf('@') === -1) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8');
        response.write(`{
          "errors": {
            "email": "invalid"
          }
        }`)
      } else if (password != password_confirm) {
        response.statusCode = 400
        response.write('password is not same')
      } else {
        var users = fs.readFileSync('./db/users', 'utf-8')
        try {
          users = JSON.parse(users)
        } catch (error) {
          users = [];
        }
        let flag = users.findIndex((item) => { return item.email === email })
        if (flag != -1) {
          response.statusCode = 400
          response.write('email is inuse')
        } else {
          users.push({ email: email, password: password })
          var userString = JSON.stringify(users);
          fs.writeFileSync('./db/users', userString)
          response.statusCode = 200;
        }
      }
      response.end()
    })

  } else if (path === '/signin' && method === 'GET') {
    let string = fs.readFileSync('./signin.html', 'utf-8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html;charset=utf-8');
    response.write(string);
    response.end()
  } else if (path === '/signin' && method === 'POST') {
    let hash = {};
    readBody(request).then((body) => {
      let strings = body.split('&')
      strings.forEach((string) => {
        let parts = string.split('=')
        let key = parts[0];
        let value = parts[1];
        hash[key] = decodeURIComponent(value);
      });
      let { email, password } = hash;
      var users = fs.readFileSync('./db/users', 'utf-8')
      try {
        users = JSON.parse(users)
      } catch (error) {
        users = []
      }
      let flag = users.findIndex((item) => {
        return item.email === email && item.password === password
      })
      if (flag != -1) {
        response.setHeader('Set-Cookie',`sign_in_email=${email}`)
        response.statusCode = 200
        response.write('got it')
      } else {
        response.statusCode = 401
      }
      response.end()
    })
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