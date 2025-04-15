import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  Text, 
  PrimaryButton, 
  DefaultButton, 
  Dialog, 
  DialogType, 
  DialogFooter,
  TextField,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Label
} from '@fluentui/react';
import { ConfigManager } from '../../services/ConfigManager';
import { ApplicationGenerator } from '../../services/ApplicationGenerator';

/**
 * Application Export Component
 * 
 * Provides a user interface for exporting applications in the Anvil platform
 * 
 * @author Justin Lietz
 */
const ApplicationExport: React.FC = () => {
  // State for application settings
  const [appName, setAppName] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  const [appDescription, setAppDescription] = useState<string>('');
  const [appAuthor, setAppAuthor] = useState<string>('');
  const [appLicense, setAppLicense] = useState<string>('MIT');
  
  // State for build settings
  const [buildType, setBuildType] = useState<string>('electron');
  const [outputDir, setOutputDir] = useState<string>('./dist');
  const [includeDevTools, setIncludeDevTools] = useState<boolean>(false);
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(['win', 'mac', 'linux']);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const [buildStatus, setBuildStatus] = useState<string>('');
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // State for build confirmation dialog
  const [isBuildDialogOpen, setIsBuildDialogOpen] = useState<boolean>(false);
  
  // State for build result dialog
  const [isBuildResultDialogOpen, setIsBuildResultDialogOpen] = useState<boolean>(false);
  const [buildResult, setBuildResult] = useState<any>(null);
  
  // Build type options
  const buildTypeOptions: IDropdownOption[] = [
    { key: 'electron', text: 'Desktop Application (Electron)' },
    { key: 'web', text: 'Web Application' },
    { key: 'pwa', text: 'Progressive Web App' }
  ];
  
  // Target platform options
  const targetPlatformOptions: IDropdownOption[] = [
    { key: 'win', text: 'Windows' },
    { key: 'mac', text: 'macOS' },
    { key: 'linux', text: 'Linux' }
  ];
  
  // License options
  const licenseOptions: IDropdownOption[] = [
    { key: 'MIT', text: 'MIT License' },
    { key: 'Apache-2.0', text: 'Apache License 2.0' },
    { key: 'GPL-3.0', text: 'GNU General Public License v3.0' },
    { key: 'BSD-3-Clause', text: 'BSD 3-Clause License' },
    { key: 'proprietary', text: 'Proprietary (All Rights Reserved)' }
  ];
  
  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Load settings from ConfigManager
  const loadSettings = async () => {
    try {
      // Load application settings
      const loadedAppName = await ConfigManager.get('application', 'name', 'My Anvil App');
      const loadedAppVersion = await ConfigManager.get('application', 'version', '1.0.0');
      const loadedAppDescription = await ConfigManager.get('application', 'description', '');
      const loadedAppAuthor = await ConfigManager.get('application', 'author', '');
      const loadedAppLicense = await ConfigManager.get('application', 'license', 'MIT');
      
      // Load build settings
      const loadedBuildType = await ConfigManager.get('build', 'type', 'electron');
      const loadedOutputDir = await ConfigManager.get('build', 'outputDir', './dist');
      const loadedIncludeDevTools = await ConfigManager.get('build', 'includeDevTools', false);
      const loadedTargetPlatforms = await ConfigManager.get('build', 'targetPlatforms', ['win', 'mac', 'linux']);
      
      // Update state
      setAppName(loadedAppName);
      setAppVersion(loadedAppVersion);
      setAppDescription(loadedAppDescription);
      setAppAuthor(loadedAppAuthor);
      setAppLicense(loadedAppLicense);
      setBuildType(loadedBuildType);
      setOutputDir(loadedOutputDir);
      setIncludeDevTools(loadedIncludeDevTools);
      setTargetPlatforms(loadedTargetPlatforms);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Save settings to ConfigManager
  const saveSettings = async () => {
    try {
      // Save application settings
      await ConfigManager.set('application', 'name', appName);
      await ConfigManager.set('application', 'version', appVersion);
      await ConfigManager.set('application', 'description', appDescription);
      await ConfigManager.set('application', 'author', appAuthor);
      await ConfigManager.set('application', 'license', appLicense);
      
      // Save build settings
      await ConfigManager.set('build', 'type', buildType);
      await ConfigManager.set('build', 'outputDir', outputDir);
      await ConfigManager.set('build', 'includeDevTools', includeDevTools);
      await ConfigManager.set('build', 'targetPlatforms', targetPlatforms);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  // Handle build application
  const handleBuildApplication = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setBuildProgress(0);
    setBuildStatus('Preparing build...');
    
    try {
      // Save settings before building
      await saveSettings();
      
      // Create build configuration
      const buildConfig = {
        appName,
        appVersion,
        appDescription,
        appAuthor,
        appLicense,
        buildType,
        outputDir,
        includeDevTools,
        targetPlatforms
      };
      
      // Register progress callback
      ApplicationGenerator.onProgressUpdate((progress, status) => {
        setBuildProgress(progress);
        setBuildStatus(status);
      });
      
      // Generate the application
      const result = await ApplicationGenerator.generateApplication(buildConfig);
      
      setBuildResult(result);
      setSuccessMessage('Application built successfully');
      setIsBuildResultDialogOpen(true);
    } catch (error) {
      setErrorMessage('Error building application: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
      closeBuildDialog();
    }
  };
  
  // Handle target platform selection
  const handleTargetPlatformChange = (item?: IDropdownOption, isSelected?: boolean) => {
    if (item && isSelected !== undefined) {
      if (isSelected) {
        setTargetPlatforms([...targetPlatforms, item.key as string]);
      } else {
        setTargetPlatforms(targetPlatforms.filter(platform => platform !== item.key));
      }
    }
  };
  
  // Open build confirmation dialog
  const openBuildDialog = () => {
    setIsBuildDialogOpen(true);
  };
  
  // Close build confirmation dialog
  const closeBuildDialog = () => {
    setIsBuildDialogOpen(false);
  };
  
  // Close build result dialog
  const closeBuildResultDialog = () => {
    setIsBuildResultDialogOpen(false);
  };
  
  return (
    <Stack tokens={{ childrenGap: 16, padding: 16 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xLarge">Application Export</Text>
        <PrimaryButton text="Build Application" onClick={openBuildDialog} />
      </Stack>
      
      {isLoading && (
        <Stack tokens={{ childrenGap: 8 }}>
          <Spinner size={SpinnerSize.large} label={buildStatus} />
          <Text>{`Progress: ${buildProgress}%`}</Text>
        </Stack>
      )}
      
      {errorMessage && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setErrorMessage('')}>
          {errorMessage}
        </MessageBar>
      )}
      
      {successMessage && (
        <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setSuccessMessage('')}>
          {successMessage}
        </MessageBar>
      )}
      
      <Stack tokens={{ childrenGap: 16 }}>
        <Text variant="large">Application Settings</Text>
        <Stack tokens={{ childrenGap: 8 }}>
          <TextField
            label="Application Name"
            value={appName}
            onChange={(_, newValue) => setAppName(newValue || '')}
            required
          />
          <TextField
            label="Version"
            value={appVersion}
            onChange={(_, newValue) => setAppVersion(newValue || '')}
            required
          />
          <TextField
            label="Description"
            value={appDescription}
            onChange={(_, newValue) => setAppDescription(newValue || '')}
            multiline
            rows={3}
          />
          <TextField
            label="Author"
            value={appAuthor}
            onChange={(_, newValue) => setAppAuthor(newValue || '')}
          />
          <Dropdown
            label="License"
            selectedKey={appLicense}
            options={licenseOptions}
            onChange={(_, option) => option && setAppLicense(option.key as string)}
          />
        </Stack>
        
        <Text variant="large">Build Settings</Text>
        <Stack tokens={{ childrenGap: 8 }}>
          <Dropdown
            label="Build Type"
            selectedKey={buildType}
            options={buildTypeOptions}
            onChange={(_, option) => option && setBuildType(option.key as string)}
          />
          <TextField
            label="Output Directory"
            value={outputDir}
            onChange={(_, newValue) => setOutputDir(newValue || '')}
          />
          <Label>Target Platforms</Label>
          <Dropdown
            multiSelect
            selectedKeys={targetPlatforms}
            options={targetPlatformOptions}
            onChange={handleTargetPlatformChange}
          />
          {buildType === 'electron' && (
            <Dropdown
              label="Include Developer Tools"
              selectedKey={includeDevTools ? 'yes' : 'no'}
              options={[
                { key: 'yes', text: 'Yes' },
                { key: 'no', text: 'No' }
              ]}
              onChange={(_, option) => option && setIncludeDevTools(option.key === 'yes')}
            />
          )}
        </Stack>
      </Stack>
      
      {/* Build Confirmation Dialog */}
      <Dialog
        hidden={!isBuildDialogOpen}
        onDismiss={closeBuildDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Build Application',
          subText: 'Are you sure you want to build the application with these settings?'
        }}
        modalProps={{
          isBlocking: true
        }}
      >
        <DialogFooter>
          <PrimaryButton text="Build" onClick={handleBuildApplication} />
          <DefaultButton text="Cancel" onClick={closeBuildDialog} />
        </DialogFooter>
      </Dialog>
      
      {/* Build Result Dialog */}
      <Dialog
        hidden={!isBuildResultDialogOpen}
        onDismiss={closeBuildResultDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Build Result',
          subText: 'The application was built successfully'
        }}
        modalProps={{
          isBlocking: false
        }}
      >
        {buildResult && (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="medium">Output Location: {buildResult.outputPath}</Text>
            <Text variant="medium">Build Type: {buildResult.buildType}</Text>
            <Text variant="medium">Platforms: {buildResult.platforms.join(', ')}</Text>
            <Text variant="medium">File Size: {buildResult.fileSize}</Text>
          </Stack>
        )}
        <DialogFooter>
          <PrimaryButton text="Close" onClick={closeBuildResultDialog} />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default ApplicationExport;
