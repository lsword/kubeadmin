/*
const Koa = require('koa');
const {koaBody} = require('koa-body');
const path = require('path');
const fs = require('fs');

const app = new Koa();

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/api/uploads'), // 设置文件上传目录
    keepExtensions: true, // 保持文件的后缀
  }
}));

app.use(async (ctx) => {
  if (ctx.method === 'POST' && ctx.path === '/api/upload') {
    const file = ctx.request.files.file; // 获取上传的文件
    if (!file) {
      ctx.status = 400;
      ctx.body = 'No file uploaded.';
      return;
    }
    console.log(file);
    // 处理文件逻辑，比如存储文件信息到数据库
    ctx.body = {
      message: 'File uploaded successfully',
      filePath: file.path
    };
  } else {
    console.log("xxx")
    ctx.status = 404;
    ctx.body = 'Not Found';
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
*/



const Koa = require('koa');
const serve = require('koa-static');
const path = require('path');
const k8sClusterRoutes = require('./routes/k8sCluster');
const appStoreRoutes = require('./routes/appStore');
const helmRoutes = require('./routes/helm');
const Router = require('koa-router');

const app = new Koa();

app.use(serve(path.join(__dirname, './static')));

const router = new Router();
router.use('/api/k8s', k8sClusterRoutes.routes());
router.use('/api/appstore', appStoreRoutes.routes());
router.use('/api/helm', helmRoutes.routes());
app.use(router.routes()).use(router.allowedMethods());


module.exports = app;
