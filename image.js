const express = require("express");
const listenNumber = 8009;
const app = express();
const bodyParser = require("body-parser");
const https = require('https');//创建服务器的
var formidable = require("formidable");
var path = require("path")
var fs = require("fs")
app.use(express.static('../../upload'))
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());//数据JSON类型

// 上传图片
app.post('/upload', (req, res, next) => {
  let defaultPath = '/upload/';
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
    let oldPath = filePath.split('\\')[filePath.split('\\').length - 1]; //原名
    let newPath = `${getRandomID()}.${backName}`; //新的随机生成名
    console.log("filePath: " + filePath);
    console.log("backName: " + backName);
    console.log("oldPath: " + oldPath);
    console.log("newPath: " + newPath);
    fs.rename("upload/" + oldPath, "upload/" + newPath, (err) => { //fs.rename重命名
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

app.listen(listenNumber);
console.log("imguploader server is listening on " + listenNumber);