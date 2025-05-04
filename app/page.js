import AdventureInput from '@/components/CreateAdventure';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <AdventureInput />
      <div className="mt-4 text-center">
        <Link href="/adventures" className="text-blue-500 hover:underline">
          Existing Adventures
        </Link>
      </div>
    </div>
  );
}