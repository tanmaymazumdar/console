import { legacy_connect as connect } from 'react-redux'
import { redirect } from 'react-router'
import { compose } from 'redux'

import type { FC, JSX } from 'react'
import type { LoaderFunction, LoaderFunctionArgs } from 'react-router'

import { query } from '../network'

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs): Promise<unknown> => {
  const res = await query('/api/v1/auth/login', {
    method: 'GET',
    bypassCache: true
  })

  const data = await res.json()

  if (res.ok && data.authenticated && !request.url.includes('/dashboard')) {
    return redirect('/dashboard')
  }

  return
}

const LoginPage: FC = (): JSX.Element => {
  return <h1>Login page</h1>
}

export const mapStateToProps = (): Record<string, never> => ({})

export const mapDispatchToProps = (): Record<string, never> => ({})

export const Component = compose(connect(mapStateToProps, mapDispatchToProps))(LoginPage)
