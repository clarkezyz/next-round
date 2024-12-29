import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Next Round Admin
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {session.user.name || session.user.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Sign Out
              </Link>
            </div>
          </div>
          {/* Navigation */}
          <nav className="mt-4">
            <ul className="flex gap-6">
              <li>
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/coasters"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Coasters
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/artwork"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Artwork
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/venues"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Venues
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/analytics"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}