'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname.startsWith('/consultas');
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex w-full">
            <Link href="/" className="flex items-center">
              <Image
                src="/favicon.ico"
                alt="Logo"
                width={32}
                height={32}
                className="mr-2"
              />
            </Link>
            <div className="flex ml-6 space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-900 hover:border-gray-300 hover:text-blue-600'
                }`}
              >
                Consultas
              </Link>
              <Link
                href="/medicamentos"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/medicamentos')
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-900 hover:border-gray-300 hover:text-blue-600'
                }`}
              >
                Medicamentos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 