const express = require("express");
const listenNumber = 8009;
const app = express();
const bodyParser = require("body-parser");
const http = require('http');
const https = require('https');//创建服务器的
var formidable = require("formidable");
var path = require("path")
var fs = require("fs")
app.use(express.static('../upload'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());//数据JSON类型


//根据项目的路径导入生成的证书文件
const privateKey = fs.readFileSync(path.join(__dirname, './certificate/server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './certificate/server.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };


// 上传图片
app.post('/upload', (req, res, next) => {
  let defaultPath = '../upload/';
  let uploadDir = path.join(__dirname, defaultPath);
  let form = new formidable.IncomingForm();
  let getRandomID = () => Number(Math.random().toString().substr(4, 10) + Date.now()).toString(36)
  form.uploadDir = uploadDir;  //设置上传文件的缓存目录
  form.encoding = 'utf-8';        //设置编辑
  form.keepExtensions = true;     //保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.locals.error = err;
      res.render('index', { title: TITLE });
      return;
    }
    let filePath = files.file['path'];
    let backName = filePath.split('.')[1]; //后缀名
    let oldPath = filePath.split('/')[filePath.split('/').length - 1]; //原名---由于路径符合不同，windows使用'\\',linux使用'/'
    let newPath = `${getRandomID()}.${backName}`; //新的随机生成名
    console.log("filePath: " + filePath);
    console.log("backName: " + backName);
    console.log("oldPath: " + oldPath);
    console.log("newPath: " + newPath);
    fs.rename(defaultPath + oldPath, defaultPath + newPath, (err) => { //fs.rename重命名
      if (!err) {
        console.log("rename success");
        newPath = `http://localhost:${listenNumber}/${newPath}`
        res.json({ flag: true, path: newPath });
        console.log("newPath: " + newPath);
        console.log("\n");
      } else {
        console.log("rename fail");
        res.json({ flag: false, path: '' });
      }
    })

  })
})


//创建http和HTTPS服务器
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

//设置http和https的访问端口号
const PORT = 8010;
const SSLPORT = 8009;

//创建http服务器
httpServer.listen(PORT, function () {
  console.log('HTTP Server is running on: http://localhost:%s', PORT);
});

//创建https服务器
httpsServer.listen(SSLPORT, function () {
  console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});
