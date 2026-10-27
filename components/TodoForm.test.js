import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoForm from './TodoForm'

// 3つの探し方のうち、おすすめは getByRole。
// 「入力欄である」という役割と名前の両方を確かめられ、読み上げソフトの使い方とも一致する。
// getByPlaceholderText は、プレースホルダーが入力すると消える補助の文字なので、名前の代わりにはならない。
test('getByRole で入力欄を探せる', () => {
  render(<TodoForm onAdd={() => {}} />)
  expect(screen.getByRole('textbox', { name: 'やること' })).toBeInTheDocument()
})

test('getByLabelText で入力欄を探せる', () => {
  render(<TodoForm onAdd={() => {}} />)
  expect(screen.getByLabelText('やること')).toBeInTheDocument()
})

test('getByPlaceholderText で入力欄を探せる', () => {
  render(<TodoForm onAdd={() => {}} />)
  expect(screen.getByPlaceholderText('やることを入力')).toBeInTheDocument()
})

test('入力して「追加」を押すと、onAdd が入力した文字で呼ばれる', async () => {
  const user = userEvent.setup()
  const handleAdd = jest.fn()
  render(<TodoForm onAdd={handleAdd} />)
  await user.type(screen.getByRole('textbox', { name: 'やること' }), '牛乳を買う')
  await user.click(screen.getByRole('button', { name: '追加' }))
  expect(handleAdd).toHaveBeenCalledTimes(1)
  expect(handleAdd).toHaveBeenCalledWith('牛乳を買う')
})

test('Enter キーでも追加でき、前後の空白は取り除かれ、入力欄が空に戻る', async () => {
  const user = userEvent.setup()
  const handleAdd = jest.fn()
  render(<TodoForm onAdd={handleAdd} />)
  const input = screen.getByRole('textbox', { name: 'やること' })
  await user.type(input, '  レポート提出  {Enter}')
  expect(handleAdd).toHaveBeenCalledWith('レポート提出')
  expect(input).toHaveValue('')
})

test('空白だけなら onAdd は呼ばれない', async () => {
  const user = userEvent.setup()
  const handleAdd = jest.fn()
  render(<TodoForm onAdd={handleAdd} />)
  await user.type(screen.getByRole('textbox', { name: 'やること' }), '   {Enter}')
  expect(handleAdd).not.toHaveBeenCalled()
})

test('空のまま追加するとエラーメッセージが出る', async () => {

  const user = userEvent.setup()
  render(<TodoForm onAdd={jest.fn()} />)
  await user.click(screen.getByRole('button', { name: '追加' }))
  expect(screen.getByRole('alert')).toHaveTextContent('やることを入力してください')
})

test('入力を始めるとエラーメッセージが消える', async () => {
  const user = userEvent.setup()
  render(<TodoForm onAdd={jest.fn()} />)
  await user.click(screen.getByRole('button', { name: '追加' }))
  await user.type(screen.getByRole('textbox', { name: 'やること' }), 'a')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('普通に追加したときはエラーメッセージが出ない', async () => {
  const user = userEvent.setup()
  render(<TodoForm onAdd={jest.fn()} />)
  await user.type(screen.getByRole('textbox', { name: 'やること' }), '牛乳を買う{Enter}')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
