// app/routes/__root.tsx
import {
    Outlet,
    ScrollRestoration,
    createRootRoute,
  } from '@tanstack/react-router'
  import { Meta, Scripts } from '@tanstack/start'
  import type { ReactNode } from 'react'
  
  export const Route = createRootRoute({
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: 'TanStack Start Starter',
        },
      ],
    }),
    component: RootComponent,
  })
  
  function RootComponent() {
    return (
      <RootDocument>
        <Outlet />
      </RootDocument>
    )
  }
  
  function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <html>
        <head>
          <Meta />
          <style>
            {`.inlineP {
              display: inline
            }
            .inlineP > p:first-child {
              display: inline
            }
            .inlineP > p:last-child {
              margin-bottom: 0
            }`}
          </style>
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    )
  }