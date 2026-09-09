import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { verifyProducerSession } from "@/lib/dal";
import LoginForm from "./LoginForm";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    const { next } = await searchParams;
    const t = await getTranslations("Login");

    const session = await verifyProducerSession();
    if (session) {
        redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
    }

    return (
        <div className="mx-auto flex max-w-xl flex-col p-4">
            <h1 className="mb-4 font-heading text-2xl font-bold">
                {t("login")}
            </h1>
            <LoginForm next={next} />
        </div>
    );
}
