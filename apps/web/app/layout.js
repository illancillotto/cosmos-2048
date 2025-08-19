import './globals.css'

export const metadata = {
  title: 'Cosmos 2048',
  description: 'A 2048 game with Cosmos ecosystem theme',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}