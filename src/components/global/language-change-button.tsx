import * as React from "react"
import { Check, ChevronsUpDown, Languages } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const languages = [
  { label: "Português", value: "pt" },
  { label: "English", value: "en" },
  // Adicione outros aqui
]

export function LanguagePicker() {
  const [open, setOpen] = React.useState(false)
  const { i18n } = useTranslation()

  const currentLanguage = languages.find(
    (lang) => lang.value === i18n.language
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 shrink-0 opacity-50" />
            {currentLanguage?.label || "Idioma"}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0 z-9999">
        <Command>
          <CommandInput placeholder="Buscar idioma..." />
          <CommandList>
            <CommandEmpty>Nenhum encontrado.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    i18n.changeLanguage(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      i18n.language === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}