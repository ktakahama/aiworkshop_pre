import Head from 'next/head'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Next.js Sample App</title>
        <meta name="description" content="Next.js sample application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Next.js!
        </h1>
        <p className="text-lg text-gray-600">
          Get started by editing pages/index.tsx
        </p>
      </main>
    </div>
  )
}
