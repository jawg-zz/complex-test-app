import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complex Test App',
  description: 'Full-stack test application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
