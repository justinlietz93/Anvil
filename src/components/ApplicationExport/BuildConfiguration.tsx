import React, { useContext, useState } from 'react';
import { 
  Stack, 
  IStackStyles, 
  IStackTokens,
  DefaultButton,
  PrimaryButton,
  TextField,
  Checkbox,
  Dialog,
  DialogType,
  DialogFooter,
  ProgressIndicator,
  Text,
  MessageBar,
  MessageBarType
} from '@fluentui/react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { ApplicationGenerator } from '../../services/ApplicationGenerator';

// Styles
const stackStyles: IStackStyles = {
  root: {
    padding: 20,
  },
};

const formStackStyles: IStackStyles = {
  root: {
    maxWidth: 600,
  },
};

// Tokens
const stackTokens: IStackTokens = {
  childrenGap: 15,
};

/**
 * Build Configuration component for configuring application builds
 * 
 * @author Justin Lietz
 */
export const BuildConfiguration: React.FC = () => {
  // Contexts
  const { project, updateProject } = useContext(ProjectContext);
  
  // State
  const [appName, setAppName] = useState<string>(project?.settings.name || '');
  const [appVersion, setAppVersion] = useState<string>(project?.settings.version || '1.0.0');
  const [appDescription, setAppDescription] = useState<string>(project?.settings.description || '');
  const [appAuthor, setAppAuthor] = useState<string>(project?.settings.author || 'Justin Lietz');
  const [windowWidth, setWindowWidth] = useState<string>(project?.settings.window.width.toString() || '800');
  const [windowHeight, setWindowHeight] = useState<string>(project?.settings.window.height.toString() || '600');
  const [windowResizable, setWindowResizable] = useState<boolean>(project?.settings.window.resizable || true);
  const [windowFrame, setWindowFrame] = useState<boolean>(project?.settings.window.frame || true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveResult, setSaveResult] = useState<{message: string, type: MessageBarType} | null>(null);
  
  // Handle save button click
  const handleSave = () => {
    if (!project) return;
    
    setIsSaving(true);
    
    try {
      // Update project settings
      const updatedSettings = {
        ...project.settings,
        name: appName,
        version: appVersion,
        description: appDescription,
        author: appAuthor,
        window: {
          ...project.settings.window,
          width: parseInt(windowWidth, 10) || 800,
          height: parseInt(windowHeight, 10) || 600,
          resizable: windowResizable,
          frame: windowFrame
        }
      };
      
      // Update project
      updateProject({ settings: updatedSettings });
      
      // Show success message
      setSaveResult({
        message: 'Build configuration saved successfully',
        type: MessageBarType.success
      });
    } catch (error) {
      // Show error message
      setSaveResult({
        message: `Error saving build configuration: ${error}`,
        type: MessageBarType.error
      });
    } finally {
      setIsSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveResult(null);
      }, 3000);
    }
  };
  
  return (
    <Stack styles={stackStyles} tokens={stackTokens}>
      <Text variant="xLarge">Build Configuration</Text>
      <Text>Configure the settings for your application build.</Text>
      
      {saveResult && (
        <MessageBar
          messageBarType={saveResult.type}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
        >
          {saveResult.message}
        </MessageBar>
      )}
      
      <Stack styles={formStackStyles} tokens={stackTokens}>
        <TextField
          label="Application Name"
          value={appName}
          onChange={(_, newValue) => setAppName(newValue || '')}
          required
          placeholder="Enter application name"
          disabled={isSaving}
        />
        
        <TextField
          label="Version"
          value={appVersion}
          onChange={(_, newValue) => setAppVersion(newValue || '')}
          required
          placeholder="1.0.0"
          disabled={isSaving}
        />
        
        <TextField
          label="Description"
          value={appDescription}
          onChange={(_, newValue) => setAppDescription(newValue || '')}
          multiline
          rows={3}
          placeholder="Enter application description"
          disabled={isSaving}
        />
        
        <TextField
          label="Author"
          value={appAuthor}
          onChange={(_, newValue) => setAppAuthor(newValue || '')}
          placeholder="Enter author name"
          disabled={isSaving}
        />
        
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <TextField
            label="Window Width"
            value={windowWidth}
            onChange={(_, newValue) => setWindowWidth(newValue || '')}
            type="number"
            min={200}
            max={4000}
            styles={{ root: { width: 100 } }}
            disabled={isSaving}
          />
          
          <TextField
            label="Window Height"
            value={windowHeight}
            onChange={(_, newValue) => setWindowHeight(newValue || '')}
            type="number"
            min={200}
            max={4000}
            styles={{ root: { width: 100 } }}
            disabled={isSaving}
          />
        </Stack>
        
        <Checkbox
          label="Resizable Window"
          checked={windowResizable}
          onChange={(_, checked) => setWindowResizable(!!checked)}
          disabled={isSaving}
        />
        
        <Checkbox
          label="Window Frame"
          checked={windowFrame}
          onChange={(_, checked) => setWindowFrame(!!checked)}
          disabled={isSaving}
        />
        
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton
            text="Save Configuration"
            onClick={handleSave}
            disabled={isSaving || !appName || !appVersion}
          />
          <DefaultButton
            text="Reset"
            onClick={() => {
              if (project) {
                setAppName(project.settings.name);
                setAppVersion(project.settings.version);
                setAppDescription(project.settings.description);
                setAppAuthor(project.settings.author);
                setWindowWidth(project.settings.window.width.toString());
                setWindowHeight(project.settings.window.height.toString());
                setWindowResizable(project.settings.window.resizable);
                setWindowFrame(project.settings.window.frame);
              }
            }}
            disabled={isSaving}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
