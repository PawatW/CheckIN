import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null;

  const { name, email, role } = session.user;
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { faceEmbedding: true },
  });
  const faceEnrolled = (user?.faceEmbedding.length ?? 0) > 0;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className="flex flex-col items-center pt-16 pb-8 px-5"
        style={{ background: "linear-gradient(145deg, #1D9E75, #0E8A62)" }}
      >
        <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold mb-3">
          {initials}
        </div>
        <p className="text-white text-lg font-bold">{name}</p>
        <p className="text-white/70 text-sm">{email}</p>
        <span className="mt-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
          {role === "ADMIN" ? "Administrator" : "Employee"}
        </span>
      </div>

      {/* Face ID status card */}
      <div className="mx-4 mt-4">
        <div
          className={`rounded-2xl px-4 py-3.5 flex items-center justify-between border ${
            faceEnrolled
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                faceEnrolled ? "bg-emerald-100" : "bg-amber-100"
              }`}
            >
              <svg
                className={`w-5 h-5 ${faceEnrolled ? "text-emerald-600" : "text-amber-600"}`}
                fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${faceEnrolled ? "text-emerald-800" : "text-amber-800"}`}>
                Face ID {faceEnrolled ? "Enrolled ✓" : "Not Enrolled"}
              </p>
              <p className={`text-xs mt-0.5 ${faceEnrolled ? "text-emerald-600" : "text-amber-600"}`}>
                {faceEnrolled ? "Your face is registered for attendance" : "Required to punch in / out"}
              </p>
            </div>
          </div>
          <Link
            href="/profile/enroll"
            className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
              faceEnrolled
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-500 text-white"
            }`}
          >
            {faceEnrolled ? "Re-enroll" : "Enroll"}
          </Link>
        </div>
      </div>

      {/* Menu */}
      <div className="p-4 flex flex-col gap-2.5">
        {[
          { label: "Personal Info",  href: "#" },
          { label: "Notifications",  href: "#" },
          { label: "Security",       href: "#" },
          { label: "Help & Support", href: "#" },
          ...(role === "ADMIN" ? [{ label: "Admin: Locations", href: "/admin/locations" }] : []),
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-xl px-4 py-4 flex items-center justify-between border border-gray-100 active:bg-gray-50 transition"
          >
            <span className="text-sm font-medium text-gray-900">{item.label}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ))}

        {/* Sign Out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-4 text-red-600 font-semibold text-sm text-left mt-2 active:bg-red-100 transition"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
