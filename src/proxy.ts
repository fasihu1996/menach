import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const LOCALE_RE = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);
const PRODUCER_ROUTE_RE = new RegExp(
    `^/(?:(?:${routing.locales.join("|")})/)?(new-item|new-collection|\\d+/upload)(?:/|$)`,
);

export default async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    const { data } = await supabase.auth.getClaims();
    const isProducer = !!data?.claims;

    const { pathname } = request.nextUrl;

    if (PRODUCER_ROUTE_RE.test(pathname) && !isProducer) {
        const locale = pathname.match(LOCALE_RE)?.[1] ?? routing.defaultLocale;
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = `/${locale}/auth/login`;
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const response = intlMiddleware(request);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie);
    });
    return response;
}

export const config = {
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
