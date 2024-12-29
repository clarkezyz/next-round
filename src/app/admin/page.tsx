import { createAPI } from "@/trpc/server";
import Link from "next/link";
import { auth } from "@/server/auth";

export default async function AdminDashboard() {
  const api = await createAPI();
  const dashboardData = await api.admin.getDashboardStats.fetch();
  const { stats, recentActivity, topVenues, popularArtwork, userGrowth } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Coasters</h3>
          <p className="mt-2 text-3xl font-semibold">{stats.totalCoasters}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Artwork</h3>
          <p className="mt-2 text-3xl font-semibold">{stats.pendingArtwork}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Venues</h3>
          <p className="mt-2 text-3xl font-semibold">{stats.activeVenues}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Scans</h3>
          <p className="mt-2 text-3xl font-semibold">{stats.totalScans}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              href="/admin/coasters"
              className="block rounded-md bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              Create New Coaster
            </Link>
            <Link
              href="/admin/artwork"
              className="block rounded-md bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              Review Pending Artwork
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="text-sm">
                  <p className="font-medium">
                    {activity.user.name || activity.user.email}
                  </p>
                  <p className="text-gray-600">
                    Scanned coaster at {activity.coaster.venue?.name || "Unknown Venue"}
                  </p>
                  <p className="text-gray-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Key Metrics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Top Venues</h3>
            {topVenues.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {topVenues.map((venue) => (
                  <li key={venue.id} className="text-sm">
                    <span className="font-medium">{venue.name}</span>
                    <span className="text-gray-600"> - {venue.totalScans} scans</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No data available</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Popular Artwork</h3>
            {popularArtwork.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {popularArtwork.map((art) => (
                  <li key={art.id} className="text-sm">
                    <span className="font-medium">{art.title || 'Untitled'}</span>
                    <span className="text-gray-600">
                      {' - '}{art.coasters.reduce((total: number, coaster) => 
                        total + coaster.scans.length, 0)} scans
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No data available</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">User Growth</h3>
            {userGrowth.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {userGrowth.map((day) => (
                  <li key={day.createdAt.toISOString()} className="text-sm">
                    <span className="font-medium">
                      {new Date(day.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-600"> - {day._count} new users</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}