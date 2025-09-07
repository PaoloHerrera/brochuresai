import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  // NavbarMenuToggle, // removed to use custom 3-line icon button
  NavbarMenu,
  NavbarMenuItem,
  Select,
  SelectItem,
  Link,
  Button,
  Switch,
} from '@heroui/react'

import { LanguagesIcon, Sun, Moon, Zap, Menu } from 'lucide-react'
import { GithubIcon } from '../icons/GithubIcon'
import { useState } from 'react'
import { GITHUB_URL } from '../../config'

import { useLanguageStore } from '../../stores/useLanguageStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { NAVBAR_TEXT } from '../../lang/navbar'
import { useTranslate } from '../../hooks/useTranslate'
import { fieldWrapperTranslucent, textMuted } from './fieldStyles'

export const NavbarUI = () => {
  const { language, setLanguage } = useLanguageStore()
  const { theme, setTheme } = useThemeStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { t } = useTranslate(NAVBAR_TEXT)

  return (
    <Navbar 
      className="h-16 sticky px-0 sm:px-6 lg:px-8 top-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-700/60"
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
    >
      {/* Brand a la izquierda en móvil y desktop */}
      <NavbarContent justify="start" className="flex-1">
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <Zap size={18} />
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{t.brand}</span>
          </div>
        </NavbarBrand>
      </NavbarContent>

      {/* Botón hamburguesa (3 líneas) a la derecha en móvil */}
      <NavbarContent justify="end" className="sm:hidden">
        <Button
          isIconOnly
          variant="light"
          radius="full"
          aria-label={isMenuOpen ? t.closeMenu : t.openMenu}
          className="text-slate-800 dark:text-slate-100"
          onPress={() => setIsMenuOpen((v) => !v)}
        >
          <Menu size={22} />
        </Button>
      </NavbarContent>

      {/* Contenido derecho en desktop */}
      <NavbarContent justify="end" className="hidden sm:flex gap-3">
        <NavbarItem>
          <Switch
            aria-label={t.changeTheme}
            size="lg"
            isSelected={theme === 'dark'}
            onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
            startContent={<Sun className="text-amber-500" size={16} />}
            endContent={<Moon className="text-blue-400" size={16} />}
            className="rounded-full"
          />
        </NavbarItem>
        <NavbarItem>
          <Select
            aria-label={t.selectLanguage}
            disallowEmptySelection={true}
            startContent={<LanguagesIcon className="text-slate-600 dark:text-slate-300" />}
            selectedKeys={[language]}
            className="w-36"
            classNames={{
              trigger: `${fieldWrapperTranslucent} ${textMuted}`,
              value: 'text-sm',
            }}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as 'en' | 'es'
              setLanguage(selected)
            }}
          >
            {t.languageOptions.map((option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            ))}
          </Select>
        </NavbarItem>
        <NavbarItem>
          <Button
            variant="flat"
            radius="full"
            color="secondary"
            as={Link}
            href={GITHUB_URL}
            className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800"
          >
            <GithubIcon ariaLabel={t.github} title={t.github} />
            {t.github}
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700">
        <NavbarMenuItem>
          <div className="flex items-center justify-between w-full py-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.theme}</span>
            <Switch
              aria-label={t.changeTheme}
              size="md"
              isSelected={theme === 'dark'}
              onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
              startContent={<Sun className="text-amber-500" size={14} />}
              endContent={<Moon className="text-blue-400" size={14} />}
            />
          </div>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <div className="w-full py-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.language}</p>
            <Select
              aria-label={t.selectLanguage}
              disallowEmptySelection={true}
              startContent={<LanguagesIcon className="text-slate-600 dark:text-slate-300" />}
              selectedKeys={[language]}
              className="w-full"
              classNames={{
                trigger: `${fieldWrapperTranslucent} ${textMuted}`,
                value: 'text-sm',
              }}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as 'en' | 'es'
                setLanguage(selected)
              }}
            >
              {t.languageOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
        </NavbarMenuItem>
        <NavbarMenuItem className="pt-2">
          <Button
            variant="flat"
            radius="full"
            color="secondary"
            as={Link}
            href={GITHUB_URL}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            startContent={<GithubIcon ariaLabel={t.github} title={t.github} />}
          >
            {t.github}
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}
