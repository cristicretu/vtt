import { changeLanguage } from "i18next";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export function LanguageToggle() {
	const { i18n } = useTranslation();
	const language = i18n.resolvedLanguage;

	const langs = [
		{ text: "English", value: "en" },
		{ text: "Spanish", value: "es" },
	];
	const formatLanguage = (lng: string) => {
		return langs.find((lang) => lang.value === lng)?.text;
	};

	return (
		<Select value={language} onValueChange={changeLanguage}>
			<SelectTrigger className="!px-2 h-6 rounded border-primary/20 bg-secondary hover:border-primary/40">
				<div className="flex items-start gap-2">
					<Languages className="h-[14px] w-[14px]" />
					<span className="font-medium text-xs">{formatLanguage(language || "en")}</span>
				</div>
			</SelectTrigger>
			<SelectContent>
				{langs.map(({ text, value }) => (
					<SelectItem key={value} value={value} className="font-medium text-primary/60 text-sm">
						{text}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
