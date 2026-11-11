
import { useTranslation } from "react-i18next";
import "../styles/LanguageSwitcher.css";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    return (
        <div className="language-switcher">
            <button
                type="button"
                className={i18n.resolvedLanguage === "it" ? "active" : ""}
                onClick={() => i18n.changeLanguage("it")}
                aria-label="Italiano"
            >
                IT
            </button>

            <button
                type="button"
                className={i18n.resolvedLanguage === "en" ? "active" : ""}
                onClick={() => i18n.changeLanguage("en")}
                aria-label="English"
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
