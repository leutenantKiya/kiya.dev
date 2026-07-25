import { useLanguage } from "@/components/providers/LanguageProvider";
import { dictionary, type TranslationKey } from "@/lib/dictionary";

export function useTranslation(){
    const { lang, setLang } = useLanguage();

    const t = (key: TranslationKey): string => {
        return dictionary[lang]?.[key] ?? dictionary["en"][key] ?? key;
    };

    return {t, lang, setLang};
}