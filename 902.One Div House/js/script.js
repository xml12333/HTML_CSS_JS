// Handle themes code by @Jhey (Thanks!)
// https://codepen.io/jh3y/pen/GRaWZrw

const isDark = document.documentElement.dataset.theme === 'dark' || matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = isDark ? 'dark' : 'light'

const updateTheme = () => {
  const isCurrentDark = document.documentElement.dataset.theme === 'dark'
  document.documentElement.dataset.theme = isCurrentDark ? 'light' : 'dark'
}

const handleChangeThemes = () => {
  if (!document.startViewTransition) return updateTheme()
  document.startViewTransition(updateTheme)
}

addEventListener('click', handleChangeThemes)