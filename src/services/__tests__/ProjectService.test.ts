import { createNewProject, createDefaultTheme, createDefaultSettings } from '../ProjectService';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('ProjectService', () => {
  beforeEach(() => {
    // Reset the mock and set a fixed return value for testing
    (uuidv4 as jest.Mock).mockReset();
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');
  });

  describe('createNewProject', () => {
    it('should create a new project with the provided name and description', () => {
      const name = 'Test Project';
      const description = 'A test project';
      const project = createNewProject(name, description);

      expect(project).toEqual({
        id: 'test-uuid',
        name,
        description,
        version: '1.0.0',
        author: 'Justin Lietz',
        created: expect.any(Date),
        modified: expect.any(Date),
        components: [],
        blueprints: [],
        variables: [],
        theme: expect.any(Object),
        settings: expect.any(Object)
      });
    });

    it('should set the created and modified dates to the current time', () => {
      const now = new Date();
      const project = createNewProject('Test', 'Test');
      
      expect(project.created.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
      expect(project.created.getTime()).toBeLessThanOrEqual(now.getTime() + 1000);
      expect(project.modified.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
      expect(project.modified.getTime()).toBeLessThanOrEqual(now.getTime() + 1000);
    });

    it('should include a default theme', () => {
      const project = createNewProject('Test', 'Test');
      expect(project.theme).toEqual(createDefaultTheme());
    });

    it('should include default settings with the provided name and description', () => {
      const name = 'Test Project';
      const description = 'A test project';
      const project = createNewProject(name, description);
      
      expect(project.settings).toEqual(createDefaultSettings(name, description));
    });
  });

  describe('createDefaultTheme', () => {
    it('should create a theme with the expected properties', () => {
      const theme = createDefaultTheme();
      
      expect(theme).toEqual({
        id: 'test-uuid',
        name: 'Default Theme',
        colors: expect.any(Object),
        typography: expect.any(Object),
        spacing: expect.any(Object)
      });
    });

    it('should include the expected color values', () => {
      const theme = createDefaultTheme();
      
      expect(theme.colors).toEqual({
        primary: '#0078d4',
        secondary: '#2b88d8',
        background: '#ffffff',
        text: '#323130',
        error: '#a4262c'
      });
    });

    it('should include the expected typography values', () => {
      const theme = createDefaultTheme();
      
      expect(theme.typography).toEqual({
        fontFamily: expect.any(String),
        fontSize: {
          small: '12px',
          medium: '14px',
          large: '16px',
          xLarge: '20px',
          xxLarge: '28px'
        },
        fontWeight: {
          regular: 400,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          small: 1.3,
          medium: 1.4,
          large: 1.5
        }
      });
    });

    it('should include the expected spacing values', () => {
      const theme = createDefaultTheme();
      
      expect(theme.spacing).toEqual({
        unit: 8,
        scale: {
          s: 1,
          m: 2,
          l: 3,
          xl: 4
        }
      });
    });
  });

  describe('createDefaultSettings', () => {
    it('should create settings with the provided name and description', () => {
      const name = 'Test Project';
      const description = 'A test project';
      const settings = createDefaultSettings(name, description);
      
      expect(settings).toEqual({
        name,
        description,
        version: '1.0.0',
        author: 'Justin Lietz',
        icon: '',
        window: {
          width: 800,
          height: 600,
          minWidth: 400,
          minHeight: 300,
          resizable: true,
          frame: true,
          transparent: false
        },
        build: {
          outputDir: '',
          platforms: ['win', 'mac', 'linux']
        }
      });
    });
  });
});
