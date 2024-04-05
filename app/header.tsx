import Link from 'next/link';

export default function Header() {
  return (
    <header className='sticky top-0 bg-zinc-900'>
      <div className='max-w-7xl mx-auto h-12 flex items-center gap-8 shadow'>
        <h1 className='text-xl'>ColorWeave</h1>
        <Link href='/'>Home</Link>
      </div>
    </header>
  );
}
