import type { TaskStatus } from './TaskRow'

const tones: Record<TaskStatus, string> = {
  done: 'bg-green-500',
  progress: 'bg-amber-500',
  hold: 'bg-blue-500',
}

export default function StatusDot({ status }: { status: TaskStatus }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${tones[status]}`} />
}
