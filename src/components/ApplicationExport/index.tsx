import React from 'react';
import { 
  Stack, 
  IStackStyles, 
  IStackTokens,
  Pivot,
  PivotItem
} from '@fluentui/react';
import { ApplicationExport } from './ApplicationExport';
import { BuildConfiguration } from './BuildConfiguration';

// Styles
const stackStyles: IStackStyles = {
  root: {
    height: '100%',
    overflow: 'auto',
  },
};

// Tokens
const stackTokens: IStackTokens = {
  childrenGap: 0,
};

/**
 * Application Export container component
 * 
 * @author Justin Lietz
 */
export const ApplicationExportContainer: React.FC = () => {
  return (
    <Stack styles={stackStyles} tokens={stackTokens}>
      <Pivot>
        <PivotItem headerText="Build Configuration">
          <BuildConfiguration />
        </PivotItem>
        <PivotItem headerText="Export Application">
          <ApplicationExport />
        </PivotItem>
      </Pivot>
    </Stack>
  );
};
