import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import Header from './Header'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

test('/ にいるときは「TODO」が現在のページになる', () => {
  usePathname.mockReturnValue('/')
  render(<Header />)
  expect(screen.getByRole('link', { name: 'TODO' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'このアプリについて' })).not.toHaveAttribute('aria-current')
})

test('/about にいるときは「このアプリについて」が現在のページになる', () => {
  usePathname.mockReturnValue('/about')
  render(<Header />)
  expect(screen.getByRole('link', { name: 'このアプリについて' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'TODO' })).not.toHaveAttribute('aria-current')
})
