"use client";

import { Button } from "./ui/button";
import { Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSelector() {
    const t = useTranslations("LangSelector");
    const pathname = usePathname();
    const router = useRouter();
    const currentLocale = useLocale();

    function handleSelect(locale: (typeof routing.locales)[number]) {
        router.replace(pathname, { locale });
    }

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button variant="default" size="icon">
                            <Globe />
                        </Button>
                    }
                />
                <DropdownMenuContent align="end">
                    {routing.locales.map((locale) => (
                        <DropdownMenuCheckboxItem
                            key={locale}
                            onClick={() => handleSelect(locale)}
                            checked={locale == currentLocale}
                        >
                            {t(locale)}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
