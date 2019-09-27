const fork = require("child_process").fork;
const cpus = require("os").cpus();

const server = require("net").createServer();

server.listen(3000);

process.title = "node-master";

const workers = {};

const createWorker = () => {
  const worker = fork("worker.js");

  worker.on("message", function(message) {
    if (message.act === "suicide") {
      createWorker();
    }
  });

  worker.on("exit", function(code, signal) {
    console.log("worker process exited, code: %s signal: %s", code, signal);

    delete workers[worker.pid];
  });

  //由于将 socket 传递给了子进程之后，net.Server#getConnections，net.Server#close 等等方法，原来的实现已经无效了，
  //为了保证功能，Node.js 又是怎么办的呢？答案可以大致概括为，父子进程之间，在同一地址下的 socket 传递时，
  //各自都额外维护一个关联列表存储这些 socket 信息和 ChildProcess 实例，并且父进程中的 net#Server 类实例自己保
  //存下所有父进程关联列表。在调用 net.Server#getConnections 这类方法时，遍历列表中的 ChildPorcess 实例发送
  //内部消息，子进程列表中的对应项收到内部消息并处理返回，父进程中再结合返回结果和对应着这个 ChildProcess 类实例
  //维护的 socket 信息，保证功能的正确性。
  worker.send("server", server);

  workers[worker.pid] = worker;

  console.log(
    "worker process created, pid: %s ppid: %s",
    worker.pid,
    process.pid
  );
};

for (let i = 0; i < cpus.length; i++) {
  createWorker();
}

process.once("SIGINT", close.bind(this, "SIGINT"));

// kill(2) Ctrl-C

process.once("SIGQUIT", close.bind(this, "SIGQUIT"));

// kill(3) Ctrl-

process.once("SIGTERM", close.bind(this, "SIGTERM"));

// kill(15) default

process.once("exit", close.bind(this));

function close(code) {
  console.log("进程退出！", code);

  if (code !== 0) {
    for (let pid in workers) {
      console.log("master process exited, kill worker pid: ", pid);

      workers[pid].kill("SIGINT");
    }
  }

  process.exit(0);
}
