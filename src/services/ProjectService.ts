import { v4 as uuidv4 } from 'uuid';
import { Project, Theme, ProjectSettings } from '../contexts/ProjectContext';
import { ConfigManager } from './ConfigManager';

/**
 * Creates a new project with default settings
 * 
 * @param name - The name of the project
 * @param description - The description of the project
 * @returns A new Project object
 */
export const createNewProject = (name: string, description: string): Project => {
  return {
    id: uuidv4(),
    name,
    description,
    version: '1.0.0',
    author: ConfigManager.get('project', 'defaults', {}).author || 'Anvil User',
    created: new Date(),
    modified: new Date(),
    components: [],
    blueprints: [],
    variables: [],
    theme: createDefaultTheme(),
    settings: createDefaultSettings(name, description)
  };
};

/**
 * Creates a default theme for new projects
 * 
 * @returns A default Theme object
 */
export const createDefaultTheme = (): Theme => {
  const defaultThemeName = ConfigManager.get('ui', 'theme', {}).defaultTheme || 'light';
  const themeColors = ConfigManager.getNested('ui', ['theme', 'themes', defaultThemeName], {});
  
  return {
    id: uuidv4(),
    name: 'Default Theme',
    colors: {
      primary: themeColors.primary || '#0078d4',
      secondary: themeColors.secondary || '#2b88d8',
      background: themeColors.background || '#ffffff',
      text: themeColors.onBackground || '#323130',
      error: themeColors.error || '#a4262c'
    },
    typography: {
      fontFamily: ConfigManager.getNested('ui', ['typography', 'fontFamily'], 
        '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'),
      fontSize: {
        small: ConfigManager.getNested('ui', ['typography', 'fontSize', 'small'], '12px'),
        medium: ConfigManager.getNested('ui', ['typography', 'fontSize', 'medium'], '14px'),
        large: ConfigManager.getNested('ui', ['typography', 'fontSize', 'large'], '16px'),
        xLarge: ConfigManager.getNested('ui', ['typography', 'fontSize', 'xLarge'], '20px'),
        xxLarge: ConfigManager.getNested('ui', ['typography', 'fontSize', 'xxLarge'], '28px')
      },
      fontWeight: {
        regular: ConfigManager.getNested('ui', ['typography', 'fontWeight', 'regular'], 400),
        semibold: ConfigManager.getNested('ui', ['typography', 'fontWeight', 'semibold'], 600),
        bold: ConfigManager.getNested('ui', ['typography', 'fontWeight', 'bold'], 700)
      },
      lineHeight: {
        small: ConfigManager.getNested('ui', ['typography', 'lineHeight', 'small'], 1.3),
        medium: ConfigManager.getNested('ui', ['typography', 'lineHeight', 'medium'], 1.4),
        large: ConfigManager.getNested('ui', ['typography', 'lineHeight', 'large'], 1.5)
      }
    },
    spacing: {
      unit: ConfigManager.getNested('ui', ['spacing', 'unit'], 8),
      scale: {
        s: ConfigManager.getNested('ui', ['spacing', 'scale', 's'], 1),
        m: ConfigManager.getNested('ui', ['spacing', 'scale', 'm'], 2),
        l: ConfigManager.getNested('ui', ['spacing', 'scale', 'l'], 3),
        xl: ConfigManager.getNested('ui', ['spacing', 'scale', 'xl'], 4)
      }
    }
  };
};

/**
 * Creates default project settings
 * 
 * @param name - The name of the project
 * @param description - The description of the project
 * @returns Default ProjectSettings object
 */
export const createDefaultSettings = (name: string, description: string): ProjectSettings => {
  const projectDefaults = ConfigManager.get('project', 'defaults', {});
  const windowDefaults = ConfigManager.getNested('project', ['defaults', 'window'], {});
  const buildPlatforms = ConfigManager.getNested('project', ['defaults', 'buildPlatforms'], ['win32', 'darwin', 'linux']);
  
  return {
    name,
    description,
    version: '1.0.0',
    author: projectDefaults.author || 'Anvil User',
    icon: '',
    window: {
      width: windowDefaults.width || 800,
      height: windowDefaults.height || 600,
      minWidth: windowDefaults.minWidth || 400,
      minHeight: windowDefaults.minHeight || 300,
      resizable: true,
      frame: true,
      transparent: false
    },
    build: {
      outputDir: ConfigManager.getNested('application', ['build', 'defaultOutputDir'], './dist'),
      platforms: buildPlatforms
    }
  };
};
