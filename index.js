/*/!*const http = require("http");

const fork = require("child_process").fork;

const server = http.createServer((req, res) => {
  if (req.url === "/compute") {
    const compute = fork("./fork_compute.js");
    compute.send("开启一个新的子进程");
    compute.on("message", sum => {
      res.end(`Sum is ${sum}`);
      compute.kill();
    });
    compute.on("close", (code, signal) => {
      console.log(
        `收到close事件，子进程收到信号${signal}而终止，退出码${code}`
      );
      compute.kill();
    });
  } else {
    res.end(`ok`);
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log(`server started at http://${"127.0.0.1"}:${3000}`);
});*!/

const http = require("http");
const numCPUs = require("os").cpus().length;
const cluster = require("cluster");
if (cluster.isMaster) {
  console.log("Master proces id is", process.pid);
  //fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", function(worker, code, signal) {
    console.log("worker process died, id", worker.process.pid);
  });
} else {
  console.log(1231);
  http
    .createServer(function(req, res) {
      res.writeHead(200);
      res.end("hello word");
    })
    .listen(8000);
}*/

var a = { a: 1 };

let b

function f(param) {
  b= param;
  b.aa=123
}

f(a)
console.log(a)
