import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoApp from './TodoApp'
import { fetchSampleTodos } from '@/lib/api'
beforeEach(() => {
  localStorage.clear()
})

test('TODO を追加・完了・削除できる', async () => {
  const user = userEvent.setup()
  render(<TodoApp />)
  const input = screen.getByRole('textbox', { name: 'やること' })
  // 追加
  await user.type(input, '牛乳を買う{Enter}')
  await user.type(input, 'レポート提出{Enter}')
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(screen.getByText(/残り\s*2\s*件/)).toBeInTheDocument()

  // 完了
  await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
  expect(screen.getByText(/残り\s*1\s*件/)).toBeInTheDocument()
  // 削除
  await user.click(screen.getByRole('button', { name: 'レポート提出を削除' }))
  expect(screen.queryByText('レポート提出')).not.toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(1)
})

test('localStorage に保存された TODO が最初から表示される', () => {
  localStorage.setItem('todos', JSON.stringify([{ id: '1', text: '保存済みの TODO', done: true }]))
  render(<TodoApp />)
  expect(screen.getByRole('checkbox', { name: '保存済みの TODO' })).toBeChecked()
  expect(screen.getByText(/残り\s*0\s*件/)).toBeInTheDocument()
})

test('空白だけでは TODO は増えない', async () => {

  const user = userEvent.setup()
  render(<TodoApp />)
  await user.type(screen.getByRole('textbox', { name: 'やること' }), '   {Enter}')
  expect(screen.getByText('やることはありません')).toBeInTheDocument()
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
})

 afterEach(() => {
  jest.restoreAllMocks()
})

test('すべて削除：キャンセルしたら何も消えない', async () => {
  const user = userEvent.setup()
  localStorage.setItem('todos', JSON.stringify([{ id: '1', text: '牛乳を買う', done: false }]))
  jest.spyOn(window, 'confirm').mockReturnValue(false)
  render(<TodoApp />)
  await user.click(screen.getByRole('button', { name: 'すべて削除' }))
  expect(window.confirm).toHaveBeenCalledWith('すべての TODO を削除しますか？')
  expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
})

test('すべて削除：OK なら全部消える', async () => {
  const user = userEvent.setup()
  localStorage.setItem('todos', JSON.stringify([{ id: '1', text: '牛乳を買う', done: false }]))
  jest.spyOn(window, 'confirm').mockReturnValue(true)
  render(<TodoApp />)
  await user.click(screen.getByRole('button', { name: 'すべて削除' }))
  expect(screen.getByText('やることはありません')).toBeInTheDocument()
})

jest.mock('@/lib/api')

test('サンプルを読み込むと一覧に追加される', async () => {
  const user = userEvent.setup()
  localStorage.setItem('todos', JSON.stringify([{ id: '1', text: '牛乳を買う', done: false }]))
  fetchSampleTodos.mockResolvedValue(['サンプル1', 'サンプル2'])
  render(<TodoApp />)
  await user.click(screen.getByRole('button', { name: 'サンプルを読み込む' }))
  expect(await screen.findByText('サンプル2')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
  expect(screen.getByText(/残り\s*3\s*件/)).toBeInTheDocument()
})

