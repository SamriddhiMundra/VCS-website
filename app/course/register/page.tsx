// import { auth } from "@/auth";
// import { redirect } from "next/navigation";
// import RegisterFormPage from "./RegisterFormPage";

// export default async function Page() {
//   const session = await auth();

//   // If no session → redirect to login/auth
//   if (!session?.user?.email) {
//     redirect("/auth");
//   }

//   // Fetch registration status
//   const baseUrl =
//     process.env.NODE_ENV === "production"
//       ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
//       : "http://localhost:3000";

//   const req = await fetch(`${baseUrl}/api/user/${session.user.email}`, {
//     cache: "no-store",
//   });

//   const res = await req.json();

//   // If already registered → redirect to /course
//   if (res?.registered_course_id) {
//     redirect("/course");
//   }

//   // If unregistered → render form
//   return <RegisterFormPage />;
// }

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import RegisterFormPage from "./RegisterFormPage";

export default async function Page() {
  const session = await auth();

  // 1) If no session → redirect to /auth
  if (!session?.user?.email) {
    redirect("/auth");
  }

  let isRegistered = false;

  try {
    // 2) Safely construct base URL from host headers
    const headerList = await headers();   // <--- IMPORTANT FIX
    const host =
      headerList.get("x-forwarded-host") ||
      headerList.get("host") ||
      "localhost:3000";

    const protocol =
      headerList.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "production" ? "https" : "http");

    const baseUrl = `${protocol}://${host}`;

    console.log("BASE URL:", baseUrl);

    // 3) Fetch user registration status
    const req = await fetch(`${baseUrl}/api/user/${session.user.email}`, {
      cache: "no-store",
    });

    if (!req.ok) {
      throw new Error("HTTP error " + req.status);
    }

    const res = await req.json();
    isRegistered = Boolean(res?.registered_course_id);
  } catch (error) {
    console.error("Error loading registration status:", error);
  }

  // 4) If already registered → redirect to /course
  if (isRegistered) {
    redirect("/course");
  }

  // 5) If user allowed → show form
  return <RegisterFormPage />;
}

