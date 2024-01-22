// 任务批处理

export const tasks: { cb }[] = [] // 马上立即执行
const timer = []

export const workLoop = () => {
  let job
  while ((job = tasks.shift())) {
    job.cb()
  }
}

let schedulerCount = true

export const schedulerTask = cb => {
  const task = { cb }
  tasks.push(task)

  if (schedulerCount) {
    window.queueMicrotask(workLoop)
  }

  schedulerCount = false
}

export const resetSchedulerCount = () => {
  schedulerCount = true
}
