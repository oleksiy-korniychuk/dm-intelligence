import AdventureInput from '@/components/AdventureInput';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <AdventureInput />
      <div className="mt-4 text-center">
        <Link href="/run/1c793443-fac3-41bc-9ee0-857e5fb51f6d" className="text-blue-500 hover:underline">
          Start Adventure (not yet dynamic)
        </Link>
      </div>
    </div>
  );
}